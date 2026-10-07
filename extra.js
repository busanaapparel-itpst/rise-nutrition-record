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

  // answer = nomor pilihan yang benar (dimulai dari 0)
  var PRETEST = [
    { q: "Manakah yang paling tepat menggambarkan fungsi anggaran bulanan?",
      options: ["Mencatat pengeluaran setelah semuanya terjadi saja", "Merencanakan pembagian pemasukan untuk kebutuhan, tabungan, dan kewajiban", "Membatasi seluruh pengeluaran sampai nol", "Menghitung pajak penghasilan"], answer: 1 },
    { q: "Dana darurat sebaiknya disiapkan untuk:",
      options: ["Belanja keinginan musiman", "Kebutuhan tak terduga, misalnya sakit atau kehilangan pekerjaan", "Membayar cicilan bulan depan", "Investasi berisiko tinggi"], answer: 1 },
    { q: "Selain protein, apa yang sebaiknya ada pada satu kali makan seimbang?",
      options: ["Hanya nasi", "Sayuran, biji-bijian, dan buah", "Gorengan", "Minuman manis"], answer: 1 },
    { q: "Manakah yang termasuk sumber protein?",
      options: ["Teh manis", "Telur, tempe, dan ikan", "Sirup", "Keripik"], answer: 1 },
    { q: "Berapa total jam dalam satu minggu?",
      options: ["100 jam", "120 jam", "168 jam", "200 jam"], answer: 2 },
    { q: "Langkah pertama dalam audit waktu adalah:",
      options: ["Membuat jadwal baru tanpa data", "Mencatat bagaimana waktu benar-benar dipakai selama seminggu", "Menghapus semua aktivitas santai", "Menambah jam kerja"], answer: 1 }
  ];
  var POSTTEST = PRETEST; // ganti dengan daftar soal sendiri jika berbeda dari pre-test
  // ===================================================================

  var h = function (s) { return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); };
  var PAGE_IDS = ["pretest", "materi", "posttest"];

  function profile(input) {
    return '<section class="rx-card rx-fields">' +
      '<div class="field"><label>Nama</label>' + input("time-name", "text", "Nama peserta") + '</div>' +
      '<div class="field"><label>Usia (tahun)</label>' + input("time-age", "number", "0") + '</div>' +
      '<div class="field"><label>Profesi</label>' + input("time-job", "text", "Profesi") + '</div></section>';
  }

  function score(list, prefix) {
    var a = 0, c = 0;
    list.forEach(function (q, i) {
      var v = state[prefix + "-q" + i];
      if (v !== undefined && v !== "") { a++; if (Number(v) === q.answer) c++; }
    });
    return { a: a, c: c, n: list.length, p: list.length ? Math.round(c / list.length * 100) : 0 };
  }
  function row(label, value) { return '<div class="summary"><span>' + h(label) + '</span><strong>' + h(value) + '</strong></div>'; }

  function testPage(kind, ctx) {
    var pre = kind === "pretest", list = pre ? PRETEST : POSTTEST, prefix = pre ? "pre" : "post", title = pre ? "Pre-test" : "Post-test";
    var sc = score(list, prefix);
    var html = ctx.heading(title, pre ? "Jawab pertanyaan berikut sebelum mengikuti materi." : "Jawab kembali pertanyaan berikut setelah mengikuti materi dan worksheet.") + profile(ctx.input);
    html += list.map(function (q, i) {
      var key = prefix + "-q" + i, v = state[key], has = v !== undefined && v !== "";
      return '<div class="rx-q"><p class="rx-qt"><b>' + (i + 1) + '.</b> ' + h(q.q) + '</p>' +
        q.options.map(function (o, j) {
          return '<label class="rx-opt"><input type="radio" name="' + key + '" data-rx="' + key + '" value="' + j + '"' + (has && Number(v) === j ? " checked" : "") + '><span>' + h(o) + '</span></label>';
        }).join("") + '</div>';
    }).join("");
    html += row("Terjawab", sc.a + " dari " + sc.n);
    html += row("Skor " + title, sc.c + " dari " + sc.n + " (" + sc.p + "%)");
    if (!pre) {
      var ps = score(PRETEST, "pre");
      if (ps.a) {
        var d = sc.p - ps.p;
        html += row("Skor Pre-test", ps.c + " dari " + ps.n + " (" + ps.p + "%)");
        html += row("Peningkatan", (d > 0 ? "+" : "") + d + " poin persentase");
      }
    }
    return html;
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
    page: function (p, ctx) { return p === "materi" ? materiPage(ctx) : testPage(p, ctx); }
  };

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t.dataset || !t.dataset.rx) return;
    state[t.dataset.rx] = t.type === "checkbox" ? (t.checked ? "1" : "") : t.value;
    save();
    render();
  });
})();
