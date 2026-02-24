import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Badge from './Badge.jsx';

expect.extend(toHaveNoViolations);

describe('Badge', () => {
  it('renders children text', () => {
    const { getByText } = render(<Badge>In Stock</Badge>);
    expect(getByText('In Stock')).toBeInTheDocument();
  });

  it('applies error styling for variant "error"', () => {
    const { container } = render(<Badge variant="error">Error</Badge>);
    expect(container.firstChild.className).toMatch(/text-error/);
  });

  it('variant "neutral" is default', () => {
    const { container } = render(<Badge>Neutral</Badge>);
    expect(container.firstChild.className).toMatch(/text-text-muted/);
  });

  it('merges extra className prop', () => {
    const { container } = render(<Badge className="extra-class">Item</Badge>);
    expect(container.firstChild.className).toMatch(/extra-class/);
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<Badge>Test</Badge>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
