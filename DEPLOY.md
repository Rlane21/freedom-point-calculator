# Freedom Point Calculator — Deployment Guide

## Quick Deploy (3 minutes)

### Option 1: Vercel CLI (fastest)
```bash
cd freedom-point-calculator
npm install
npx vercel
```
Follow the prompts. Done.

### Option 2: GitHub + Vercel (auto-deploys on every push)
1. Push this folder to a new GitHub repo:
   ```bash
   cd freedom-point-calculator
   gh repo create freedom-point-calculator --private --source=. --push
   ```
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import the repo → Deploy

---

## Environment Variables (Optional)

Set these in Vercel → Project → Settings → Environment Variables:

| Variable | Purpose | Required? |
|----------|---------|-----------|
| `RESEND_API_KEY` | Email notifications when someone submits the form | Optional — leads still log to Vercel console without this |
| `NOTIFY_EMAIL` | Where lead notifications go (default: robert@volare.ai) | Optional |

### Getting a Resend API Key
1. Sign up at [resend.com](https://resend.com) (free tier: 3,000 emails/month)
2. Create an API key
3. Verify your domain (volare.ai) or use their test domain
4. Add the key to Vercel env vars

**Without Resend:** Every lead still gets logged to Vercel's runtime logs (Dashboard → Logs). You won't miss any leads.

---

## Customize Before Launch

### Calendly Link
In `src/app/page.tsx`, find `https://calendly.com/volare-advisory` and replace with your actual Calendly URL.

### Tax/Fee Defaults
In `src/app/page.tsx`, the defaults are 20% tax and 12% fees. Change in the `DEFAULT_INPUTS` object if needed.

### Brand Assets
The app uses your Volare color system. Logo is rendered as SVG text — replace with your actual logo image if desired.

---

## What's Included

- **Full calculator** — all 5 sections from your original, plus Freedom Point breakdown
- **Three-number hero** — Freedom Point, Current Value, Gap — always visible
- **Progress bar** — visual gap-to-freedom tracker
- **Lead capture modal** — name, email, phone (optional) — triggered by "Get Your Free Report" CTA
- **Premium PDF report** — multi-page branded report with analysis and next steps
- **Calendly CTA** — appears after calculator is filled in
- **Email notifications** — via Resend (optional) + Vercel logs (always)
- **Mobile responsive** — works great on phone, tablet, desktop
- **SEO optimized** — Open Graph tags, meta descriptions
