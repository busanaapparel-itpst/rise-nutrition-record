(function () {
  var app = document.getElementById("app");

  // Tabel: beri label pada setiap sel agar bisa tampil sebagai kartu di layar kecil.
  // Tabel lebar (banyak kolom) tetap berupa tabel yang bisa digeser dengan kolom pertama menempel.
  function prepare() {
    app.querySelectorAll("table").forEach(function (t) {
      var heads = [].map.call(t.querySelectorAll("thead th"), function (th) { return th.textContent.trim(); });
      t.classList.add(heads.length > 6 ? "wide" : "stack");
      t.querySelectorAll("tbody tr").forEach(function (tr) {
        [].forEach.call(tr.children, function (td, i) { td.setAttribute("data-label", heads[i] || ""); });
      });
    });
  }
  if (app) {
    prepare();
    new MutationObserver(prepare).observe(app, { childList: true, subtree: true });
  }

  // Pindah menu = kembali ke atas halaman
  window.addEventListener("hashchange", function () { window.scrollTo(0, 0); });

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", function () { navigator.serviceWorker.register("sw.js").catch(function () {}); });
  }
})();
