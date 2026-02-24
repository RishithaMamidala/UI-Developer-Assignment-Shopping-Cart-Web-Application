import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Header from './Header.jsx';

expect.extend(toHaveNoViolations);

describe('Header', () => {
  it('renders cart button with aria-label "Cart, 0 items" when cartCount=0', () => {
    render(<Header cartCount={0} onOpenCart={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Cart, 0 items' })).toBeInTheDocument();
  });

  it('updates aria-label to "Cart, 3 items" when cartCount=3', () => {
    render(<Header cartCount={3} onOpenCart={jest.fn()} />);
    expect(screen.getByRole('button', { name: 'Cart, 3 items' })).toBeInTheDocument();
  });

  it('clicking cart button calls onOpenCart', () => {
    const onOpenCart = jest.fn();
    render(<Header cartCount={0} onOpenCart={onOpenCart} />);
    fireEvent.click(screen.getByRole('button', { name: /Cart/i }));
    expect(onOpenCart).toHaveBeenCalled();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<Header cartCount={0} onOpenCart={jest.fn()} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
