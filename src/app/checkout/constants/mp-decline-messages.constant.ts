export const MP_DECLINE_MESSAGES: Record<string, string> = {
  cc_rejected_insufficient_amount: 'Saldo ou limite insuficiente neste cartão.',
  cc_rejected_bad_filled_security_code: 'Código de segurança (CVV) inválido.',
  cc_rejected_bad_filled_date: 'Data de validade inválida.',
  cc_rejected_bad_filled_card_number: 'Número do cartão inválido.',
  cc_rejected_bad_filled_other: 'Dados do cartão inválidos. Confira e tente novamente.',
  cc_rejected_call_for_authorize: 'Autorize esta compra com o seu banco e tente novamente.',
  cc_rejected_card_disabled: 'Cartão desabilitado. Contate o emissor.',
  cc_rejected_card_error: 'Não foi possível processar este cartão. Tente outro.',
  cc_rejected_duplicated_payment: 'Pagamento duplicado. Aguarde alguns minutos antes de tentar de novo.',
  cc_rejected_high_risk: 'Pagamento recusado por segurança. Use outro meio de pagamento.',
  cc_rejected_max_attempts: 'Muitas tentativas. Tente mais tarde ou use outro cartão.',
  cc_rejected_blacklist: 'Cartão não autorizado. Use outro cartão.',
  cc_rejected_other_reason: 'O emissor recusou o pagamento. Tente outro cartão.',
};

export const MP_DECLINE_FALLBACK = 'Pagamento recusado. Verifique os dados ou tente outro cartão.';
