// client/src/components/Game/PlayersList.js
import React from 'react';
import styled from 'styled-components';
import { Card } from '../Layout/Card';

const PlayerListTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.tertiary};
`;

const PlayerItem = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.sm};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  
  &:last-child {
    border-bottom: none;
  }
  
  ${({ isBank, theme }) => isBank && `
    background-color: rgba(255, 204, 0, 0.1);
    font-weight: ${theme.typography.fontWeights.semiBold};
  `}
`;

const PlayerName = styled.div`
  display: flex;
  align-items: center;
  
  .bank-label {
    background-color: ${({ theme }) => theme.colors.bank};
    color: ${({ theme }) => theme.colors.tertiary};
    font-size: ${({ theme }) => theme.typography.fontSizes.small};
    padding: 2px 6px;
    border-radius: ${({ theme }) => theme.borderRadius.small};
    margin-left: ${({ theme }) => theme.spacing.sm};
  }
`;

const PlayerBalance = styled.div`
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  color: ${({ isBank, theme }) => isBank ? theme.colors.bank : theme.colors.tertiary};
`;

export const PlayersList = ({ players, currentPlayerId }) => {
  return (
    <Card>
      <PlayerListTitle>Players</PlayerListTitle>
      {players.length === 0 ? (
        <p>No players have joined yet.</p>
      ) : (
        players.map(player => (
          <PlayerItem key={player._id} isBank={player.isBank} isCurrentPlayer={player._id === currentPlayerId}>
            <PlayerName>
              {player.name}
              {player.isBank && <span className="bank-label">Bank</span>}
              {player._id === currentPlayerId && ' (You)'}
            </PlayerName>
            <PlayerBalance isBank={player.isBank}>
              {player.isBank 
                ? 'Unlimited' 
                : `$${player.balance.toLocaleString()}`}
            </PlayerBalance>
          </PlayerItem>
        ))
      )}
    </Card>
  );
};