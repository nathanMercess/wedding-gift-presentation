import { PaymentStatus } from '../enums/payment-status.enum';

export abstract class PaymentStatusUtil {
  public static isApproved(status: PaymentStatus): boolean {
    return status === PaymentStatus.Approved || status === PaymentStatus.Processed;
  }

  public static isPending(status: PaymentStatus): boolean {
    return status === PaymentStatus.Pending || status === PaymentStatus.InProcess || status === PaymentStatus.Created || status === PaymentStatus.Processing || status === PaymentStatus.ActionRequired || status === PaymentStatus.InMediation;
  }

  public static isFinalFailure(status: PaymentStatus): boolean {
    return status === PaymentStatus.Rejected || status === PaymentStatus.Error || status === PaymentStatus.Failed || status === PaymentStatus.Expired || status === PaymentStatus.Cancelled || status === PaymentStatus.Canceled || status === PaymentStatus.Refunded || status === PaymentStatus.PartiallyRefunded || status === PaymentStatus.ChargedBack;
  }

  public static label(status: PaymentStatus): string {
    if (PaymentStatusUtil.isApproved(status))
      return 'Aprovado';

    if (status === PaymentStatus.InProcess || status === PaymentStatus.Processing)
      return 'Em analise';

    if (status === PaymentStatus.Pending)
      return 'Pendente';

    if (status === PaymentStatus.Created)
      return 'Criado';

    if (status === PaymentStatus.ActionRequired)
      return 'Aguardando pagamento';

    if (status === PaymentStatus.InMediation)
      return 'Em mediação';

    if (status === PaymentStatus.Rejected)
      return 'Recusado';

    if (status === PaymentStatus.Failed)
      return 'Falhou';

    if (status === PaymentStatus.Expired)
      return 'Expirado';

    if (status === PaymentStatus.Cancelled || status === PaymentStatus.Canceled)
      return 'Cancelado';

    if (status === PaymentStatus.Refunded)
      return 'Estornado';

    if (status === PaymentStatus.PartiallyRefunded)
      return 'Parcialmente estornado';

    if (status === PaymentStatus.ChargedBack)
      return 'Chargeback';

    return 'Erro';
  }

  public static message(status: PaymentStatus, coupleName: string): string {
    if (PaymentStatusUtil.isApproved(status))
      return `Pagamento aprovado. Obrigado por presentear ${coupleName}.`;

    if (status === PaymentStatus.ActionRequired)
      return 'Aguardando a conclusão do pagamento para confirmar o presente.';

    if (PaymentStatusUtil.isPending(status))
      return 'Pagamento recebido e em analise. Assim que for confirmado, o presente sera registrado para o casal.';

    if (status === PaymentStatus.Expired)
      return 'O pagamento expirou antes da confirmacao.';

    if (status === PaymentStatus.Cancelled || status === PaymentStatus.Canceled)
      return 'O pagamento foi cancelado.';

    if (status === PaymentStatus.Refunded)
      return 'O pagamento foi estornado.';

    if (status === PaymentStatus.PartiallyRefunded)
      return 'O pagamento foi parcialmente estornado.';

    if (status === PaymentStatus.ChargedBack)
      return 'O pagamento foi contestado e recebeu chargeback.';

    return 'Nao foi possivel confirmar este pagamento.';
  }
}
