document.documentElement.classList.add("js");
(function(){
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
var WA = "628567876751"; /* WhatsApp bisnis MENEJ */
var rp = function(n){ return "Rp" + Math.round(n).toLocaleString("id-ID"); };
var waLink = function(t){ return "https://wa.me/" + WA + (t ? "?text=" + encodeURIComponent(t) : ""); };
window.__menej = {reduce: reduce};
/* ---------- router ---------- */
var views = {beranda:"v-beranda", harga:"v-harga", kontak:"v-kontak"};
var titles = {beranda:"Menej Web · Website 3D & Landing Page untuk Brand", harga:"Harga · Menej Web", kontak:"Kontak · Menej Web"};
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
var ical = document.getElementById("addIcal"), addOut = document.getElementById("addOut");
function calc(){
var add = ical.checked ? 90000 : 0;
document.querySelectorAll(".est b[data-base]").forEach(function(b){ b.textContent = rp(+b.dataset.base + add); });
addOut.textContent = add ? "+" + rp(add) : "Tanpa tambahan";
}
ical.addEventListener("change", calc); calc();
document.querySelectorAll("[data-plan]").forEach(function(b){
b.addEventListener("click", function(){ var v = b.dataset.plan; document.querySelectorAll('input[name="paket"]').forEach(function(i){ i.checked = i.value === v; }); });
});
/* ---------- kontak ---------- */
document.getElementById("waNum").textContent = "+" + WA.replace(/^(62)(\d{3})(\d{4})(\d+)$/, "$1 $2-$3-$4");
document.getElementById("waDirect").href = waLink("Halo MENEJ, saya ingin konsultasi soal website untuk brand saya.");
var form = document.getElementById("lead"), err = document.getElementById("fErr");
form.addEventListener("submit", function(e){
e.preventDefault();
var d = new FormData(form), miss = [];
if (!String(d.get("nama")||"").trim()) miss.push("nama");
if (!/[0-9]{8,}/.test(String(d.get("wa")||"").replace(/\D/g,""))) miss.push("nomor WhatsApp yang valid");
if (!String(d.get("brand")||"").trim()) miss.push("nama brand atau usaha");
if (miss.length){ err.textContent = "Lengkapi dulu: " + miss.join(", ") + "."; err.hidden = false; return; }
err.hidden = true;
var lines = ["Halo MENEJ, saya ingin konsultasi soal website.","","Nama: "+d.get("nama").trim(),"WhatsApp: "+d.get("wa").trim(),"Brand atau usaha: "+d.get("brand").trim(),"Paket diminati: "+(d.get("paket")||"-"),"Domain: "+(d.get("domain")||"-")];
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
click:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M3 1l10 5-4.2 1.5L6.8 12z"/></svg>',
phone:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="4.5" y="1.5" width="7" height="13" rx="1.5"/><path d="M7 12.5h2"/></svg>',
link:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M6.5 9.5l3-3M5 8L3.5 9.5a2.1 2.1 0 0 0 3 3L8 11M11 8l1.5-1.5a2.1 2.1 0 0 0-3-3L8 5"/></svg>'
};
var msgs = [
["phone","Halaman dibuka","dari Instagram · di HP"],["click","Tombol diklik","WhatsApp terbuka"],
["chat","Pesan baru masuk","Pertanyaan soal produk"],["link","Link dibagikan","ke pelanggan"],
["phone","Halaman dibuka","dari Google · di HP"],["chat","Pesan baru masuk","Siap dibalas"]
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
