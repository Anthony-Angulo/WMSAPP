import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecepcionDataService {

  orderData: any;
  receptionData: any;

  constructor() { }

  public setOrderData(data: any){
    this.orderData = data;
  }

  public getOrderData(){
    return this.orderData;
  }

  public setReceptionData(data: any){
    this.receptionData = data;
  }

  public getReceptionData(){
    return this.receptionData;
  }
}
