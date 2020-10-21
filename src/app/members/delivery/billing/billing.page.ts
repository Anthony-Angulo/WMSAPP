import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-billing',
  templateUrl: './billing.page.html',
  styleUrls: ['./billing.page.scss'],
})
export class BillingPage implements OnInit {

  productsList = []
  clientData: any;

  constructor(private storage: Storage) { }

  ngOnInit() {

  }

  ionViewWillEnter() {

    this.storage.get('bar').then(val => {
      if (val) {
        this.clientData = val[0].cliente
        this.productsList = val[0].products;
        this.productsList.forEach(element => {
          element.D2_QUANT = element.D2_QUANT.toFixed(2)
          element.D2_PRCVEN = element.D2_PRCVEN.toFixed(2)
        })
      }
    });

  }


}
