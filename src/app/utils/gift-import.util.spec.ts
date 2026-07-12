import { GiftCategory } from '../enums/gift-category.enum';
import { GiftImportUtil } from './gift-import.util';

describe('GiftImportUtil', () => {
  it('importa CSV com categoria opcional', () => {
    const gifts = GiftImportUtil.parse('nome;valor;categoria;descricao;parcial\nAir Fryer;500;Eletrodomésticos;Presente útil;sim\nLua de mel;150;;Presente divertido;nao');

    expect(gifts).toHaveLength(2);
    expect(gifts[0]).toEqual(expect.objectContaining({ name: 'Air Fryer', total: 500, category: GiftCategory.Appliances, allowPartialContribution: true }));
    expect(gifts[1]).toEqual(expect.objectContaining({ name: 'Lua de mel', total: 150, category: null, allowPartialContribution: false }));
  });

  it('ignora linhas sem nome ou valor válido', () => {
    const gifts = GiftImportUtil.parse('nome;valor\n;100\nItem;0\nValido;25');

    expect(gifts).toHaveLength(1);
    expect(gifts[0].name).toBe('Valido');
  });

  it('preserva separadores dentro de valores entre aspas', () => {
    const gifts = GiftImportUtil.parse('nome;valor;descricao\n"Jantar, especial";200;"Mesa; varanda"');

    expect(gifts[0]).toEqual(expect.objectContaining({ name: 'Jantar, especial', description: 'Mesa; varanda' }));
  });
});
