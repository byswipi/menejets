(function(){
var reduce = window.__menej && window.__menej.reduce;
var stage = document.getElementById("stage3d"), canvas = document.getElementById("scene");
var gl = null;
try { gl = window.THREE && (canvas.getContext("webgl2") || canvas.getContext("webgl")); } catch(e){}
if (!gl){ stage.classList.add("no3d"); document.getElementById("rebuild").hidden = true; return; }
var T = THREE, small = innerWidth < 900;
var clamp = function(v,a,b){ return Math.min(b, Math.max(a, v)); };
var ss = function(a,b,v){ var t = clamp((v-a)/(b-a),0,1); return t*t*(3-2*t); };
var lerp = function(a,b,t){ return a + (b-a)*t; };
var back = function(k){ return k <= 0 ? 0 : k >= 1 ? 1 : 1 + 2.2*Math.pow(k-1,3) + 1.2*Math.pow(k-1,2); };
var TEAL = 0x0E7490, DARK = 0x0B2E38, PASIR = 0xCFE3E8, KUNING = 0xFFD166, PUTIH = 0xF7FBFC;
var renderer = new T.WebGLRenderer({canvas: canvas, context: gl, antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
renderer.setClearColor(0xECF6F8, 0);
renderer.shadowMap.enabled = !small; renderer.shadowMap.type = T.PCFSoftShadowMap;
var scene = new T.Scene();
var camera = new T.PerspectiveCamera(30, 1, 0.1, 200);
scene.add(new T.HemisphereLight(0xFFFFFF, 0xBFD5DB, 0.62));
var sun = new T.DirectionalLight(0xFFFFFF, 0.8);
sun.position.set(-9, 16, 7); sun.castShadow = !small; sun.shadow.mapSize.set(2048, 2048);
var sc = sun.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 50; sun.shadow.bias = -0.0005;
scene.add(sun);
var shadowCatch = new T.Mesh(new T.CircleGeometry(13, 64), new T.ShadowMaterial({opacity: 0.10}));
shadowCatch.rotation.x = -Math.PI/2; shadowCatch.position.y = 0.003; shadowCatch.receiveShadow = true; scene.add(shadowCatch);
var grid = new T.PolarGridHelper(12, 16, 6, 64, PASIR, PASIR);
grid.position.y = 0.004; grid.material.transparent = true; grid.material.opacity = 0.55; scene.add(grid);
var mat = function(c, o){ return new T.MeshStandardMaterial(Object.assign({color: c, roughness: 0.9}, o || {})); };
var edgeMat = new T.LineBasicMaterial({color: DARK, transparent: true, opacity: 0.8});
function withEdges(m, em){ m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry), em || edgeMat)); return m; }
/* logo -> dunia: x=(px-50)/8, z=(py-50)/8 */
function flat(shape, depth, material){
var g = new T.ExtrudeGeometry(shape, {depth: depth, bevelEnabled: false});
g.rotateX(-Math.PI/2);
var m = new T.Mesh(g, material); m.castShadow = m.receiveShadow = true; return m;
}
/* lencana teal (rounded square) */
var R = 6.25, rr = 2.75, bs = new T.Shape();
bs.moveTo(-R+rr, -R); bs.lineTo(R-rr, -R); bs.absarc(R-rr, -R+rr, rr, -Math.PI/2, 0, false);
bs.lineTo(R, R-rr); bs.absarc(R-rr, R-rr, rr, 0, Math.PI/2, false);
bs.lineTo(-R+rr, R); bs.absarc(-R+rr, R-rr, rr, Math.PI/2, Math.PI, false);
bs.lineTo(-R, -R+rr); bs.absarc(-R+rr, -R+rr, rr, Math.PI, 1.5*Math.PI, false);
var BADGE_H = 0.4;
var badge = flat(bs, BADGE_H, mat(TEAL));
var badgeG = new T.Group(); badgeG.add(badge); scene.add(badgeG);
/* kotak putih dengan takik */
var ws = new T.Shape();
ws.moveTo(-3, 3); ws.lineTo(0.6, 3); ws.absarc(3, 3, 2.4, Math.PI, 1.5*Math.PI, false); ws.lineTo(3, -3); ws.lineTo(-3, -3); ws.lineTo(-3, 3);
var SLAB_H = 0.62;
var slab = withEdges(flat(ws, SLAB_H, mat(PUTIH)));
var slabG = new T.Group(); slabG.position.y = BADGE_H; slabG.add(slab); scene.add(slabG);
/* isi halaman */
var TOP = BADGE_H + SLAB_H, blocks = [];
function block(w, d, h, x, z, c, delay){
var m = withEdges(new T.Mesh(new T.BoxGeometry(w, h, d), mat(c)), new T.LineBasicMaterial({color: DARK, transparent: true, opacity: 0.35}));
m.position.set(x, TOP + h/2, z); m.userData = {h: h, y: TOP + h/2, d: delay}; m.castShadow = true; scene.add(m); blocks.push(m); return m;
}
block(3.6, 0.42, 0.16, -1.1, -1.7, DARK, 0);
block(2.4, 0.42, 0.16, -1.7, -0.95, DARK, 0.05);
block(4.4, 0.18, 0.1, -0.7, -0.15, PASIR, 0.1);
block(3.4, 0.18, 0.1, -1.2, 0.35, PASIR, 0.14);
block(1.6, 1.1, 0.26, -1.9, 1.75, PASIR, 0.2);
block(1.6, 1.1, 0.26, 0.0, 1.75, PASIR, 0.25);
block(1.6, 1.1, 0.26, 1.9, 1.75, TEAL, 0.3);
/* tombol kuning di takik */
var DOT = new T.Vector3(2.8, 0, -2.8);
var dotMat = mat(KUNING, {roughness: 0.55});
var dot = new T.Mesh(new T.CylinderGeometry(1.1, 1.1, 0.7, 40), dotMat);
dot.castShadow = true; dot.add(new T.LineSegments(new T.EdgesGeometry(dot.geometry, 40), edgeMat));
var dotG = new T.Group(); dotG.position.set(DOT.x, BADGE_H + 0.35, DOT.z); dotG.add(dot); scene.add(dotG);
var ringMat = new T.MeshBasicMaterial({color: KUNING, transparent: true, opacity: 0, side: T.DoubleSide});
var ring = new T.Mesh(new T.RingGeometry(1.1, 1.3, 48), ringMat); ring.rotation.x = -Math.PI/2; ring.position.set(DOT.x, BADGE_H + 0.05, DOT.z); scene.add(ring);
/* kursor */
var cs = new T.Shape(); [[0,0],[0,1.5],[0.4,1.15],[0.75,1.9],[1.0,1.75],[0.65,1.05],[1.15,1.0]].forEach(function(p,i){ var x = p[0]*0.9, y = -p[1]*0.9; i ? cs.lineTo(x, y) : cs.moveTo(x, y); });
var cur = new T.Mesh(new T.ExtrudeGeometry(cs, {depth: 0.06, bevelEnabled: false}), mat(DARK));
cur.geometry.rotateX(-Math.PI/2); cur.add(new T.LineSegments(new T.EdgesGeometry(cur.geometry), new T.LineBasicMaterial({color: 0xFFFFFF})));
var curG = new T.Group(); curG.add(cur); scene.add(curG);
/* jendela melayang */
var floats = [];
[[-7.2,3.0,-1.5,2.8,1.8,PUTIH],[7.6,4.2,4.2,2.4,1.5,PUTIH],[-6.0,2.2,5.2,2.2,1.4,PASIR],[6.6,2.6,-6.2,2.0,1.3,PASIR]].forEach(function(p,i){
var w = withEdges(new T.Mesh(new T.BoxGeometry(p[3], 0.12, p[4]), mat(p[5])));
w.add(new T.Mesh(new T.BoxGeometry(p[3]*0.6, 0.14, 0.14), mat(i%2 ? TEAL : DARK))); w.children[1].position.set(-p[3]*0.1, 0.01, -p[4]*0.18);
w.position.set(p[0], p[1], p[2]); w.rotation.y = (i%2 ? -1 : 1) * 0.35; w.userData = {y: p[1], i: i, r: w.rotation.y}; w.castShadow = !small; scene.add(w); floats.push(w);
});
function resize(){
var W = stage.clientWidth, H = stage.clientHeight;
renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
}
var drag = 0, dragV = 0, dragging = false, lastX = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
canvas.addEventListener("pointerdown", function(e){ dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", function(e){ if (dragging){ dragV = (e.clientX - lastX) * 0.006; drag += dragV; lastX = e.clientX; } });
canvas.addEventListener("pointerup", function(){ dragging = false; });
canvas.style.touchAction = "pan-y";
addEventListener("pointermove", function(e){ if (e.pointerType !== "mouse") return; tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; });
var t0 = performance.now(), BUILD = 4.2;
document.getElementById("rebuild").addEventListener("click", function(){ t0 = performance.now(); });
var running = false, visible = true, onHome = true;
function frame(now){
var t = (now - t0) / 1000, p = reduce ? 1 : clamp(t / BUILD, 0, 1);
var kb = ss(0.04, 0.34, p), kw = ss(0.3, 0.6, p);
badge.scale.y = Math.max(0.001, kb); badgeG.visible = kb > 0.002;
slab.scale.y = Math.max(0.001, kw); slabG.visible = kw > 0.002;
blocks.forEach(function(b){ var k = ss(0.52 + b.userData.d * 0.9, 0.7 + b.userData.d * 0.9, p); b.scale.set(Math.max(0.001, k), Math.max(0.001, k), Math.max(0.001, k)); b.position.y = b.userData.y; b.visible = k > 0.003; });
var kd = back(clamp((p - 0.78) / 0.2, 0, 1));
var post = Math.max(0, t - BUILD), pulse = reduce ? 0 : (Math.sin(post * 3.2) * 0.5 + 0.5);
dotG.scale.setScalar(Math.max(0.001, kd) * (1 + pulse * 0.05)); dotG.visible = kd > 0.003;
/* kursor: jalan ke tombol, klik, cincin, kembali */
var cyc = reduce ? 0 : (post % 5.0), kc = 0, ringK = 0;
if (p >= 1 && !reduce){
var go = ss(0.2, 1.6, cyc), ret = ss(3.4, 4.8, cyc);
var sx = -1.2, sz = 3.2, ex = DOT.x - 0.1, ez = DOT.z + 0.1;
var f = go * (1 - ret);
curG.position.set(lerp(sx, ex, f), 1.5 + (1 - f) * 0.6, lerp(sz, ez, f));
var press = ss(1.6, 1.75, cyc) * (1 - ss(1.75, 2.0, cyc)); curG.position.y -= press * 0.35; kc = 1;
ringK = clamp((cyc - 1.7) / 1.1, 0, 1);
} else { curG.position.set(DOT.x - 0.1, 1.6, DOT.z + 0.1); kc = reduce ? 1 : 0; }
curG.visible = kc > 0;
ring.visible = ringK > 0 && ringK < 1; ring.scale.setScalar(1 + ringK * 1.5); ringMat.opacity = (1 - ringK) * 0.8;
var fk = ss(0.8, 1.0, p);
floats.forEach(function(w, i){ var k = clamp(fk * 1.8 - i * 0.2, 0, 1); w.scale.setScalar(Math.max(0.001, back(k))); w.visible = k > 0.01; w.position.y = w.userData.y + Math.sin(t * 0.9 + i * 1.7) * 0.18; w.rotation.y = w.userData.r + Math.sin(t * 0.3 + i) * 0.06; });
mx = lerp(mx, tmx, 0.05); my = lerp(my, tmy, 0.05);
if (!dragging){ dragV *= 0.94; drag += dragV; }
var polar = lerp(0.05, 0.95, ss(0.0, 0.6, p)) + my * 0.06;
var az = lerp(-0.6, 0.5, ss(0.0, 0.9, p)) + (reduce ? 0 : post * 0.07) + mx * 0.15 + drag;
var fit = Math.max(1, 1.05 / camera.aspect);
var radius = lerp(27, 30, ss(0, 0.6, p)) * fit;
var ty = lerp(0, 0.8, ss(0.1, 0.6, p));
camera.position.set(Math.sin(polar) * Math.sin(az) * radius, ty + Math.cos(polar) * radius, Math.sin(polar) * Math.cos(az) * radius + 0.0001);
camera.lookAt(0, ty, 0);
renderer.render(scene, camera);
if (visible && onHome && !document.hidden && !(reduce && p >= 1)) requestAnimationFrame(frame); else running = false;
}
function kick(){ if (!running && visible && onHome){ running = true; requestAnimationFrame(frame); } }
addEventListener("resize", function(){ resize(); kick(); });
document.addEventListener("visibilitychange", kick);
document.addEventListener("menej:view", function(e){ onHome = e.detail === "beranda"; if (onHome){ setTimeout(function(){ resize(); t0 = performance.now(); kick(); }, 20); } });
if ("IntersectionObserver" in window) new IntersectionObserver(function(es){ visible = es[0].isIntersecting; kick(); }).observe(stage);
onHome = document.getElementById("v-beranda").classList.contains("on");
resize(); kick();
})();
