import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NavExtrasService {

  orderData: any
  products: any
  scannedProducts: any
  scannedBeef: any
  totalAndCode: any

  inventoryDetail: any
  inventoryProduct: any;

  constructor() { }

  public setOrderData(data: any) {
    this.orderData = data
  }

  public getOrderData() {
    return this.orderData
  }

  public setProductToGetScanned(data: any) {
    this.products = data
  }

  public getProducts() {
    return this.products
  }

  public setScannedProducts(data: any) {
    this.scannedProducts = data
  }

  public getScannedProducts() {
    return this.scannedProducts
  }

  public setScannedBeef(data: any) {
    this.scannedBeef = data
  }

  public getScannedBeef() {
    return this.scannedBeef
  }

  public setScannedCodeAndTotal(data: any) {
    this.totalAndCode = data
  }

  public getScannedCodeAndTotal() {
    return this.totalAndCode
  }

  public setInventoryDetail(data: any) {
    this.inventoryDetail = data
  }

  public getInventoryDetail() {
    return this.inventoryDetail
  }

  public setInventoryProduct(data: any) {
    this.inventoryProduct = data
  }

  public getInventoryProduct() {
    return this.inventoryProduct
  }
}
