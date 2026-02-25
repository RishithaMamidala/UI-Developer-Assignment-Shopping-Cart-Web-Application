import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { axe, toHaveNoViolations } from 'jest-axe';
import Button from './Button.jsx';

expect.extend(toHaveNoViolations);

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('"primary" is default variant', () => {
    const { container } = render(<Button>Primary</Button>);
    expect(container.firstChild.className).toMatch(/bg-primary/);
  });

  it('success variant has success styling', () => {
    const { container } = render(<Button variant="success">Done</Button>);
    expect(container.firstChild.className).toMatch(/bg-success/);
  });

  it('secondary variant has border and primary text styling', () => {
    const { container } = render(<Button variant="secondary">Secondary</Button>);
    expect(container.firstChild.className).toMatch(/border-primary/);
  });

  it('ghost variant has hover-gray styling', () => {
    const { container } = render(<Button variant="ghost">Ghost</Button>);
    expect(container.firstChild.className).toMatch(/hover:bg-gray-100/);
  });

  it('danger variant has error styling', () => {
    const { container } = render(<Button variant="danger">Danger</Button>);
    expect(container.firstChild.className).toMatch(/bg-error/);
  });

  it('renders sm size', () => {
    const { container } = render(<Button size="sm">Small</Button>);
    expect(container.firstChild.className).toMatch(/text-sm/);
  });

  it('renders md size (default)', () => {
    const { container } = render(<Button>Medium</Button>);
    expect(container.firstChild.className).toMatch(/text-base/);
  });

  it('renders lg size', () => {
    const { container } = render(<Button size="lg">Large</Button>);
    expect(container.firstChild.className).toMatch(/text-lg/);
  });

  it('disabled prop makes button disabled', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('loading prop shows Spinner and disables button', () => {
    const { container } = render(<Button loading>Loading</Button>);
    expect(container.querySelector('[role="status"]')).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeDisabled();
  });

  it('spreads extra HTML attributes', () => {
    render(<Button data-testid="my-btn">Test</Button>);
    expect(screen.getByTestId('my-btn')).toBeInTheDocument();
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(<Button>Accessible</Button>);
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
