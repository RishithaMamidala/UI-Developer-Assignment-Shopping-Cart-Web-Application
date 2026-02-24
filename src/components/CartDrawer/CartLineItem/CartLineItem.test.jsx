import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CartLineItem from './CartLineItem.jsx';

expect.extend(toHaveNoViolations);

const item = {
  productId: 1,
  title: 'Test Product',
  image: 'https://fakestoreapi.com/img/test.jpg',
  price: 25.0,
  quantity: 2,
};

describe('CartLineItem', () => {
  it('renders product thumbnail with alt text', () => {
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
    const img = screen.getByAltText('Test Product');
    expect(img).toHaveAttribute('src', item.image);
  });

  it('renders product name', () => {
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
    expect(screen.getByText('Test Product')).toBeInTheDocument();
  });

  it('renders unit price via formatPrice', () => {
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });

  it('renders QuantitySelector with item.quantity', () => {
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
    expect(screen.getByRole('spinbutton')).toHaveValue(2);
  });

  it('renders line subtotal (price * quantity)', () => {
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
    expect(screen.getByText('$50.00')).toBeInTheDocument();
  });

  it('renders a remove button', () => {
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
    expect(screen.getByRole('button', { name: /remove/i })).toBeInTheDocument();
  });

  it('clicking remove button calls onRemove', () => {
    const onRemove = jest.fn();
    render(<CartLineItem item={item} onRemove={onRemove} onQuantityChange={jest.fn()} />);
    fireEvent.click(screen.getByRole('button', { name: /remove/i }));
    expect(onRemove).toHaveBeenCalled();
  });

  it('changing QuantitySelector calls onQuantityChange with new value', () => {
    const onQuantityChange = jest.fn();
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={onQuantityChange} />);
    fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(onQuantityChange).toHaveBeenCalledWith(3);
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(
      <CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
