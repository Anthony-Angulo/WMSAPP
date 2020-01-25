import { Injectable } from '@angular/core';
import { File } from '@ionic-native/file/ngx';
import { ToastController} from '@ionic/angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class SettingsService {

  blob: Blob
  fileData: JSON

  constructor(
    private file: File,
    private toastController: ToastController
  ) { }


  public async validateFile() {

    this.file.checkFile(this.file.dataDirectory, 'settings.txt').then(async val => {
      console.log(val)
      if (!val) {
        this.file.createFile(this.file.dataDirectory, 'settings.txt', true)

        let url = {
          apiSAP: environment.apiSAP,
          porcentaje: '10'
        };

        let environmentToString = JSON.stringify(url)

        this.blob = new Blob([environmentToString], { type: 'text/plain' });

        let writePromise = this.file.writeFile(this.file.dataDirectory, 'settings.txt', this.blob, { replace: true, append: false });

        await writePromise.catch(err => {
          console.log(err)
        })

      }
      this.readFile()
    }).catch(err => {
      console.log(err)
    })

  }

  public async readFile() {
    let promise = this.file.readAsText(this.file.dataDirectory, 'settings.txt');

    await promise.then(value => {
      this.fileData = JSON.parse(value)
    }).catch(err => {
      this.presentToast('Error al leer archivo','danger')
    })
  }

  public async saveFile(apiSAP: string, porcentaje: string){
    let uri = {
      apiSAP: apiSAP,
      porcentaje: porcentaje
    };

    let environmentToString = JSON.stringify(uri)

    this.blob = new Blob([environmentToString], { type: 'text/plain' });

    let writePromise = this.file.writeFile(this.file.dataDirectory, 'settings.txt', this.blob, { replace: true, append: false });

    await writePromise.then(() => {this.presentToast('Guardado correctamente','success')}).catch(err => {
      this.presentToast('Error al guardar','danger')
    })

    this.readFile()
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
