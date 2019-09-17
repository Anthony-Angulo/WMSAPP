import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ToastController, LoadingController } from '@ionic/angular';
import { HttpClient } from '@angular/common/http';

const TOKEN_KEY = 'auth-token';
const SUCURSAL_KEY = '0';
const USER_ID = '1';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authenticationState = new BehaviorSubject(null);

  constructor(private storage: Storage,
    private plt: Platform,
    private toastController: ToastController,
    private http: HttpClient) {
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

  login(value) {
    console.log(value)
    this.http.post(environment.apiCRM + '/login', value).toPromise().then((data: any) => {
      if (!data.status) {
        this.presentToast('User y/o password incorrectos.', 'warning')
      } else {
        this.storage.set(SUCURSAL_KEY, data.sucursal);
        this.storage.set(USER_ID, data.id);
        this.authenticationState.next(true);
        return this.storage.set(TOKEN_KEY, data.token)
      }
    }).catch(error => {
      console.error(error)
    });
  }

  public logout(): Promise<void> {
    return this.storage.remove(TOKEN_KEY).then(_ => {
      this.authenticationState.next(false);
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
}
