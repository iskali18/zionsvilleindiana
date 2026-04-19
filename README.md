# ZionsvilleIndiana.com

Next.js + TypeScript + Tailwind community guide for Zionsville, Indiana.

## Tech stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript
- **Styling:** Tailwind CSS + @tailwindcss/typography
- **Content:** Markdown with YAML frontmatter (gray-matter)
- **Deployment:** Vercel via GitHub (`main` branch → auto-deploy)

## Getting started

```powershell
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Project structure

```
app/                    # Next.js App Router pages
  page.tsx              # Homepage
  events/               # Events hub + /events/[slug]
  parks/                # Parks hub + /parks/[slug]
  downtown/             # Downtown overview, /dining, /shopping
  businesses/           # Directory + /businesses/[slug]
  about/                # About + community resources
  sitemap.ts            # Auto-generated sitemap
  not-found.tsx         # 404 page
  layout.tsx            # Root layout (fonts, GA4, metadata)

components/
  layout/               # Header, Footer
  ui/                   # Breadcrumb (with BreadcrumbList schema)

content/
  events/               # One .md file per event
  parks/                # One .md file per park
  businesses/           # One .md file per business

lib/
  content.ts            # All content loaders (getAllEvents, getPark, etc.)

types/
  index.ts              # EventMeta, ParkMeta, BusinessMeta interfaces

public/
  robots.txt
  images/               # events/, parks/, businesses/, downtown/
```

## Adding content

### New event
Create `content/events/your-slug.md` following the frontmatter in an existing event file.
Required fields: `title`, `description`, `eventType`, `startDate`, `location`, `address`, `image`, `imageAlt`, `tags`, `metaTitle`, `metaDescription`

### New park
Create `content/parks/your-slug.md`. Required: `name`, `parkType`, `description`, `address`, `lat`, `lng`, `image`, `imageAlt`, `metaTitle`, `metaDescription`

### New business
Create `content/businesses/your-slug.md`. Required: `name`, `category`, `description`, `address`, `lastVerified`, `metaTitle`, `metaDescription`
Categories: `dining` | `coffee` | `shopping` | `boutique` | `services` | `entertainment`

## Before going live

- [ ] Replace `G-XXXXXXXXXX` in `app/layout.tsx` with your GA4 Measurement ID
- [ ] Replace Google Calendar embed URL in `app/events/page.tsx`
- [ ] Add all images to `public/images/` (see image paths in each markdown file)
- [ ] Replace placeholder `og-default.jpg` in `public/images/`
- [ ] Verify/update business addresses and phone numbers
- [ ] Set up Google Business Profile for zionsvilleindiana.com
- [ ] Submit sitemap to Google Search Console after deploy
- [ ] Resolve www redirect in GSC (add both properties, set canonical)
- [ ] Add favicon files to `public/`

## Deployment

Push to `main` branch → Vercel auto-deploys.
The `vercel.json` handles www → non-www redirect and security headers.

## Staging

Create a `stagin` branch (matching JavaHatch convention) for preview deploys.
