import { render, screen, fireEvent, within } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CartLineItem from './CartLineItem.jsx';
import { MAX_QUANTITY } from '@/constants/index.js';

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
    expect(screen.getByRole('button', { name: 'Remove Test Product' })).toBeInTheDocument();
  });

  it('clicking increase quantity calls onQuantityChange with incremented value', () => {
    const onQuantityChange = jest.fn();
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={onQuantityChange} />);
    fireEvent.click(screen.getByRole('button', { name: /increase quantity/i }));
    expect(onQuantityChange).toHaveBeenCalledWith(3);
  });

  it('clicking decrease quantity calls onQuantityChange with decremented value', () => {
    const onQuantityChange = jest.fn();
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={onQuantityChange} />);
    fireEvent.click(screen.getByRole('button', { name: /decrease quantity/i }));
    expect(onQuantityChange).toHaveBeenCalledWith(1);
  });

  it('typing 0 and blurring reverts spinbutton to previous cart quantity', () => {
    const onQuantityChange = jest.fn();
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={onQuantityChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.change(input, { target: { value: '0' } });
    fireEvent.blur(input);
    expect(input).toHaveValue(item.quantity);
    expect(onQuantityChange).toHaveBeenCalledWith(item.quantity);
  });

  it('typing above MAX_QUANTITY shows inline max alert and reverts to original quantity on blur', () => {
    const onQuantityChange = jest.fn();
    render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={onQuantityChange} />);
    const input = screen.getByRole('spinbutton');
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: String(MAX_QUANTITY + 1) } });
    expect(screen.getByRole('alert')).toHaveTextContent(`Maximum quantity is ${MAX_QUANTITY}`);
    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    expect(onQuantityChange).not.toHaveBeenCalled();
    fireEvent.blur(input);
    expect(input).toHaveValue(item.quantity);
    expect(onQuantityChange).toHaveBeenCalledWith(item.quantity);
  });

  describe('remove confirmation modal', () => {
    it('modal is not shown on initial render', () => {
      render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('clicking remove button opens confirmation modal', () => {
      render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      expect(screen.getByRole('dialog')).toBeInTheDocument();
    });

    it('clicking remove button does not immediately call onRemove', () => {
      const onRemove = jest.fn();
      render(<CartLineItem item={item} onRemove={onRemove} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('modal shows item title', () => {
      render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText('Test Product')).toBeInTheDocument();
    });

    it('modal shows item total price', () => {
      render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/\$50\.00/)).toBeInTheDocument();
    });

    it('clicking Remove in modal calls onRemove', () => {
      const onRemove = jest.fn();
      render(<CartLineItem item={item} onRemove={onRemove} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /remove/i }));
      expect(onRemove).toHaveBeenCalledTimes(1);
    });

    it('modal closes after confirming Remove', () => {
      render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      fireEvent.click(within(screen.getByRole('dialog')).getByRole('button', { name: /remove/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('clicking Keep closes modal without calling onRemove', () => {
      const onRemove = jest.fn();
      render(<CartLineItem item={item} onRemove={onRemove} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      fireEvent.click(screen.getByRole('button', { name: /keep/i }));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('clicking backdrop closes modal without calling onRemove', () => {
      const onRemove = jest.fn();
      render(<CartLineItem item={item} onRemove={onRemove} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      fireEvent.click(screen.getByTestId('remove-confirm-backdrop'));
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
      expect(onRemove).not.toHaveBeenCalled();
    });

    it('modal uses plural "units" for quantity > 1', () => {
      render(<CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      expect(screen.getByRole('heading', { name: /remove all 2 units/i })).toBeInTheDocument();
    });

    it('modal uses singular "unit" for quantity = 1', () => {
      const singleItem = { ...item, quantity: 1 };
      render(<CartLineItem item={singleItem} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      expect(screen.getByRole('heading', { name: /remove all 1 unit\b/i })).toBeInTheDocument();
    });

    it('modal body shows singular "unit" and correct price for quantity=1', () => {
      const singleItem = { ...item, quantity: 1 };
      render(<CartLineItem item={singleItem} onRemove={jest.fn()} onQuantityChange={jest.fn()} />);
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      const dialog = screen.getByRole('dialog');
      expect(within(dialog).getByText(/1 unit · \$25\.00/i)).toBeInTheDocument();
    });

    it('passes axe accessibility audit with modal open', async () => {
      const { container } = render(
        <CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />
      );
      fireEvent.click(screen.getByRole('button', { name: 'Remove Test Product' }));
      const results = await axe(container);
      expect(results).toHaveNoViolations();
    });
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(
      <CartLineItem item={item} onRemove={jest.fn()} onQuantityChange={jest.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
