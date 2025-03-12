// client/src/components/UI/Header.js
import React from 'react';
import styled from 'styled-components';
import { Logo } from './Logo';

const HeaderContainer = styled.header`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.md};
  background-color: ${({ theme }) => theme.colors.secondary};
  box-shadow: ${({ theme }) => theme.shadows.small};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`;

export const Header = () => {
  return (
    <HeaderContainer>
      <Logo width="180px" />
    </HeaderContainer>
  );
};
