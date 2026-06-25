export abstract class DateUtil {
  public static readonly dateTimeFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' });
  public static readonly shortDateFormatter: Intl.DateTimeFormat = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: '2-digit' });

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

  public static formatDateTime(value: string | null | undefined): string {
    if (!value)
      return '-';

    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
      return '-';

    return this.dateTimeFormatter.format(date);
  }

  public static formatShortDate(value: string): string {
    const date = new Date(value);

    if (Number.isNaN(date.getTime()))
      return '-';

    return this.shortDateFormatter.format(date);
  }
}
