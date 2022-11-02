export type DailyCost = {
  [cost: string]: number;
} & {
  usageDate: string;
  cost?: number;
};

export type MonthlyCost = {
  [cost: string]: number;
} & {
  billingPeriod: string;
  cost?: number;
};
