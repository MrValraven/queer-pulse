import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ImageSlot } from './ImageSlot';

describe('ImageSlot crop', () => {
  it('positions the image by the crop rect', () => {
    const { container } = render(
      <ImageSlot src="https://x/y.jpg" alt="a" width={100} height={100}
        crop={{ x: 0.25, y: 0, width: 0.5, height: 1, aspect: '1:1' }} />,
    );
    const image = container.querySelector('img')!;
    expect(image.style.width).toBe('200%');
    expect(image.style.left).toBe('-50%');
  });

  it('leaves the image unpositioned without a crop', () => {
    const { container } = render(
      <ImageSlot src="https://x/y.jpg" alt="a" width={100} height={100} />,
    );
    const image = container.querySelector('img')!;
    expect(image.style.width).toBe('');
  });
});
