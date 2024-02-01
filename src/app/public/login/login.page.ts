import { AuthenticationService } from './../../services/authentication.service';
import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import {
  Platform,
  ToastController,
  LoadingController,
  AlertController
}
  from '@ionic/angular';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
})
export class LoginPage implements OnInit {

  opcIp: any = [];
  ip: any;
  inputs = [];

  constructor(private authService: AuthenticationService,
    private router: Router,
    private http: HttpClient,
    private alert: AlertController,
    private toastController: ToastController,) { }

  ngOnInit() {
    if(this.authService.isAuthenticated()){
      this.router.navigate(['/members/home'])
    }
  }

  login(form) {
    if(this.ip == undefined) {
      this.presentToast("Selecciona una conexion.", "warning");
      return
    }
    this.authService.login(form.value, this.ip);
  }

  opciones() {
    this.inputs = [];
    this.http.get(`${environment.apiCCFN}/user/ip`).toPromise().then((val:any) => {
      this.opcIp = val;
      this.opcIp.forEach(e => {
        this.inputs.push({
          name: e.Nombre,
          type: "radio",
          label: e.Nombre,
          value: e.iP
        });
      });

      this.promptCodeDesc();
    }).catch((err) => {
      console.log(err)
      // this.presentToast(err.error, "danger");
    }).finally(() => { 
      // this.hideLoading();
    })
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
            console.log(data)
            this.ip = data
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
