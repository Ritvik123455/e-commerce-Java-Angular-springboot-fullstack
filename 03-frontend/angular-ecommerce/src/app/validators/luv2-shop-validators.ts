import { FormControl, ValidationErrors } from "@angular/forms";

export class Luv2ShopValidators {

    // Whitespace validator
    static notOnlyWhitespace(control: FormControl) : ValidationErrors | null {
        if (control.value != null && (control.value as string).trim().length === 0) {
            return { 'notOnlyWhitespace': true };
        }
        else {
            return null;
        }
    }
}
