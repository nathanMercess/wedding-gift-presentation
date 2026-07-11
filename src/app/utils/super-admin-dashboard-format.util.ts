import { DateUtil } from './date.util';

export abstract class SuperAdminDashboardFormatUtil {
  public static readonly sensitiveTerms: string[] = ['authorization', 'bearer', 'cookie', 'cookies', 'password', 'senha', 'token'];
  public static readonly moneyFormatter: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  public static readonly numberFormatter: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  public static readonly percentFormatter: Intl.NumberFormat = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });

  public static formatMoney(value: number): string {
    return this.moneyFormatter.format(value);
  }

  public static formatNumber(value: number): string {
    return this.numberFormatter.format(value);
  }

  public static formatPercent(value: number): string {
    return `${this.percentFormatter.format(value)}%`;
  }

  public static formatDate(value: string | null | undefined): string {
    return DateUtil.formatDateTime(value);
  }

  public static formatShortDate(value: string): string {
    return DateUtil.formatShortDate(value);
  }

  public static formatMilliseconds(value: number): string {
    return `${this.formatNumber(value)} ms`;
  }

  public static displayValue(value: string | null | undefined): string {
    if (!value || value.trim().length === 0)
      return '-';

    return value;
  }

  public static healthLabel(value: string): string {
    const normalizedValue: string = value.toLowerCase();

    if (normalizedValue === 'critical')
      return 'Crítico';

    if (normalizedValue === 'warning')
      return 'Atenção';

    return 'Saudável';
  }

  public static severityLabel(value: string): string {
    const normalizedValue: string = value.toLowerCase();

    if (normalizedValue === 'critical')
      return 'Crítico';

    if (normalizedValue === 'warning')
      return 'Atenção';

    if (normalizedValue === 'success' || normalizedValue === 'healthy')
      return 'Ok';

    return 'Info';
  }

  public static severityBadgeClass(value: string): string {
    const normalizedValue: string = value.toLowerCase();

    if (normalizedValue === 'critical')
      return 'severity-badge is-critical';

    if (normalizedValue === 'warning')
      return 'severity-badge is-warning';

    if (normalizedValue === 'success' || normalizedValue === 'healthy')
      return 'severity-badge is-success';

    return 'severity-badge';
  }

  public static healthBadgeClass(value: string): string {
    return this.severityBadgeClass(value);
  }

  public static displayPath(path: string): string {
    const value: string = this.displayValue(path);

    if (value === '-')
      return value;

    const cleanPath: string = value.split('?')[0];

    if (!cleanPath)
      return '-';

    return cleanPath;
  }

  public static safeOperationalText(value: string | null | undefined): string {
    const text: string = this.displayValue(value);

    if (text === '-')
      return text;

    const normalizedText: string = text.toLowerCase();
    const hasSensitiveTerm: boolean = this.sensitiveTerms.some((term: string): boolean => normalizedText.includes(term));

    if (hasSensitiveTerm)
      return 'Conteúdo ocultado';

    return text;
  }

  public static progressPercent(value: number): number {
    if (!Number.isFinite(value))
      return 0;

    return Math.max(0, Math.min(value, 100));
  }

  public static barWidth(value: number, maxValue: number): number {
    if (value <= 0 || maxValue <= 0)
      return 0;

    return Math.max(4, Math.min(100, (value / maxValue) * 100));
  }

  public static max(values: number[]): number {
    if (values.length === 0)
      return 0;

    return Math.max(...values);
  }

  public static statusBadgeClass(status: string): string {
    const normalizedStatus: string = status.toLowerCase();

    if (normalizedStatus.includes('approved') || normalizedStatus.includes('paid') || normalizedStatus.includes('success') || normalizedStatus.includes('aprovado') || normalizedStatus.includes('pago'))
      return 'status-badge is-success';

    if (normalizedStatus.includes('pending') || normalizedStatus.includes('processing') || normalizedStatus.includes('pendente'))
      return 'status-badge is-warning';

    if (normalizedStatus.includes('failed') || normalizedStatus.includes('cancelled') || normalizedStatus.includes('canceled') || normalizedStatus.includes('rejected') || normalizedStatus.includes('error') || normalizedStatus.includes('falha') || normalizedStatus.includes('cancelado'))
      return 'status-badge is-danger';

    return 'status-badge';
  }

}
