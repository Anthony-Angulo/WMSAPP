import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavExtrasService {

  extras: any;
  products: any;
  scannedProducts: any;
  scannedBeef: any;
  totalAndCode: any;

  constructor() { }

  public setExtras(data: any) {
    this.extras = data;
  }

  public getExtras() {
    return this.extras;
  }

  public setProducts(data: any) {
    this.products = data;
  }

  public getProducts() {
    return this.products;
  }

  public setScannedProducts(data: any) {
    this.scannedProducts = data;
  }

  public getScannedProducts() {
    return this.scannedProducts;
  }

  public setScannedBeef(data: any) {
    this.scannedBeef = data;
  }

  public getScannedBeef() {
    return this.scannedBeef;
  }

  public setScannedCodeAndTotal(data: any) {
    this.totalAndCode = data;
  }

  public getScannedCodeAndTotal() {
    return this.totalAndCode;
  }
}
