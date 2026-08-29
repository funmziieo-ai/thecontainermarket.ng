# Deploy Guide — thecontainermarket.ng
## GitHub → Vercel → Custom Domain

Everything you need, step by step. Takes about 20 minutes total.

---

## PART 1 — GitHub (store your code)

### Step 1 — Create a GitHub account
1. Go to https://github.com
2. Click **Sign up**
3. Enter your email, create a password, choose a username
4. Verify your email address

### Step 2 — Create a new repository
1. After logging in, click the **+** icon (top right) → **New repository**
2. Repository name: `thecontainermarket`
3. Set it to **Public** (required for free Vercel deploys)
4. ✅ Check **Add a README file** → NO (we have our own)
5. Click **Create repository**

### Step 3 — Upload your files
You'll see your empty repo. Now upload all files:

1. Click **uploading an existing file** (the link in the middle of the page)
2. Drag and drop ALL of the following into the upload box:
   - `index.html`
   - `app.js`
   - `vercel.json`
   - `.gitignore`
   - `README.md`
   - Your `images/` folder with product photos (if you have them yet)
3. Scroll down, add a commit message: `first commit — launch site`
4. Click **Commit changes**

✅ Your code is now on GitHub.

---

## PART 2 — Vercel (serve the site to the world)

### Step 4 — Create a Vercel account
1. Go to https://vercel.com
2. Click **Sign Up**
3. Choose **Continue with GitHub** — this links them automatically

### Step 5 — Deploy your site
1. On the Vercel dashboard, click **Add New… → Project**
2. Find `thecontainermarket` in the list → click **Import**
3. On the next screen:
   - Framework Preset: **Other** (it detects static automatically)
   - Leave everything else as default
4. Click **Deploy**
5. Wait ~30 seconds. You'll see a ✅ and a preview URL like:
   `thecontainermarket.vercel.app`

Click **Visit** — your site is LIVE. 🎉

### Step 6 — Connect your .ng domain
1. In your Vercel project, go to **Settings → Domains**
2. Type `thecontainermarket.ng` → click **Add**
3. Also add `www.thecontainermarket.ng`
4. Vercel shows you two DNS records to add. Write them down:
   ```
   Type: A      Name: @    Value: 76.76.21.21
   Type: CNAME  Name: www  Value: cname.vercel-dns.com
   ```

### Step 7 — Add DNS records at your domain registrar
Go to wherever you bought `thecontainermarket.ng`:

**If with WhoGoHost / Qservers / Netim / any Nigerian registrar:**
1. Log in → go to **Domain Manager** or **DNS Management**
2. Find `thecontainermarket.ng` → click **Manage DNS**
3. Delete any existing A records pointing to the old IP
4. Add:
   - Type: **A** | Name: **@** | Value: **76.76.21.21**
   - Type: **CNAME** | Name: **www** | Value: **cname.vercel-dns.com**
5. Save. DNS takes 15 minutes to 24 hours to propagate.

**Check if it worked:**
- Open a new browser tab → go to `thecontainermarket.ng`
- You should see your site
- Vercel automatically gives you HTTPS (the padlock 🔒)

---

## PART 3 — After going live

### Update your WhatsApp number in app.js
Before or after deploying, open `app.js` and change line 10:
```js
whatsappNumber: '2348000000000',
```
To your real number, e.g.: `'2348012345678'`

Then commit and push:
- On GitHub: go to `app.js` → click the pencil ✏️ icon → edit → **Commit changes**
- Vercel redeployment happens automatically in ~30 seconds

### Add product photos
1. Create an `images/` folder in your repo
2. On GitHub: click **Add file → Upload files**
3. Upload `product-1.jpg` through `product-6.jpg`
4. Commit → Vercel redeploys → photos appear on the site

---

## PART 4 — Social media links

Once your domain is live, use this in your bios:

**Instagram bio link:**
```
🪑 Vintage & bargain interiors
💬 Enquire directly on WhatsApp
🛒 thecontainermarket.ng
```

**Facebook page:**
- About section → Website: `https://thecontainermarket.ng`
- Add a "Shop Now" button pointing to your site

**WhatsApp Business:**
- Business profile → Website: `https://thecontainermarket.ng`

**Linktree alternative (free):**
If you want one link for ALL socials, use https://bio.link (free):
- Add: Website, Instagram, WhatsApp, Facebook
- Put bio.link URL in Instagram bio

---

## PART 5 — Every time you make a change

Future edits work like this:

1. Go to your GitHub repo
2. Click the file you want to edit (e.g. `index.html`)
3. Click the pencil ✏️ icon
4. Make your change
5. Click **Commit changes**
6. Vercel detects the change → redeploys in ~30 seconds
7. Your live site is updated ✅

---

## PART 6 — What's next (roadmap)

### Phase 2 — Supabase database
Instead of editing HTML to add products, you'll have a database:
- Add a product → it appears on the site instantly
- Upload photos → they go to cloud storage
- Track enquiries

### Phase 3 — Admin dashboard
A private page where you:
- Add / edit / delete listings
- Upload photos from your phone
- See enquiry stats

### Phase 4 — Mobile app
A React Native / Expo app for:
- Shoppers: browse, save, enquire
- Vendors: list items from their phone camera
- Push notifications for new arrivals
- Available on Google Play Store

---

## Help

If anything goes wrong, the most common issues are:

| Problem | Fix |
|---------|-----|
| Site not loading after domain change | Wait up to 24 hrs for DNS to propagate |
| Photos not showing | Make sure filenames match exactly: `product-1.jpg` (lowercase, hyphen) |
| WhatsApp button not working | Check your number in `app.js` — no `+`, no spaces |
| Changes not appearing | Hard refresh: Ctrl+Shift+R (Windows) or Cmd+Shift+R (Mac) |
