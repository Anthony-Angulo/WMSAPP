import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

const TOKEN_KEY = 'auth-token';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authenticationState = new BehaviorSubject(null);
  load: any

  constructor(private storage: Storage,
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

  async login(value) {

    await this.presentLoading('Inciando Session.....');

    this.http.post(`${environment.apiCRM}/login`,value).toPromise().then((data: any) => {
      if (!data.status) {
        this.presentToast('User y/o password incorrectos.', 'warning')
      } else {
        this.authenticationState.next(true);
        return this.storage.set(TOKEN_KEY, data.token)
      }
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
