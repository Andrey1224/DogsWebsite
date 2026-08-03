import { describe, expect, it } from 'vitest';

import { getMetaTrackingCommand } from './meta-events';

describe('getMetaTrackingCommand', () => {
  it('maps a puppy view to Meta ViewContent commerce fields', () => {
    expect(
      getMetaTrackingCommand('view_item', {
        currency: 'USD',
        value: 3000,
        items: [
          {
            item_id: 'sunny',
            item_name: 'Sunny',
            item_category: 'French Bulldog',
          },
        ],
      }),
    ).toEqual({
      method: 'track',
      name: 'ViewContent',
      params: {
        content_ids: ['sunny'],
        content_name: 'Sunny',
        content_category: 'French Bulldog',
        content_type: 'product',
        value: 3000,
        currency: 'USD',
      },
    });
  });

  it('maps a successful contact form to Meta Lead', () => {
    expect(
      getMetaTrackingCommand('generate_lead', {
        location: 'puppy_detail',
        puppy_slug: 'sunny',
      }),
    ).toEqual({
      method: 'track',
      name: 'Lead',
      params: {
        content_name: 'puppy_detail',
        content_category: 'puppy_inquiry',
      },
    });
  });

  it('keeps site-specific events as custom Meta events', () => {
    expect(getMetaTrackingCommand('review_form_success', { source: 'reviews' })).toEqual({
      method: 'trackCustom',
      name: 'review_form_success',
      params: { source: 'reviews' },
    });
  });
});
