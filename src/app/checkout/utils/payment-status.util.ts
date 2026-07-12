import { PaymentStatus } from '../enums/payment-status.enum';

export abstract class PaymentStatusUtil {
  public static isApproved(status: PaymentStatus): boolean {
    return status === PaymentStatus.Approved || status === PaymentStatus.Processed;
  }

  public static isPending(status: PaymentStatus): boolean {
    return status === PaymentStatus.Pending || status === PaymentStatus.InProcess;
  }

  public static isFinalFailure(status: PaymentStatus): boolean {
    return status === PaymentStatus.Rejected || status === PaymentStatus.Error || status === PaymentStatus.Expired || status === PaymentStatus.Cancelled;
  }

  public static label(status: PaymentStatus): string {
    if (PaymentStatusUtil.isApproved(status))
      return 'Aprovado';

    if (status === PaymentStatus.InProcess)
      return 'Em analise';

    if (status === PaymentStatus.Pending)
      return 'Pendente';

    if (status === PaymentStatus.Rejected)
      return 'Recusado';

    if (status === PaymentStatus.Expired)
      return 'Expirado';

    if (status === PaymentStatus.Cancelled)
      return 'Cancelado';

    return 'Erro';
  }

  public static message(status: PaymentStatus, coupleName: string): string {
    if (PaymentStatusUtil.isApproved(status))
      return `Pagamento aprovado. Obrigado por presentear ${coupleName}.`;

    if (PaymentStatusUtil.isPending(status))
      return 'Pagamento recebido e em analise. Assim que for confirmado, o presente sera registrado para o casal.';

    if (status === PaymentStatus.Expired)
      return 'O pagamento expirou antes da confirmacao.';

    if (status === PaymentStatus.Cancelled)
      return 'O pagamento foi cancelado.';

    return 'Nao foi possivel confirmar este pagamento.';
  }
}
