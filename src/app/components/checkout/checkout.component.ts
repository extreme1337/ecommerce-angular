import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, FormGroupDirective } from '@angular/forms';
import { Country } from 'src/app/common/country';
import { State } from 'src/app/common/state';
import { EcommerceFormService } from 'src/app/service/ecommerce-form.service';

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

  shippingAddressState: State[] = [];
  billingAddressState: State[] = [];

  constructor(private formBuilder: FormBuilder, private ecommerceFormService: EcommerceFormService) { }

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
        country: [''],
        state: [''],
        zipCode: ['']
      }),
      billingAddress: this.formBuilder.group({
        street: [''],
        city: [''],
        country: [''],
        state: [''],
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


  copyShippingAddressToBillingAddress(event){
    if(event.target.checked){
      this.checkoutFormGroup.controls.billingAddress
        .setValue(this.checkoutFormGroup.controls.shippingAddress.value);
    }else{
      this.checkoutFormGroup.controls.billingAddress.reset();
    }
  }

  onSubmit(){
    console.log("Handling the submit button");
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
          this.shippingAddressState = data;
        }else{
          this.billingAddressState = data;
        }

        formGrop.get('state').setValue(data[0]);
      }
    );
  }

}
