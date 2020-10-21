import { Component, OnInit } from '@angular/core';
import { Storage } from '@ionic/storage';

@Component({
  selector: 'app-supply',
  templateUrl: './supply.page.html',
  styleUrls: ['./supply.page.scss'],
})
export class SupplyPage implements OnInit {

  productsList = []
  orders = []
  clientData: any;

  orderSelected=''

  constructor(private storage: Storage) { }

  ngOnInit() {
    
  }

  ionViewWillEnter() {

    this.storage.get('bar').then(val => {
      if (val) {
        this.orders = val 
        console.log(this.orders)
        this.clientData = val[0].cliente
        this.productsList = val[0].productsgeneral;
        this.productsList.forEach(element => {
          element.D2_QUANT = element.D2_QUANT.toFixed(2)
          element.D2_PRCVEN = element.D2_PRCVEN.toFixed(2)
          element.D2_PRECO2 = element.D2_PRECO2.toFixed(2)
          element.D2_TOTAL = element.D2_TOTAL.toFixed(2)
        })
      }
    });
  }
  changeOrder(event){
console.log(event)
  }
}