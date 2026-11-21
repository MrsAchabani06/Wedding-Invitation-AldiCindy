// Google Apps Script untuk konfirmasi kehadiran (RSVP) undangan.
// Tempel seluruh isi file ini di Apps Script milik Google Sheet-mu.

var NAMA_SHEET = 'RSVP';
var TAMPILKAN_UCAPAN = true;  // true = ucapan tampil di undangan; false = hanya kamu yang lihat di Sheet
var MAKS_TAMPIL = 50;         // jumlah ucapan terbaru yang ditampilkan

function doPost(e) {
  var lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    var d = JSON.parse(e.postData.contents);
    if (d.website) return json_({ ok: true });            // jebakan bot
    var nama = bersih_(d.nama, 60);
    if (!nama) return json_({ ok: false, pesan: 'Nama wajib diisi' });
    var hadir = (d.hadir === 'Mohon maaf, belum bisa hadir') ? d.hadir : 'Insya Allah hadir';
    var jumlah = Math.min(10, Math.max(1, parseInt(d.jumlah, 10) || 1));
    var ucapan = bersih_(d.ucapan, 500);
    sheet_().appendRow([new Date(), nama, hadir, jumlah, ucapan]);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false });
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  if (!TAMPILKAN_UCAPAN) return json_({ ok: true, data: [] });
  var s = sheet_();
  var last = s.getLastRow();
  if (last < 2) return json_({ ok: true, data: [] });
  var awal = Math.max(2, last - 199);
  var rows = s.getRange(awal, 1, last - awal + 1, 5).getValues();
  var out = [];
  for (var i = rows.length - 1; i >= 0 && out.length < MAKS_TAMPIL; i--) {
    var r = rows[i];
    if (!r[4]) continue;
    out.push({ waktu: new Date(r[0]).toISOString(), nama: r[1], hadir: r[2], ucapan: r[4] });
  }
  return json_({ ok: true, data: out });
}

function sheet_() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var s = ss.getSheetByName(NAMA_SHEET);
  if (!s) {
    s = ss.insertSheet(NAMA_SHEET);
    s.appendRow(['Waktu', 'Nama', 'Kehadiran', 'Jumlah tamu', 'Ucapan']);
    s.setFrozenRows(1);
  }
  return s;
}

function bersih_(v, maks) {
  v = String(v || '').replace(/[\u0000-\u0009\u000b-\u001f]/g, ' ').trim().slice(0, maks);
  if (/^[=+\-@]/.test(v)) v = "'" + v;   // cegah rumus nyasar di Sheet
  return v;
}

function json_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj)).setMimeType(ContentService.MimeType.JSON);
}
