import { HttpClient } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';
import { Platform } from '@ionic/angular';
import { ToastController, LoadingController } from '@ionic/angular';

@Component({
  selector: 'app-pedimento',
  templateUrl: './pedimento.page.html',
  styleUrls: ['./pedimento.page.scss'],
})
export class PedimentoPage implements OnInit {

  public aduana: any;
  public year: any;
  public documento: any;
  public patente: any;

  constructor(
    private http: HttpClient,
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router,
    private loading: LoadingController,
    private platform: Platform
  ) { }

  ngOnInit() {
  }

  agregarPedimento() {

      if (this.aduana == '' || this.aduana == undefined) {
        this.presentToast('Ingresa aduana', 'warning')
        return
      } else if (this.year == '' || this.year == undefined) {
        this.presentToast('Ingresa un año', 'warning')
        return
      } else if(this.documento == '' || this.documento == undefined) { 
        this.presentToast('Ingresa un documento', 'warning')
        return
      } else if (this.patente == '' || this.patente == undefined) {
        this.presentToast('Ingresa un patente', 'warning')
        return
      }
  

        let year = this.year.substr(3 - 1, 2)
        console.log(year + "  " + this.aduana + "  "  + this.patente + "  " + this.documento)
        let pedimento = year + "  " + this.aduana + "  "  + this.patente + "  " + this.documento
  
        this.navExtras.setPedimento(pedimento)
        this.presentToast("Se agrego pedimento correctamente",'success')
        this.router.navigate(['/members/recepcion-sap'])
      
    }
  

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000
    });
    toast.present();
  }

}
