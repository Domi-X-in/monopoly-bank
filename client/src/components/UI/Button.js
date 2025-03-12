// client/src/components/UI/Button.js
import styled, { css } from 'styled-components';

export const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.lg}`};
  font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  border-radius: ${({ theme }) => theme.borderRadius.small};
  transition: all ${({ theme }) => theme.transitions.default};
  font-size: ${({ theme }) => theme.typography.fontSizes.medium};
  box-shadow: ${({ theme }) => theme.shadows.small};
  
  ${({ variant, theme }) => {
    switch (variant) {
      case 'primary':
        return css`
          background-color: ${theme.colors.primary};
          color: ${theme.colors.secondary};
          
          &:hover, &:focus {
            background-color: #c01712;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.medium};
          }
        `;
      case 'secondary':
        return css`
          background-color: ${theme.colors.secondary};
          color: ${theme.colors.primary};
          border: 2px solid ${theme.colors.primary};
          
          &:hover, &:focus {
            background-color: #f8f8f8;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.medium};
          }
        `;
      case 'bank':
        return css`
          background-color: ${theme.colors.bank};
          color: ${theme.colors.tertiary};
          
          &:hover, &:focus {
            background-color: #e6b800;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.medium};
          }
        `;
      default:
        return css`
          background-color: ${theme.colors.tertiary};
          color: ${theme.colors.secondary};
          
          &:hover, &:focus {
            background-color: #333333;
            transform: translateY(-2px);
            box-shadow: ${theme.shadows.medium};
          }
        `;
    }
  }}
  
  ${({ fullWidth }) => fullWidth && css`
    width: 100%;
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none !important;
    box-shadow: none !important;
  }
`;