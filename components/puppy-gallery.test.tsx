import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { PuppyGallery } from './puppy-gallery';

// Mock dependencies
vi.mock('@/lib/utils/images', () => ({
  resolveLocalImage: (url: string) => url,
}));

vi.mock('./puppy-detail/share-button', () => ({
  ShareButton: ({ title }: { title: string }) => <button data-testid="share-btn">{title}</button>,
}));

// Mock Next/Image
vi.mock('next/image', () => ({
  // eslint-disable-next-line @next/next/no-img-element
  default: (props: React.ImgHTMLAttributes<HTMLImageElement>) => <img {...props} alt={props.alt} />,
}));

describe('PuppyGallery', () => {
  const mockPhotos = ['/img1.jpg', '/img2.jpg', '/img3.jpg'];
  const mockVideos = ['https://youtube.com/v/123'];
  const defaultProps = {
    photos: mockPhotos,
    videos: [],
    name: 'Test Puppy',
    status: 'available' as const,
    shareUrl: 'http://example.com',
  };

  it('renders the first photo as the main image initially', () => {
    render(<PuppyGallery {...defaultProps} />);

    const mainImage = screen.getByAltText('Test Puppy photo 1');
    expect(mainImage).toBeInTheDocument();
    expect(mainImage).toHaveAttribute('src', '/img1.jpg');
  });

  it('renders thumbnails correctly', () => {
    render(<PuppyGallery {...defaultProps} />);

    const thumbnails = screen.getAllByAltText('Puppy thumbnail');
    expect(thumbnails).toHaveLength(3);
  });

  it('changes main image when thumbnail is clicked', () => {
    render(<PuppyGallery {...defaultProps} />);

    const thumbnails = screen.getAllByAltText('Puppy thumbnail');
    // Click second thumbnail
    fireEvent.click(thumbnails[1]);

    // Main image should update
    const mainImage = screen.getByAltText('Test Puppy photo 2');
    expect(mainImage).toHaveAttribute('src', '/img2.jpg');
  });

  describe('Status Badges', () => {
    it('renders "Available" badge correctly', () => {
      render(<PuppyGallery {...defaultProps} status="available" />);
      expect(screen.getByText('Available')).toBeInTheDocument();
    });

    it('renders "Sold" badge correctly', () => {
      render(<PuppyGallery {...defaultProps} status="sold" />);
      expect(screen.getByText('Sold')).toBeInTheDocument();
    });

    it('renders "Reserved" badge correctly', () => {
      render(<PuppyGallery {...defaultProps} status="reserved" />);
      expect(screen.getByText('reserved')).toBeInTheDocument();
    });
  });

  it('renders video links if provided', () => {
    render(<PuppyGallery {...defaultProps} videos={mockVideos} />);

    const videoLink = screen.getByText('Watch clip');
    expect(videoLink).toBeInTheDocument();
    expect(videoLink).toHaveAttribute('href', 'https://youtube.com/v/123');
  });

  it('renders share button', () => {
    render(<PuppyGallery {...defaultProps} />);
    expect(screen.getByTestId('share-btn')).toBeInTheDocument();
  });
});
