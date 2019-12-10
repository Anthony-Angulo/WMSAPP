import { Component, OnInit } from '@angular/core';
import { AppVersion } from '@ionic-native/app-version/ngx';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {
  version 
  constructor(private appVersion: AppVersion) { }

  ngOnInit() {
    this.appVersion.getVersionNumber().then(version => {
      this.version = version
      }).catch(err => {
        console.log(err)
      });
  }

}
