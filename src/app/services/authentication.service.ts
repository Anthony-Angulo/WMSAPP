import { Platform } from '@ionic/angular';
import { Injectable } from '@angular/core';
import { Storage } from '@ionic/storage';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';
import { HttpClient } from '@angular/common/http';

const TOKEN_KEY = 'auth-token';
const SUCURSAL_KEY = '0';
const USER_ID = '1';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationService {

  authenticationState = new BehaviorSubject(null);

  constructor(private storage: Storage, private plt: Platform, private http: HttpClient) {
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
    this.http.post(environment.apiCRM + '/login', value).subscribe((data: any) => {

      console.log(data.id);

      this.storage.set(SUCURSAL_KEY, data.sucursal);
      this.storage.set(USER_ID, data.id);

      this.storage.set(TOKEN_KEY, data.token).then(() => {
        this.authenticationState.next(true);
      });
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
}
