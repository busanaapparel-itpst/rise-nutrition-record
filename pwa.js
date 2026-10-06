(function () {
  var app = document.getElementById("app");
  var isBs = document.getElementById("nav").classList.contains("nav-pills");
  var clean = function (s) { return String(s).replace(/\u2212/g, "-").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); };

  var PROFILE = [["time-name", "Nama"], ["time-age", "Usia"], ["time-job", "Profesi"]];

  // Tabel: beri label pada sel (tampil sebagai kartu di layar kecil), dan pasang tombol PDF
  function prepare() {
    app.querySelectorAll("table").forEach(function (t) {
      var heads = [].map.call(t.querySelectorAll("thead th"), function (th) { return th.textContent.trim(); });
      t.classList.add(heads.length > 6 ? "wide" : "stack");
      if (t.parentElement) t.parentElement.classList.add(heads.length > 6 ? "wide-wrap" : "stack-wrap");
      t.querySelectorAll("tbody tr").forEach(function (tr) {
        [].forEach.call(tr.children, function (td, i) { td.setAttribute("data-label", heads[i] || ""); });
      });
    });
    PROFILE.forEach(function (p) {
      var el = app.querySelector('[data-key="' + p[0] + '"]'), lab = el && el.closest(".field") && el.closest(".field").querySelector("label");
      if (lab && !lab.querySelector(".req")) lab.insertAdjacentHTML("beforeend", ' <span class="req" aria-hidden="true">*</span>');
      if (el) el.setAttribute("aria-required", "true");
    });
    if (app.querySelector(".top") && !app.querySelector(".pdf-actions")) {
      var d = document.createElement("div");
      d.className = "pdf-actions";
      d.innerHTML = '<button type="button" class="pdf-btn' + (isBs ? " btn btn-primary" : "") + '">Generate PDF</button>' +
        '<button type="button" class="clear-btn' + (isBs ? " btn btn-outline-danger" : "") + '">Clear Data</button>';
      var foot = app.querySelector(":scope > .hint");
      if (foot) foot.insertAdjacentElement("beforebegin", d); else app.appendChild(d);
    }
  }

  // ---- Logo untuk header PDF: ganti file logo.png untuk memakai logo sendiri ----
  var logo = null;
  (function () {
    var img = new Image();
    img.onload = function () {
      var k = Math.min(1, 600 / Math.max(img.naturalWidth, img.naturalHeight)), c = document.createElement("canvas");
      c.width = Math.round(img.naturalWidth * k); c.height = Math.round(img.naturalHeight * k);
      c.getContext("2d").drawImage(img, 0, 0, c.width, c.height);
      try { logo = { data: c.toDataURL("image/png"), w: c.width, h: c.height }; } catch (err) {}
    };
    img.src = "logo.png";
  })();

  // ---- PDF dari isi halaman yang sedang dibuka ----
  function fieldText(el) {
    var v = el.value.trim();
    if (!v) return "-";
    if (el.type === "month") { var p = v.split("-"); return new Date(p[0], p[1] - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" }); }
    if (el.type === "date") return new Date(v + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    if (el.inputMode === "decimal") { var n = Number(v); return isNaN(n) ? v : n.toLocaleString("id-ID", { maximumFractionDigits: 2 }); }
    return v;
  }
  function cellText(c) {
    var i = c.querySelector("input, select");
    if (i && i.tagName === "SELECT") return i.value ? clean(i.options[i.selectedIndex].text) : "-";
    return clean(i ? fieldText(i) : c.textContent);
  }

  function checkProfile() {
    var bad = [];
    PROFILE.forEach(function (p) {
      var el = app.querySelector('[data-key="' + p[0] + '"]'), v = el ? el.value.trim() : "";
      if (!v || (p[0] === "time-age" && !(Number(v) > 0))) bad.push({ el: el, label: p[1] });
    });
    if (!bad.length) return true;
    bad.forEach(function (b) { if (b.el) b.el.classList.add("field-invalid"); });
    alert("Lengkapi dulu data berikut sebelum membuat PDF:\n- " + bad.map(function (b) { return b.label; }).join("\n- "));
    if (bad[0].el) { bad[0].el.focus(); bad[0].el.scrollIntoView({ block: "center", behavior: "smooth" }); }
    return false;
  }

  function generate() {
    if (!checkProfile()) return;
    if (!(window.jspdf && window.jspdf.jsPDF)) { alert("Library PDF belum termuat. Periksa koneksi internet lalu coba lagi."); return; }
    var title = clean(app.querySelector(".top h1").textContent);
    var subEl = app.querySelector(".top p");
    var landscape = location.hash.slice(1) === "time";
    var doc = new window.jspdf.jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: "a4" });
    var W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), L = 14, R = W - 14, y = 18;
    function room(h) { if (y + h > H - 14) { doc.addPage(); y = 18; } }

    var lh = 16, lw = 0, tx = L, tw = R - L;
    if (logo) {
      lw = lh * logo.w / logo.h;
      if (lw > 50) { lw = 50; lh = lw * logo.h / logo.w; }
      doc.addImage(logo.data, "PNG", R - lw, y + 3 - lh / 2, lw, lh);
      tw = R - L - lw - 5;
    }
    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(20, 59, 72);
    doc.text(title, tx, y); y += 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(110);
    if (subEl) { doc.text(doc.splitTextToSize(clean(subEl.textContent), tw), tx, y); y += 5; }
    doc.text("Dibuat pada " + new Date().toLocaleString("id-ID"), tx, y); y += 3;
    if (logo) y = Math.max(y, 18 + 3 + lh / 2 + 3);
    doc.setDrawColor(190); doc.line(L, y, R, y); y += 8;
    doc.setTextColor(0);

    app.querySelectorAll(".toolbar > div, .field, h2, table, .summary, section .hint").forEach(function (el) {
      if (el.matches(".toolbar > div, .field")) {
        var lab = el.querySelector("label"), inp = el.querySelector("input");
        if (!lab || !inp) return;
        room(7); doc.setFontSize(10.5);
        doc.setFont("helvetica", "bold"); doc.text(clean(lab.textContent) + ":", L, y);
        doc.setFont("helvetica", "normal"); doc.text(fieldText(inp), L + 42, y);
        y += 6.5;
      } else if (el.tagName === "H2") {
        room(16); y += 3;
        doc.setFont("helvetica", "bold"); doc.setFontSize(12.5); doc.setTextColor(20, 59, 72);
        doc.text(clean(el.textContent), L, y); doc.setTextColor(0); y += 3;
      } else if (el.tagName === "TABLE") {
        var heads = [].filter.call(el.querySelectorAll("thead th"), function (th) { return !th.classList.contains("no-pdf"); }).map(function (th) {
          return { content: clean(th.textContent), styles: { halign: th.classList.contains("num") ? "right" : "left" } };
        });
        var body = [].map.call(el.querySelectorAll("tbody tr"), function (tr) {
          var total = !!tr.querySelector("th");
          return [].filter.call(tr.children, function (c) { return !c.classList.contains("no-pdf"); }).map(function (c) {
            var i = c.querySelector("input"), num = c.classList.contains("num") || (i && i.inputMode === "decimal");
            return { content: cellText(c), styles: { halign: num ? "right" : "left", fontStyle: total ? "bold" : "normal" } };
          });
        });
        doc.autoTable({ head: [heads], body: body, startY: y, margin: { left: L, right: 14 }, theme: "grid",
          styles: { fontSize: landscape ? 8.5 : 9.5, cellPadding: 2, lineColor: [210, 222, 225], textColor: 30 },
          headStyles: { fillColor: [20, 59, 72], textColor: 255 }, alternateRowStyles: { fillColor: [246, 250, 250] } });
        y = doc.lastAutoTable.finalY + 5;
      } else if (el.classList.contains("summary")) {
        var sp = el.querySelector("span"), st = el.querySelector("strong");
        if (!sp || !st) return;
        room(12);
        doc.setFillColor(234, 245, 241); doc.roundedRect(L, y - 5, R - L, 9, 1.5, 1.5, "F");
        doc.setFontSize(10.5);
        doc.setFont("helvetica", "normal"); doc.text(clean(sp.textContent), L + 3, y + 1);
        doc.setFont("helvetica", "bold"); doc.text(clean(st.textContent), R - 3, y + 1, { align: "right" });
        y += 11;
      } else {
        var lines = doc.splitTextToSize(clean(el.textContent), R - L);
        room(lines.length * 4 + 4);
        doc.setFont("helvetica", "normal"); doc.setFontSize(8.5); doc.setTextColor(110);
        doc.text(lines, L, y); doc.setTextColor(0); y += lines.length * 4 + 3;
      }
    });

    var pages = doc.getNumberOfPages();
    for (var p = 1; p <= pages; p++) {
      doc.setPage(p); doc.setFont("helvetica", "normal"); doc.setFontSize(8); doc.setTextColor(140);
      doc.text("Halaman " + p + " dari " + pages, W / 2, H - 7, { align: "center" });
    }
    var slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
    doc.save("rise-" + slug + "-" + new Date().toISOString().slice(0, 10) + ".pdf");
  }

  // ---- Clear Data: kembalikan menu yang sedang dibuka ke kondisi awal ----
  var CLEAR = {
    budgeting: { label: "Budgeting bulanan (semua bulan, termasuk item yang Anda tambah atau ubah)",
      test: function (k) { return /^budget:/.test(k) || /^budget-name:/.test(k) || /^b-\d+-\d+$/.test(k) || k === "budgetIds" || k === "budget-period"; } },
    nutrition: { label: "Nutrisi harian (termasuk item yang Anda tambah atau ubah)",
      test: function (k) { return /^n-\d+-/.test(k) || k === "nutIds" || k === "nutrition-date"; } },
    time: { label: "Audit waktu",
      test: function (k) { return /^t-\d+-\d+$/.test(k); } }
  };
  function clearData() {
    var h = location.hash.slice(1), page = CLEAR[h] ? h : "budgeting", c = CLEAR[page];
    if (typeof state === "undefined" || typeof render !== "function") return;
    if (!confirm("Hapus semua isian di menu " + c.label + " dan kembalikan ke kondisi awal?\n\nTindakan ini tidak bisa dibatalkan.")) return;
    Object.keys(state).forEach(function (k) { if (c.test(k)) delete state[k]; });
    save();
    render();
    window.scrollTo(0, 0);
  }

  document.addEventListener("click", function (e) {
    if (e.target.closest(".pdf-btn")) generate();
    else if (e.target.closest(".clear-btn")) clearData();
  });

  if (app) {
    prepare();
    new MutationObserver(prepare).observe(app, { childList: true, subtree: true });
  }
  window.addEventListener("hashchange", function () { window.scrollTo(0, 0); });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
