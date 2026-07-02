# Home Ledger — Setup Guide

Everything you need to get the app running: GitHub hosting, the Claude bill-scanner project, Google Drive storage, and Google Sheet sync.

**Files in this package**

| file | what it is |
|---|---|
| `index.html` | the whole app (PWA) |
| `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png` | PWA install & offline support |
| `google-apps-script.gs` | backend script that writes entries into your Google Sheet |
| `PROJECT_INSTRUCTIONS.md` | paste into your Claude "Bill Scanner" project |
| `SETUP_GUIDE.md` | this file |

The daily workflow once everything is connected:

```
📷 photo of bill → Claude project (vision scan) → JSON
        JSON → saved to Google Drive folder (by Claude)
        JSON → pasted/dropped into the Ledger app → categorised entries
        Ledger app → "Sync now" → rows appear in your Google Sheet
```

---

## Part 1 — Put the app on GitHub Pages (free hosting)

1. Go to <https://github.com> and sign in (create a free account if needed).
2. Click **＋ → New repository**.
   - Repository name: `home-ledger`
   - Visibility: **Private is NOT supported by free GitHub Pages** — choose **Public** (the app contains no personal data; your expense data never lives in the repo, only on your phone and your Google Sheet).
   - Click **Create repository**.
3. On the new repo page click **uploading an existing file**, then drag in all six app files (`index.html`, `manifest.json`, `sw.js`, `icon-192.png`, `icon-512.png`, and optionally the `.md` and `.gs` files for safe keeping). Click **Commit changes**.
4. Open **Settings → Pages** (left sidebar).
   - Source: **Deploy from a branch**
   - Branch: `main`, folder `/ (root)` → **Save**.
5. Wait 1–2 minutes, refresh the page. You'll get a URL like:
   `https://YOURUSERNAME.github.io/home-ledger/`
6. Open that URL on your phone.
   - **Android (Chrome):** menu ⋮ → **Add to Home screen** → Install.
   - **iPhone (Safari):** Share □↑ → **Add to Home Screen**.
   It now opens full-screen like a native app and works offline.

> Updating the app later: edit/replace `index.html` in the repo → Commit. If changes don't appear on the phone, bump the version string in `sw.js` (`home-ledger-v1` → `v2`) and commit that too, then close and reopen the app.

---

## Part 2 — Create the "Bill Scanner" project in Claude

1. In claude.ai go to **Projects → New project**, name it **Bill Scanner**.
2. Open the project's **Instructions** (Set project instructions) and paste the entire contents of `PROJECT_INSTRUCTIONS.md`.
3. Make sure the **Google Drive connector** is enabled: Settings → Connectors → Google Drive → Connect, and grant access.
4. In Google Drive, create a folder named exactly **Home Ledger Bills** (the instructions tell Claude to save each bill's JSON there).
5. Test: open a new chat inside the project, upload a receipt photo, and send "scan". You should get a JSON code block back. Copy it.

> Tip: you can upload several receipt photos in one message — you'll get a JSON array, and the app imports all of them at once.

---

## Part 3 — Google Sheet + Apps Script (auto-sync backend)

This gives you a permanent spreadsheet copy of every entry, useful for backup and for any analysis you want to do in Sheets.

1. Go to <https://sheets.google.com> → **Blank spreadsheet**. Name it **Home Ledger**.
2. In the sheet: **Extensions → Apps Script**.
3. Delete the placeholder code and paste the full contents of `google-apps-script.gs`. Save (💾, name it "Home Ledger Sync").
4. Click **Deploy → New deployment**.
   - Click the gear ⚙ next to "Select type" → **Web app**.
   - Description: `ledger sync`
   - **Execute as: Me**
   - **Who has access: Anyone**  ← required so your phone can post to it without signing in
   - Click **Deploy**.
5. Google will ask for authorization: **Authorize access** → choose your account → "Google hasn't verified this app" → **Advanced → Go to Home Ledger Sync (unsafe)** → **Allow**. (It's your own script; this warning is normal.)
6. Copy the **Web app URL** — it looks like
   `https://script.google.com/macros/s/AKfycb…/exec`
7. In the Ledger app: **Settings tab → Apps Script URL** → paste → tap outside the box to save → **Sync now**.
8. Open the Google Sheet — an **Entries** tab appears with headers and your rows. ✅

Notes
- The script skips duplicate ids, so re-syncing never creates double rows.
- Redeploying after editing the script: **Deploy → Manage deployments → ✎ → Version: New version → Deploy** (the URL stays the same).
- To pull the sheet contents back (e.g. new phone), open the Web app URL in a browser — it returns all rows as JSON; or just restore from a JSON backup made in the app.

---

## Part 4 — Daily use

**Scanned bills**
1. Photograph the receipt (flat, good light — the app's accuracy depends on the photo).
2. Upload to the Bill Scanner project chat. Claude returns JSON and saves a copy to *Home Ledger Bills* in Drive.
3. Open Home Ledger → **Import** tab → paste the JSON (or drop the `.json` file downloaded from Drive) → **Preview bill**.
4. Check the auto-assigned categories (change any with the dropdowns) → **Add to ledger**.

**Manual entries** (fuel, electricity, water, gas, insurance…)
- Home tab → tap a quick tile (⛽ ⚡ 🔥 💧 🛡️ 📶 🍽️ 🛒) → the form opens pre-filled with the right category → enter amount → **Save**.
- Or use the **Add** tab for anything else. The **＋** button beside sub-category lets you create new sub-categories (e.g. add "Sugar-free items" under Grocery) — they're remembered.

**Answering your questions**
- *How much sugar did we use last month?* → Insights → **Ask the ledger** → type `sugar`, range `Last month`. You get total spend **and** total quantity (kg).
- *Meat + fish + vegetables total?* → Insights → **Drill down** → Grocery → read the Meat / Fish & seafood / Vegetables bars (or search each term).
- *Fuel cost? Restaurant food? Clothes?* → Drill down on Energy / Dining out / Non-consumables, or search `petrol`, `restaurant`, `dress`.
- Every month gets a donut of category shares, bill count, and a % comparison vs the previous month.

**Backups**
- Settings → **Backup JSON** monthly (keep it in Drive). **Export CSV** any time for Excel analysis.
- Your data lives in the phone's browser storage *and* the Google Sheet — two independent copies.

---

## Troubleshooting

| problem | fix |
|---|---|
| "Sync failed" | Re-check the Apps Script URL ends in `/exec`; redeploy with access = **Anyone**; make sure you have internet. |
| JSON won't parse in Import | Make sure you copied the whole code block, including the outer `{ }` or `[ ]`. |
| App shows old version after update | Bump the cache name in `sw.js`, commit, then fully close & reopen the app. |
| Install button missing on Android | GitHub Pages must be served over https (it is) and you must visit the *root* URL of the app once online. |
| Wrong category on a scanned item | Change it in the Import preview before adding, or edit the entry later (✎ on single entries). |

You're done — enjoy the ledger. 📒
