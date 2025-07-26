import { Transaction } from '@/types/transactions';
import { serverFetch } from '@/lib/server-api';
import { FAKE_TRANSACTIONS } from '@/lib/dev/fakeData';

export async function fetchUserTransactions(): Promise<Transaction[]> {
    if (process.env.NEXT_PUBLIC_FAKE_AUTH === 'true') return FAKE_TRANSACTIONS;

  try {
    const res = await serverFetch(`/transactions`);
    if (res.status === 404) return [];
    if (!res.ok) {
        console.error('fetchUserTransactions:', res.statusText);
        return [];
    }
    return res.json();
  } catch (error) {
    // Handle errors appropriately
    console.error("Failed to fetch transactions:", error);
    return []; // Return empty array on failure
  }
}
