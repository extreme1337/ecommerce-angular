import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, FormGroup, FormGroupDirective, Validators } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { EcommerceFormService } from 'src/app/service/ecommerce-form.service';
import { EcommerceValidators} from 'src/app/validators/ecommerce-validators';

@Component({
  selector: 'app-checkout',
  templateUrl: './checkout.component.html',
  styleUrls: ['./checkout.component.css']
})
export class CheckoutComponent implements OnInit {

  checkoutFormGroup: FormGroup;

  totalPrice: number = 0;
  totalQuantity: number = 0;

  creditCardYears: number[] = [];
  creditCardMonths: number[] = [];

  countries: Country[] = [];

  shippingAddressStates: State[] = [];
  billingAddressStates: State[] = [];

  constructor(private formBuilder: FormBuilder, private ecommerceFormService: EcommerceFormService) { }

  ngOnInit(): void {
    this.checkoutFormGroup = this.formBuilder.group({
      customer: this.formBuilder.group({
        firstName: new FormControl('',[Validators.required,Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        lastName: new FormControl('',[Validators.required,Validators.minLength(2),EcommerceValidators.notOnlyWhitespace]),
        email: new FormControl('',[Validators.required,Validators.pattern('^[a-z0-9._%+-]+@[a-z-0-9.-]+\\.[a-z]{2,4}$')])
      }),
      shippingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required,Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required,Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        country: new FormControl('',[Validators.required]),
        state: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required,Validators.minLength(2), EcommerceValidators.notOnlyWhitespace])
      }),
      billingAddress: this.formBuilder.group({
        street: new FormControl('',[Validators.required,Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        city: new FormControl('',[Validators.required,Validators.minLength(2), EcommerceValidators.notOnlyWhitespace]),
        country: new FormControl('',[Validators.required]),
        state: new FormControl('',[Validators.required]),
        zipCode: new FormControl('',[Validators.required,Validators.minLength(2), EcommerceValidators.notOnlyWhitespace])
      }),
      creditCard: this.formBuilder.group({
        cardType:  new FormControl('',[Validators.required]),
        nameOnCard: new FormControl('',[Validators.required,Validators.minLength(2),EcommerceValidators.notOnlyWhitespace]),
        cardNumber: new FormControl('',[Validators.required,Validators.pattern('[0-9]{16}')]),
        securityCode: new FormControl('',[Validators.required,Validators.pattern('[0-9]{3}')]),
        expirationMonth: [''],
        expirationYear: ['']
      })
    });

    const startMonth: number = new Date().getMonth()+1;

    this.ecommerceFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("Retrived credit card months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    );
    
    this.ecommerceFormService.getCreditCardYears().subscribe(
      data=>{
        console.log("Retrived credit card years: "+JSON.stringify(data));
        this.creditCardYears=data;
      }
    );

    this.ecommerceFormService.getCountries().subscribe(
      data => {
        console.log("Retrived countries: "+JSON.stringify(data));
        this.countries = data;
      }
    )
  }

  get firstName(){return this.checkoutFormGroup.get('customer.firstName');}
  get lastName(){return this.checkoutFormGroup.get('customer.lastName');}
  get email(){return this.checkoutFormGroup.get('customer.email');}
  
  get shippingAddressStreat(){return this.checkoutFormGroup.get('shippingAddress.street');}
  get shippingAddressCity(){return this.checkoutFormGroup.get('shippingAddress.city');}
  get shippingAddressState(){return this.checkoutFormGroup.get('shippingAddress.state');}
  get shippingAddressZipCode(){return this.checkoutFormGroup.get('shippingAddress.zipCode');}
  get shippingAddressCountry(){return this.checkoutFormGroup.get('shippingAddress.country');}

  get billingAddressStreat(){return this.checkoutFormGroup.get('billingAddress.street');}
  get billingAddressCity(){return this.checkoutFormGroup.get('billingAddress.city');}
  get billingAddressState(){return this.checkoutFormGroup.get('billingAddress.state');}
  get billingAddressZipCode(){return this.checkoutFormGroup.get('billingAddress.zipCode');}
  get billingAddressCountry(){return this.checkoutFormGroup.get('billingAddress.country');}

  get creditCardType(){ return this.checkoutFormGroup.get('creditCard.cardType');}
  get creditCardNameOnCard(){ return this.checkoutFormGroup.get('creditCard.nameOnCard');}
  get creditCardNumber(){ return this.checkoutFormGroup.get('creditCard.cardNumber');}
  get creditCardSecurityCode(){ return this.checkoutFormGroup.get('creditCard.securityCode');}


  copyShippingAddressToBillingAddress(event){
    if(event.target.checked){
      this.checkoutFormGroup.controls.billingAddress
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);

        this.billingAddressStates = this.shippingAddressStates;
    }else{
      this.checkoutFormGroup.controls.billingAddress.reset();

      this.billingAddressStates = [];
    }
  }

  onSubmit(){
    console.log("Handling the submit button");

    if(this.checkoutFormGroup.invalid){
      this.checkoutFormGroup.markAllAsTouched();
    }

    console.log(this.checkoutFormGroup.get('customer').value);
    console.log("The email is: " + this.checkoutFormGroup.get('customer').value.email);
  }

  
  handleMonthsAndYears(){
    const creditCardFormGroup = this.checkoutFormGroup.get('creditCard');

    const currentYear: number = new Date().getFullYear();
    const selectedYear: number= Number(creditCardFormGroup.value.expirationYear);

    let startMonth: number;
    if(currentYear === selectedYear){
      startMonth = new Date().getMonth()+1;
    }else{
      startMonth = 1;
    }

    this.ecommerceFormService.getCreditCardMonths(startMonth).subscribe(
      data=>{
        console.log("Retrived credit card months: "+JSON.stringify(data));
        this.creditCardMonths = data;
      }
    )
  }

  getStates(formGroupName: string){
    const formGrop = this.checkoutFormGroup.get(formGroupName);
    const countryCode = formGrop.value.country.code;
    const countryName = formGrop.value.country.name;

    console.log(`{formGroupName} country code: ${countryCode}`);
    console.log(`{formGroupName} country name: ${countryName}`);

    this.ecommerceFormService.getStates(countryCode).subscribe(
      data =>{
        if(formGroupName === 'shippingAddress'){
          this.shippingAddressStates = data;
        }else{
          this.billingAddressStates = data;
        }

        formGrop.get('state').setValue(data[0]);
      }
    );
  }

}
