import { Component, OnInit } from '@angular/core';
import { Form, FormBuilder, FormControl, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { count } from 'rxjs';
import { Country } from 'src/app/common/country';
import { Order } from 'src/app/common/order';
import { OrderItem } from 'src/app/common/order-item';
import { Purchase } from 'src/app/common/purchase';
import { State } from 'src/app/common/state';
import { CartService } from 'src/app/services/cart.service';
import { CheckoutService } from 'src/app/services/checkout.service';
import { Luv2ShopFormService } from 'src/app/services/luv2-shop-form.service';
import { Luv2ShopValidators } from 'src/app/validators/luv2-shop-validators';

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

  countries: Country[] = [];


  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];
  constructor(private formBuilder: FormBuilder,
              private luv2ShopFormService: Luv2ShopFormService,
              private cartService: CartService,
              private checkoutService: CheckoutService,
              private router: Router) { }

  ngOnInit(): void {

    this.reviewCartDetails();

    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        lastName: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        email: new FormControl('', [Validators.required, Validators.pattern('^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        city: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        state: new FormControl('', [Validators.required]),
        country: new FormControl('', [Validators.required]),
        zipCode: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType: new FormControl('', [Validators.required]),
        nameOnCard: new FormControl('', [Validators.required, Validators.minLength(2), Luv2ShopValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('', [Validators.required, Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('', [Validators.required, Validators.pattern('[0-9]{3}')]),
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
    // populate countries
    this.luv2ShopFormService.getCountries().subscribe(
      (data: Country[]) => {
        console.log('Countries: ' + JSON.stringify(data));
        this.countries = data;
      }
    );
  }
  reviewCartDetails() {
    // subscribe to cartService.totalPrice
    this.cartService.totalPrice.subscribe(
      data => this.totalPrice = data
    );

    // subscribe to cartService.totalQuantity
    this.cartService.totalQuantity.subscribe(
      data => this.totalQuantity = data
    );
  }


  onSubmit() {
    console.log('Handling the submit button');

    if (this.checkoutFormGroup.invalid) {
      this.checkoutFormGroup.markAllAsTouched(); // Mark all controls as touched to show validation errors
      return;
    }

    console.log(this.checkoutFormGroup.get('customer')?.value);
    console.log("The shipping address country is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    console.log("The shipping address state is " + this.checkoutFormGroup.get('shippingAddress')?.value.country.name);
    // set up order
    let order = new Order(this.totalQuantity, this.totalPrice);

    // get cartItems
    const cartItems = this.cartService.cartItems;

    // create orderItems from cartItems
    const orderItems = cartItems.map(item => new OrderItem(item));

    // set up purchase
    const shippingAddress = JSON.parse(JSON.stringify(this.checkoutFormGroup.controls['shippingAddress'].value));
    const billingAddress = JSON.parse(JSON.stringify(this.checkoutFormGroup.controls['billingAddress'].value));
    const shippingState: State = JSON.parse(JSON.stringify(this.checkoutFormGroup.controls['shippingAddress'].value));
    const shippingCountry: Country = JSON.parse(JSON.stringify(this.checkoutFormGroup.controls['shippingAddress'].value));
    const billingAddressState: State = JSON.parse(JSON.stringify(this.checkoutFormGroup.controls['billingAddress'].value));
    const billingAddressCountry: Country = JSON.parse(JSON.stringify(this.checkoutFormGroup.controls['billingAddress'].value));
    const customer = JSON.parse(JSON.stringify(this.checkoutFormGroup.controls['customer'].value));

    let purchase = new Purchase(customer, shippingAddress, billingAddress, order, orderItems);
    purchase.shippingAddress.state = shippingState.name ? shippingState.name : '';
    purchase.shippingAddress.country = shippingCountry.name ? shippingCountry.name : '';
    purchase.billingAddress.state = billingAddressState.name ? billingAddressState.name : '';
    purchase.billingAddress.country = billingAddressCountry.name ? billingAddressCountry.name : '';

    purchase.order = order;
    purchase.orderItems = orderItems;

    // call rest API via CheckoutService
    this.checkoutService.placeOrder(purchase).subscribe({
        next: (response) => {
          console.log('Order placed successfully:', response);
          alert(`Order placed successfully! \n ${response.orderTrackingNumber}`); // Display order tracking number to the user
          this.resetCart();
        },
        error: (error) => {
          console.error('Error placing order:', error);
          alert(`Error placing order: ${error.message}`);
        }
      }
    );
  }

  get firstName() { return this.checkoutFormGroup.get('customer.firstName'); }
  get lastName() { return this.checkoutFormGroup.get('customer.lastName'); }
  get email() { return this.checkoutFormGroup.get('customer.email'); }
  get shippingAddressStreet() { return this.checkoutFormGroup.get('shippingAddress.street'); }
  get shippingAddressCity() { return this.checkoutFormGroup.get('shippingAddress.city'); }
  get shippingAddressState() { return this.checkoutFormGroup.get('shippingAddress.state'); }
  get shippingAddressCountry() { return this.checkoutFormGroup.get('shippingAddress.country'); }
  get shippingAddressZipCode() { return this.checkoutFormGroup.get('shippingAddress.zipCode'); }
  get billingAddressStreet() { return this.checkoutFormGroup.get('billingAddress.street'); }
  get billingAddressCity() { return this.checkoutFormGroup.get('billingAddress.city'); }
  get billingAddressState() { return this.checkoutFormGroup.get('billingAddress.state'); }
  get billingAddressCountry() { return this.checkoutFormGroup.get('billingAddress.country'); }
  get billingAddressZipCode() { return this.checkoutFormGroup.get('billingAddress.zipCode'); }
  get creditCardType() { return this.checkoutFormGroup.get('creditCard.cardType'); }
  get creditCardNameOnCard() { return this.checkoutFormGroup.get('creditCard.nameOnCard'); }
  get creditCardNumber() { return this.checkoutFormGroup.get('creditCard.cardNumber'); }
  get creditCardSecurityCode() { return this.checkoutFormGroup.get('creditCard.securityCode'); }

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

  handleMonthsAndYears() {
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');
    const currentYear: number = new Date().getFullYear();
    const selectedYear: number = Number(creditCardFormGroup?.value.expirationYear);

    // if the selected year is the same as the current year, then start with the current month
    let startMonth: number;
    if (selectedYear === currentYear) {
      startMonth = new Date().getMonth() + 1; // get current month
    } else {
      startMonth = 1; // January
    }

    this.luv2ShopFormService.getCreditCardMonths(startMonth).subscribe(
      data => {
        console.log(`creditCardMonths: ${JSON.stringify(data)}`);
        this.creditCardMonths = data;
      }
    );
  }

  getStates(formGroupName: string) {
    const formGroup = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGroup?.value.country;
    const countryName = formGroup?.value.country.name;

    console.log(`Country code: ${countryCode}`);
    console.log(`Country name: ${countryName}`);

    this.luv2ShopFormService.getStates(countryCode).subscribe(
      data => {
        if (formGroupName === 'shippingAddress') {
          this.shippingAddressStates = data;
        } else {
          this.billingAddressStates = data;
        }
        // reset the state field
        formGroup?.get('state')?.setValue(data[0]);
      }
    );
  }
  resetCart() {
    // reset cart data
    this.cartService.cartItems = [];
    this.cartService.totalPrice.next(0);
    this.cartService.totalQuantity.next(0);

    // reset the form
    this.checkoutFormGroup.reset();

    // navigate back to the products page
    this.router.navigateByUrl("/products");
  }
}
