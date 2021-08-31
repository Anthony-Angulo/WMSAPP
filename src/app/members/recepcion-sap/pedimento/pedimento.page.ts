import { Component, OnInit } from '@angular/core';
import { NavExtrasService } from 'src/app/services/nav-extras.service';
import { Router } from '@angular/router';
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
    private navExtras: NavExtrasService,
    private toastController: ToastController,
    private router: Router
  ) { }

  ngOnInit() {
  }

  agregarPedimento() {

      if (this.aduana == '' || this.aduana == undefined || this.aduana.length !=2) {
        this.presentToast('Ingresa aduana o valida la aduana sea igual a 2 caracteres', 'warning')
        return
      } else if (this.year == '' || this.year == undefined) {
        this.presentToast('Ingresa un año', 'warning')
        return
      } else if(this.documento == '' || this.documento == undefined || this.documento.length != 7) { 
        this.presentToast('Ingresa un documento o valida el documento sea igual a 7 caracteres', 'warning')
        return
      } else if (this.patente == '' || this.patente == undefined || this.patente.length != 4) {
        this.presentToast('Ingresa un patente o valida patente sea igual a 4 caracteres', 'warning')
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
