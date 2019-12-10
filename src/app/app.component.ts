import { Router } from '@angular/router';
import { AuthenticationService } from './services/authentication.service';
import { Component } from '@angular/core';

import { Platform } from '@ionic/angular';
import { SplashScreen } from '@ionic-native/splash-screen/ngx';
import { StatusBar } from '@ionic-native/status-bar/ngx';

declare global {
  interface Date {
    getMySQLFormat(): string;
  }

  interface Array<T> {
    swap(a: number, b: number): void;
  }

  interface Window {
    html2canvas: any;
  }

  interface Number {
    toFixedNoRounding(n: number): string;
  }

}

Number.prototype.toFixedNoRounding = function(n) {
  const reg = new RegExp("^-?\\d+(?:\\.\\d{0," + n + "})?", "g")
  const a = this.toString().match(reg)[0];
  const dot = a.indexOf(".");
  if (dot === -1) { // integer, insert decimal dot and pad up zeros
      return a + "." + "0".repeat(n);
  }
  const b = n - (a.length - dot) + 1;
  return b > 0 ? (a + "0".repeat(b)) : a;
};

Array.prototype.swap = function(a: number, b: number) {
  if (a < 0 || a >= this.length || b < 0 || b >= this.length) {
      return;
  }

  const temp = this[a];
  this[a] = this[b];
  this[b] = temp;
  return this;
};

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html'
})
export class AppComponent {
  constructor(
    private platform: Platform,
    private splashScreen: SplashScreen,
    private statusBar: StatusBar,
    private authenticationService: AuthenticationService,
    private router: Router
  ) {
    this.initializeApp();
  }

  initializeApp() {
    this.platform.ready().then(() => {
      this.statusBar.styleDefault();
      this.splashScreen.hide();

      this.authenticationService.authenticationState.subscribe(state => {
        if (state) {
          this.router.navigateByUrl('members/home');
        } else {
          this.router.navigateByUrl('/login');
        }
      });

    });
  }

  
}
