// client/src/components/Game/CreateGameForm.js
import React, { useState } from "react";
import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FormGroup } from "../UI/FormGroup";
import { Input } from "../UI/Input";
import { Button } from "../UI/Button";
import { Card } from "../Layout/Card";
import * as api from "../../services/api";

const FormTitle = styled.h2`
  font-size: ${({ theme }) => theme.typography.fontSizes.xlarge};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-align: center;
  color: ${({ theme }) => theme.colors.primary};
`;

export const CreateGameForm = () => {
  const [gameName, setGameName] = useState("");
  const [initialBalance, setInitialBalance] = useState("1500");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!gameName.trim()) {
      setError("Game name is required");
      return;
    }

    if (
      !initialBalance ||
      isNaN(initialBalance) ||
      Number(initialBalance) < 0
    ) {
      setError("Please enter a valid initial balance");
      return;
    }

    try {
      setLoading(true);
      const response = await api.createGame({
        name: gameName,
        initialPlayerBalance: Number(initialBalance),
      });
      navigate("/games", { state: { createdGame: response.data } });
    } catch (err) {
      setError(err.response?.data?.message || "Failed to create game");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <FormTitle>Create New Game</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="gameName">Game Name</label>
          <Input
            id="gameName"
            type="text"
            value={gameName}
            onChange={(e) => setGameName(e.target.value)}
            placeholder="Enter game name"
            required
          />
        </FormGroup>

        <FormGroup>
          <label htmlFor="initialBalance">Initial Player Balance ($)</label>
          <Input
            id="initialBalance"
            type="number"
            min="0"
            step="1"
            value={initialBalance}
            onChange={(e) => setInitialBalance(e.target.value)}
            placeholder="Enter initial balance for players"
            required
          />
        </FormGroup>

        {error && (
          <div className="error" style={{ color: "red", marginBottom: "1rem" }}>
            {error}
          </div>
        )}

        <Button type="submit" variant="primary" fullWidth disabled={loading}>
          {loading ? "Creating..." : "Create Game"}
        </Button>
      </form>
    </Card>
  );
};
