/**
 * HOME LEDGER — Google Apps Script backend
 * ----------------------------------------
 * Receives entries from the Home Ledger PWA and appends them
 * to the "Entries" tab of the Google Sheet this script is bound to.
 *
 * Setup: see SETUP_GUIDE.md → Part 3.
 * Deploy as: Web App · Execute as: Me · Who has access: Anyone
 */

const SHEET_NAME = 'Entries';

const HEADERS = [
  'id', 'date', 'time', 'shop', 'category', 'subcategory', 'item',
  'qty', 'unit', 'unit_price', 'amount', 'paid_by', 'notes', 'source', 'synced_at'
];

const CATEGORY_NAMES = {
  grocery: 'Grocery', consumable: 'Consumables', nonconsumable: 'Non-consumables',
  energy: 'Energy', water: 'Water', services: 'Services',
  dining: 'Dining out', transport: 'Transport', other: 'Other'
};

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(SHEET_NAME);
  if (!sh) sh = ss.insertSheet(SHEET_NAME);
  if (sh.getLastRow() === 0) {
    sh.appendRow(HEADERS);
    sh.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold').setBackground('#F2B33D');
    sh.setFrozenRows(1);
  }
  return sh;
}

/** POST { action:"append", entries:[...] }  → { ok:true, appended:n } */
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);
    if (body.action !== 'append' || !Array.isArray(body.entries)) {
      return json_({ ok: false, error: 'bad request' });
    }
    const sh = getSheet_();

    // avoid duplicate rows if the phone retries a sync
    const existing = new Set(
      sh.getLastRow() > 1
        ? sh.getRange(2, 1, sh.getLastRow() - 1, 1).getValues().flat().map(String)
        : []
    );

    const now = new Date();
    const rows = body.entries
      .filter(en => en.id && !existing.has(String(en.id)))
      .map(en => [
        en.id, en.date, en.time || '', en.shop || '',
        CATEGORY_NAMES[en.cat] || en.cat, en.sub || '', en.item || '',
        en.qty ?? '', en.unit || '', en.unitPrice ?? '', en.amount,
        en.pay || '', en.notes || '', en.source || 'manual', now
      ]);

    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, HEADERS.length).setValues(rows);
    return json_({ ok: true, appended: rows.length, skipped: body.entries.length - rows.length });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

/** GET → all rows as JSON (handy for restoring or checking) */
function doGet() {
  const sh = getSheet_();
  const values = sh.getDataRange().getValues();
  const head = values.shift() || [];
  const out = values.map(r => Object.fromEntries(head.map((h, i) => [h, r[i]])));
  return json_({ ok: true, count: out.length, entries: out });
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
