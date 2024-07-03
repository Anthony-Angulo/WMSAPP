import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";
import { ToastController } from "@ionic/angular";
import { SettingsService } from "../../../services/settings.service";
import { Platform } from "@ionic/angular";
import { HttpClient } from "@angular/common/http";
import { RecepcionDataService } from "src/app/services/recepcion-data.service";
import { environment } from "src/environments/environment";
import { getSettingsFileData, getValidPercentage } from "../../commons";

@Component({
  selector: "app-abarrotes",
  templateUrl: "./abarrotes.page.html",
  styleUrls: ["./abarrotes.page.scss"],
})
export class AbarrotesPage implements OnInit {
  public productData: any;
  public cantidad: number;
  public tarima: string;
  public appSettings: any;
  public uom: any;
  public stock: string;

  constructor(
    private http: HttpClient,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private settings: SettingsService,
    private receptionService: RecepcionDataService
  ) {}

  /* Al inciiar el modulo buscara los settings del app y traera la informacion del producto. Tambien hara un get a SAP para el stock del producto */
  ngOnInit() {
    this.productData = this.receptionService.getOrderData();
    this.appSettings = getSettingsFileData(this.platform, this.settings);

    if (this.productData.count) {
      this.cantidad = this.productData.count;
    }

    if (!this.productData.pallet) {
      this.productData.pallet = "";
    }

    this.http
      .get(
        this.appSettings.apiSAP +
          "/api/batch/" +
          this.productData.FromWhsCod +
          "/" +
          this.productData.ItemCode
      )
      .toPromise()
      .then((val: any) => {
        this.stock = val.stock;
      })
      .catch((error) => {
        this.presentToast(error.error, "danger");
      });
  }

  public captureData() {
    // if (this.cantidad > getValidPercentage(this.productData, this.appSettings.porcentaje)) {
    //   this.presentToast("Cantidad Ingresada Excede De La Cantidad Solicitada", "warning");
    //   return;
    // }
    if (this.tarima == undefined || this.tarima == "") {
      this.presentToast("Debes Ingresar Numero De Tarima", "warning");
      return;
    }

    if (this.productData.UomEntry == this.uom.UomEntry) {
      this.productData.count = this.cantidad;
    } else {
      let factor = this.productData.Uoms.find(
        (x: any) => x.UomEntry == this.productData.UomEntry
      );
      if (factor.BaseQty == 1) {
        this.productData.count = Number(this.cantidad * this.uom.BaseQty);
      } else {
        this.productData.count = Number(this.cantidad / this.uom.BaseQty);
      }
    }

    this.receptionService.setReceptionData(this.productData);
    this.router.navigate(["/members/transferencia-sap"]);
  }

  /* Metodo para agregar producto a la lista a transferir, validara que no exceda de la cantidad permitida agergando el porcentaje configurada en la aplicacion */
  public transferAbarrotes() {
    if (
      this.cantidad >
      getValidPercentage(this.productData, this.appSettings.porcentaje)
    ) {
      this.presentToast(
        "Cantidad Ingresada Excede De La Cantidad Solicitada",
        "warning"
      );
      return;
    }

    if (this.tarima == undefined || this.tarima == "") {
      this.presentToast("Debes Ingresar Numero De Tarima", "warning");
      return;
    }

    this.productData.count = this.cantidad;
    this.productData.pallet = this.tarima;
    this.receptionService.setReceptionData(this.productData);
    this.router.navigate(["/members/transferencia-sap"]);
  }

  async presentToast(msg: string, color: string) {
    const toast = await this.toastController.create({
      message: msg,
      color: color,
      duration: 4000,
    });
    toast.present();
  }
}
