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

  surtidoDetail: any
  surtidoProduct: any
  movId: any;

  Entry: any;

  pedimento: any;

  constructor() { }

  public setOrderData(data: any) {
    this.orderData = data
  }

  public setEntry(data: any){
    this.Entry = data
  }

  public getEntry(){
    return this.Entry
  }

  public getOrderData() {
    return this.orderData
  }

  public setProducts(data: any) {
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

  public setSurtidoDetail(data: any) {
    this.surtidoDetail = data
  }

  public getSurtidoDetail() {
    return this.surtidoDetail
  }

  public setSurtidoProduct(data: any) {
    this.surtidoProduct = data
  }

  public getSurtidoProduct() {
    return this.surtidoProduct
  }

  public setMovInv(data: any){
    this.movId = data
  }

  public getMovInv(){
    return this.movId
  }

  public setPedimento(data: any){
    this.pedimento = data;
  }

  public getPedimento(){
    return this.pedimento;
  }

}
