export interface HistoricalSpending {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface AccountUsage {
  currentMonthSpending: number;
  previousMonthSpending: number;
  totalBudget: number;
  historicalSpending: HistoricalSpending[];
}

export interface UserUsage {
  usage: AccountUsage;
}

export interface AuthMeResponse {
  id: string;
  email: string;
  name?: string;
  // ... other user details
  usage: UserUsage; // This will contain the usage data
}
