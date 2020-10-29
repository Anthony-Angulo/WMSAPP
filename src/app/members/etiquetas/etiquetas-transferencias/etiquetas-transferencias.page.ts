import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { SettingsService } from '../../../services/settings.service';
import { ToastController, LoadingController } from '@ionic/angular';
import { Platform } from '@ionic/angular';
import { Storage } from '@ionic/storage';
import { getSettingsFileData } from '../../commons';
import { EtiquetasTransferencia } from '../../../interfaces/etiquetasTransferencia';

const TOKEN_KEY = 'auth_token';

@Component({
  selector: 'app-etiquetas-transferencias',
  templateUrl: './etiquetas-transferencias.page.html',
  styleUrls: ['./etiquetas-transferencias.page.scss'],
})
export class EtiquetasTransferenciasPage implements OnInit {

  public appSettings: any;

  load: any
  number: number
  DocEntry: any;
  data
  datos
  display: any;
  apiSAP: string;
  IpImpresora: string;

  constructor(
    private http: HttpClient,
    private settings: SettingsService,
    private toastController: ToastController,
    private loading: LoadingController,
    private platform: Platform,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.appSettings = getSettingsFileData(this.platform, this.settings);
  }

  async getOrden() {

    await this.presentLoading('Buscando....');

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.get(`${this.appSettings.apiSAP}/api/InventoryTransferRequest/WmsTransferLabels/${this.number}/DocNum`, { headers }).toPromise().then((data: any) => {
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
              return detailmatch;
            });
          });

        }

      }
      this.data = request;
    }).catch(error => {
      if (error.status == 404) {
        this.presentToast('No encontrado o no existe', 'warning')
      } else if (error.status == 400) {
        this.presentToast(error.error, 'warning')
      } else if (error.status == 500) {
        this.presentToast('Error de conexion', 'danger')
      } else if (error.status == 401) {
        this.presentToast(error.error, "danger");
      }
    }).finally(() => {
      this.hideLoading()
    })
  }

  async printLabel(index: number) {

    await this.presentLoading('Imprimiendo Etiqueta..')

    let post: EtiquetasTransferencia = {
      WHS: this.data.Transfers[index].Filler,
      IDPrinter: (this.IpImpresora == undefined) ? 'S01-recepcion01' : this.IpImpresora,
      Pallet: (this.data.Transfers[index].Detail[0].U_Tarima) ? this.data.Transfers[index].Detail[0].U_Tarima : '',
      Request: this.data.OWTQ.DocNum,
      Transfer: this.data.Transfers[index].DocNum,
      RequestCopy: (this.data.Transfers[index].Request) ? this.data.Transfers[index].Request.DocNum : ''
    }

    let token = await this.storage.get(TOKEN_KEY);

    let headers = new HttpHeaders();

    headers = headers.set('Authorization', `Bearer ${token}`);

    this.http.post(`${this.appSettings.apiSAP}/api/Impresion/WmsTarima`, post, { headers }).toPromise().catch(error => {
      this.presentToast('Error al imprimir etiquetas', 'danger')
      console.log(error)
    }).finally(() => {
      this.hideLoading()
      this.presentToast('Impresion Completado', 'success')
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
    });

    await this.load.present()
  }

  hideLoading() {
    this.load.dismiss()
  }

}
