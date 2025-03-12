// client/src/components/Game/PaymentForm.js
import React, { useState, useEffect } from "react";
import styled from "styled-components";
import { FormGroup } from "../UI/FormGroup";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { Card } from "../Layout/Card";
import * as api from "../../services/api";

export const PaymentForm = ({ gameId, currentPlayer, players, onPaymentComplete }) => {
    const [amount, setAmount] = useState('');
    const [recipientId, setRecipientId] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [recipients, setRecipients] = useState([]);
    
    // Filter and prepare recipients list with defensive checks
    useEffect(() => {
      // Ensure players is an array
      if (!Array.isArray(players)) {
        setRecipients([]);
        return;
      }
      
      // Filter out current player with defensive check
      const filteredPlayers = currentPlayer ? 
        players.filter(player => player._id !== currentPlayer._id) : [];
      
      // Ensure the Bank is always included for players
      if (currentPlayer && !currentPlayer.isBank) {
        const bankPlayer = players.find(player => player.isBank);
        if (bankPlayer && !filteredPlayers.some(p => p._id === bankPlayer._id)) {
          filteredPlayers.push(bankPlayer);
        }
      }
      
      setRecipients(filteredPlayers);
    }, [players, currentPlayer]);

const FormTitle = styled.h3`
  font-size: ${({ theme }) => theme.typography.fontSizes.large};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  color: ${({ theme }) => theme.colors.tertiary};
`;

const UsersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

const UserCard = styled.div`
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  border: 2px solid
    ${({ isSelected, theme }) =>
      isSelected ? theme.colors.primary : theme.colors.border};
  background-color: ${({ isSelected, isBank, theme }) => {
    if (isSelected) return `rgba(227, 26, 22, 0.1)`;
    if (isBank) return `rgba(255, 204, 0, 0.1)`;
    return theme.colors.secondary;
  }};
  cursor: pointer;
  transition: all ${({ theme }) => theme.transitions.default};
  text-align: center;

  &:hover {
    border-color: ${({ theme, isSelected }) =>
      isSelected ? theme.colors.primary : theme.colors.textLight};
    transform: translateY(-2px);
  }
`;

const UserName = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.small};
  font-weight: ${({ isSelected, theme }) =>
    isSelected
      ? theme.typography.fontWeights.semiBold
      : theme.typography.fontWeights.medium};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  ${({ isBank, theme }) =>
    isBank &&
    `
    color: ${theme.colors.bank};
    font-weight: ${theme.typography.fontWeights.semiBold};
  `}
`;

const BankLabel = styled.div`
  font-size: ${({ theme }) => theme.typography.fontSizes.small};
  background-color: ${({ theme }) => theme.colors.bank};
  color: ${({ theme }) => theme.colors.tertiary};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  padding: 2px 6px;
  margin-top: 4px;
  display: inline-block;
`;

const ErrorMessage = styled.div`
  color: ${({ theme }) => theme.colors.danger};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  text-align: center;
`;

const NoRecipientsMessage = styled.p`
  color: ${({ theme }) => theme.colors.textLight};
  text-align: center;
  margin: ${({ theme }) => theme.spacing.md} 0;
`;

export const PaymentForm = ({
  gameId,
  currentPlayer,
  players,
  onPaymentComplete,
}) => {
  const [amount, setAmount] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recipients, setRecipients] = useState([]);

  // Filter and prepare recipients list
  useEffect(() => {
    // Filter out current player
    const filteredPlayers = players.filter(
      (player) => player._id !== currentPlayer._id
    );

    // Ensure the Bank is always included for players
    if (!currentPlayer.isBank) {
      const bankPlayer = players.find((player) => player.isBank);
      if (
        bankPlayer &&
        !filteredPlayers.some((p) => p._id === bankPlayer._id)
      ) {
        filteredPlayers.push(bankPlayer);
      }
    }

    setRecipients(filteredPlayers);
  }, [players, currentPlayer]);

  const handleUserSelect = (userId) => {
    setRecipientId(userId === recipientId ? "" : userId);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate inputs
    if (!amount || isNaN(amount) || Number(amount) <= 0) {
      setError("Please enter a valid amount");
      return;
    }

    if (!recipientId) {
      setError("Please select a recipient");
      return;
    }

    try {
      setLoading(true);

      const paymentData = {
        gameId,
        fromPlayerId: currentPlayer._id,
        toPlayerId: recipientId,
        amount: Number(amount),
      };

      await api.createTransaction(paymentData);

      // Reset form
      setAmount("");
      setRecipientId("");
      setError("");

      // Notify parent component
      if (onPaymentComplete) {
        onPaymentComplete();
      }
    } catch (err) {
      setError(err.response?.data?.message || "Failed to make payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <FormTitle>Make Payment</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="amount">Amount</label>
          <Input
            id="amount"
            type="number"
            min="1"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="Enter amount"
            required
          />
        </FormGroup>

        <label>Pay To</label>
        {recipients.length === 0 ? (
          <NoRecipientsMessage>No other players to pay.</NoRecipientsMessage>
        ) : (
          <UsersGrid>
            {recipients.map((player) => (
              <UserCard
                key={player._id}
                isSelected={player._id === recipientId}
                isBank={player.isBank}
                onClick={() => handleUserSelect(player._id)}
              >
                <UserName
                  isSelected={player._id === recipientId}
                  isBank={player.isBank}
                >
                  {player.name}
                </UserName>
                {player.isBank && <BankLabel>Bank</BankLabel>}
              </UserCard>
            ))}
          </UsersGrid>
        )}

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <Button
          type="submit"
          variant="primary"
          fullWidth
          disabled={
            loading ||
            recipients.length === 0 ||
            !recipientId ||
            (!currentPlayer.isBank && currentPlayer.balance <= 0)
          }
        >
          {loading ? "Processing..." : "Pay"}
        </Button>

        {!currentPlayer.isBank && currentPlayer.balance <= 0 && (
          <div
            className="error"
            style={{ textAlign: "center", marginTop: "0.5rem" }}
          >
            You're out of money!
          </div>
        )}
      </form>
    </Card>
  );
};
