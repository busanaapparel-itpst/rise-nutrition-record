(function () {
  var app = document.getElementById("app");
  var isBs = document.getElementById("nav").classList.contains("nav-pills");
  var clean = function (s) { return String(s).replace(/\u2212/g, "-").replace(/\u00a0/g, " ").replace(/\s+/g, " ").trim(); };

  // Tabel: beri label pada sel (tampil sebagai kartu di layar kecil), dan pasang tombol PDF
  function prepare() {
    app.querySelectorAll("table").forEach(function (t) {
      var heads = [].map.call(t.querySelectorAll("thead th"), function (th) { return th.textContent.trim(); });
      t.classList.add(heads.length > 6 ? "wide" : "stack");
      t.querySelectorAll("tbody tr").forEach(function (tr) {
        [].forEach.call(tr.children, function (td, i) { td.setAttribute("data-label", heads[i] || ""); });
      });
    });
    var top = app.querySelector(".top");
    if (top && !app.querySelector(".pdf-actions")) {
      var d = document.createElement("div");
      d.className = "pdf-actions";
      d.innerHTML = '<button type="button" class="pdf-btn' + (isBs ? " btn btn-primary" : "") + '">Generate PDF</button>';
      top.insertAdjacentElement("afterend", d);
    }
  }

  // ---- PDF dari isi halaman yang sedang dibuka ----
  function fieldText(el) {
    var v = el.value.trim();
    if (!v) return "-";
    if (el.type === "month") { var p = v.split("-"); return new Date(p[0], p[1] - 1, 1).toLocaleDateString("id-ID", { month: "long", year: "numeric" }); }
    if (el.type === "date") return new Date(v + "T00:00:00").toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
    if (el.inputMode === "decimal") { var n = Number(v); return isNaN(n) ? v : n.toLocaleString("id-ID", { maximumFractionDigits: 2 }); }
    return v;
  }
  function cellText(c) { var i = c.querySelector("input"); return clean(i ? fieldText(i) : c.textContent); }

  function generate() {
    if (!(window.jspdf && window.jspdf.jsPDF)) { alert("Library PDF belum termuat. Periksa koneksi internet lalu coba lagi."); return; }
    var title = clean(app.querySelector(".top h1").textContent);
    var subEl = app.querySelector(".top p");
    var landscape = location.hash.slice(1) === "time";
    var doc = new window.jspdf.jsPDF({ orientation: landscape ? "landscape" : "portrait", unit: "mm", format: "a4" });
    var W = doc.internal.pageSize.getWidth(), H = doc.internal.pageSize.getHeight(), L = 14, R = W - 14, y = 18;
    function room(h) { if (y + h > H - 14) { doc.addPage(); y = 18; } }

    doc.setFont("helvetica", "bold"); doc.setFontSize(18); doc.setTextColor(20, 59, 72);
    doc.text(title, L, y); y += 7;
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(110);
    if (subEl) { doc.text(doc.splitTextToSize(clean(subEl.textContent), R - L), L, y); y += 5; }
    doc.text("Dibuat pada " + new Date().toLocaleString("id-ID"), L, y); y += 3;
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
        var heads = [].map.call(el.querySelectorAll("thead th"), function (th) {
          return { content: clean(th.textContent), styles: { halign: th.classList.contains("num") ? "right" : "left" } };
        });
        var body = [].map.call(el.querySelectorAll("tbody tr"), function (tr) {
          var total = !!tr.querySelector("th");
          return [].map.call(tr.children, function (c) {
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

  document.addEventListener("click", function (e) { if (e.target.closest(".pdf-btn")) generate(); });

  if (app) {
    prepare();
    new MutationObserver(prepare).observe(app, { childList: true, subtree: true });
  }
  window.addEventListener("hashchange", function () { window.scrollTo(0, 0); });
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
