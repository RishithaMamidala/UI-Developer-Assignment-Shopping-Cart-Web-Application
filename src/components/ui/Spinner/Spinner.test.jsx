import { render } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import Spinner from './Spinner.jsx';

expect.extend(toHaveNoViolations);

describe('Spinner', () => {
  it('renders a div with role="status"', () => {
    const { getByRole } = render(<Spinner />);
    expect(getByRole('status')).toBeInTheDocument();
  });

  it('uses default aria-label "Loading..."', () => {
    const { getByRole } = render(<Spinner />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Loading...');
  });

  it('accepts custom aria-label', () => {
    const { getByRole } = render(<Spinner label="Please wait" />);
    expect(getByRole('status')).toHaveAttribute('aria-label', 'Please wait');
  });

  it('applies sm size classes', () => {
    const { getByRole } = render(<Spinner size="sm" />);
    const el = getByRole('status');
    expect(el.className).toMatch(/w-4/);
    expect(el.className).toMatch(/h-4/);
  });

  it('applies md size classes (default)', () => {
    const { getByRole } = render(<Spinner size="md" />);
    const el = getByRole('status');
    expect(el.className).toMatch(/w-8/);
    expect(el.className).toMatch(/h-8/);
  });

  it('applies lg size classes', () => {
    const { getByRole } = render(<Spinner size="lg" />);
    const el = getByRole('status');
    expect(el.className).toMatch(/w-12/);
    expect(el.className).toMatch(/h-12/);
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<Spinner />);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
