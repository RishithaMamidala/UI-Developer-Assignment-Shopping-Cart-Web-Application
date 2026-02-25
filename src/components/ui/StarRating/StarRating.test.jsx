import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import StarRating from './StarRating.jsx';

expect.extend(toHaveNoViolations);

/** Returns the `offset` attribute of the first <stop> in each linearGradient, one per star. */
function getStopOffsets(container) {
  return Array.from(container.querySelectorAll('linearGradient')).map(
    (grad) => grad.querySelector('stop').getAttribute('offset')
  );
}

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

  it('renders all stars fully filled for rate 5', () => {
    const { container } = render(<StarRating rate={5} count={0} />);
    expect(getStopOffsets(container)).toEqual(['100.0%', '100.0%', '100.0%', '100.0%', '100.0%']);
  });

  it('renders all stars empty for rate 0', () => {
    const { container } = render(<StarRating rate={0} count={0} />);
    expect(getStopOffsets(container)).toEqual(['0.0%', '0.0%', '0.0%', '0.0%', '0.0%']);
  });

  it('renders correct gradient offsets for a fractional rate (3.7)', () => {
    const { container } = render(<StarRating rate={3.7} count={0} />);
    // stars 0-2 full, star 3 at 70%, star 4 empty
    expect(getStopOffsets(container)).toEqual(['100.0%', '100.0%', '100.0%', '70.0%', '0.0%']);
  });

  it('renders correct gradient offsets for a fractional rate (4.2)', () => {
    const { container } = render(<StarRating rate={4.2} count={0} />);
    // stars 0-3 full, star 4 at 20%
    expect(getStopOffsets(container)).toEqual(['100.0%', '100.0%', '100.0%', '100.0%', '20.0%']);
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<StarRating rate={4} count={10} />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
