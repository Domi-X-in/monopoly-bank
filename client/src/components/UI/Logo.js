// client/src/components/UI/Logo.js
import React from 'react';
import styled from 'styled-components';
import monopolyLogo from '../../assets/monopoly-logo.png';

const LogoImage = styled.img`
  width: ${props => props.width || '200px'};
  height: auto;
`;

export const Logo = ({ width }) => {
  return <LogoImage src={monopolyLogo} alt="Monopoly Bank" width={width} />;
};