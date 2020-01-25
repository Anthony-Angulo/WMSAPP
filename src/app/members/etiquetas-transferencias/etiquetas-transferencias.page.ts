import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';
import { map, mergeMap } from 'rxjs/operators';

@Component({
  selector: 'app-etiquetas-transferencias',
  templateUrl: './etiquetas-transferencias.page.html',
  styleUrls: ['./etiquetas-transferencias.page.scss'],
})
export class EtiquetasTransferenciasPage implements OnInit {

  load: any
  number: number
  DocEntry
  data
  display

  constructor(
    private http: HttpClient,
    private receptionService: RecepcionDataService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() {
  }

  async getOrden() {
    await this.presentLoading('Buscando....')


    this.http.get(environment.apiSAP + '/api/InventoryTransferRequest/Detail/' + this.number + '/DocNum').toPromise().then((data: any) => {
      console.log(data)
      const request: any = {
        OWTQ: data.OWTQ,
        WTQ1: data.WTQ1
      }

      if (data.Transfers) {
        request.Transfers = data.Transfers;
        request.Transfers.map(t => {
          t.Detail = data.TransfersDetail.filter(td => t.DocEntry == td.DocEntry);
        });

        if (data.Requests) {
          request.Requests = data.Requests;
          request.Requests.map(r => {
            r.Detail = data.RequestsDetail.filter(rd => r.DocEntry == rd.DocEntry);
          });

          request.Transfers.map(t => {
            t.Request = request.Requests.find(r => {
              const detailmatch = t.Detail.map((d, i) => {
                try {
                  if (d.ItemCode == r.Detail[i].ItemCode && d.Quantity == r.Detail[i].Quantity) {
                    return true;
                  } else {
                    return false;
                  }
                } catch (error) {
                  return false;
                }
              }).some(result => result);
              // console.log(detailmatch)
              return detailmatch;
            });
          });

        }

      }
      this.data = request;
      
      console.log(request)
      
    }).catch(error => {
      console.log(error)
      if (error.status == 404) {
        this.presentToast('No encontrado o no existe', 'warning')
      } else if (error.status == 400) {
        this.presentToast(error.error, 'warning')
      } else if (error.status == 500) {
        this.presentToast('Error de conexion', 'danger')
      }
    }).finally(() => {
      this.hideLoading()
    })
  }

  async printLabel(index){

    await this.presentLoading('Imprimiendo Etiqueta..')

    const output = {
      WHS: this.data.Transfers[index].Filler,
      Pallet: (this.data.Transfers[index].Detail[0].U_Tarima) ? this.data.Transfers[index].Detail[0].U_Tarima : '',
      Request: this.data.OWTQ.DocNum,
      Transfer: this.data.Transfers[index].DocNum,
      RequestCopy: (this.data.Transfers[index].Request) ? this.data.Transfers[index].Request.DocNum : ''
    }

    // this.data.Transfers.forEach(element => {
    //   if(element.Request != undefined){
    //     const output = {
    //       WHS: element.Filler,
    //       Pallet: (element.Detail[0].U_Tarima) ? element.Detail[0].U_Tarima : '',
    //       Request: this.data.OWTQ.DocNum,
    //       Transfer: element.DocNum,
    //       RequestCopy: (element.Request) ? element.Request.DocNum : ''
    //     };

        
    //   }
    // });

    this.http.post(environment.apiSAP + '/api/TarimaImp', output).toPromise().catch(error => {
      this.presentToast('Error al imprimir etiquetas','danger')
      console.log(error)
    }).finally(() => {
      this.hideLoading()
      this.presentToast('Impresion Completado','success')
    });
  }


  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000
    });
    toast.present();
  }

  async presentLoading(msg) {
    this.load = await this.loading.create({
      message: msg,
      // duration: 3000
    });

    await this.load.present()
  }

  hideLoading() {
    // console.log('loading')
    this.load.dismiss()
  }

}
