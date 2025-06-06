import { render, screen } from '@testing-library/react';
import App from './App';

test('renders without crashing', () => {
  render(<App />);
  // Initially the app shows a connecting message while the socket initializes
  expect(screen.getByText(/connecting to server/i)).toBeInTheDocument();
});
