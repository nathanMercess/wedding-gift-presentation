export abstract class DateUtil {
  public static formatWeddingDate(rawValue: string): string {
    const value = rawValue?.trim();

    if (!value)
      return '';

    const match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (!match)
      return value;

    const date = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));

    return new Intl.DateTimeFormat('pt-BR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'UTC',
    }).format(date);
  }
}
