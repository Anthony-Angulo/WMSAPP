import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';
import { AlertController, ToastController, LoadingController } from '@ionic/angular';
import { getCerosFromEtiqueta } from '../../commons';

@Component({
  selector: 'app-beef',
  templateUrl: './beef.page.html',
  styleUrls: ['./beef.page.scss'],
})
export class BeefPage implements OnInit {

  productData: any;
  codigoBarra: string;
  detail = []
  peso
  cantidadEscaneada: number = 0;
  cantidadPeso: number = 0;
  load: any;
  batch: any;
  codebarDescription: any;
  inputs = [];
  selectedDesc: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private NavExtras: NavExtrasService,
    private router: Router,
    private alert: AlertController,
    private loading: LoadingController
  ) { }

  async ngOnInit() {

    this.productData = this.NavExtras.getProducts();

    await this.presentLoading('Buscando Lotes de producto...')

    this.http.get(environment.apiSAP + '/api/batch/' + this.productData.WhsCode
      + '/' + this.productData.ItemCode).toPromise().then((batchs: any) => {
        console.log(batchs)
        this.batch = batchs
      }).then(() => {
        return this.http.get(environment.apiWMS + '/codebardescriptionsVariants/'
          + this.productData.ItemCode).toPromise()
      }).then((codebarDescription: any[]) => {
        console.log(codebarDescription)
        this.productData.cBDetail = codebarDescription
      }).then(() => {
        if (!this.productData.detalle) {
          this.productData.detalle = []
        } else {
          this.detail = this.productData.detalle
        }

        if (this.productData.cajasEscaneadas) {
          this.cantidadEscaneada = Number(this.productData.cajasEscaneadas)
        } else {
          this.cantidadEscaneada = 0
        }

        if (!this.productData.pesoContado) {
          this.productData.pesoContado = 0
        } else {
          this.cantidadPeso = this.productData.pesoContado
        }

        if (!this.productData.pallet) {
          this.productData.pallet = ''
        }

        if (Number(this.productData.Detail.U_IL_PesMin) == 0 && Number(this.productData.Detail.U_IL_PesMax) == 0) {
          this.productData.Detail.U_IL_PesMin = 0
          this.productData.Detail.U_IL_PesMax = 100
        }

        if (this.productData.Detail.QryGroup45 == "Y") {
          this.codebarDescription = this.productData.cBDetail.filter(x => x.proveedor != null)
          this.codebarDescription.forEach(y => {
            this.inputs.push({
              name: y.proveedor,
              type: "radio",
              label: y.proveedor,
              value: y.proveedor
            })
          })

          this.promptCodeDesc()
          this.presentToast("Selecciona una configuracion", "warning")
        }
      }).catch((error) => {
        this.presentToast(error.error.error, 'danger')
      }).finally(() => {
        this.hideLoading()
      })
  }

  public eliminar(index) {
    this.cantidadEscaneada--
    this.cantidadPeso = this.cantidadPeso - Number(this.detail[index].quantity)
    this.detail.splice(index, 1)
  }

  public getDataFromCodeBar(): void {
    if (this.codigoBarra == '') {

    } else if (this.productData.Detail.QryGroup44 == 'Y') {
      let isValidCodeBar = this.productData.cBDetail.findIndex(y =>
        y.length == this.codigoBarra.trim().length)

      if (isValidCodeBar < 0) {
        this.presentToast('El codigo de barra no coincide con la informacion' +
          'de etiqueta de proveedor.', 'warning')
      } else {
        let pesoDeEtiqueta = this.codigoBarra.substr(
          this.productData.cBDetail[isValidCodeBar].peso_pos - 1,
          this.productData.cBDetail[isValidCodeBar].peso_length)

        if (this.productData.cBDetail[isValidCodeBar].maneja_decimal == 1) {
          if (this.productData.cBDetail[isValidCodeBar].UOM_id != 3) {
            this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2))
          } else {
            this.peso = Number(pesoDeEtiqueta);
          }
        } else {
          this.peso = getCerosFromEtiqueta(this.productData,
            pesoDeEtiqueta,
            isValidCodeBar);
        }
        let ind = this.detail.findIndex(product =>
          product.code == this.codigoBarra.trim())

        if (ind < 0) {
          if (Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin)
            && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)) {
            let findBatch = this.batch.findIndex(y => y.BatchNum
              == this.codigoBarra.substr(25, this.codigoBarra.length).trim())
            if (findBatch < 0) {
              this.presentToast("El codigo de barra no esta en inventario", "warning")
            } else {
              this.detail.push({
                name: this.batch[findBatch].BatchNum,
                display: this.batch[findBatch].BatchNum
                  .substr(this.batch[findBatch].BatchNum.length - 6),
                code: this.codigoBarra,
                attr1: '',
                expirationDate: '11-12-2019',
                quantity: Number(this.batch[findBatch].Quantity),
                pallet: ''
              })
              this.cantidadEscaneada++
              this.cantidadPeso = this.cantidadPeso + Number(this.peso)
              this.presentToast('Se agrego a la lista', 'success')
            }
          } else {
            this.presentToast("El peso no esta dentro del maximo y minmo de producto", "warning")
          }
        } else {
          this.presentToast("Este codigo de barra ya fue escaneado", "warning")
        }
      }
    } else if (this.productData.Detail.QryGroup45 == "Y") {
      let ind = this.detail.findIndex(product =>
        product.code == this.codigoBarra.trim())
      if (ind < 0) {
        let codFound = this.productData.cBDetail.findIndex(y =>
          y.proveedor == this.selectedDesc)
        if (codFound < 0) {
          this.presentToast('El codigo de barra no coincide con la informacion' +
            'de etiqueta de proveedor. Selecciona otra configuracion.', 'warning')
        } else {
          let pesoDeEtiqueta = this.codigoBarra.substr(
            this.productData.cBDetail[codFound].peso_pos - 1,
            this.productData.cBDetail[codFound].peso_length)

          if (this.productData.cBDetail[codFound].maneja_decimal == 1) {
            if (this.productData.cBDetail[codFound].UOM_id != 3) {
              this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2))
            } else {
              this.peso = Number(pesoDeEtiqueta);
            }
          } else {
            this.peso = getCerosFromEtiqueta(this.productData,
              pesoDeEtiqueta,
              codFound);
            if (Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin)
              && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)) {
              let findBatch = this.batch.findIndex(y => y.U_IL_CodBar
                == this.codigoBarra.trim())
              if (findBatch < 0) {
                this.presentToast("El codigo de barra no esta en inventario", "warning")
              } else {
                this.detail.push({
                  name: this.batch[findBatch].BatchNum,
                  display: this.batch[findBatch].BatchNum
                    .substr(this.batch[findBatch].BatchNum.length - 6),
                  code: this.codigoBarra,
                  attr1: '',
                  expirationDate: '11-12-2019',
                  quantity: Number(this.batch[findBatch].Quantity),
                  pallet: ''
                })

                this.cantidadEscaneada++
                this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                this.presentToast('Se agrego a la lista', 'success')
              }
            } else {
              this.presentToast("El peso no esta dentro del maximo y minmo de producto", "warning")
            }
          }
        }
      } else {
        this.presentToast("Este codigo de barra ya fue escaneado", "warning")
      }
    } else {
      let ind = this.detail.findIndex(product =>
        product.code == this.codigoBarra.trim())
      if (ind < 0) {
        let codFound = this.productData.cBDetail.findIndex(y =>
          y.length == this.codigoBarra.trim().length)
        if (codFound < 0) {
          this.presentToast('El codigo de barra no coincide con la informacion' +
            'de etiqueta de proveedor.', 'warning')
        } else {
          let pesoDeEtiqueta = this.codigoBarra.substr(
            this.productData.cBDetail[codFound].peso_pos - 1,
            this.productData.cBDetail[codFound].peso_length)

          if (this.productData.cBDetail[codFound].maneja_decimal == 1) {
            if (this.productData.cBDetail[codFound].UOM_id != 3) {
              this.peso = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2))
            } else {
              this.peso = Number(pesoDeEtiqueta);
            }
          } else {
            this.peso = getCerosFromEtiqueta(this.productData,
              pesoDeEtiqueta,
              codFound);

            if (Number(this.peso) >= Number(this.productData.Detail.U_IL_PesMin)
              && Number(this.peso) <= Number(this.productData.Detail.U_IL_PesMax)) {
              let findBatch = this.batch.findIndex(y => y.U_IL_CodBar
                == this.codigoBarra.trim())
              if (findBatch < 0) {
                this.presentToast("El codigo de barra no esta en inventario", "warning")
              } else {
                this.detail.push({
                  name: this.batch[findBatch].BatchNum,
                  display: this.batch[findBatch].BatchNum
                    .substr(this.batch[findBatch].BatchNum.length - 6),
                  code: this.codigoBarra,
                  attr1: '',
                  expirationDate: '11-12-2019',
                  quantity: Number(this.batch[findBatch].Quantity),
                  pallet: ''
                })

                this.cantidadEscaneada++
                this.cantidadPeso = this.cantidadPeso + Number(this.peso)
                this.presentToast('Se agrego a la lista', 'success')
              }
            } else {
              this.presentToast("El peso no esta dentro del maximo y " +
                "minmo de producto", "warning")
            }
          }
        }
      } else {
        this.presentToast("Este codigo de barra ya fue escaneado", "warning")
      }
    }
    this.peso = 0
    document.getElementById('input-codigo').setAttribute('value', '')
    document.getElementById('input-codigo').focus()
  }

  submit() {

    this.productData.cajasEscaneadas = this.cantidadEscaneada

    if (this.productData.count != 0 && this.cantidadEscaneada <= 0) {
      this.productData.count = this.cantidadEscaneada
      this.productData.pallet = ''
      this.NavExtras.setScannedProducts(this.productData)
      this.router.navigate(['/members/purchase-return-detail'])
    } else if (this.cantidadEscaneada <= 0) {
      this.presentToast('Debe igresar una cantidad valida', 'warning')
    } else if (this.productData.Detail.QryGroup42 == 'Y') {
      this.productData.count = this.cantidadEscaneada
      this.productData.pallet = ''
      this.productData.detalle = this.detail
      this.NavExtras.setScannedProducts(this.productData)
      this.router.navigate(['/members/purchase-return-detail'])
    } else {
      this.productData.count = this.detail.map(lote => lote.quantity)
      .reduce((a, b) => a + b, 0)
      this.productData.detalle = this.detail
      this.productData.pallet = ''
      this.NavExtras.setScannedProducts(this.productData)
      this.router.navigate(['/members/purchase-return-detail'])
    }

  }

  async promptCodeDesc() {
    const alert = await this.alert.create({
      header: 'Configuracion',
      inputs: this.inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            console.log('Confirm Cancel');
          }
        }, {
          text: 'Aceptar',
          handler: (data) => {
            this.selectedDesc = data
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "middle",
      color: color,
      duration: 4000
    });
    toast.present();
  }

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }

}
