'use client';

import { useState } from 'react';
import { Transaction } from '@/types';

interface FinancialTabProps {
  deposits: Transaction[];
  withdrawals: Transaction[];
}

export default function FinancialTab({ deposits, withdrawals }: FinancialTabProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const formatCurrency = (amount: number, currency: string) => {
    return `${currency} ${amount.toFixed(2)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const allTransactions = [...deposits, ...withdrawals].map(t => ({
    ...t,
    type: deposits.includes(t) ? 'Deposit' : 'Withdrawal'
  }));

  const filteredTransactions = allTransactions.filter(transaction => 
    transaction.method.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.status.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    transaction.amount.toString().includes(searchTerm)
  );

  return (
    <div className="h-full overflow-y-auto scrollbar-thin">
      <div className="p-4">
        {/* Search Bar */}
        <div className="mb-6">
          <div className="relative">
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-input text-foreground placeholder:text-muted-foreground rounded-lg px-4 py-1.5 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50 border border-border"
            />
            <svg className="absolute left-3 top-2 w-4 h-4 text-muted-foreground" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>

        {/* Excel-style Table */}
        <div className="bg-card border border-border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead className="border-b border-border">
                <tr className="bg-muted">
                  <th className="border-r border-border px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">Type</th>
                  <th className="border-r border-border px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">Amount</th>
                  <th className="border-r border-border px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">Method</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider font-sans">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                      No transactions found
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((transaction, index) => (
                    <tr key={transaction.id} className="hover:bg-accent/50">
                      <td className="border-r border-border px-4 py-3 text-sm text-card-foreground font-medium font-sans">
                        {transaction.type}
                      </td>
                      <td className="border-r border-border px-4 py-3 text-sm font-mono text-card-foreground">
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </td>
                      <td className="border-r border-border px-4 py-3 text-sm text-card-foreground font-sans">
                        {transaction.method}
                      </td>
                      <td className="px-4 py-3 text-sm text-card-foreground capitalize font-sans">
                        {transaction.status}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}