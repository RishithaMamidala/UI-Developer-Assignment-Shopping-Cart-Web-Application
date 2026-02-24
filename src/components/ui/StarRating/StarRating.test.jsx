import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import StarRating from './StarRating.jsx';

expect.extend(toHaveNoViolations);

describe('StarRating', () => {
  it('has aria-label with rate and count', () => {
    const { container } = render(<StarRating rate={4.5} count={120} />);
    const el = container.firstChild;
    expect(el).toHaveAttribute('aria-label', 'Rated 4.5 out of 5 (120 reviews)');
  });

  it('renders review count as visible text', () => {
    const { getByText } = render(<StarRating rate={3.9} count={42} />);
    expect(getByText('(42)')).toBeInTheDocument();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<StarRating rate={4} count={10} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
