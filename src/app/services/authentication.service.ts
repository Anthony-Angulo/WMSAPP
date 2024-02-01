import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { NavExtrasService } from './nav-extras.service';

const TOKEN_KEY = 'auth-token';
const USER = 'user';
const IP = 'ip';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authenticationState = new BehaviorSubject(null);
  load: any

  constructor(private storage: Storage,
    private navExtras: NavExtrasService,
    private plt: Platform,
    private toastController: ToastController,
    private http: HttpClient,
    private router: Router,
    private loading: LoadingController) {
    this.plt.ready().then(() => {
      this.checkToken();
    });
  } 

  checkToken() {
    this.storage.get(TOKEN_KEY).then(res => {
      if (res) {
        this.authenticationState.next(true);
      }
    })
  }

  async login(value, api) {

    await this.presentLoading('Inciando Session.....');

    this.http.post(`http://${api}/api/Account/Login`,value).toPromise().then((data: any) => {
      console.log(data)
        this.authenticationState.next(true);
        this.storage.set(USER,data.AppLogin);
        this.navExtras.setIp(api);
        return this.storage.set(TOKEN_KEY, data.token)
      }).catch(error => {
      if(error.status == 400){
        this.presentToast(error.error,"danger")
      } else {
        this.presentToast('Error de conexion','danger')
      }
    }).finally(() => {
      this.hideLoading()
    })
  }

  public logout(): Promise<void> {
    return this.storage.remove(TOKEN_KEY).then(_ => {
      this.authenticationState.next(false);
      this.router.navigate(['login'])
    })
  }

  isAuthenticated() {
    return this.authenticationState.value;
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
