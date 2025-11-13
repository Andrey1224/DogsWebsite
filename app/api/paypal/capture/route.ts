import crypto from "node:crypto";

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";

import { capturePayPalOrder, getPayPalOrder } from "@/lib/paypal/client";
import type { PayPalOrderMetadata } from "@/lib/paypal/types";
import { ReservationCreationError, ReservationCreationService } from "@/lib/reservations/create";
import type { ReservationChannel } from "@/lib/reservations/types";
import { ReservationQueries } from "@/lib/reservations/queries";

export const runtime = "nodejs";

const requestSchema = z.object({
  orderId: z.string().min(1, "orderId is required"),
});

function parseMetadata(customId?: string): PayPalOrderMetadata | null {
  if (!customId) return null;

  try {
    return JSON.parse(customId) as PayPalOrderMetadata;
  } catch (error) {
    console.error("[PayPal Capture] Failed to parse custom_id metadata:", error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  try {
    const json = await request.json();
    const { orderId } = requestSchema.parse(json);

    const orderDetails = await getPayPalOrder(orderId);
    const pendingMetadata = parseMetadata(orderDetails.purchase_units?.[0]?.custom_id);

    if (!pendingMetadata?.puppy_id) {
      return NextResponse.json(
        { error: "Missing puppy metadata" },
        { status: 400 },
      );
    }

    const hasActiveReservation = await ReservationQueries.hasActiveReservation(pendingMetadata.puppy_id);
    if (hasActiveReservation) {
      return NextResponse.json(
        { error: "Reservation in progress - please try again in ~15 minutes" },
        { status: 409 },
      );
    }

    const captureResponse = await capturePayPalOrder({
      orderId,
      requestId: crypto.randomUUID(),
    });

    if (captureResponse.status !== "COMPLETED") {
      return NextResponse.json(
        {
          error: `Capture status is ${captureResponse.status}`,
          status: captureResponse.status,
        },
        { status: 409 },
      );
    }

    const purchaseUnit = captureResponse.purchase_units?.[0];
    const capture = purchaseUnit?.payments?.captures?.[0];

    if (!capture || !capture.id) {
      return NextResponse.json(
        { error: "Capture details not found in response" },
        { status: 500 },
      );
    }

    const metadata = parseMetadata(capture.custom_id) ?? pendingMetadata;
    if (!metadata?.puppy_id) {
      return NextResponse.json(
        { error: "Missing puppy metadata" },
        { status: 400 },
      );
    }

    const amountValue = Number.parseFloat(capture.amount?.value ?? "0");
    if (!Number.isFinite(amountValue) || amountValue <= 0) {
      return NextResponse.json(
        { error: "Invalid capture amount" },
        { status: 400 },
      );
    }

    const payer = captureResponse.payer;
    const customerEmail = metadata.customer_email ?? payer?.email_address;
    const paypalName = [payer?.name?.given_name, payer?.name?.surname]
      .filter(Boolean)
      .join(" ")
      .trim();
    const computedCustomerName = metadata.customer_name ?? (paypalName || undefined);
    const customerName =
      computedCustomerName && computedCustomerName.trim().length > 0
        ? computedCustomerName.trim()
        : undefined;
    const computedPhone = metadata.customer_phone ?? payer?.phone?.phone_number?.national_number;
    const customerPhone =
      computedPhone && computedPhone.trim().length > 0 ? computedPhone.trim() : undefined;

    if (!customerEmail) {
      return NextResponse.json(
        { error: "Missing customer email address" },
        { status: 400 },
      );
    }

    const channel = (metadata.channel ?? "site") as ReservationChannel;

    try {
      const { reservationId } = await ReservationCreationService.createReservation({
        puppyId: metadata.puppy_id,
        customerEmail,
        customerName,
        customerPhone,
        depositAmount: amountValue,
        paymentProvider: "paypal",
        externalPaymentId: capture.id,
        channel,
        notes: `PayPal capture ${capture.id}`,
      });

      return NextResponse.json({
        success: true,
        reservationId,
        captureId: capture.id,
        orderStatus: captureResponse.status,
      });
    } catch (reservationError) {
      if (reservationError instanceof ReservationCreationError) {
        const status =
          reservationError.code === "RACE_CONDITION_LOST" ||
          reservationError.code === "PUPPY_NOT_AVAILABLE"
            ? 409
            : 500;

        return NextResponse.json(
          {
            error: reservationError.message,
            errorCode: reservationError.code,
          },
          { status },
        );
      }

      throw reservationError;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 },
      );
    }

    const message = error instanceof Error ? error.message : "Unknown error";
    console.error("[PayPal Capture] Failed:", message);

    return NextResponse.json(
      { error: message },
      { status: 500 },
    );
  }
}
