import { FormControl } from '@angular/forms';
import { CpfValidators } from './cpf-validators';

describe('CpfValidators', () => {
  it('aceita CPF válido, inclusive o utilizado no sandbox', () => {
    const control: FormControl<string | null> = new FormControl('123.456.789-09', CpfValidators.validator());

    expect(control.valid).toBe(true);
    expect(CpfValidators.isValid('12345678909')).toBe(true);
  });

  it('rejeita CPF com dígitos verificadores inválidos', () => {
    const control: FormControl<string | null> = new FormControl('123.456.789-01', CpfValidators.validator());

    expect(control.hasError('invalidCpf')).toBe(true);
  });

  it('rejeita sequências repetidas', () => {
    expect(CpfValidators.isValid('00000000000')).toBe(false);
    expect(CpfValidators.isValid('11111111111')).toBe(false);
  });
});
