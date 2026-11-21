# Panduan: konfirmasi kehadiran langsung di undangan

Hasilnya: tamu mengisi form di undangan, datanya masuk ke Google Sheet-mu, dan ucapan tamu langsung tampil di bagian bawah undangan.

## 1. Buat Google Sheet
1. Buka sheets.google.com dan buat spreadsheet baru. Beri nama, misalnya **RSVP Undangan**.

## 2. Pasang skrip
1. Di Sheet itu, buka menu **Extensions (Ekstensi) → Apps Script**.
2. Hapus semua kode yang ada, lalu tempel seluruh isi file `apps-script/Code.gs`.
3. Ketuk ikon simpan.

## 3. Jadikan Web App
1. Klik **Deploy (Terapkan) → New deployment (Deployment baru)**.
2. Ketuk ikon roda gigi, pilih **Web app**.
3. Isi:
   - **Execute as (Jalankan sebagai):** Me (Saya)
   - **Who has access (Yang memiliki akses):** **Anyone (Siapa saja)**
4. Klik **Deploy**, setujui izin yang diminta (Authorize access).
5. Salin **Web app URL** yang muncul (bentuknya `https://script.google.com/macros/s/.../exec`).

## 4. Masukkan alamatnya ke undangan
Buka `script.js`, cari baris:

    var APPS_SCRIPT_URL = '';

lalu isi dengan alamat tadi, misalnya:

    var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/xxxx/exec';

Unggah ulang ke GitHub. Atau kirim alamatnya ke Claude supaya file undangan dibuatkan ulang.

## Catatan
- Ucapan tamu tampil di undangan. Kalau mau disembunyikan (hanya kamu yang lihat di Sheet), ubah `TAMPILKAN_UCAPAN` di `Code.gs` jadi `false`.
- Setiap kali kamu mengubah kode di Apps Script, buat **New deployment** lagi (atau Manage deployments → Edit → New version), kalau tidak perubahan tidak aktif.
- Data tamu ada di tab **RSVP** pada Sheet: waktu, nama, kehadiran, jumlah tamu, dan ucapan.
- Fitur ini hanya jalan di halaman yang di-host (misalnya GitHub Pages), bukan di halaman preview Claude.
