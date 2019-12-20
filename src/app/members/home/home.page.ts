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
  constructor(private appVersion: AppVersion,
    private authService: AuthenticationService) { }

  ngOnInit() {
    this.appVersion.getVersionNumber().then(version => {
      this.version = version
      }).catch(err => {
        console.log(err)
      });
  }

  logout(){
    this.authService.logout()
  }

}
