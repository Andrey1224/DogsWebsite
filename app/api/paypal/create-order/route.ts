import crypto from 'node:crypto';

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

import { createPayPalOrder } from '@/lib/paypal/client';
import { getPuppyBySlug } from '@/lib/supabase/queries';
import { ReservationQueries } from '@/lib/reservations/queries';
import { calculateDepositAmount } from '@/lib/payments/deposit';

export const runtime = 'nodejs';

const requestSchema = z.object({
  puppySlug: z.string().min(1, 'Puppy slug is required'),
});

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { puppySlug } = requestSchema.parse(json);

    const puppy = await getPuppyBySlug(puppySlug);

    if (!puppy) {
      return NextResponse.json({ error: 'Puppy not found' }, { status: 404 });
    }

    if (puppy.status !== 'available') {
      return NextResponse.json(
        { error: `This puppy is ${puppy.status} and cannot be reserved` },
        { status: 409 },
      );
    }

    const hasActiveReservation = await ReservationQueries.hasActiveReservation(puppy.id);
    if (hasActiveReservation) {
      return NextResponse.json(
        { error: 'Reservation in progress - please try again in ~15 minutes' },
        { status: 409 },
      );
    }

    const depositAmount = calculateDepositAmount({ priceUsd: puppy.price_usd, fixedAmount: 300 });

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

    const order = await createPayPalOrder({
      amount: depositAmount,
      description: `Deposit for ${puppy.name ?? 'Bulldog Puppy'}`,
      metadata: {
        puppy_id: puppy.id,
        puppy_slug: puppy.slug || '',
        puppy_name: puppy.name || 'Bulldog Puppy',
        channel: 'site',
        deposit_amount: depositAmount,
      },
      requestId: crypto.randomUUID(),
      returnUrl: `${siteUrl}/puppies/${puppySlug}/reserved?paypal=success`,
      cancelUrl: `${siteUrl}/puppies/${puppySlug}?paypal=cancelled`,
    });

    return NextResponse.json({
      orderId: order.id,
      status: order.status,
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }

    const message = error instanceof Error ? error.message : 'Unknown error';
    console.error('[PayPal Create Order] Failed:', message);

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
