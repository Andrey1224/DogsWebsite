type MetaEventParams = Record<string, unknown>;

export type MetaTrackingCommand = {
  method: 'track' | 'trackCustom';
  name: string;
  params?: MetaEventParams;
};

function getFirstItem(params?: MetaEventParams): MetaEventParams | undefined {
  if (!Array.isArray(params?.items)) return undefined;

  const item = params.items[0];
  return item && typeof item === 'object' ? (item as MetaEventParams) : undefined;
}

function withDefinedValues(params: MetaEventParams): MetaEventParams {
  return Object.fromEntries(Object.entries(params).filter(([, value]) => value !== undefined));
}

function getCommerceParams(params?: MetaEventParams): MetaEventParams {
  const item = getFirstItem(params);
  const itemId = item?.item_id;

  return withDefinedValues({
    content_ids: itemId === undefined ? undefined : [String(itemId)],
    content_name: item?.item_name,
    content_category: item?.item_category,
    content_type: 'product',
    value: params?.value,
    currency: params?.currency,
  });
}

/**
 * Maps GA4-style site events to Meta's standard events where a standard exists.
 * Keeping this mapping in one place prevents reporting the same action under
 * different Meta event names across components.
 */
export function getMetaTrackingCommand(
  event: string,
  params?: MetaEventParams,
): MetaTrackingCommand {
  switch (event) {
    case 'view_item':
      return { method: 'track', name: 'ViewContent', params: getCommerceParams(params) };
    case 'begin_checkout':
      return { method: 'track', name: 'InitiateCheckout', params: getCommerceParams(params) };
    case 'generate_lead':
      return {
        method: 'track',
        name: 'Lead',
        params: withDefinedValues({
          content_name: params?.location,
          content_category: params?.puppy_slug ? 'puppy_inquiry' : 'general_inquiry',
        }),
      };
    case 'contact_click':
      return {
        method: 'track',
        name: 'Contact',
        params: withDefinedValues({
          content_name: params?.channel,
          content_category: params?.location,
        }),
      };
    default:
      return { method: 'trackCustom', name: event, params };
  }
}
