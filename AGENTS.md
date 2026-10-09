# omnimart — Next.js E-commerce Landing Page

## Project Type
Next.js 16 (App Router) + TypeScript + Tailwind CSS v4. Arabic RTL landing page for "صندوق الأناقة" (Elegance Box) gift box product (watch + perfume). Google Sheets + Resend email integration.

## Quick Commands
```bash
cd D:\omnimart
npm run dev       # Dev server with Turbopack (port 3000)
npm run build     # Production build
npm run start     # Production server
npm run lint      # ESLint
```

## Git Status
- Initialized: Yes
- Branch: main
- Remote: origin -> https://github.com/oguenfoude/omnimart.git (up to date)
- Clean working tree

## Environment Setup
Required in `.env.local` (already configured):
- `GOOGLE_SERVICE_ACCOUNT` (JSON string) -- Sheets API
- `GOOGLE_SHEET_ID` -- Target spreadsheet
- `RESEND_API_KEY` -- Resend email service

## Key Architecture
- **Single-page landing** (`src/app/page.tsx` - 672 lines): Product selection, order form, countdown timer, price calculator, delivery options
- **Server Actions** (`src/app/actions.ts`): Zod validation -> Google Sheets append + Resend email notification
- **Dual submission**: "Confirm & Send" (email+sheets) + "Order via WhatsApp" (direct WhatsApp link)
- **Arabic RTL**: Full RTL layout, 58 wilayas with delivery fees (domicile vs desk pickup)
- **Images**: 8 watch models + 2 box images + logo in `public/`

## Project Structure
```
omnimart/
├── src/
│   ├── app/
│   │   ├── page.tsx          # Main landing page
│   │   ├── layout.tsx        # Root layout (Arabic RTL)
│   │   ├── globals.css       # Global styles
│   │   ├── actions.ts        # Server Actions: Sheets + Resend
│   │   ├── api/sheet-status/route.ts  # API route
│   │   └── data/
│   │       └── wilayas.ts    # All 58 Algerian wilayas
│   ├── components/           # (minimal - mostly inline in page.tsx)
│   └── lib/                  # (minimal)
├── public/
│   ├── box/1.jpg, 2.jpg      # Product box images
│   ├── whatchs/1-8.jpg       # Watch model images
│   └── logo/logo.jpg         # Brand logo
├── .env.local                # All secrets configured
├── Configuration files
```

## Build Verification
```bash
npm run build  # Completes successfully (~10s with Turbopack)
npm run dev    # Starts in ~10.5s, loads at localhost:3000
```

## Notes
- `.env.local` contains real private key (rotate if repo made public)
- Phone validation requires Algerian format (05/06/07 + 8 digits)
- Heavy single-page component (672 lines) - could benefit from splitting
- No AGENTS.md existed before -- this file created for OpenCode sessions
- Build verified working as of 2026-10-08