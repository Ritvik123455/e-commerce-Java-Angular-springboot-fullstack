import { Country } from "./country";
import { State } from "./state";

export class Address {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;

    constructor(street: string, city: string, state: string, zipCode: string, country: string) {
        this.street = street;
        this.city = city;
        this.state = state;
        this.zipCode = zipCode;
        this.country = country;
    }
}
