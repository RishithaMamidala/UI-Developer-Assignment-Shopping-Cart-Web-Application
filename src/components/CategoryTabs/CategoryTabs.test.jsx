import { render, screen, fireEvent } from '@testing-library/react';
import { axe, toHaveNoViolations } from 'jest-axe';
import CategoryTabs from './CategoryTabs.jsx';

expect.extend(toHaveNoViolations);

const categories = ['electronics', 'jewelery', "men's clothing"];

describe('CategoryTabs', () => {
  it('renders a ul with role="tablist"', () => {
    render(<CategoryTabs categories={categories} activeCategory="all" onChange={jest.fn()} />);
    expect(screen.getByRole('tablist')).toBeInTheDocument();
  });

  it('renders "All Categories" tab plus one tab per category', () => {
    render(<CategoryTabs categories={categories} activeCategory="all" onChange={jest.fn()} />);
    const tabs = screen.getAllByRole('tab');
    // 1 "All Categories" + 3 category tabs
    expect(tabs).toHaveLength(4);
    expect(screen.getByRole('tab', { name: /all categories/i })).toBeInTheDocument();
    categories.forEach((cat) => {
      expect(screen.getByRole('tab', { name: new RegExp(cat, 'i') })).toBeInTheDocument();
    });
  });

  it('active tab has aria-selected="true"', () => {
    render(
      <CategoryTabs categories={categories} activeCategory="electronics" onChange={jest.fn()} />
    );
    expect(screen.getByRole('tab', { name: /electronics/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    expect(screen.getByRole('tab', { name: /all categories/i })).toHaveAttribute(
      'aria-selected',
      'false'
    );
  });

  it('"All Categories" tab has aria-selected="true" when activeCategory is "all"', () => {
    render(<CategoryTabs categories={categories} activeCategory="all" onChange={jest.fn()} />);
    expect(screen.getByRole('tab', { name: /all categories/i })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });

  it('clicking a non-active category tab calls onChange with the category string', () => {
    const onChange = jest.fn();
    render(<CategoryTabs categories={categories} activeCategory="all" onChange={onChange} />);
    fireEvent.click(screen.getByRole('tab', { name: /electronics/i }));
    expect(onChange).toHaveBeenCalledWith('electronics');
  });

  it('clicking "All Categories" calls onChange with "all"', () => {
    const onChange = jest.fn();
    render(
      <CategoryTabs categories={categories} activeCategory="electronics" onChange={onChange} />
    );
    fireEvent.click(screen.getByRole('tab', { name: /all categories/i }));
    expect(onChange).toHaveBeenCalledWith('all');
  });

  it('container has overflow-x-auto for horizontal scroll', () => {
    const { container } = render(
      <CategoryTabs categories={categories} activeCategory="all" onChange={jest.fn()} />
    );
    const list = container.querySelector('[role="tablist"]');
    expect(list.className).toMatch(/overflow-x-auto/);
  });

  it('passes axe accessibility audit', async () => {
    const { container } = render(
      <CategoryTabs categories={categories} activeCategory="all" onChange={jest.fn()} />
    );
    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});
