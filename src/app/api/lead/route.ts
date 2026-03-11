import { NextRequest, NextResponse } from "next/server";
import { leadReportEmail } from "@/lib/emailTemplates";

export const maxDuration = 30; // seconds

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, results } = body;

    if (!name || !email) {
      return NextResponse.json({ error: "Name and email are required" }, { status: 400 });
    }

    const resendKey = process.env.RESEND_API_KEY;
    const notifyEmail = process.env.NOTIFY_EMAIL || "robert@volare.ai";
    let emailSent = false;

    if (resendKey) {
      const { Resend } = await import("resend");
      const resend = new Resend(resendKey);

      // Email 1: Notification to Robert (existing)
      await resend.emails.send({
        from: "Freedom Point Calculator <notifications@volare.ai>",
        to: notifyEmail,
        subject: `New Freedom Point Lead: ${name}`,
        html: `
          <div style="font-family: 'Inter', Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #111729; padding: 24px 28px; border-radius: 12px 12px 0 0;">
              <div style="color: #00a243; font-size: 11px; font-weight: 700; letter-spacing: 0.18em; text-transform: uppercase; margin-bottom: 4px;">NEW LEAD</div>
              <h1 style="color: #F7F7F3; font-size: 20px; font-weight: 800; margin: 0;">Freedom Point Calculator</h1>
            </div>
            <div style="background: #F7F7F3; padding: 24px 28px; border: 1px solid #E3E8EF; border-top: 3px solid #00a243;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #677489; font-size: 13px;">Name</td><td style="padding: 8px 0; font-weight: 700; color: #20293A;">${name}</td></tr>
                <tr><td style="padding: 8px 0; color: #677489; font-size: 13px;">Email</td><td style="padding: 8px 0; font-weight: 700; color: #20293A;"><a href="mailto:${email}" style="color: #00a243;">${email}</a></td></tr>
                ${phone ? `<tr><td style="padding: 8px 0; color: #677489; font-size: 13px;">Phone</td><td style="padding: 8px 0; font-weight: 700; color: #20293A;">${phone}</td></tr>` : ""}
              </table>
              ${results ? `
              <hr style="border: none; border-top: 1px solid #E3E8EF; margin: 16px 0;" />
              <div style="font-size: 11px; font-weight: 700; color: #677489; letter-spacing: 0.1em; text-transform: uppercase; margin-bottom: 10px;">CALCULATOR RESULTS</div>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 6px 0; color: #677489; font-size: 13px;">Freedom Point</td><td style="padding: 6px 0; font-weight: 700; color: #005122;">${results.grossSalePrice || "—"}</td></tr>
                <tr><td style="padding: 6px 0; color: #677489; font-size: 13px;">Current Valuation</td><td style="padding: 6px 0; font-weight: 700; color: #20293A;">${results.currentValuation || "—"}</td></tr>
                <tr><td style="padding: 6px 0; color: #677489; font-size: 13px;">Gap</td><td style="padding: 6px 0; font-weight: 700; color: ${results.isAbove ? "#00a243" : "#c0392b"};">${results.gap || "—"}</td></tr>
                <tr><td style="padding: 6px 0; color: #677489; font-size: 13px;">Health Score</td><td style="padding: 6px 0; font-weight: 700; color: #20293A;">${results.healthScore || "—"}%</td></tr>
                <tr><td style="padding: 6px 0; color: #677489; font-size: 13px;">EBITDA</td><td style="padding: 6px 0; font-weight: 700; color: #20293A;">${results.ebitda || "—"}</td></tr>
              </table>
              ` : ""}
            </div>
            <div style="padding: 16px 28px; text-align: center; color: #97A3B6; font-size: 11px;">
              Volare Advisory · Freedom Point Calculator
            </div>
          </div>
        `,
      });

      // Email 2: Branded summary email to the lead (PDF downloads separately)
      try {
        const firstName = name.split(" ")[0] || name;
        const htmlContent = leadReportEmail({
          firstName,
          freedomPoint: results?.grossSalePrice || "—",
          currentValuation: results?.currentValuation || "—",
          gap: results?.gap || "—",
          isAbove: results?.isAbove || false,
          progressPercent: results?.progressPercent || 0,
        });

        await resend.emails.send({
          from: "Volare Advisory <reports@volare.ai>",
          to: email,
          subject: "Your Freedom Point Results — Volare Advisory",
          html: htmlContent,
        });

        emailSent = true;
      } catch (emailErr) {
        console.error("Failed to send report email to lead:", emailErr);
        // Don't fail the whole request — the PDF download still works
      }
    }

    // Always log to console
    console.log("=== NEW FREEDOM POINT LEAD ===");
    console.log(`Name: ${name}`);
    console.log(`Email: ${email}`);
    if (phone) console.log(`Phone: ${phone}`);
    if (results) console.log("Results:", JSON.stringify(results));
    console.log(`Email sent to lead: ${emailSent}`);
    console.log("==============================");

    return NextResponse.json({ success: true, emailSent });
  } catch (error) {
    console.error("Lead capture error:", error);
    return NextResponse.json({ error: "Failed to process lead" }, { status: 500 });
  }
}
