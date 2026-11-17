import { Component, Input, inject, input } from '@angular/core';
import { BttnPrimaryComponent } from '../bttn-primary/bttn-primary.component';
import { CommonModule } from '@angular/common';
import { HomeComponent } from '../home/home.component';
import { ProductService } from '../service/product.service';


@Component({
  selector: 'app-product-card',
  imports: [BttnPrimaryComponent],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent {

  @Input() product: any;
inc(Lt1: { qt: number; prix:number }){

  if(  Lt1.qt = Lt1.qt +=1){
    Lt1.prix *= Lt1.qt
  }
}

dec(Lt1: {
  prix: number; qt: number; 
}){
  if(  Lt1.qt = Lt1.qt -=1){
    if(Lt1.qt<2){
           Lt1.prix=Lt1.prix
    }else{
      Lt1.prix = Lt1.prix%Lt1.qt
    }
  }
}

productService = inject(ProductService);

addCart(productData: any){
  this.productService.onaddCart$.next(productData);
}
}
