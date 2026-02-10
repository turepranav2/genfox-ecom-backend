export const ORDER_STATUSES = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED"
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const STATUS_FLOW = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED"
] as const;