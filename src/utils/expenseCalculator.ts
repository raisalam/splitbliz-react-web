export type SplitType = 'EQUAL' | 'PERCENTAGE' | 'FIXED';

export interface Payer {
  userId: string;
  amount: number;
}

export interface Split {
  userId: string;
  amount: number;
}

export interface Settlement {
  fromUser: string;
  toUser: string;
  amount: number;
}

/**
 * Validates if the sum of all payers equals the total expense amount.
 */
export function validatePayers(totalAmount: number, payers: Record<string, number>): { isValid: boolean; errorMsg: string } {
  if (totalAmount <= 0) {
    return { isValid: false, errorMsg: 'Total amount must be greater than zero.' };
  }

  let totalPaid = 0;
  for (const amt of Object.values(payers)) {
    totalPaid += amt;
  }

  if (Math.abs(totalPaid - totalAmount) > 0.01) {
    return { isValid: false, errorMsg: `Payers total sum to ${totalPaid.toFixed(2)}, but expense is ${totalAmount.toFixed(2)}.` };
  }

  return { isValid: true, errorMsg: '' };
}

/**
 * Computes individual split amounts based on the selected method.
 */
export function computeSplits(
  totalAmount: number, 
  splitType: SplitType, 
  selectedUsers: string[], 
  customInputs: Record<string, number>
): { results: Record<string, number>; isValid: boolean; errorMsg: string } {
  const results: Record<string, number> = {};
  const numSelected = selectedUsers.length;

  if (numSelected === 0) {
    return { results, isValid: false, errorMsg: 'Select at least one member to participate in the split.' };
  }

  if (splitType === 'EQUAL') {
    const share = totalAmount > 0 ? Number((totalAmount / numSelected).toFixed(2)) : 0;
    let totalAssigned = 0;
    selectedUsers.forEach((userId, idx) => {
      // Adjust for floating point rounding error on the last person
      if (idx === numSelected - 1 && totalAmount > 0) {
        results[userId] = Number((totalAmount - totalAssigned).toFixed(2));
      } else {
        results[userId] = share;
        totalAssigned += share;
      }
    });
    return { results, isValid: true, errorMsg: '' };
  } 
  
  if (splitType === 'PERCENTAGE') {
    let totalPct = 0;
    selectedUsers.forEach(userId => {
      const pct = customInputs[userId] || 0;
      totalPct += pct;
      results[userId] = totalAmount > 0 ? Number(((totalAmount * pct) / 100).toFixed(2)) : 0;
    });

    if (Math.abs(totalPct - 100) > 0.01 && totalAmount > 0) {
      return { results, isValid: false, errorMsg: `Percentages add up to ${totalPct.toFixed(1)}%, must be exactly 100%.` };
    }
    return { results, isValid: true, errorMsg: '' };
  } 
  
  // FIXED type
  let totalFixed = 0;
  selectedUsers.forEach(userId => {
    const amt = customInputs[userId] || 0;
    totalFixed += amt;
    results[userId] = Number(amt.toFixed(2));
  });

  if (Math.abs(totalFixed - totalAmount) > 0.01 && totalAmount > 0) {
    return { results, isValid: false, errorMsg: `Fixed amounts sum to ₹${totalFixed.toFixed(2)}, but expense is ₹${totalAmount.toFixed(2)}.` };
  }

  return { results, isValid: true, errorMsg: '' };
}

/**
 * Calculates net balances for each user based on what they paid minus what their share was.
 * Positive balance means they are owed money.
 * Negative balance means they owe money.
 */
export function calculateBalances(
  payers: Record<string, number>, 
  splits: Record<string, number>
): Record<string, number> {
  const balances: Record<string, number> = {};
  
  // Initialize balances for anyone either paying or splitting
  const allUserIds = new Set([...Object.keys(payers), ...Object.keys(splits)]);
  allUserIds.forEach(id => { balances[id] = 0; });

  // Add what they paid
  for (const [userId, amount] of Object.entries(payers)) {
    balances[userId] += amount;
  }

  // Subtract their share
  for (const [userId, amount] of Object.entries(splits)) {
    balances[userId] -= amount;
  }

  // Clean up floating point errors
  for (const userId in balances) {
    balances[userId] = Number(balances[userId].toFixed(2));
  }

  return balances;
}

/**
 * Resolves the pairwise net balances into a minimum set of transactions.
 * Greedily settles the largest debtors with the largest creditors.
 */
export function computeSettlements(balances: Record<string, number>): Settlement[] {
  const debtors: { userId: string; amount: number }[] = [];
  const creditors: { userId: string; amount: number }[] = [];

  for (const [userId, balance] of Object.entries(balances)) {
    if (balance > 0) {
      creditors.push({ userId, amount: balance });
    } else if (balance < 0) {
      debtors.push({ userId, amount: Math.abs(balance) });
    }
  }

  // Sort descending by amount to minimize transactions
  debtors.sort((a, b) => b.amount - a.amount);
  creditors.sort((a, b) => b.amount - a.amount);

  const settlements: Settlement[] = [];
  let dIdx = 0;
  let cIdx = 0;

  while (dIdx < debtors.length && cIdx < creditors.length) {
    const debtor = debtors[dIdx];
    const creditor = creditors[cIdx];

    const amount = Math.min(debtor.amount, creditor.amount);
    if (amount > 0) {
       settlements.push({
         fromUser: debtor.userId,
         toUser: creditor.userId,
         amount: Number(amount.toFixed(2))
       });
    }

    debtor.amount -= amount;
    creditor.amount -= amount;

    if (debtor.amount < 0.01) dIdx++;
    if (creditor.amount < 0.01) cIdx++;
  }

  return settlements;
}
