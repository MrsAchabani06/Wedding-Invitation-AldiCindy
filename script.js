(function () {
  'use strict';

  var WA = '6285792553368';
  // Isi dengan alamat Web App Google Apps Script (lihat PANDUAN-RSVP.md).
  // Kalau kosong, konfirmasi dikirim lewat WhatsApp saja.
  var APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzpZ_l8RBUIu8-YCeBcFyceLScf7U4mu5zdcdh1AVR9xbqCEp6TEkqDsDYQc6iJNPrwtg/exec';
  var WAKTU_ACARA = new Date('2026-12-06T08:30:00+07:00');

  var cover = document.getElementById('cover');
  var konten = document.getElementById('konten');
  var musik = document.getElementById('musik');
  var btnMusik = document.getElementById('btnMusik');

  // Nama tamu dari ?to=
  var tamu = new URLSearchParams(location.search).get('to');
  if (tamu) {
    document.getElementById('namaTamu').textContent = tamu;
    var rNama = document.getElementById('rNama');
    if (rNama) rNama.value = tamu;
  }

  // Detik awal pemutaran lagu (0 = dari awal). Ubah bila ingin mulai di titik lain, misalnya bagian reff.
  var MULAI_REFF = 0;

  function mulaiMusik() {
    musik.volume = 0;
    musik.play().then(function () {
      btnMusik.classList.add('main');
      var v = 0;
      var t = setInterval(function () {
        v = Math.min(1, v + 0.05);
        musik.volume = v;
        if (v >= 1) clearInterval(t);
      }, 150);
    }).catch(function () {});
    if (musik.readyState >= 1) {
      musik.currentTime = MULAI_REFF;
    } else {
      musik.addEventListener('loadedmetadata', function () {
        musik.currentTime = MULAI_REFF;
      }, { once: true });
    }
  }

  // Setelah lagu habis, ulang dari reff lagi
  musik.addEventListener('ended', function () {
    musik.currentTime = MULAI_REFF;
    musik.play().catch(function () {});
  });

  // Buka undangan + mulai musik
  document.getElementById('btnBuka').addEventListener('click', function () {
    konten.hidden = false;
    cover.classList.add('tutup');
    document.body.classList.remove('locked');
    window.scrollTo(0, 0);
    mulaiMusik();
    setTimeout(function () { cover.hidden = true; }, 1000);
    aktifkanMuncul();
  });

  btnMusik.addEventListener('click', function () {
    if (musik.paused) {
      musik.play().catch(function () {});
      btnMusik.classList.add('main');
    } else {
      musik.pause();
      btnMusik.classList.remove('main');
    }
  });

  // Hitung mundur
  function dua(n) { return n < 10 ? '0' + n : '' + n; }
  function hitung() {
    var sisa = WAKTU_ACARA - new Date();
    if (sisa < 0) sisa = 0;
    var d = Math.floor(sisa / 864e5);
    var j = Math.floor(sisa % 864e5 / 36e5);
    var m = Math.floor(sisa % 36e5 / 6e4);
    var s = Math.floor(sisa % 6e4 / 1e3);
    document.getElementById('cHari').textContent = dua(d);
    document.getElementById('cJam').textContent = dua(j);
    document.getElementById('cMenit').textContent = dua(m);
    document.getElementById('cDetik').textContent = dua(s);
  }
  hitung();
  setInterval(hitung, 1000);

  // Simpan di kalender (.ics)
  document.getElementById('btnKalender').addEventListener('click', function (e) {
    e.preventDefault();
    var ics = [
      'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
      'DTSTART:20261206T013000Z', 'DTEND:20261206T070000Z',
      'SUMMARY:Pernikahan Aldi & Cindy',
      'LOCATION:Bebek Goreng H. Makrus\\, Jarakan\\, Tanjunganom\\, Nganjuk',
      'DESCRIPTION:Akad 08.30 WIB\\, Resepsi 11.00 - 14.00 WIB',
      'END:VEVENT', 'END:VCALENDAR'
    ].join('\r\n');
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([ics], { type: 'text/calendar' }));
    a.download = 'pernikahan-aldi-cindy.ics';
    a.click();
  });

  // Tombol kembali ke atas
  var btnAtas = document.getElementById('btnAtas');
  window.addEventListener('scroll', function () {
    btnAtas.classList.toggle('tampil', window.scrollY > 500);
  }, { passive: true });
  btnAtas.addEventListener('click', function () {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  // Salin teks
  document.querySelectorAll('[data-salin]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var teks = document.querySelector(btn.dataset.salin).textContent.trim();
      var awal = btn.textContent;
      (navigator.clipboard ? navigator.clipboard.writeText(teks) : Promise.reject())
        .then(function () { btn.textContent = 'Tersalin'; })
        .catch(function () { btn.textContent = 'Salin manual ya'; })
        .then(function () { setTimeout(function () { btn.textContent = awal; }, 1800); });
    });
  });

  // RSVP: langsung ke website (Google Sheets) atau lewat WhatsApp
  (function rsvp() {
    var btnKirim = document.getElementById('btnKirim');
    var btnWA = document.getElementById('btnWA');
    var status = document.getElementById('rStatus');
    var box = document.getElementById('ucapanBox');
    var list = document.getElementById('ucapanList');
    var langsung = !!APPS_SCRIPT_URL;

    function ambil() {
      return {
        nama: document.getElementById('rNama').value.trim(),
        hadir: document.getElementById('rHadir').value,
        jumlah: document.getElementById('rJumlah').value,
        ucapan: document.getElementById('rUcapan').value.trim()
      };
    }
    function bukaWA(d) {
      var pesan = 'Assalamu’alaikum, saya ' + d.nama + '.\n' +
        'Konfirmasi: ' + d.hadir + '\n' +
        'Jumlah tamu: ' + d.jumlah + '\n' +
        'Ucapan: ' + (d.ucapan || '-');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(pesan), '_blank');
    }
    function pesan(teks, galat) {
      status.textContent = teks || '';
      status.className = 'r-status' + (galat ? ' galat' : '');
    }
    function waktuRelatif(iso) {
      var t = new Date(iso).getTime(); if (isNaN(t)) return '';
      var s = Math.max(0, (Date.now() - t) / 1000);
      if (s < 60) return 'baru saja';
      if (s < 3600) return Math.floor(s / 60) + ' menit lalu';
      if (s < 86400) return Math.floor(s / 3600) + ' jam lalu';
      if (s < 86400 * 30) return Math.floor(s / 86400) + ' hari lalu';
      return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    }
    function buatItem(u) {
      var el = document.createElement('div'); el.className = 'ucapan-item';
      var atas = document.createElement('div'); atas.className = 'ucapan-atas';
      var nama = document.createElement('span'); nama.className = 'ucapan-nama'; nama.textContent = u.nama;
      var wkt = document.createElement('span'); wkt.className = 'ucapan-waktu'; wkt.textContent = waktuRelatif(u.waktu);
      atas.appendChild(nama); atas.appendChild(wkt); el.appendChild(atas);
      if (u.hadir) { var st = document.createElement('span'); st.className = 'ucapan-status'; st.textContent = u.hadir; el.appendChild(st); }
      var isi = document.createElement('p'); isi.className = 'ucapan-isi'; isi.textContent = u.ucapan; el.appendChild(isi);
      return el;
    }
    function tampilkan(data) {
      list.innerHTML = '';
      if (!data.length) {
        var k = document.createElement('p'); k.className = 'ucapan-kosong';
        k.textContent = 'Jadilah yang pertama mengirim ucapan.'; list.appendChild(k); return;
      }
      data.forEach(function (u) { list.appendChild(buatItem(u)); });
    }

    if (langsung) {
      btnKirim.textContent = 'Kirim Konfirmasi';
      document.querySelector('.rsvp > p.anim').textContent = 'Konfirmasi kehadiran dan ucapan Anda akan langsung tampil di bawah.';
      box.hidden = false;
      fetch(APPS_SCRIPT_URL)
        .then(function (r) { return r.json(); })
        .then(function (j) { if (j && j.ok && j.data && j.data.length) tampilkan(j.data); else tampilkan([]); })
        .catch(function () { box.hidden = true; });
    }

    btnKirim.addEventListener('click', function () {
      var d = ambil();
      if (!d.nama) { pesan('Nama wajib diisi ya.', true); document.getElementById('rNama').focus(); return; }
      if (!langsung) { bukaWA(d); return; }
      if (document.getElementById('rJebakan').value) return;
      btnKirim.disabled = true; pesan('Mengirim…');
      fetch(APPS_SCRIPT_URL, { method: 'POST', body: JSON.stringify({
        nama: d.nama, hadir: d.hadir, jumlah: d.jumlah, ucapan: d.ucapan,
        website: document.getElementById('rJebakan').value
      }) })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!j || !j.ok) throw new Error('gagal');
          pesan('Terima kasih, konfirmasi Anda sudah kami terima.');
          if (d.ucapan) {
            var kosong = list.querySelector('.ucapan-kosong'); if (kosong) list.innerHTML = '';
            list.insertBefore(buatItem({ nama: d.nama, hadir: d.hadir, ucapan: d.ucapan, waktu: new Date().toISOString() }), list.firstChild);
            box.hidden = false;
          }
          document.getElementById('rUcapan').value = '';
          btnWA.hidden = false; btnWA.onclick = function () { bukaWA(d); };
        })
        .catch(function () {
          pesan('Gagal mengirim. Coba lagi, atau kabari lewat WhatsApp.', true);
          btnWA.hidden = false; btnWA.onclick = function () { bukaWA(d); };
        })
        .then(function () { btnKirim.disabled = false; });
    });
  })();

  // Pecah teks jadi kata-kata supaya masuk satu per satu
  (function pecahKata() {
    document.querySelectorAll('.kata').forEach(function (el) {
      var n = 0;
      (function walk(node) {
        Array.prototype.slice.call(node.childNodes).forEach(function (c) {
          if (c.nodeType === 3) {
            var frag = document.createDocumentFragment();
            c.textContent.split(/(\s+)/).forEach(function (bagian) {
              if (!bagian) return;
              if (/^\s+$/.test(bagian)) { frag.appendChild(document.createTextNode(' ')); return; }
              var s = document.createElement('span');
              s.className = 'k';
              s.style.setProperty('--i', n++);
              s.textContent = bagian;
              frag.appendChild(s);
            });
            node.replaceChild(frag, c);
          } else if (c.nodeType === 1) { walk(c); }
        });
      })(el);
    });
  })();

  // Muncul saat digulir (beberapa gaya masuk, hormati reduced motion lewat CSS)
  function aktifkanMuncul() {
    var els = Array.prototype.slice.call(document.querySelectorAll('.anim'));
    if (!('IntersectionObserver' in window)) { els.forEach(function (el) { el.classList.add('tampil'); }); return; }
    // Elemen yang meluncur dari luar layar diamati lewat induknya (.baris),
    // supaya tetap terdeteksi walau posisi awalnya di luar area terlihat.
    var kelompok = new Map();
    els.forEach(function (el) {
      var pemicu = el.closest('.baris') || el;
      if (!kelompok.has(pemicu)) kelompok.set(pemicu, []);
      kelompok.get(pemicu).push(el);
    });
    var io = new IntersectionObserver(function (list) {
      var i = 0;
      list.forEach(function (x) {
        if (!x.isIntersecting) return;
        (kelompok.get(x.target) || []).forEach(function (el, k) {
          if (!el.style.getPropertyValue('--d')) {
            var sama = x.target === el;
            el.style.setProperty('--d', ((sama ? i++ : k) * (sama ? 0.14 : 0.35)) + 's');
          }
          el.classList.add('tampil');
        });
        io.unobserve(x.target);
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -6% 0px' });
    kelompok.forEach(function (v, pemicu) { io.observe(pemicu); });
  }

  // Galeri slide: geser, tombol, titik, dan otomatis
  (function galeri() {
    var slider = document.getElementById('slider');
    if (!slider) return;
    var slides = Array.prototype.slice.call(slider.querySelectorAll('.slide'));
    var dots = document.getElementById('slDots');
    var aktif = 0, jedaSampai = 0, terlihat = false, rafId = null;
    if (!slides.length) return;

    slides.forEach(function (s, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.setAttribute('aria-label', 'Foto ' + (i + 1));
      b.addEventListener('click', function () { jeda(); ke(i); });
      dots.appendChild(b);
    });

    function tandai(i) {
      aktif = i;
      slides.forEach(function (s, k) { s.classList.toggle('aktif', k === i); });
      Array.prototype.forEach.call(dots.children, function (d, k) { d.classList.toggle('aktif', k === i); });
    }
    function ke(i) {
      i = (i + slides.length) % slides.length;
      var s = slides[i];
      slider.scrollTo({ left: s.offsetLeft - (slider.clientWidth - s.offsetWidth) / 2, behavior: 'smooth' });
      tandai(i);
    }
    function terdekat() {
      var rect = slider.getBoundingClientRect(), pusat = rect.left + rect.width / 2, best = 0, jarak = 1e9;
      slides.forEach(function (s, k) {
        var r = s.getBoundingClientRect(), d = Math.abs(r.left + r.width / 2 - pusat);
        if (d < jarak) { jarak = d; best = k; }
      });
      return best;
    }
    function jeda() { jedaSampai = Date.now() + 6000; }

    slider.addEventListener('scroll', function () {
      if (rafId) return;
      rafId = requestAnimationFrame(function () { rafId = null; var t = terdekat(); if (t !== aktif) tandai(t); });
    }, { passive: true });
    ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (ev) {
      slider.addEventListener(ev, jeda, { passive: true });
    });
    document.getElementById('slPrev').addEventListener('click', function () { jeda(); ke(aktif - 1); });
    document.getElementById('slNext').addEventListener('click', function () { jeda(); ke(aktif + 1); });

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(function (l) { terlihat = l[0].isIntersecting; }, { threshold: 0.4 }).observe(slider);
    }
    setInterval(function () {
      if (!terlihat || document.hidden || Date.now() < jedaSampai) return;
      ke(aktif + 1);
    }, 3500);
    window.addEventListener('load', function () { ke(0); slider.scrollLeft = 0; tandai(0); });
    tandai(0);
  })();
})();
