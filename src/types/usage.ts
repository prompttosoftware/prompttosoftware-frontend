export interface HistoricalSpending {
  date: string; // YYYY-MM-DD
  amount: number;
}

export interface AccountUsage {
  currentPeriodSpent: number;
  budgetLimit: number;
  historicalSpending: HistoricalSpending[];
}

export interface AuthMeResponse {
  id: string;
  email: string;
  name?: string;
  // ... other user details
  usage: AccountUsage; // This will contain the usage data
}
