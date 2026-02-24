import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import SortSelect from './SortSelect.jsx';

expect.extend(toHaveNoViolations);

describe('SortSelect', () => {
  it('renders a <label> associated with <select> via htmlFor/id', () => {
    render(<SortSelect value="none" onChange={jest.fn()} />);
    const label = screen.getByText(/sort by/i);
    const select = screen.getByRole('combobox');
    expect(label).toHaveAttribute('for', select.id);
  });

  it('renders 4 options: none, price_asc, price_desc, rating_desc', () => {
    render(<SortSelect value="none" onChange={jest.fn()} />);
    const options = screen.getAllByRole('option');
    expect(options).toHaveLength(4);
    expect(options[0]).toHaveValue('none');
    expect(options[1]).toHaveValue('price_asc');
    expect(options[2]).toHaveValue('price_desc');
    expect(options[3]).toHaveValue('rating_desc');
  });

  it('current value matches the value prop', () => {
    render(<SortSelect value="price_asc" onChange={jest.fn()} />);
    expect(screen.getByRole('combobox')).toHaveValue('price_asc');
  });

  it('onChange fires with new value when selection changes', () => {
    const onChange = jest.fn();
    render(<SortSelect value="none" onChange={onChange} />);
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'price_desc' } });
    expect(onChange).toHaveBeenCalledWith('price_desc');
  });

  it('option labels are human readable', () => {
    render(<SortSelect value="none" onChange={jest.fn()} />);
    expect(screen.getByRole('option', { name: /default/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /low to high/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /high to low/i })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: /rating/i })).toBeInTheDocument();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<SortSelect value="none" onChange={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
