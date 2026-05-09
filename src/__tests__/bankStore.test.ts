import { describe, it, expect, beforeEach } from 'vitest';
import { useBankStore } from '@/store/bankStore';

describe('Bank Store', () => {
  beforeEach(() => {
    // Reset store before each test
    useBankStore.setState({
      accounts: useBankStore.getState().accounts.slice(0, 1),
      activeAccountId: useBankStore.getState().accounts[0]?.id,
      budgets: [],
    });
  });

  it('should initialize with default account', () => {
    const store = useBankStore.getState();
    expect(store.accounts.length).toBeGreaterThan(0);
    expect(store.accounts[0].name).toBe('Main Checking');
    expect(store.accounts[0].balance).toBe(5000);
  });

  it('should create new account', () => {
    const store = useBankStore.getState();
    const initialCount = store.accounts.length;

    store.createAccount('Savings Account', 'savings');
    const updated = useBankStore.getState();

    expect(updated.accounts.length).toBe(initialCount + 1);
    expect(updated.accounts[updated.accounts.length - 1].type).toBe('savings');
  });

  it('should deposit funds', () => {
    const store = useBankStore.getState();
    const accountId = store.accounts[0].id;
    const initialBalance = store.accounts[0].balance;

    store.deposit(accountId, 1000, 'Test deposit');
    const updated = useBankStore.getState();
    const account = updated.accounts.find((a) => a.id === accountId);

    expect(account?.balance).toBe(initialBalance + 1000);
    expect(account?.transactions.length).toBeGreaterThan(0);
  });

  it('should withdraw funds', () => {
    const store = useBankStore.getState();
    const accountId = store.accounts[0].id;
    const initialBalance = store.accounts[0].balance;

    store.withdraw(accountId, 500, 'Test withdrawal');
    const updated = useBankStore.getState();
    const account = updated.accounts.find((a) => a.id === accountId);

    expect(account?.balance).toBe(initialBalance - 500);
  });

  it('should prevent withdrawal over balance', () => {
    const store = useBankStore.getState();
    const accountId = store.accounts[0].id;

    const result = store.withdraw(accountId, 10000, 'Overdraft attempt');

    expect(result).toBe(false);
  });

  it('should transfer between accounts', () => {
    const store = useBankStore.getState();

    // Create second account
    store.createAccount('Second Account', 'savings');
    const updated = useBankStore.getState();
    const account1 = updated.accounts[0];
    const account2 = updated.accounts[1];

    const initialBalance1 = account1.balance;
    const initialBalance2 = account2.balance;

    store.transfer(account1.id, account2.id, 500, 'Test transfer');
    const final = useBankStore.getState();
    const finalAccount1 = final.accounts.find((a) => a.id === account1.id)!;
    const finalAccount2 = final.accounts.find((a) => a.id === account2.id)!;

    expect(finalAccount1.balance).toBe(initialBalance1 - 500);
    expect(finalAccount2.balance).toBe(initialBalance2 + 500);
  });

  it('should calculate total balance', () => {
    const store = useBankStore.getState();
    store.createAccount('Second Account', 'savings');

    const total = useBankStore.getState().getTotalBalance();
    const expected = useBankStore.getState().accounts.reduce((sum, acc) => sum + acc.balance, 0);

    expect(total).toBe(expected);
  });
});
