/* Menu tambahan: Pre-test, Materi, Post-test.
   Ubah isi materi dan soal di bagian KONTEN di bawah ini. */
(function () {
  // ================= KONTEN (contoh, silakan ganti) =================
  // Ada 7 slot materi (satu per file PPT). Ubah title, lalu isi salah satu dari slides atau pptx:
  //  slides: link Google Slides/Drive (link berbagi biasa boleh ditempel langsung) atau link sematan, diawali https://
  //  pptx:   nama file .pptx yang diunggah ke repository GitHub, misalnya "materi/modul1.pptx"
  var MATERI = [
    { title: "Materi 1 : Manajemen diri dan perubahan", body: [], slides: "https://docs.google.com/presentation/d/1HKq5pc6l3fJBsFic2Nu8h3b68WQpbG5W/edit", pptx: "", link: "" },
    { title: "Materi 2 : Gender dan komunikasi", body: [], slides: "https://docs.google.com/presentation/d/1tWDfifjtL63osZqI2uFsxljQh-0UIzBq/edit", pptx: "", link: "" },
    { title: "Materi 3 : Penyelesaian masalah dan pengambilan keputusan", body: [], slides: "https://docs.google.com/presentation/d/1s0Q1JId7lUnXHQoNdfJB6XaOfX1aMYeI/edit", pptx: "", link: "" },
    { title: "Materi 4 : Manajemen waktu dan stress", body: [], slides: "https://docs.google.com/presentation/d/1EQ9Heqq5w8uEwp8PGK8ZcdxHyBdk3c0d/edit", pptx: "", link: "" },
    { title: "Materi 5 : Kesehatan dasar", body: [], slides: "https://docs.google.com/presentation/d/1yf6kcYcMQy7vbVse4QEcyxQ-r3HT_rct/edit", pptx: "", link: "" },
    { title: "Materi 6 : Kesehatan keuangan", body: [], slides: "https://docs.google.com/presentation/d/118C9UgneYWz2rsA2vjo6N_JDqKm0qedZ/edit", pptx: "", link: "" },
    { title: "Materi 7 : HKSR", body: [], slides: "https://docs.google.com/presentation/d/1WDLXoe-6RT8z-GqWa78Ft_3Wo_WoYAR5/edit", pptx: "", link: "" }
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

  function slideHtml(m, i) {
    var src = "", open = "", label = "";
    if (m.slides && /^https:\/\//i.test(m.slides)) {
      src = m.slides; open = m.slides; label = "Buka slide di tab baru";
      // Link berbagi biasa (…/d/ID/edit) diubah otomatis menjadi link sematan
      var g = m.slides.match(/^https:\/\/(?:docs|drive)\.google\.com\/(?:presentation\/d|file\/d)\/([\w-]+)/);
      if (g && !/\/(embed|pub)(\?|\/|$)/.test(m.slides)) {
        src = g[1].length > 40
          ? "https://docs.google.com/presentation/d/" + g[1] + "/embed?start=false&loop=false"
          : "https://drive.google.com/file/d/" + g[1] + "/preview";
      }
    }
    else if (m.pptx) {
      try {
        var file = new URL(m.pptx, location.href).href;
        src = "https://view.officeapps.live.com/op/embed.aspx?src=" + encodeURIComponent(file);
        open = file; label = "Unduh file PPT";
      } catch (err) {}
    }
    if (!src) return "";
    // src diisi saat modul dibuka, agar 7 slide tidak dimuat sekaligus
    return '<div class="rx-slides"><iframe data-src="' + h(src) + '" title="' + h(m.title) + '" allowfullscreen></iframe></div>' +
      '<p class="rx-note"><a class="rx-link" href="' + h(open) + '" target="_blank" rel="noopener">' + label + ' &#8599;</a></p>';
  }

  // Materi dibuka berurutan: materi N baru terbuka setelah materi N-1 dicentang "sudah dibaca"
  function doneList() {
    var eff = [];
    MATERI.forEach(function (_, i) { eff[i] = state["materi-done-" + i] === "1" && (i === 0 || eff[i - 1]); });
    return eff;
  }

  function materiPage(ctx) {
    var eff = doneList(), count = eff.filter(Boolean).length;
    var cards = MATERI.map(function (m, i) {
      var open = i === 0 || eff[i - 1], d = eff[i];
      if (!open) {
        return '<div class="rx-card rx-mod rx-locked"><div class="rx-lockrow"><span class="rx-mt">' + h(m.title) + '</span>' +
          '<span class="rx-badge">&#128274; Terkunci</span></div>' +
          '<p class="rx-note">Centang &ldquo;Saya sudah membaca materi ini&rdquo; pada materi sebelumnya untuk membuka materi ini.</p></div>';
      }
      return '<details class="rx-card rx-mod" data-i="' + i + '"><summary><span class="rx-mt">' + h(m.title) + '</span>' +
        '<span class="rx-badge' + (d ? " done" : "") + '">' + (d ? "Sudah dibaca" : "Belum dibaca") + '</span></summary><div class="rx-body">' +
        (m.body || []).map(function (p) { return "<p>" + h(p) + "</p>"; }).join("") +
        slideHtml(m, i) +
        (m.link ? '<p><a class="rx-link" href="' + h(m.link) + '" target="_blank" rel="noopener">Buka materi &#8599;</a></p>' : "") +
        '<label class="rx-check"><input type="checkbox" data-rx="materi-done-' + i + '"' + (d ? " checked" : "") + '><span>Saya sudah membaca materi ini</span></label></div></details>';
    }).join("");
    return ctx.heading("Materi", "Pelajari materi secara berurutan. Centang \u201cSaya sudah membaca materi ini\u201d untuk membuka materi berikutnya.") + cards +
      '<div class="summary"><span>Materi selesai dibaca</span><strong class="rx-prog">' + count + " dari " + MATERI.length + "</strong></div>" +
      (count === MATERI.length ? '<p class="rx-allDone">Selamat, semua materi sudah selesai dibaca.</p>' : "");
  }

  window.RX = {
    has: function (p) { return PAGE_IDS.indexOf(p) > -1; },
    page: function (p, ctx) { return p === "materi" ? materiPage(ctx) : sheetPage(p, ctx); }
  };

  // Muat slide hanya saat modul dibuka
  document.addEventListener("toggle", function (e) {
    var d = e.target;
    if (d.open && d.classList && d.classList.contains("rx-mod")) {
      var f = d.querySelector("iframe[data-src]");
      if (f && !f.getAttribute("src")) f.setAttribute("src", f.getAttribute("data-src"));
    }
  }, true);

  document.addEventListener("change", function (e) {
    var t = e.target;
    if (!t.dataset || !t.dataset.rx || t.dataset.rx.indexOf("materi-done-") !== 0) return;
    var i = Number(t.dataset.rx.replace("materi-done-", "")), j, later = false;
    for (j = i + 1; j < MATERI.length; j++) if (state["materi-done-" + j] === "1") later = true;
    if (!t.checked && later && !confirm("Membatalkan centang ini akan mengunci kembali materi sesudahnya dan menghapus centang pada materi tersebut. Lanjutkan?")) {
      t.checked = true; return;
    }
    state["materi-done-" + i] = t.checked ? "1" : "";
    if (!t.checked) for (j = i + 1; j < MATERI.length; j++) state["materi-done-" + j] = "";
    save();
    render();
    // Setelah dicentang, buka materi berikutnya; jika dibatalkan, tetap di materi ini
    var target = t.checked ? i + 1 : i, d = document.querySelector('details.rx-mod[data-i="' + target + '"]');
    if (d) { d.open = true; d.scrollIntoView({ block: "start", behavior: "smooth" }); }
    else { var p = document.querySelector(".rx-prog"); if (p) p.scrollIntoView({ block: "center", behavior: "smooth" }); }
  });
})();
