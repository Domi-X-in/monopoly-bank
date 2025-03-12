// client/src/components/Game/TransactionsList.js
import React from 'react';
import styled from 'styled-components';
import { Card } from '../Layout/Card';

const TransactionListTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.tertiary};
`;

const TransactionItem = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
`;

const TransactionDetails = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`;

const TransactionAmount = styled.span`
  font-weight: ${({ theme }) => theme.typography.fontWeights.semiBold};
  color: ${({ theme }) => theme.colors.tertiary};
`;

const TransactionParties = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
`;

const NoTransactions = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
`;

const TransactionTime = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.small};
  color: ${({ theme }) => theme.colors.textLight};
  text-align: right;
  margin-top: ${({ theme }) => theme.spacing.xs};
`;

export const TransactionsList = ({ transactions }) => {
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <Card>
      <TransactionListTitle>Recent Transactions</TransactionListTitle>
      {transactions.length === 0 ? (
        <NoTransactions>No transactions yet.</NoTransactions>
      ) : (
        transactions.map(transaction => (
          <TransactionItem key={transaction._id}>
            <TransactionDetails>
              <TransactionParties>
                {transaction.fromPlayerId.name} → {transaction.toPlayerId.name}
              </TransactionParties>
              <TransactionAmount>${transaction.amount.toLocaleString()}</TransactionAmount>
            </TransactionDetails>
            <TransactionTime>{formatTime(transaction.createdAt)}</TransactionTime>
          </TransactionItem>
        ))
      )}
    </Card>
  );
};