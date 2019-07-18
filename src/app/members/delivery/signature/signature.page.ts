import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-signature',
  templateUrl: './signature.page.html',
  styleUrls: ['./signature.page.scss'],
})
export class SignaturePage implements OnInit {

  clients = []

  constructor(private storage: Storage) { }

  ngOnInit() {
  }

  ionViewWillEnter() {

    this.clients = []
    this.storage.get('bar').then((data: any) => {

      data.forEach(element => {
        this.clients.push(element.cliente);
      });

    });

  }

}
