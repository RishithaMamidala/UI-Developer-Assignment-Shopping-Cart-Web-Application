import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import QuantitySelector from './QuantitySelector.jsx';

expect.extend(toHaveNoViolations);

describe('QuantitySelector', () => {
  // --- Rendering & accessibility ---

  it('renders decrement and increment buttons with correct aria-labels', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeInTheDocument();
  });

  it('input has an associated <label> via htmlFor/id', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} />);
    const input = screen.getByRole('spinbutton');
    const label = screen.getByText(/quantity/i);
    expect(label).toHaveAttribute('for', input.id);
  });

  it('disabled prop disables all three controls', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} disabled />);
    expect(screen.getByRole('button', { name: 'Decrease quantity' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Increase quantity' })).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  // --- Increment / Decrement ---

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

  it('clicking decrement at min does not call onChange', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={1} onChange={onChange} min={1} max={50} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  it('clicking increment at max does not call onChange', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={50} onChange={onChange} min={1} max={50} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    expect(onChange).not.toHaveBeenCalled();
  });

  // --- Typing ---

  it('typing a valid value calls onChange', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={1} max={50} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '10' } });
    expect(onChange).toHaveBeenCalledWith(10);
  });

  it('typing above max shows "Maximum quantity is N" alert', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} min={1} max={50} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '100' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Maximum quantity is 50');
  });

  it('typing below min shows "Minimum quantity is N" alert', () => {
    render(<QuantitySelector value={5} onChange={jest.fn()} min={1} max={50} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    expect(screen.getByRole('alert')).toHaveTextContent('Minimum quantity is 1');
  });

  // --- Out-of-range via buttons ---

  it('decrement below min shows "Minimum quantity" alert with aria-live="assertive" and does not call onValidityChange(false)', () => {
    const onValidityChange = jest.fn();
    render(<QuantitySelector value={1} onChange={jest.fn()} min={1} max={50} onValidityChange={onValidityChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Minimum quantity is 1');
    expect(alert).toHaveAttribute('aria-live', 'assertive');
    expect(onValidityChange).not.toHaveBeenCalledWith(false);
  });

  it('increment above max shows "Maximum quantity" alert and calls onValidityChange(false)', () => {
    const onValidityChange = jest.fn();
    render(<QuantitySelector value={50} onChange={jest.fn()} min={1} max={50} onValidityChange={onValidityChange} />);
    fireEvent.click(screen.getByRole('button', { name: 'Increase quantity' }));
    const alert = screen.getByRole('alert');
    expect(alert).toHaveTextContent('Maximum quantity is 50');
    expect(onValidityChange).toHaveBeenCalledWith(false);
  });

  it('error message clears when focus leaves the component', () => {
    render(<QuantitySelector value={1} onChange={jest.fn()} min={1} max={50} />);
    fireEvent.click(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(screen.getByRole('alert')).toBeInTheDocument();
    fireEvent.blur(screen.getByRole('button', { name: 'Decrease quantity' }));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  // --- onValidityChange ---

  it('calls onValidityChange(false) when an out-of-range value is typed', () => {
    const onValidityChange = jest.fn();
    render(<QuantitySelector value={5} onChange={jest.fn()} min={1} max={50} onValidityChange={onValidityChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    expect(onValidityChange).toHaveBeenCalledWith(false);
  });

  it('calls onValidityChange(true) when a valid value is typed after an invalid one', () => {
    const onValidityChange = jest.fn();
    render(<QuantitySelector value={5} onChange={jest.fn()} min={1} max={50} onValidityChange={onValidityChange} />);
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '0' } });
    fireEvent.change(screen.getByRole('spinbutton'), { target: { value: '3' } });
    expect(onValidityChange).toHaveBeenLastCalledWith(true);
  });

  // --- Blur / reset behavior ---

  it('clearing the input does not call onChange mid-edit; blur resets to min and commits', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={1} max={50} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue(1);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('typing an over-max value and blurring resets to min when no resetTo', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={1} max={50} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '99' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue(1);
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('with resetTo prop, blur on invalid value reverts to resetTo not min', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={4} onChange={onChange} min={1} max={50} resetTo={4} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '99' } });
    expect(onChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue(4);
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('can type a new value after clearing the input', () => {
    const onChange = jest.fn();
    render(<QuantitySelector value={5} onChange={onChange} min={1} max={50} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '' } });
    fireEvent.change(input, { target: { value: '8' } });
    expect(onChange).toHaveBeenCalledWith(8);
  });

  // --- Axe audit ---

  it('passes axe accessibility audit', async () => {
    const { container } = render(<QuantitySelector value={5} onChange={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
