import { render, screen, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { AboutBreedCarousel } from './about-breed-carousel';

// Mock Next/Image
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

describe('AboutBreedCarousel', () => {
  const mockImages = [
    { src: '/img1.jpg', alt: 'Frenchie 1' },
    { src: '/img2.jpg', alt: 'Frenchie 2' },
  ];

  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders the first image initially', () => {
    render(<AboutBreedCarousel images={mockImages} breedName="french" />);

    const img = screen.getByAltText('Frenchie 1');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', '/img1.jpg');
  });

  it('applies correct rotation class for "french" breed', () => {
    const { container } = render(<AboutBreedCarousel images={mockImages} breedName="french" />);

    // The outer div should have rotate-2
    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('rotate-2');
  });

  it('applies correct rotation class for "english" breed', () => {
    const { container } = render(<AboutBreedCarousel images={mockImages} breedName="english" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass('-rotate-2');
  });

  it('cycles through images over time', () => {
    render(<AboutBreedCarousel images={mockImages} breedName="french" />);

    // Initial state: Image 1 visible (opacity-100), Image 2 hidden (opacity-0)
    // Note: Our mock renders both, but we check classes applied by logic
    const img1 = screen.getByAltText('Frenchie 1');
    const img2 = screen.getByAltText('Frenchie 2');

    expect(img1).toHaveClass('opacity-100');
    expect(img2).toHaveClass('opacity-0');

    // Advance time by 3.5s
    act(() => {
      vi.advanceTimersByTime(3500);
    });

    // Now Image 2 should be visible
    expect(img1).toHaveClass('opacity-0');
    expect(img2).toHaveClass('opacity-100');
  });
});
