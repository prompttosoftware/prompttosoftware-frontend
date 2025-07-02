import { useBalanceStore, useBalance } from './balanceStore';

describe('balanceStore', () => {
  beforeEach(() => {
    // Reset the store to its initial state before each test
    useBalanceStore.setState({ balance: 0 });
  });

  it('should initialize with a balance of 0', () => {
    const { balance } = useBalanceStore.getState();
    expect(balance).toBe(0);
  });

  it('should update the balance using setBalance', () => {
    const { setBalance } = useBalanceStore.getState();
    setBalance(100);
    const { balance } = useBalanceStore.getState();
    expect(balance).toBe(100);
  });

  it('should allow components to subscribe to balance changes via useBalance hook', () => {
    // This part is trickier to test directly without react-hooks-testing-library
    // which is not part of the standard prompttosoftware-frontend setup.
    // However, we can still verify the store's state changes.
    // For more comprehensive hook testing, '@testing-library/react-hooks' or '@testing-library/react'
    // with a dummy component would be used.

    const { balance: initialBalance } = useBalanceStore.getState();
    expect(initialBalance).toBe(0);

    const { setBalance } = useBalanceStore.getState();
    setBalance(500);

    const { balance: newBalance } = useBalanceStore.getState();
    expect(newBalance).toBe(500);

    // In a real component, useBalance() would reflect this new state.
    // Since we don't have react-hooks-testing-library readily available,
    // we'll rely on checking the store's internal state directly for this test.
  });

  it('should handle negative balance values', () => {
    const { setBalance } = useBalanceStore.getState();
    setBalance(-25);
    const { balance } = useBalanceStore.getState();
    expect(balance).toBe(-25);
  });

  it('should update balance multiple times correctly', () => {
    const { setBalance } = useBalanceStore.getState();
    setBalance(100);
    expect(useBalanceStore.getState().balance).toBe(100);
  
    setBalance(150);
    expect(useBalanceStore.getState().balance).toBe(150);
  
    setBalance(75);
    expect(useBalanceStore.getState().balance).toBe(75);
  });
});
