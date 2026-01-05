export function round(value) {
  return Math.round(Number(value) || 0);
}

export function calculateFinancials({
  party_freight,
  party_advance,
  tds,
  himmali,
  gaadi_freight,
  gaadi_advance
}) {
  const party_balance = round(
    (party_freight + himmali) - (party_advance + tds)
  );

  const gaadi_balance = round(
    gaadi_freight - gaadi_advance
  );

  const profit = round(
    (party_freight + himmali - tds) - gaadi_freight
  );

  return {
    party_balance,
    gaadi_balance,
    profit
  };
}
