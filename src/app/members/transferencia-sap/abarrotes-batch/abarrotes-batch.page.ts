import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastController } from '@ionic/angular';
import { RecepcionDataService } from 'src/app/services/recepcion-data.service';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Storage } from '@ionic/storage';
import { SettingsService } from '../../../services/settings.service';
import { getSettingsFileData, getValidPercentage } from '../../commons';
import { Platform } from '@ionic/angular';

const TOKEN_KEY = 'auth-token';

@Component({
  selector: 'app-abarrotes-batch',
  templateUrl: './abarrotes-batch.page.html',
  styleUrls: ['./abarrotes-batch.page.scss'],
})



export class AbarrotesBatchPage implements OnInit {

  public productData: any;
  public cantidad: number;
  public loteAEnviar: any = [];
  public batchNum: string;
  public batchs: any;
  public tarima: string;
  public appSettings: any;
  public uom: any;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private receptionService: RecepcionDataService,
    private storage: Storage
  ) { }

  /* Al iniciar el componente buscara los lotes disponibles para el producto */
  ngOnInit() {

    this.productData = this.receptionService.getOrderData();
    this.appSettings = getSettingsFileData(this.platform, this.settings);

    console.log(this.productData)

    // if (this.productData.count) {
    //   this.cantidad = this.productData.count;
    // }

    if (!this.productData.detalle) {
      this.productData.detalle = [];
    } else {
      this.loteAEnviar = this.productData.detalle;
    }

    if (!this.productData.pallet) {
      this.productData.pallet = '';
    } else {
      this.tarima = this.productData.pallet;
    }


    // Promise.all([
    //   this.http.get(`${this.appSettings.apiSAP}/api/batch/${this.productData.FromWhsCod}/${this.productData.ItemCode}`).toPromise(),
    //   // this.http.get(`${this.appSettings.apiSAP}/api/InventoryTransfer/lastUOM/${this.productData.ItemCode}`).toPromise()
    // ]).then(([data]:any) => {

    //   if(data[0].BatchNum == null) {
    //     this.presentToast('Producto Sin Lotes Disponibles. Notificar A Adutoria.', 'danger');
    //     return;
    //   }
    //   this.batchs = data;
    //   // this.uom = this.productData.Uoms.filter(x => x.UomEntry == lastU)[0];
      
    // }).catch(() => {
    //   this.presentToast('Error al traer lotes de producto', 'danger')
    // });

  }

  triggerQty(){
    this.cantidad = this.productData.ctd;
  }

  /* Metodo que agrga el lote y cantidad automaticamente al ingresar una cantida en el campo de cantidad. 
    Si la diferencia en unidad base es menor a 2 decimas, lo igualara a lo que espera SAP. */
  public addLote() {

    if (this.cantidad == undefined || this.cantidad == 0) return

    if (this.tarima == undefined || this.tarima == '') {
      this.presentToast('Debes Ingresar Un Numero De Tarima', 'warning');
      return;
    }

    // if (this.batchNum == undefined || this.batchNum == '') {
    //   this.presentToast("Debes Elegir Un Lote A Transferir", "warning");
    //   return;
    // }

    let unitBase = this.productData.Uoms.findIndex((x: any) => x.UomEntry == this.productData.UomEntry)

    let unitBaseValor
    
    if (unitBase >= 0) {
      unitBaseValor = this.cantidad * this.productData.Uoms[unitBase].BaseQty
    }

    let dif = Math.abs(unitBaseValor - this.productData.OpenInvQty);

    if (dif < 2) {
      this.loteAEnviar = [{
        Code: 'SI',
        Quantity: this.productData.OpenInvQty
      }];
    } else {

      if (unitBaseValor > getValidPercentage(this.productData, this.appSettings.porcentaje)) {
        this.presentToast("La Cantidad Ingresada Excede De La Cantidad Solicitada", "warning");
        return;
      }

      this.loteAEnviar = [{
        Code: 'SI',
        Quantity: unitBaseValor
      }];
    }
  }

  public eliminarLote(index: number) {
    this.loteAEnviar.splice(index, 1);
  }

  public transferAbarrotes() {

    if (this.loteAEnviar.length == 0) {
      this.productData.count = 0;
      this.receptionService.setReceptionData(this.productData);
      this.router.navigate(['/members/transferencia-sap']);
      return;
    }

    let madeByUom = this.productData.Uoms.findIndex((x: any) => x.UomEntry == this.productData.UomEntry);

    if (this.productData.UomEntry == this.productData.Uoms[madeByUom].BaseEntry) {
      this.productData.count = this.loteAEnviar.map((lote: any) => lote.Quantity).reduce((a, b) => a + b, 0);
    } else {
      this.productData.count = this.cantidad;
    }

    this.productData.detalle = this.loteAEnviar;
    this.productData.pallet = this.tarima;
    this.receptionService.setReceptionData(this.productData)
    this.router.navigate(['/members/transferencia-sap'])

  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000
    });
    toast.present();
  }

}
