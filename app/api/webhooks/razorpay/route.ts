// app/api/webhooks/razorpay/route.ts
// POST /api/webhooks/razorpay
//
// Razorpay calls this endpoint when payment events occur.
// Setup in Razorpay Dashboard → Settings → Webhooks → add this URL.
// Events handled:
//   payment.captured  → mark payment Paid, mark order Accepted
//   payment.failed    → mark payment Failed, send FCM alert
//   refund.created    → mark refund Initiated

import { NextResponse } from "next/server"
import crypto from "crypto"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { sendAdminNotification } from "@/lib/fcm"

export async function POST(request: Request) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-razorpay-signature")

    // ── Verify webhook signature ──────────────────────────────────────────────
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    if (webhookSecret && signature) {
      const expectedSig = crypto
        .createHmac("sha256", webhookSecret)
        .update(rawBody)
        .digest("hex")

      if (expectedSig !== signature) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody)
    const supabase = createServerSupabaseClient()

    // ── Handle events ─────────────────────────────────────────────────────────
    switch (event.event) {
      case "payment.captured": {
        const payment = event.payload.payment.entity
        const { razorpay_order_id, id: razorpay_payment_id, amount } = payment

        // Update payment record
        await supabase
          .from("payments")
          .update({ status: "Paid", razorpay_payment_id })
          .eq("razorpay_order_id", razorpay_order_id)

        // Also accept the linked order
        const { data: payRecord } = await supabase
          .from("payments")
          .select("order_id")
          .eq("razorpay_order_id", razorpay_order_id)
          .single()

        if (payRecord?.order_id) {
          await supabase
            .from("orders")
            .update({ status: "Accepted", pay_status: "Paid" })
            .eq("id", payRecord.order_id)
        }

        await sendAdminNotification({
          title: "✅ Payment Captured",
          body: `₹${amount / 100} received via Razorpay (${razorpay_payment_id})`,
        })
        break
      }

      case "payment.failed": {
        const payment = event.payload.payment.entity
        const { razorpay_order_id, id: razorpay_payment_id } = payment

        await supabase
          .from("payments")
          .update({ status: "Failed", razorpay_payment_id })
          .eq("razorpay_order_id", razorpay_order_id)

        const { data: payRecord } = await supabase
          .from("payments")
          .select("order_id, amount")
          .eq("razorpay_order_id", razorpay_order_id)
          .single()

        if (payRecord?.order_id) {
          await supabase
            .from("orders")
            .update({ status: "Failed", pay_status: "Failed" })
            .eq("id", payRecord.order_id)
        }

        await sendAdminNotification({
          title: "❌ Payment Failed",
          body: `Payment failed for order. ₹${(payRecord?.amount ?? 0)} not captured.`,
        })
        break
      }

      case "refund.created": {
        const refund = event.payload.refund.entity
        const { payment_id } = refund

        await supabase
          .from("payments")
          .update({ status: "Refunded", refund: "Initiated" })
          .eq("razorpay_payment_id", payment_id)

        await sendAdminNotification({
          title: "💸 Refund Created",
          body: `Refund initiated for Razorpay payment ${payment_id}`,
        })
        break
      }

      case "refund.processed": {
        const refund = event.payload.refund.entity
        await supabase
          .from("payments")
          .update({ refund: "Completed" })
          .eq("razorpay_payment_id", refund.payment_id)
        break
      }

      default:
        // Unhandled event type — return 200 to acknowledge receipt
        break
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    const message = err instanceof Error ? err.message : "Webhook processing failed"
    console.error("[Razorpay Webhook]", message)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
