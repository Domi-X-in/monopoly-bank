// client/src/components/UI/FormGroup.js
import styled from 'styled-components';

export const FormGroup = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  label {
    display: block;
    margin-bottom: ${({ theme }) => theme.spacing.xs};
    font-weight: ${({ theme }) => theme.typography.fontWeights.medium};
  }
  
  .error {
    color: ${({ theme }) => theme.colors.danger};
    font-size: ${({ theme }) => theme.typography.fontSizes.small};
    margin-top: ${({ theme }) => theme.spacing.xs};
  }
`;