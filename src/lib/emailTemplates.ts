// Branded email templates for Freedom Point Calculator

interface ReportEmailData {
  firstName: string;
  freedomPoint: string;
  currentValuation: string;
  gap: string;
  isAbove: boolean;
  progressPercent: number;
}

export function leadReportEmail(data: ReportEmailData): string {
  const statusColor = data.isAbove ? "#00a243" : "#c0392b";
  const statusLabel = data.isAbove ? "Above Freedom Point ✓" : "Gap to Close";
  const statusMessage = data.isAbove
    ? "Your business is currently valued above your Freedom Point. Focus on protecting and growing this position."
    : "Your report includes a detailed breakdown of the gap and what it takes to close it.";

  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#F2F5F9;font-family:'Inter',Arial,Helvetica,sans-serif;">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#F2F5F9;padding:32px 16px;">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

  <!-- Header -->
  <tr><td style="background:#111729;padding:28px 32px;border-radius:12px 12px 0 0;">
    <div style="color:#00a243;font-size:10px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;margin-bottom:6px;">FREEDOM POINT REPORT</div>
    <h1 style="color:#F7F7F3;font-size:22px;font-weight:800;margin:0;line-height:1.2;">Your Numbers Are Ready, ${data.firstName}</h1>
  </td></tr>

  <!-- Green accent -->
  <tr><td style="background:#00a243;height:3px;font-size:0;line-height:0;">&nbsp;</td></tr>

  <!-- Body -->
  <tr><td style="background:#ffffff;padding:32px;">

    <p style="color:#364153;font-size:15px;line-height:1.6;margin:0 0 24px;">
      Your Freedom Point Report has been downloaded to your device. Here's a quick snapshot of your results:
    </p>

    <!-- Three Numbers -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
    <tr>
      <td width="33%" style="padding:4px;">
        <div style="background:#005122;border-radius:8px;padding:14px 12px;text-align:center;">
          <div style="color:#80d1a1;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px;">FREEDOM POINT</div>
          <div style="color:#F7F7F3;font-size:18px;font-weight:800;">${data.freedomPoint}</div>
        </div>
      </td>
      <td width="33%" style="padding:4px;">
        <div style="background:#20293A;border-radius:8px;padding:14px 12px;text-align:center;">
          <div style="color:#97A3B6;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px;">CURRENT VALUE</div>
          <div style="color:#F7F7F3;font-size:18px;font-weight:800;">${data.currentValuation}</div>
        </div>
      </td>
      <td width="33%" style="padding:4px;">
        <div style="background:#364153;border-radius:8px;padding:14px 12px;text-align:center;">
          <div style="color:#97A3B6;font-size:9px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;margin-bottom:4px;">${statusLabel.toUpperCase()}</div>
          <div style="color:${statusColor};font-size:18px;font-weight:800;">${data.gap}</div>
        </div>
      </td>
    </tr>
    </table>

    <!-- Progress -->
    <div style="margin-bottom:24px;">
      <div style="background:#E3E8EF;border-radius:6px;height:8px;overflow:hidden;">
        <div style="background:#00a243;height:100%;width:${Math.min(100, data.progressPercent)}%;border-radius:6px;"></div>
      </div>
      <div style="color:#677489;font-size:12px;margin-top:6px;">${data.progressPercent}% of Freedom Point reached</div>
    </div>

    <p style="color:#4A5567;font-size:14px;line-height:1.6;margin:0 0 28px;">
      ${statusMessage}
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="https://calendly.com/volare-advisory" target="_blank" style="display:inline-block;background:#00a243;color:#ffffff;padding:14px 36px;border-radius:10px;font-size:15px;font-weight:700;text-decoration:none;letter-spacing:0.02em;">
        Book a Free Strategy Call →
      </a>
    </div>

    <p style="color:#97A3B6;font-size:12px;line-height:1.5;margin:0;border-top:1px solid #E3E8EF;padding-top:20px;">
      Your full Freedom Point Report was downloaded when you completed the calculator. It includes a detailed breakdown of your income needs, personal assets, business debt, valuation scenarios, and personalized guidance.
    </p>

  </td></tr>

  <!-- Footer -->
  <tr><td style="background:#F8FAFC;padding:20px 32px;border-radius:0 0 12px 12px;border:1px solid #E3E8EF;border-top:none;">
    <p style="color:#97A3B6;font-size:11px;margin:0;text-align:center;">
      Volare Advisory · Freedom Point Calculator · For advisory use only · Not financial advice
    </p>
  </td></tr>

</table>
</td></tr>
</table>
</body>
</html>`;
}
