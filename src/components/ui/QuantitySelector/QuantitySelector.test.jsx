import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import QuantitySelector from './QuantitySelector.jsx';

expect.extend(toHaveNoViolations);

describe('QuantitySelector', () => {
  it('decrement button has aria-label="Decrease quantity"', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeInTheDocument();
  });

  it('increment button has aria-label="Increase quantity"', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeInTheDocument();
  });

  it('input has an associated <label> via htmlFor/id', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} />);
    const input = screen.getByRole('spinbutton');
    const label = screen.getByText(/quantity/i);
    expect(label).toHaveAttribute('for', input.id);
  });

  it('clicking decrement calls onChange with value - 1', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={1} max={50} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('clicking increment calls onChange with value + 1', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={1} max={50} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('typing a valid value calls onChange', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={1} max={50} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('typing an out-of-range value shows an error message', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} min={1} max={50} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } });
    expect(screen.getByRole('alert')).toBeInTheDocument();
    expect(screen.getByRole('alert')).toHaveTextContent('Maximum quantity is 50');
  });

  it('ArrowUp and ArrowDown keys do not call onChange', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={1} max={50} />);
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowUp' });
    fireEvent.keyDown(screen.getByRole('spinbutton'), { key: 'ArrowDown' });
    expect(onChange).not.toHaveBeenCalled();
  });

  it('value below min shows role="alert" error message with aria-live="assertive"', () => {
    render(<QuantitySelector value={1} onChange={jest.fn()} min={1} max={50} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(alert).toBeInTheDocument();
  });

  it('value above max shows role="alert" error message', () => {
    render(<QuantitySelector value={50} onChange={jest.fn()} min={1} max={50} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
  });

  it('disabled prop disables all three controls', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('error message clears when focus leaves the component', () => {
    render(<QuantitySelector value={1} onChange={jest.fn()} min={1} max={50} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.blur(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<QuantitySelector value={5} onChange={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
