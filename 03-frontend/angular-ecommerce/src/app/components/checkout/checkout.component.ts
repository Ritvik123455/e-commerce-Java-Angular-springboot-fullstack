import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormGroup } from '@angular/forms';
import { count } from 'rxjs';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup!: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardMonths: number[] = [];
  creditCardYears: number[] = [];

  shippingAddressStates: string[] = ['California', 'Texas', 'Florida'];
  billingAddressStates: string[] = ['California', 'Texas', 'Florida'];
  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopFormService) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: [''],
        lastName: [''],
        email: ['']
      }),
      shippingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        state: [''],
        country: [''],
        zipCode: ['']
      }),
      creditCard: this.formBuilder.group({
        cardType: [''],
        nameOnCard: [''],
        cardNumber: [''],
        securityCode: [''],
        expirationMonth: [''],
        expirationYear: ['']
      })
    });
    // populate credit card months
    const startMonth: number = new Date().getMonth() + 1; // get current month
    console.log(`startMonth: ${startMonth}`);
    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        this.creditCardMonths = data;
        console.log(`creditCardMonths: ${JSON.stringify(this.creditCardMonths)}`);
      }
    );
    // populate credit card years
    this.luv2ShopFormService.getCreditCardYears().subscribe(
      (data: number[]) => {
        console.log(`creditCardYears: ${JSON.stringify(data)}`);
        this.creditCardYears = data;
      }
    );
  }


  onSubmit() {
    console.log('Handling the submit button');
    console.log(this.checkoutFormGroup.get('customer')?.value);
    //console.log(this.checkoutFormGroup.get('shippingAddress')?.value);
    //console.log(this.checkoutFormGroup.get('billingAddress')?.value);
  }
  copyShippingAddressToBillingAddress(event: any) {
    if (event.target.checked) {
      this.checkoutFormGroup.controls['billingAddress'].setValue(
        this.checkoutFormGroup.controls['shippingAddress'].value
      );
      this.billingAddressStates = this.shippingAddressStates;
    } else {
      this.checkoutFormGroup.controls['billingAddress'].reset();
      this.billingAddressStates = [];
    }
  }
}
