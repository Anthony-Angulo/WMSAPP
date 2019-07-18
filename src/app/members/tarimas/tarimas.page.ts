import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

@Component({
  selector: 'app-tarimas',
  templateUrl: './tarimas.page.html',
  styleUrls: ['./tarimas.page.scss'],
})
export class TarimasPage implements OnInit {

  codeBar: any;
  product: any;
  cantidad: number;
  code: any;
  lote: any;

  constructor(private http: HttpClient) { }

  ngOnInit() {
  }


  searchProduct() {

    this.http.get(environment.apiWMS + '/public/api/codeBarFromInventory/' + this.codeBar)
      .subscribe((data: any) => {
        this.product = data.product[0];
        console.log(this.product);
        this.code = this.product.codigoProtevs;
        this.lote = this.product.maneja_lote;
      });
  }
  armarTarima() {
    let body = {
      'producto': this.product,
      'cantidad': this.cantidad
    }
    console.log(body);
    this.http.post(environment.apiWMS + '/public/api/saveTarima', body).subscribe(val => {
      console.log(val);
    }, error => {
      console.log(error);
    });
  }
}
