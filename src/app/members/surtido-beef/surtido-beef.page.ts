import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';
import { promise } from 'protractor';

@Component({
  selector: 'app-surtido-beef',
  templateUrl: './surtido-beef.page.html',
  styleUrls: ['./surtido-beef.page.scss'],
})
export class SurtidoBeefPage implements OnInit {

  productInfo: any
  eventCodeBar: any;
  cantidad: number = 0
  cantidadReg: number = 0
  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.productInfo = this.navExtras.getSurtidoDetail()
    if (!this.productInfo.detalle) this.productInfo.detalle = []
    this.navExtras.setSurtidoDetail(null)
    this.cantidad = this.productInfo.cantidad
  }

  scannOnChange(event) {
    if (event.target.value == '') {
      console.log(1)
    } else {
      this.eventCodeBar = event.target.value
      console.log(this.eventCodeBar)
      Promise.all([
        this.http.get(environment.apiWMS + '/verifyCodeInventory/' + this.eventCodeBar).toPromise(),
        this.http.get(environment.apiWMS + '/verifyCodeMaster/' + this.eventCodeBar).toPromise()
      ]).then(([inventory, master]: any[]) => {
        if (inventory.existe != 1 || master.existe != 0) {
          this.presentToast('El codigo de barra no existe en inventario o esta en tarima master', 'danger')
        } else {
          console.log(2)
          this.productInfo.detalle.push({
            Tipo_movimiento_id: 2,
            pedido_id: this.productInfo.pedido_id,
            codigo_protehus: this.productInfo.codigoProtevs,
            cantidad: 1,
            codigoBarras: this.eventCodeBar,
            producto_id: this.productInfo.id
          })
          this.cantidadReg++
          this.presentToast('Se agrego a la lista', 'success')
        }
      }).catch(error => {
        this.presentToast('Error al buscar orden. Vuelva a Intentarlo', 'danger')
      }).finally(() => {
        //  this.hideLoading()
        this.eventCodeBar = ''
        event.target.value = ''
        console.log(this.productInfo.detalle)
      })
    }
  }

  surtirProducts() {
    this.productInfo.cantidad = 0

    if (this.productInfo.detalle.length != 0) {
      this.productInfo.detalle.forEach(product => {
        this.productInfo.cantidad += Number(product.cantidad)
      })
    }

    this.navExtras.setSurtidoProduct(this.productInfo)
    this.router.navigate(['/members/surtido']);
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 2000
    });
    toast.present();
  }

}
