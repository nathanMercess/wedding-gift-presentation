import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export abstract class CpfValidators {
  public static validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const digits = (control.value as string)?.replace(/\D/g, '') ?? '';
      return digits.length === 11 ? null : { invalidCpf: true };
    };
  }
}
