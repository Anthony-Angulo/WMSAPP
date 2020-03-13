import { HttpClient } from '@angular/common/http';



//Validar si existe un codigo de barra en Inventario completo y/o ciclico
export async function validateCodeBar(productInfo: any, api: string, codebar: string, http: HttpClient): Promise<boolean> {

  if (productInfo.cBDetail[0].grupo == 'queso') {
    let codigoDeBarra = { codigo: codebar.trim() }
    return await http.post(api + '/validateCodeBarQueso',
      codigoDeBarra).toPromise().then((resp) => {
        if (resp) {
          return true;
        } else { return false }
      }).catch((err) => { return false });
  } else {
    return await http.get(api + '/validateCodeBarInventorySAP/' +
      codebar.trim()).toPromise().then((resp) => {
        if (resp) {
          return true;
        } else { return false }
      }).catch((err) => { return false });
  }
}

export function getCerosFromEtiqueta(productInfo: any, pesoDeEtiqueta: string, codFound: number): number {

  let contCero: number = 0;
  let pesoFinal: number = 0;

  for (var i = 0; i < pesoDeEtiqueta.length; i++) {
    if (pesoDeEtiqueta[i] == '0') {
      contCero++
    } else {
      break
    }
  }

  if (productInfo.cBDetail[codFound].UOM_id != 3) {
    if (contCero == 3) {
      pesoDeEtiqueta = pesoDeEtiqueta.substring(0, pesoDeEtiqueta.length - 1)
        + '.' + pesoDeEtiqueta.substring(pesoDeEtiqueta.length - 1,
          pesoDeEtiqueta.length + 1)
    } else if (contCero == 4) {
      pesoDeEtiqueta = pesoDeEtiqueta.substring(pesoDeEtiqueta.length - 2)
    } else {
      pesoDeEtiqueta = pesoDeEtiqueta.substring(0, pesoDeEtiqueta.length - 2)
        + '.' + pesoDeEtiqueta.substring(pesoDeEtiqueta.length - 2,
          pesoDeEtiqueta.length + 1)
    }

    if (pesoDeEtiqueta != '.') {
      pesoFinal = Number((Number(pesoDeEtiqueta) / 2.2046).toFixed(2))
    } else {
      pesoDeEtiqueta = '0'
    }
  } else {
    pesoDeEtiqueta = pesoDeEtiqueta.substring(0, pesoDeEtiqueta.length - 2) +
      '.' + pesoDeEtiqueta.substring(pesoDeEtiqueta.length - 2,
        pesoDeEtiqueta.length + 1)

    if (pesoDeEtiqueta != '.') {
      pesoFinal = Number(Number(pesoDeEtiqueta).toFixed(2))
    } else {
      pesoDeEtiqueta = '0'
    }
  }

  return Number(pesoFinal);
}
