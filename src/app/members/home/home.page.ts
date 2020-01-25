import { Router } from '@angular/router';
import { AlertController, ToastController } from '@ionic/angular';
import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';


import { AuthenticationService } from './../../services/authentication.service';


@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  version


  constructor(
    private appVersion: AppVersion,
    private authService: AuthenticationService,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,) { }

  async ngOnInit() {
 
    this.appVersion.getVersionNumber().then(version => {
      this.version = version
    }).catch(err => {
      console.log(err)
    });
  }

  logout() {
    this.authService.logout()
  }

  ajustes(){
    this.promptSettings()
  }

  async promptSettings(){
    const alert = await this.alertController.create({
      header: 'Solo Admins',
      message: 'Ingresa Password',
      inputs: [
        {
          name: 'password',
          type: 'password',
        },
      ],
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
          cssClass: 'secondary',
          handler: () => {

          }
        }, {
          text: 'Aceptar',
          handler: (data) => {
            if(data.password == 'Chivas.2019'){
              this.router.navigate(['/members/ajustes'])
            } else {
              this.presentToast('Password Incorrecto','warning')
            }
            
          }
        }
      ]
    });

    await alert.present();
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
