export const calculateCommission = (
  totalAmount: number,
  commissionRate: number
) => {
  const commissionAmount = (totalAmount * commissionRate) / 100;
  const supplierEarning = totalAmount - commissionAmount;

  return {
    commissionAmount,
    supplierEarning
  };
};