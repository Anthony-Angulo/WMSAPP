import { Component, OnInit } from '@angular/core';
import { BarcodeScanner } from '@ionic-native/barcode-scanner/ngx';
import { ToastController, LoadingController, AlertController } from '@ionic/angular';

@Component({
  selector: 'app-scann-label',
  templateUrl: './scann-label.page.html',
  styleUrls: ['./scann-label.page.scss'],
})
export class ScannLabelPage implements OnInit {

  scannedCode = null;

  almacen: string;
  seccion: string;
  pasillo: string;
  rack: string;
  nivel: string;
  posicion: string;

  QRscanner: any;

  inputs = [];
  letters = [];

  constructor(private alertController: AlertController,
    private barcodeScanner: BarcodeScanner,
    private toastController: ToastController) { }

  ngOnInit() {
    // this.inputs.push(
    //   {
    //     name: '01', 
    //     type: "radio", 
    //     label: '01', 
    //     value: '01'
    //   },
    //   {
    //     name: '02', 
    //     type: "radio", 
    //     label: '02', 
    //     value: '02'
    //   },
    //   {
    //     name: '03', 
    //     type: "radio", 
    //     label: '03', 
    //     value: '03'
    //   },
    //   {
    //     name: '04', 
    //     type: "radio", 
    //     label: '04', 
    //     value: '04'
    //   },
    //   {
    //     name: '05', 
    //     type: "radio", 
    //     label: '05', 
    //     value: '05'
    //   }
    // );


    this.letters = ['A','B','C','D','E','F','G','H','I','J','K','L','M','N','O','P','Q'];
    
  }

  async openQR() {

    this.nivel = '';

    if(this.QRscanner == false) {
      this.scannedCode = null;
      return
    }

    this.barcodeScanner.scan().then(QrData => {
      this.scannedCode = QrData.text;

      let spt = this.scannedCode.split('-');

      this.almacen = spt[0];
      this.seccion = spt[1];
      this.pasillo = spt[2];
      this.rack = spt[3];

      this.nivel = spt[4];
      this.posicion = spt[5];

      for(let i = 1; i < Number(this.nivel); i++) {
        for(let y = 0; y < Number(this.posicion); y++) {
          this.inputs.push({
            name: i + ' ' + this.letters[y],
            type: "radio",
            label: i + ' ' + this.letters[y],
            value: i + ' ' + this.letters[y]
          });
        }
      }

      // console.log(this.inputs);
    });
    
    this.promptLocation();
  }

  getCode(){

    this.nivel = ''

    this.promptLocation();

      let spt = this.scannedCode.split('-');

      this.almacen = spt[0];
      this.seccion = spt[1];
      this.pasillo = spt[2];
      this.rack = spt[3];

      this.nivel = spt[4];
      this.posicion = spt[5];

      for(let i = 1; i <= Number(this.nivel); i++) {
        for(let y = 0; y < Number(this.posicion); y++) {
          this.inputs.push({
            name: i + ' ' + this.letters[y],
            type: "radio",
            label: i + ' ' + this.letters[y],
            value: i + ' ' + this.letters[y]
          });
        }
      }

      // console.log(this.inputs);
  }


  async promptLocation() {
    const alert = await this.alertController.create({
      header: 'Nivel',
      message: 'Ingresa el nivel de ubicacion',
      inputs: this.inputs,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {
            if(this.nivel == '') {
              this.promptLocation();
            }
          }
        }, {
          text: 'Aceptar',
          handler: (data) => {
            this.nivel = data
          }
        }
      ]
    });

    await alert.present();
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      position: "bottom",
      color: color,
      duration: 2000
    });
    toast.present();
  }

}
