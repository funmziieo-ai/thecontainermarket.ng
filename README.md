# The Container Market

**thecontainermarket.ng** — Curated vintage & bargain interior finds. Nigeria.

> Enquire, offer, and discover one-of-a-kind pieces — direct on WhatsApp.

---

## Live site

Deployed on Vercel → [thecontainermarket.ng](https://thecontainermarket.ng)

---

## Project structure

```
thecontainermarket/
├── index.html        ← the full site (HTML + CSS)
├── app.js            ← all interactivity (filters, WA, offers, wishlist)
├── vercel.json       ← Vercel deploy config
├── .gitignore
├── README.md
└── images/           ← product photos (add yours here)
    ├── product-1.jpg
    ├── product-2.jpg
    └── ...
```

---

## Adding your product photos

1. Take or download a clear photo of each product (portrait 3:4 ratio works best)
2. Rename: `product-1.jpg` through `product-6.jpg`
3. Compress at [squoosh.app](https://squoosh.app) → MozJPEG, quality 80, max 900px wide
4. Place in the `images/` folder
5. `git add . && git commit -m "add product photos" && git push` → Vercel redeploys automatically

---

## Update your WhatsApp number

Open `app.js` line 10:

```js
whatsappNumber: '2348000000000',
```

Replace with your real number (international format, no `+` or spaces).

---

## Deploying to Vercel

1. Push this repo to GitHub (see DEPLOY-GUIDE.md)
2. Go to [vercel.com](https://vercel.com) → New Project → Import from GitHub
3. Click Deploy (no build settings needed — it's a static site)
4. Add your custom domain under Project → Domains

---

## Roadmap

- [x] Phase 1 — Static site on GitHub + Vercel
- [ ] Phase 2 — Supabase database (dynamic products, no HTML editing)
- [ ] Phase 3 — Admin dashboard (add/edit/remove listings)
- [ ] Phase 4 — Mobile app (React Native / Expo)
