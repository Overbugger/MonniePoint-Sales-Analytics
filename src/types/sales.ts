export interface Transaction {
  salesStaffId: string;
  timestamp: Date;
  products: { [key: string]: number };
  saleAmount: number;
}

export interface DailySales {
  volume: number;
  value: number;
  date: string;
}