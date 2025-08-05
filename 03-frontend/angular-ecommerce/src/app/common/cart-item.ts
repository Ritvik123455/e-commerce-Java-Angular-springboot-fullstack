import { Product } from "./product";

export class CartItem {

    id: string;
    name: string;
    imageUrl: string;
    unitPrice: number;
    quantity: number;

    constructor(product: Product){
        this.id = product.id !== undefined ? String(product.id) : '';
        this.name = product.name !== undefined ? product.name : '';
        this.imageUrl = product.imageUrl !== undefined ? product.imageUrl : '';
        this.unitPrice = product.unitPrice !== undefined ? product.unitPrice : 0;
        this.quantity = 1;
    }

}
