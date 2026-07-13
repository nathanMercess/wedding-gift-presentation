import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export abstract class CpfValidators {
  public static validator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      const digits = (control.value as string)?.replace(/\D/g, '') ?? '';
      return CpfValidators.isValid(digits) ? null : { invalidCpf: true };
    };
  }

  public static isValid(value: string): boolean {
    const digits: string = value.replace(/\D/g, '');

    if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits))
      return false;

    let firstSum: number = 0;

    for (let index: number = 0; index < 9; index += 1)
      firstSum += Number(digits[index]) * (10 - index);

    const firstRemainder: number = (firstSum * 10) % 11;
    const firstDigit: number = firstRemainder === 10 ? 0 : firstRemainder;

    if (firstDigit !== Number(digits[9]))
      return false;

    let secondSum: number = 0;

    for (let index: number = 0; index < 10; index += 1)
      secondSum += Number(digits[index]) * (11 - index);

    const secondRemainder: number = (secondSum * 10) % 11;
    const secondDigit: number = secondRemainder === 10 ? 0 : secondRemainder;
    return secondDigit === Number(digits[10]);
  }
}
