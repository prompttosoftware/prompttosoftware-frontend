export interface UserUsage {
  currentMonthSpending: number;
  previousMonthSpending: number;
  totalBudget: number;
  historicalSpending: { date: string; amount: number }[];
}
