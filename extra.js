/* Menu tambahan: Pre-test, Materi, Post-test.
   Ubah isi materi dan soal di bagian KONTEN di bawah ini. */
(function () {
  // ================= KONTEN (contoh, silakan ganti) =================
  var MATERI = [
    { title: "Modul 1 · Budgeting bulanan",
      body: ["Anggaran bulanan adalah rencana pembagian pemasukan sebelum bulan berjalan: untuk kebutuhan rutin, cicilan, tabungan, dana darurat, dan pengeluaran lain.",
             "Catat pemasukan lebih dulu, lalu alokasikan ke setiap kelompok. Bandingkan hasilnya di akhir bulan untuk melihat selisihnya."],
      link: "" },
    { title: "Modul 2 · Nutrisi harian",
      body: ["Makan seimbang mencakup protein, serat/sayuran, biji-bijian, dan buah/vitamin pada setiap waktu makan.",
             "Catat menu dan biaya makan harian agar pola makan dan pengeluaran makanan mudah dipantau."],
      link: "" },
    { title: "Modul 3 · Audit waktu",
      body: ["Dalam seminggu ada 168 jam. Audit waktu membantu melihat ke mana jam-jam itu benar-benar dipakai.",
             "Catat jam per aktivitas selama satu minggu, lalu tinjau aktivitas mana yang perlu dikurangi atau ditambah."],
      link: "" }
  ];

  // Tempel link Google Sheet (diawali https://) di antara tanda kutip
  var SHEET_LINKS = {
    pretest: "",
    posttest: ""
  };
  // ===================================================================

  var h = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var PAGE_IDS = ["pretest", "materi", "posttest"];

  function profile(input) {
    return '<section class="rx-card rx-fields">' +
      '<div class="field"><label>Nama</label>' + input("time-name", "text", "Nama peserta") + '</div>' +
      '<div class="field"><label>Usia (tahun)</label>' + input("time-age", "number", "0") + '</div>' +
      '<div class="field"><label>Profesi</label>' + input("time-job", "text", "Profesi") + '</div></section>';
  }

  function row(label, value) { return '<div class="summary"><span>' + h(label) + '</span><strong>' + h(value) + '</strong></div>'; }

  function sheetPage(kind, ctx) {
    var pre = kind === "pretest", title = pre ? "Pre-test" : "Post-test", url = SHEET_LINKS[kind] || "";
    var ok = /^https:\/\//i.test(url);
    return ctx.heading(title, pre ? "Kerjakan pre-test melalui Google Sheet sebelum mengikuti materi." : "Kerjakan post-test melalui Google Sheet setelah mengikuti materi dan worksheet.") +
      '<section class="rx-card rx-sheet"><div class="rx-sheet-ico" aria-hidden="true">&#128202;</div>' +
      '<h2>' + title + ' (Google Sheet)</h2>' +
      (ok ? '<p>Ketuk tombol di bawah untuk membuka lembar ' + title.toLowerCase() + ' di tab baru.</p>' +
            '<a class="rx-btn" href="' + h(url) + '" target="_blank" rel="noopener">Buka ' + title + ' &#8599;</a>'
          : '<p class="rx-muted">Link ' + title + ' belum tersedia.</p>') +
      '</section>';
  }

  function materiPage(ctx) {
    var done = 0;
    var cards = MATERI.map(function (m, i) {
      var d = state["materi-done-" + i] === "1"; if (d) done++;
      return '<section class="rx-card rx-mod"><h3 class="rx-mt">' + h(m.title) + '</h3>' +
        m.body.map(function (p) { return "<p>" + h(p) + "</p>"; }).join("") +
        (m.link ? '<p><a class="rx-link" href="' + h(m.link) + '" target="_blank" rel="noopener">Buka materi &#8599;</a></p>' : "") +
        '<label class="rx-check"><input type="checkbox" data-rx="materi-done-' + i + '"' + (d ? " checked" : "") + '><span>Saya sudah membaca materi ini</span></label></section>';
    }).join("");
    return ctx.heading("Materi", "Baca setiap modul, lalu centang jika sudah selesai.") + profile(ctx.input) + cards +
      row("Materi selesai dibaca", done + " dari " + MATERI.length);
  }

  window.RX = {
    has: function (p) { return PAGE_IDS.indexOf(p) > -1; },
    page: function (p, ctx) { return p === "materi" ? materiPage(ctx) : sheetPage(p, ctx); }
  };

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t.dataset || !t.dataset.rx) return;
    state[t.dataset.rx] = t.type === "checkbox" ? (t.checked ? "1" : "") : t.value;
    save();
    render();
  });
})();
