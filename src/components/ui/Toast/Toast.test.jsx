import { render, screen, fireEvent, act } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Toast from './Toast.jsx';

expect.extend(toHaveNoViolations);

describe('Toast', () => {
  beforeEach(() => jest.useFakeTimers());
  afterEach(() => jest.useRealTimers());

  it('renders div with role="status" and aria-live="polite"', () => {
    render(<Toast message="Hello" onDismiss={jest.fn()} />);
    const toast = screen.getByRole('status');
    expect(toast).toHaveAttribute('aria-live', 'polite');
  });

  it('displays the message prop', () => {
    render(<Toast message="Item added!" onDismiss={jest.fn()} />);
    expect(screen.getByText('Item added!')).toBeInTheDocument();
  });

  it('success variant has success styling', () => {
    const { container } = render(<Toast message="Done" variant="success" onDismiss={jest.fn()} />);
    const toast = container.firstChild;
    expect(toast.className).toMatch(/bg-success/);
  });

  it('error variant has error styling', () => {
    const { container } = render(<Toast message="Failed" variant="error" onDismiss={jest.fn()} />);
    const toast = container.firstChild;
    expect(toast.className).toMatch(/bg-error/);
  });

  it('calls onDismiss after 3 seconds', () => {
    const onDismiss = jest.fn();
    render(<Toast message="Hello" onDismiss={onDismiss} />);
    expect(onDismiss).not.toHaveBeenCalled();
    act(() => jest.advanceTimersByTime(3000));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('calls onDismiss when dismiss button is clicked', () => {
    const onDismiss = jest.fn();
    render(<Toast message="Hello" onDismiss={onDismiss} />);
    fireEvent.click(screen.getByRole('button', { name: /dismiss/i }));
    expect(onDismiss).toHaveBeenCalled();
  });

  it('passes axe accessibility audit', async () => {
    jest.useRealTimers();
    const { container } = render(<Toast message="Hello" onDismiss={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
