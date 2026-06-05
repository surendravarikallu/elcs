"use server";

import { createClient } from "@/lib/supabase/server";
import { Resend } from "resend";

export interface EnquiryPayload {
  name:          string;
  email:         string;
  phone?:        string;
  company?:      string;
  message?:      string;
  // optional — omit for general footer messages
  product_id?:   string;
  product_name?: string;
  quantity?:     number;
}

export async function submitEnquiry(
  payload: EnquiryPayload,
): Promise<{ success: boolean; error?: string }> {
  /* ── 1. Save to Supabase ── */
  try {
    const supabase = await createClient();
    const { error } = await supabase.from("enquiries").insert({
      customer_name:  payload.name.trim(),
      customer_email: payload.email.trim().toLowerCase(),
      customer_phone: payload.phone?.trim()    || null,
      company:        payload.company?.trim()  || null,
      message:        payload.message?.trim()  || null,
      items: payload.product_id && payload.product_name
        ? [{ product_id: payload.product_id, product_name: payload.product_name, quantity: payload.quantity ?? 1 }]
        : [],
      status:      "new",
      admin_notes: null,
    });
    if (error) {
      console.error("[Enquiry] DB insert error:", error.message);
      return { success: false, error: "Failed to submit. Please try again." };
    }
  } catch {
    return { success: false, error: "Connection error. Please try again." };
  }

  /* ── 2. Send admin notification email (non-blocking) ── */
  const apiKey     = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_NOTIFY_EMAIL;
  const fromEmail  = process.env.RESEND_FROM_EMAIL ?? "onboarding@resend.dev";

  if (apiKey && adminEmail) {
    try {
      const resend = new Resend(apiKey);
      const response = await resend.emails.send({
        from:    `ELCS Enquiries <${fromEmail}>`,
        to:      adminEmail,
        subject: payload.product_name
          ? `New Quote Request — ${payload.product_name}`
          : `New Message from ${payload.name}`,
        html: `
<div style="font-family:monospace;max-width:580px;margin:0 auto;padding:32px 24px;background:#0d0d0d;color:#e0d8cc;">
  <div style="color:#d4af37;font-size:10px;letter-spacing:4px;margin-bottom:6px;">[ NEW ENQUIRY — ELCS ]</div>
  <h2 style="font-size:18px;font-weight:600;color:#e0d8cc;margin:0 0 24px;border-bottom:1px solid #222;padding-bottom:16px;">
    ${payload.product_name}
  </h2>
  <table style="width:100%;border-collapse:collapse;font-size:12px;color:#b0a898;">
    <tr style="border-bottom:1px solid #1a1a1a;">
      <td style="padding:10px 0;color:#555;width:110px;vertical-align:top;">NAME</td>
      <td style="padding:10px 0;">${payload.name}</td>
    </tr>
    <tr style="border-bottom:1px solid #1a1a1a;">
      <td style="padding:10px 0;color:#555;vertical-align:top;">EMAIL</td>
      <td style="padding:10px 0;">
        <a href="mailto:${payload.email}" style="color:#d4af37;text-decoration:none;">${payload.email}</a>
      </td>
    </tr>
    ${payload.phone ? `
    <tr style="border-bottom:1px solid #1a1a1a;">
      <td style="padding:10px 0;color:#555;vertical-align:top;">PHONE</td>
      <td style="padding:10px 0;">${payload.phone}</td>
    </tr>` : ""}
    ${payload.company ? `
    <tr style="border-bottom:1px solid #1a1a1a;">
      <td style="padding:10px 0;color:#555;vertical-align:top;">COMPANY</td>
      <td style="padding:10px 0;">${payload.company}</td>
    </tr>` : ""}
    <tr style="border-bottom:1px solid #1a1a1a;">
      <td style="padding:10px 0;color:#555;vertical-align:top;">QUANTITY</td>
      <td style="padding:10px 0;">${payload.quantity}</td>
    </tr>
    ${payload.message ? `
    <tr>
      <td style="padding:10px 0;color:#555;vertical-align:top;">MESSAGE</td>
      <td style="padding:10px 0;line-height:1.6;">${payload.message.replace(/\n/g, "<br>")}</td>
    </tr>` : ""}
  </table>
  <div style="margin-top:28px;padding-top:16px;border-top:1px solid #1a1a1a;font-size:10px;color:#444;letter-spacing:1px;">
    View all enquiries → https://elcs.in/admin/enquiries
  </div>
</div>`,
      });

      if (response.error) {
        console.error("[Resend] API error sending email:", response.error);
      } else {
        console.log("[Resend] Email sent successfully:", response.data);
      }
    } catch (err) {
      // Non-fatal — enquiry is already saved to DB
      console.error("[Resend] Exception during email notification:", err);
    }
  }

  return { success: true };
}
