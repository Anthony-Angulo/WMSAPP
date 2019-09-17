import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Storage } from '@ionic/storage';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-surtido-abarrotes',
  templateUrl: './surtido-abarrotes.page.html',
  styleUrls: ['./surtido-abarrotes.page.scss'],
})
export class SurtidoAbarrotesPage implements OnInit {

  productInfo: any
  modo: boolean = false
  codeExist: boolean
  cantidad: number = 0
  eventCodeBar: any

  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private storage: Storage
  ) { }

  ngOnInit() {
    this.productInfo = this.navExtras.getSurtidoDetail()
    if (this.productInfo.codigoBarras == '') {
      console.log(1)
      this.codeExist = false
    } else {
      this.codeExist = true
      if (!this.productInfo.detalle) this.productInfo.detalle = []
      this.navExtras.setSurtidoDetail(null)
      this.cantidad = this.productInfo.cantidad
      console.log(this.productInfo)
    }
  }

  public scannOnChange(event) {

    this.eventCodeBar = event.target.value
    let index

    if (this.eventCodeBar != '') {
      console.log(1)
      index = this.productInfo.detalle.findIndex(product => product.codigoBarras == this.eventCodeBar)
      if (index < 0) {
        console.log(2)
        this.productInfo.detalle.push({
          Tipo_movimiento_id: 2,
          pedido_id: this.productInfo.pedido_id,
          codigo_protehus: this.productInfo.codigoProtevs,
          cantidad: 1,
          codigoBarras: this.eventCodeBar,
          producto_id: this.productInfo.id
        })
      } else {
        this.productInfo.detalle[index].cantidad = Number(this.productInfo.detalle[index].cantidad)
        this.productInfo.detalle[index].cantidad += 1;
      }
      console.log(this.productInfo)
      this.eventCodeBar = ''
      event.target.value = ''

    }
  }

  surtirProducts() {
    let index
    if (this.modo == false) {
      if (this.cantidad != 0) {
        index = this.productInfo.detalle.findIndex(product => product.codigoBarras == this.productInfo.codigoBarras)
        if (index < 0) {
          this.productInfo.detalle.push({
            Tipo_movimiento_id: 2,
            pedido_id: this.productInfo.pedido_id,
            codigo_protehus: this.productInfo.codigoProtevs,
            cantidad: this.cantidad,
            codigoBarras: this.productInfo.codigoBarras,
            producto_id: this.productInfo.id
          })
        } else {
          this.productInfo.detalle[index].cantidad = Number(this.productInfo.detalle[index].cantidad)
          this.productInfo.detalle[index].cantidad = Number(this.cantidad);
        }
      } else {
        this.presentToast("Ingresa primero un codigo y/o cantidad", 'warning');
      }
    }
    this.productInfo.cantidad = 0
    if (this.productInfo.detalle.length != 0) {
      this.productInfo.detalle.forEach(product => {
        this.productInfo.cantidad += Number(product.cantidad)
      })
    }

    this.navExtras.setSurtidoProduct(this.productInfo)
    this.router.navigate(['/members/surtido']);
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 2000
    });
    toast.present();
  }



}
