import { GiftCategory } from '../enums/gift-category.enum';
import { Gift } from '../models/gift.model';

export abstract class GiftImportUtil {
  public static parse(content: string): Array<Partial<Gift>> {
    const lines: string[] = content.replace(/^\uFEFF/, '').split(/\r?\n/).filter((line: string): boolean => line.trim().length > 0);

    if (lines.length < 2)
      return [];

    const separator: string = lines[0].includes(';') ? ';' : ',';
    const headers: string[] = GiftImportUtil.splitLine(lines[0], separator).map((header: string): string => header.trim().toLowerCase());

    return lines.slice(1).map((line: string): Partial<Gift> | null => {
      const values: string[] = GiftImportUtil.splitLine(line, separator);
      const value: Record<string, string> = {};
      headers.forEach((header: string, index: number): void => { value[header] = values[index]?.trim() ?? ''; });
      const name: string = value['nome'] || value['name'];
      const total: number = Number((value['valor'] || value['total'] || '').replace(',', '.'));
      const categoryText: string = value['categoria'] || value['category'] || '';
      const category: GiftCategory | null = Object.values(GiftCategory).includes(categoryText as GiftCategory) ? categoryText as GiftCategory : null;

      if (!name || !Number.isFinite(total) || total <= 0)
        return null;

      return {
        name,
        total,
        price: total,
        category,
        description: value['descricao'] || value['description'] || '',
        image: value['imagem'] || value['image'] || '',
        allowPartialContribution: GiftImportUtil.boolean(value['parcial'] || value['allowpartialcontribution'], true),
        available: true,
        raised: 0,
        fullyFunded: false,
      };
    }).filter((gift: Partial<Gift> | null): gift is Partial<Gift> => gift !== null);
  }

  public static splitLine(line: string, separator: string): string[] {
    const values: string[] = [];
    let current: string = '';
    let quoted: boolean = false;

    for (let index: number = 0; index < line.length; index++) {
      const character: string = line[index];

      if (character === '"') {
        quoted = !quoted;
        continue;
      }

      if (character === separator && !quoted) {
        values.push(current);
        current = '';
        continue;
      }

      current += character;
    }

    values.push(current);
    return values;
  }

  public static boolean(value: string, fallback: boolean): boolean {
    if (!value)
      return fallback;

    return ['true', 'sim', '1', 'yes'].includes(value.trim().toLowerCase());
  }
}
