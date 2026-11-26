document.documentElement.classList.add("js");
(function(){
var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
var WA = "628567876751"; /* WhatsApp bisnis Menej Homes */
var rp = function(n){ return "Rp" + Math.round(n).toLocaleString("id-ID"); };
var waLink = function(t){ return "https://wa.me/" + WA + (t ? "?text=" + encodeURIComponent(t) : ""); };
window.__menej = {reduce: reduce};
/* ---------- router ---------- */
var views = {beranda:"v-beranda", harga:"v-harga", kontak:"v-kontak"};
function route(){
var h = (location.hash || "").replace("#","");
if (!views[h]) h = "beranda";
Object.keys(views).forEach(function(k){ document.getElementById(views[k]).classList.toggle("on", k === h); });
document.querySelectorAll("[data-nav]").forEach(function(a){ a.toggleAttribute("aria-current", a.dataset.nav === h); if (a.dataset.nav === h) a.setAttribute("aria-current","page"); });
document.title = h === "beranda" ? "Menej Homes" : (h === "harga" ? "Harga · Menej Homes" : "Kontak · Menej Homes");
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
/* ---------- bento: calendar ---------- */
var cal = document.getElementById("cal"), plats = document.querySelectorAll("#plats span"), calN = document.getElementById("calN"), rate = document.getElementById("ratePill");
["S","S","R","K","J","S","M"].forEach(function(d){ var b = document.createElement("b"); b.textContent = d; cal.appendChild(b); });
var cells = []; for (var i = 0; i < 28; i++){ var c = document.createElement("i"); cal.appendChild(c); cells.push(c); }
var order = [4,5,11,12,18,19,25,26,3,10,17,24,6,13,20,27,2,9,0,16,23,1,8,15,22];
var rates = ["Rp2,4 jt","Rp2,6 jt","Rp3,1 jt","Rp2,8 jt"];
var PK = ["airbnb","booking","agoda","traveloka","tiket","trip","tiktok-go"];
function mark(c, k){ c.innerHTML = '<img src="/homes/logos/' + k + '.png" alt="" decoding="async">'; }
var step = 0;
function tickCal(){
if (step >= order.length + 6){ cells.forEach(function(c){ c.className = ""; c.innerHTML = ""; }); step = 0; calN.textContent = "0"; return; }
if (step < order.length){
var c = cells[order[step]]; c.className = Math.random() < .3 ? "bk2" : "bk"; mark(c, PK[step % PK.length]);
calN.textContent = String(step + 1);
plats.forEach(function(p){ p.classList.remove("hit"); }); plats[step % plats.length].classList.add("hit");
if (step % 6 === 0){ rate.style.opacity = 0; setTimeout(function(){ rate.textContent = rates[(step/6|0) % rates.length]; rate.style.opacity = 1; }, 250); }
}
step++;
}
/* ---------- bento: phone ---------- */
var feed = document.getElementById("feed"), tabs = document.querySelectorAll("#ptabs span");
for (var j = 0; j < 12; j++){ var t = document.createElement("i"); if (j % 3 === 1) t.className = "rl"; t.style.animationDelay = (j*0.18) + "s"; feed.appendChild(t); }
var tabI = 0;
function tickTab(){ tabs[tabI].classList.remove("on"); tabI = (tabI+1) % tabs.length; tabs[tabI].classList.add("on"); }
/* ---------- bento: days ---------- */
var dayN = document.getElementById("dayN"), day = 1;
function tickDay(){ day = day >= 14 ? 1 : day + 1; dayN.textContent = day; }
var loops = [];
function startLoops(){
if (reduce){ order.forEach(function(k, n){ cells[k].className = "bk"; mark(cells[k], PK[n % PK.length]); }); calN.textContent = order.length; dayN.textContent = "14"; return; }
if (loops.length) return;
loops.push(setInterval(tickCal, 260), setInterval(tickTab, 2200), setInterval(tickDay, 400));
}
function stopLoops(){ loops.forEach(clearInterval); loops = []; }
document.addEventListener("menej:view", function(e){ if (e.detail === "beranda") startLoops(); else stopLoops(); });
/* ---------- pricing ---------- */
var rev = document.getElementById("rev");
function calc(){
var r = +rev.value;
document.getElementById("revOut").textContent = rp(r);
document.getElementById("eList").textContent = rp(r*0.10);
document.getElementById("eFull").textContent = rp(r*0.10 + 3500000);
document.getElementById("eMkt").textContent = rp(4500000);
rev.style.setProperty("--fill", ((r - rev.min) / (rev.max - rev.min) * 100) + "%");
}
rev.addEventListener("input", calc); calc();
document.querySelectorAll("[data-plan]").forEach(function(b){
b.addEventListener("click", function(){ var v = b.dataset.plan; document.querySelectorAll('input[name="paket"]').forEach(function(i){ i.checked = i.value === v; }); });
});
/* ---------- contact ---------- */
document.getElementById("waNum").textContent = "+" + WA.replace(/^(62)(\d{3})(\d{4})(\d+)$/, "$1 $2-$3-$4");
document.querySelector(".wa .note").textContent = "WhatsApp bisnis Menej Homes. Dibalas di hari kerja.";
document.querySelectorAll(".foot .base span")[1].textContent = "Foto masih placeholder.";
document.querySelectorAll("span").forEach(function(s){ if (s.children.length === 0 && /halo@menejhomes\.id/.test(s.textContent)) s.innerHTML = 'Email <a href="mailto:menejhomes@gmail.com" style="color:inherit">menejhomes@gmail.com</a> · Senin–Sabtu 09.00–18.00 WIB'; });
document.getElementById("waDirect").href = waLink("Halo Menej Homes, saya owner villa dan ingin konsultasi.");
var form = document.getElementById("lead"), err = document.getElementById("fErr");
form.addEventListener("submit", function(e){
e.preventDefault();
var d = new FormData(form), miss = [];
if (!String(d.get("nama")||"").trim()) miss.push("nama");
if (!/[0-9]{8,}/.test(String(d.get("wa")||"").replace(/\D/g,""))) miss.push("nomor WhatsApp yang valid");
if (!String(d.get("lokasi")||"").trim()) miss.push("lokasi villa");
if (miss.length){ err.textContent = "Lengkapi dulu: " + miss.join(", ") + "."; err.hidden = false; return; }
err.hidden = true;
var lines = ["Halo Menej Homes, saya ingin konsultasi.","","Nama: "+d.get("nama").trim(),"WhatsApp: "+d.get("wa").trim(),"Lokasi villa: "+d.get("lokasi").trim(),"Jumlah kamar: "+d.get("kamar"),"Status: "+(d.get("status")||"-"),"Paket diminati: "+(d.get("paket")||"-")];
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
/* ---------- hero toasts ---------- */
var ICON = {
cal:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><rect x="2" y="3" width="12" height="11"/><path d="M2 6h12M5 1v3M11 1v3"/></svg>',
play:'<svg viewBox="0 0 16 16" fill="currentColor"><path d="M5 3l8 5-8 5z"/></svg>',
chat:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M2 3h12v8H7l-3 3v-3H2z"/></svg>',
sync:'<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.4"><path d="M13.5 8a5.5 5.5 0 1 1-1.6-3.9M13.5 2.5v3h-3"/></svg>'
};
var msgs = [
["cal","Booking baru masuk","Airbnb · 3 malam"],["sync","Kalender tersinkron","7 platform · tanpa bentrok"],
["play","Reels baru tayang","Room tour · TikTok & Instagram"],["chat","Tamu dibalas","Traveloka · 4 menit"],
["cal","Booking baru masuk","tiket.com · 2 malam"],["play","Konten minggu ini siap","Menunggu persetujuan Anda"]
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
route(); startLoops();
})();/* ---------- platform logos ---------- */
(function(){
var L = {"airbnb":["airbnb",1],"booking.com":["booking",.78],"agoda":["agoda",1.2],"traveloka":["traveloka",.9],"tiket.com":["tiket",1.35],"trip.com":["trip",.85],"tiktok go":["tiktok-go",.85],"instagram":["instagram",1.05],"tiktok":["tiktok",1.05],"threads":["threads-w",1.05]};
var DARK = {"tiktok":"tiktok-w","threads":"threads-w"};
var css = document.createElement("style");
css.textContent = ".marq{background:var(--kapur);border-top:1px solid var(--pasir);border-bottom:1px solid var(--pasir)}"
+".marq-group{gap:40px;padding:18px 20px}"
+".marq-group .plogo{display:inline-flex;align-items:center;height:44px;flex:none;transition:transform .3s var(--ease)}"
+".marq-group .plogo:hover{transform:translateY(-2px)}"
+".marq-group .plogo img{display:block;height:calc(28px*var(--s));width:auto}"
+".marq-group i{border-color:var(--jati)}"
+".marq-group img[src$=\"threads-w.png\"]{filter:brightness(.15)}"
+".plats .pl{display:inline-flex;align-items:center;padding:5px 8px;background:#FFF9F2;border:1px solid var(--pasir);transition:all .35s var(--ease)}"
+".plats .pl img{display:block;height:calc(13px*var(--s));width:auto}"
+".plats span.pl.hit{background:#FFF9F2;border-color:var(--arang);box-shadow:0 0 0 1px var(--arang);transform:translateY(-2px)}"
+".ptabs span.ic{display:inline-flex;padding:6px 9px;opacity:.4}.ptabs span.ic.on{opacity:1}.ptabs span.ic img{display:block;height:15px;width:auto}"
+".foot nav a.soc{display:inline-flex;gap:14px;align-items:center}.foot nav a.soc img{display:block;height:18px;width:auto}"
+"@media(max-width:760px){.toast.t2{bottom:19%}.rebuild{bottom:0;right:0}}"
+"@media(max-width:760px){.marq-group{gap:28px;padding:14px 14px}.marq-group .plogo{height:36px}.marq-group .plogo img{height:calc(22px*var(--s))}}";
css.textContent += ".cal i{display:flex;align-items:center;justify-content:center}.cal i img{display:block;height:60%;max-height:22px;width:auto;max-width:80%;object-fit:contain;background:#FFF9F2;padding:3px 5px;box-sizing:border-box;animation:pop .35s var(--ease)}@keyframes pop{from{opacity:0;transform:scale(.6)}to{opacity:1;transform:none}}";
document.head.appendChild(css);
function img(key, alt, dark){ var e = document.createElement("img"); e.src = "/homes/logos/" + (dark && DARK[key] ? DARK[key] : L[key][0]) + ".png"; e.alt = alt; e.decoding = "async"; return e; }
document.querySelectorAll(".marq-group span").forEach(function(s){
var k = s.textContent.trim().toLowerCase(); if (!L[k]) return;
var p = document.createElement("span"); p.className = "plogo"; p.style.setProperty("--s", L[k][1]);
p.appendChild(img(k, s.textContent.trim())); s.replaceWith(p);
});
document.querySelectorAll("#plats span").forEach(function(s){
var k = s.textContent.trim().toLowerCase(); if (!L[k]) return;
s.textContent = ""; s.classList.add("pl"); s.style.setProperty("--s", L[k][1]); s.appendChild(img(k, k)); s.title = k;
});
var NS = "http://www.w3.org/2000/svg";
document.querySelectorAll(".flow text").forEach(function(t){
var k = t.textContent.trim().toLowerCase(); if (!L[k]) return;
var x = +t.getAttribute("x"), y = +t.getAttribute("y"), h = 13 * L[k][1], w = 52;
var im = document.createElementNS(NS, "image");
im.setAttribute("href", "/homes/logos/" + L[k][0] + ".png"); im.setAttribute("x", x - w/2); im.setAttribute("y", y - 3 - h/2);
im.setAttribute("width", w); im.setAttribute("height", h); im.setAttribute("preserveAspectRatio", "xMidYMid meet");
t.replaceWith(im);
});
document.querySelectorAll("#ptabs span").forEach(function(s){
var k = s.textContent.trim().toLowerCase(); if (!L[k]) return;
var n = s.textContent.trim(); s.textContent = ""; s.classList.add("ic"); s.title = n; s.appendChild(img(k, n, true));
});
document.querySelectorAll(".foot nav a").forEach(function(a){
if (!/instagram/i.test(a.textContent)) return;
a.textContent = ""; a.classList.add("soc"); a.setAttribute("aria-label", "Instagram, TikTok, Threads");
["instagram","tiktok","threads"].forEach(function(k){ a.appendChild(img(k, "", true)); });
});
})();
