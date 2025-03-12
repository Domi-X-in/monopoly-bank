
// client/src/pages/WelcomePage.js
import React from 'react';
import styled from 'styled-components';
import { Header } from '../components/UI/Header';
import { Container } from '../components/Layout/Container';
import { CreateGameForm } from '../components/Game/CreateGameForm';
import { JoinGameForm } from '../components/Game/JoinGameForm';

const WelcomeTitle = styled.h1`
  font-size: ${({ theme }) => theme.typography.fontSizes.xxlarge};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.tertiary};
`;

const WelcomeText = styled.p`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.textLight};
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
`;

const FormsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: ${({ theme }) => theme.spacing.lg};
  max-width: 800px;
  margin: 0 auto;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr 1fr;
  }
`;

const WelcomePage = () => {
  return (
    <>
      <Header />
      <Container>
        <WelcomeTitle>Welcome to Monopoly Bank</WelcomeTitle>
        <WelcomeText>
          Manage your Monopoly money digitally! Create a new game or join an existing one.
        </WelcomeText>
        
        <FormsContainer>
          <CreateGameForm />
          <JoinGameForm />
        </FormsContainer>
      </Container>
    </>
  );
};

export default WelcomePage;