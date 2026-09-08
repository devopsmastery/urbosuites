# Cabin & Creek — short-term rental listing site

A static site for listing a small portfolio of short-term rental
properties. Built with [Astro](https://astro.build) + Tailwind CSS.
No database, no server, no monthly hosting bill beyond a free static
host.

**Ships with:** a home page, a full properties grid, a detail page per
property (gallery, amenities, map, key facts), an about page, a
contact/inquiry form, a sitemap, and SEO/Open Graph tags on every page.
Three sample properties are included so you can see the layout with
real content before swapping in your own.

## Run it locally

```bash
npm install
npm run dev
```

Open the URL it prints (usually `http://localhost:4321`).

To build the production files: `npm run build` → output goes to `dist/`.
`npm run preview` serves that build locally so you can check it before
deploying.

## Add or edit a property

Every property is one Markdown file in `src/content/properties/`.
Copy an existing one (e.g. `willow-creek-cottage.md`) and change the
frontmatter fields at the top:

```yaml
title: Your Property Name
tagline: One short line describing it
location: Town, State
address: "Full street address" # used for the embedded map
pricePerNight: 180
guests: 4
bedrooms: 2
beds: 3
baths: 1
amenities:
  - Wifi
  - Free parking
heroImage: "https://your-image-url.jpg"
gallery:
  - "https://your-image-url-2.jpg"
  - "https://your-image-url-3.jpg"
featured: true # show it on the home page
order: 1 # sort position
```

Everything below the `---` is the property description, written as
normal Markdown. Delete a file to remove a property — no code changes
needed anywhere else; the home page, the grid, and the sitemap all
update automatically.

**Photos:** the sample properties use placeholder photos from
picsum.photos so the layout renders immediately. Replace `heroImage`
and `gallery` with your own photo URLs (or drop images into `public/`
and reference them as `/your-photo.jpg`).

## Set up the contact form

The form in `src/pages/contact.astro` posts to
[Formspree](https://formspree.io), which is free for low volume and
needs no backend:

1. Create a free Formspree account and a new form.
2. Copy the form endpoint it gives you.
3. In `src/pages/contact.astro`, replace `your-form-id` in the
   `<form action="https://formspree.io/f/your-form-id" ...>` line.

Submissions land in your email. If you outgrow the free tier or want
something else, Web3Forms and Netlify Forms work as drop-in
alternatives — just swap the form's `action`.

## Before you deploy

- **`astro.config.mjs`** — change `site: 'https://example.com'` to your
  real domain. This is what makes canonical links, Open Graph previews,
  and the sitemap correct.
- **`src/components/Header.astro`, `Footer.astro`, `about.astro`** —
  replace "Cabin & Creek", the email, phone number, and about-page
  story with your own.
- **`public/favicon.svg`** — swap for your own mark if you have one.
- **`public/og-image.jpg`** (optional) — add a 1200×630 image here for
  a nicer link preview when the site is shared on social media.

## Deploy it

Push this project to a GitHub repo, then connect it to a free static
host — both auto-build and redeploy on every push:

**Cloudflare Pages**
1. New Pages project → connect your GitHub repo.
2. Build command: `npm run build`. Output directory: `dist`.
3. Deploy — you'll get a `*.pages.dev` URL, with your own domain
   attachable for free.

**Netlify**
1. "Add new site" → import your GitHub repo.
2. Build command: `npm run build`. Publish directory: `dist`.
3. Deploy.

Either one works well; pick whichever you're already using elsewhere.

## Design system

The warm/cozy palette and type pairing live as CSS variables at the
top of `src/styles/global.css`, so you can re-theme the whole site by
editing one block:

- `--color-hearth` / `--color-paper` — the two background tones
  (dark "evening" sections vs. light "daytime" sections)
- `--color-ember` — the primary accent (buttons, links, highlights)
- `--color-pine`, `--color-brick` — secondary accents used sparingly
- `--font-display` (Fraunces), `--font-body` (Karla), `--font-mono`
  (IBM Plex Mono, used for prices, dates, and tags)

## Project structure

```
src/
├── content/properties/    ← one .md file per property (edit these)
├── content.config.ts      ← the schema those files must follow
├── components/            ← Header, Footer, PropertyCard, Icon
├── layouts/Layout.astro   ← shared <head>, SEO tags, font loading
├── pages/
│   ├── index.astro        ← home page
│   ├── properties/
│   │   ├── index.astro    ← full grid of every property
│   │   └── [slug].astro   ← one generated page per property
│   ├── about.astro
│   ├── contact.astro
│   └── 404.astro
└── styles/global.css      ← design tokens + Tailwind
```

## Extending it later

- **Real booking calendars**: pull the `.ics` export Airbnb/Vrbo give
  you and render it as a simple calendar on the property page.
- **A no-code editor for content**: add [Keystatic](https://keystatic.com)
  or [Decap CMS](https://decapcms.org) so you (or anyone else) can add
  properties through a web form instead of editing Markdown.
- **Full online booking + payments**: embed a widget from a host like
  Lodgify or Hospitable on the property page once you need that.
