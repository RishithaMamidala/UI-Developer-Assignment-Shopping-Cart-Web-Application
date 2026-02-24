import { render } from '@testing-library/react';
import ProductSkeleton from './ProductSkeleton.jsx';

describe('ProductSkeleton', () => {
  it('renders with aria-hidden="true"', () => {
    const { container } = render(<ProductSkeleton />);
    expect(container.firstChild).toHaveAttribute('aria-hidden', 'true');
  });

  it('contains animate-pulse class', () => {
    const { container } = render(<ProductSkeleton />);
    expect(container.firstChild.className).toMatch(/animate-pulse/);
  });

  it('does not render any text content', () => {
    const { container } = render(<ProductSkeleton />);
    expect(container.textContent).toBe('');
  });
});
