document.documentElement.classList.add("js");
(function(){
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
var WA = "628567876751"; /* WhatsApp bisnis MENEJ */
var rp = function(n){ return "Rp" + Math.round(n).toLocaleString("id-ID"); };
var waLink = function(t){ return "https://wa.me/" + WA + (t ? "?text=" + encodeURIComponent(t) : ""); };
window.__menej = {reduce: reduce};
/* ---------- router ---------- */
var views = {beranda:"v-beranda", harga:"v-harga", kontak:"v-kontak"};
var titles = {beranda:"Menej Social · Kelola Instagram, Konten & Iklan untuk UMKM", harga:"Harga · Menej Social", kontak:"Kontak · Menej Social"};
function route(){
var h = (location.hash || "").replace("#","");
if (!views[h]) h = "beranda";
Object.keys(views).forEach(function(k){ document.getElementById(views[k]).classList.toggle("on", k === h); });
document.querySelectorAll("[data-nav]").forEach(function(a){ if (a.dataset.nav === h) a.setAttribute("aria-current","page"); else a.removeAttribute("aria-current"); });
document.title = titles[h];
window.scrollTo(0, 0);
document.dispatchEvent(new CustomEvent("menej:view", {detail: h}));
setTimeout(observe, 30);
}
addEventListener("hashchange", route);
/* ---------- reveal ---------- */
var io = "IntersectionObserver" in window ? new IntersectionObserver(function(es){
es.forEach(function(e){ if (e.isIntersecting){ e.target.classList.add("in"); io.unobserve(e.target); } });
}, {rootMargin:"0px 0px -8% 0px"}) : null;
function observe(){
var els = document.querySelectorAll(".view.on .rv:not(.in)");
if (!io || reduce){ els.forEach(function(e){ e.classList.add("in"); }); return; }
els.forEach(function(e){ io.observe(e); });
}
setTimeout(function(){ document.querySelectorAll(".rv").forEach(function(e){ e.classList.add("in"); }); }, 4000);
/* ---------- spotlight + tilt ---------- */
document.querySelectorAll(".card,.plan").forEach(function(c){
c.addEventListener("pointermove", function(e){
var r = c.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
c.style.setProperty("--mx", (x*100) + "%"); c.style.setProperty("--my", (y*100) + "%");
if (!reduce && e.pointerType === "mouse" && c.classList.contains("tilt"))
c.style.transform = "perspective(900px) rotateX(" + ((0.5-y)*4).toFixed(2) + "deg) rotateY(" + ((x-0.5)*5).toFixed(2) + "deg) translateY(-4px)";
});
c.addEventListener("pointerleave", function(){ c.style.transform = ""; });
});
/* ---------- bento: animasi hanya jalan di Beranda ---------- */
function setPlay(on){ document.documentElement.classList.toggle("paused", !on); }
document.addEventListener("menej:view", function(e){ setPlay(e.detail === "beranda"); });
/* ---------- harga ---------- */
var addOut = document.getElementById("addOut");
function calc(){
var sel = document.querySelector('input[name="ads"]:checked'), add = +sel.value;
document.querySelectorAll(".est b[data-base]").forEach(function(b){ b.textContent = rp(+b.dataset.base + add); });
addOut.textContent = add ? sel.dataset.label + " +" + rp(add) : "Tanpa iklan";
}
document.querySelectorAll('input[name="ads"]').forEach(function(i){ i.addEventListener("change", calc); }); calc();
document.querySelectorAll("[data-plan]").forEach(function(b){
b.addEventListener("click", function(){ var v = b.dataset.plan; document.querySelectorAll('input[name="paket"]').forEach(function(i){ i.checked = i.value === v; }); });
});
/* ---------- kontak ---------- */
document.getElementById("waNum").textContent = "+" + WA.replace(/^(62)(\d{3})(\d{4})(\d+)$/, "$1 $2-$3-$4");
document.getElementById("waDirect").href = waLink("Halo MENEJ, saya ingin konsultasi soal Instagram dan konten untuk usaha saya.");
var form = document.getElementById("lead"), err = document.getElementById("fErr");
form.addEventListener("submit", function(e){
e.preventDefault();
var d = new FormData(form), miss = [];
if (!String(d.get("nama")||"").trim()) miss.push("nama");
if (!/[0-9]{8,}/.test(String(d.get("wa")||"").replace(/\D/g,""))) miss.push("nomor WhatsApp yang valid");
if (!String(d.get("brand")||"").trim()) miss.push("nama brand atau usaha");
if (miss.length){ err.textContent = "Lengkapi dulu: " + miss.join(", ") + "."; err.hidden = false; return; }
err.hidden = true;
var lines = ["Halo MENEJ, saya ingin konsultasi soal Instagram dan konten.","","Nama: "+d.get("nama").trim(),"WhatsApp: "+d.get("wa").trim(),"Brand atau usaha: "+d.get("brand").trim()];
var ig = String(d.get("ig")||"").trim(); if (ig) lines.push("Instagram: " + ig);
lines.push("Paket diminati: "+(d.get("paket")||"-"),"Iklan: "+(d.get("iklan")||"-"));
var note = String(d.get("catatan")||"").trim(); if (note) lines.push("", "Catatan: " + note);
var text = lines.join("\n");
document.getElementById("msg").textContent = text;
document.getElementById("waSend").href = waLink(text);
var res = document.getElementById("result"); res.hidden = false; res.scrollIntoView({block:"nearest"});
});
function copy(btn, text, selId){
var lbl = btn.textContent, done = function(){ btn.textContent = "Tersalin"; setTimeout(function(){ btn.textContent = lbl; }, 1600); };
var fb = function(){ var r = document.createRange(); r.selectNodeContents(document.getElementById(selId)); var s = getSelection(); s.removeAllRanges(); s.addRange(r); btn.textContent = "Terpilih, tekan salin"; };
try { navigator.clipboard.writeText(text).then(done, fb); } catch(x){ fb(); }
}
document.getElementById("copyNum").addEventListener("click", function(){ copy(this, "+" + WA, "waNum"); });
document.getElementById("copyMsg").addEventListener("click", function(){ copy(this, document.getElementById("msg").textContent, "msg"); });
/* ---------- toast hero ---------- */
var ICON = {
chat:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3h12v8H7l-3 3v-3H2z"/></svg>',
play:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l8 5-8 5z"/></svg>',
heart:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M8 14S2 10 2 6a3 3 0 0 1 6-1 3 3 0 0 1 6 1c0 4-6 8-6 8z"/></svg>',
cal:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="11"/><path d="M2 6h12M5 1v3M11 1v3"/></svg>'
};
var msgs = [
["play","Reels baru tayang","Jadwal sesuai kalender"],["heart","Tombol suka ditekan","Konten mulai dilihat"],
["chat","Komentar masuk","Siap dibalas"],["cal","Konten minggu ini siap","Menunggu persetujuan Anda"],
["play","Carousel terunggah","Caption dan hashtag lengkap"],["chat","Pesan baru masuk","Dari iklan Meta"]
];
var mi = 0, slot = 0;
function toast(){
var n = slot % 2 + 1, m = msgs[mi % msgs.length]; mi++; slot++;
var el = document.getElementById("toast"+n);
el.classList.remove("show");
setTimeout(function(){
document.getElementById("ti"+n).innerHTML = ICON[m[0]];
document.getElementById("tb"+n).textContent = m[1];
document.getElementById("ts"+n).textContent = m[2];
el.classList.add("show");
}, 450);
}
setTimeout(function(){ toast(); setTimeout(toast, 900); setInterval(toast, 2600); }, 2400);
route();
})();
