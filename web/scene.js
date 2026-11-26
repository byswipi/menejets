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
scene.add(new T.HemisphereLight(0xFFFFFF, 0xBFD5DB, 0.7));
var sun = new T.DirectionalLight(0xFFFFFF, 0.75);
sun.position.set(-8, 18, 9); sun.castShadow = !small; sun.shadow.mapSize.set(2048, 2048);
var sc = sun.shadow.camera; sc.left = -14; sc.right = 14; sc.top = 14; sc.bottom = -14; sc.near = 1; sc.far = 60; sun.shadow.bias = -0.0005;
scene.add(sun);
var shadowCatch = new T.Mesh(new T.CircleGeometry(14, 64), new T.ShadowMaterial({opacity: 0.12}));
shadowCatch.rotation.x = -Math.PI/2; shadowCatch.position.y = 0.003; shadowCatch.receiveShadow = true; scene.add(shadowCatch);
var grid = new T.PolarGridHelper(13, 16, 6, 64, PASIR, PASIR);
grid.position.y = 0.004; grid.material.transparent = true; grid.material.opacity = 0.6; scene.add(grid);
var mat = function(c, o){ return new T.MeshStandardMaterial(Object.assign({color: c, roughness: 0.85}, o || {})); };
var edgeMat = new T.LineBasicMaterial({color: DARK, transparent: true, opacity: 0.75});
function withEdges(m, em){ m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry, 30), em || edgeMat)); return m; }
function flat(shape, depth, material){
var g = new T.ExtrudeGeometry(shape, {depth: depth, bevelEnabled: false, curveSegments: 24});
g.rotateX(-Math.PI/2);
var m = new T.Mesh(g, material); m.castShadow = m.receiveShadow = true; return m;
}
/* bentuk logo: x=(px-50)/8, z=(py-50)/8 */
function rounded(R, rr){
var s = new T.Shape();
s.moveTo(-R+rr, -R); s.lineTo(R-rr, -R); s.absarc(R-rr, -R+rr, rr, -Math.PI/2, 0, false);
s.lineTo(R, R-rr); s.absarc(R-rr, R-rr, rr, 0, Math.PI/2, false);
s.lineTo(-R+rr, R); s.absarc(-R+rr, R-rr, rr, Math.PI/2, Math.PI, false);
s.lineTo(-R, -R+rr); s.absarc(-R+rr, -R+rr, rr, Math.PI, 1.5*Math.PI, false);
return s;
}
function notched(h){
var s = new T.Shape(), a = 3.4, r = 2.9, c = a - 0.0;
s.moveTo(-a, a); s.lineTo(c - r, a); s.absarc(c, a, r, Math.PI, 1.5*Math.PI, false); s.lineTo(a, -a); s.lineTo(-a, -a); s.lineTo(-a, a);
return s;
}
var Y1 = 2.7, Y2 = 5.4;
/* lapis 0: lencana teal */
var L0 = new T.Group(); scene.add(L0);
var base = withEdges(flat(rounded(6.2, 2.8), 0.5, mat(TEAL)), new T.LineBasicMaterial({color: DARK, transparent: true, opacity: 0.5})); L0.add(base);
/* lapis 1: halaman putih */
var L1 = new T.Group(); scene.add(L1);
var page = withEdges(flat(notched(), 0.5, mat(PUTIH))); L1.add(page);
var blocks = [];
function block(w, d, h, x, z, c, delay){
var m = withEdges(new T.Mesh(new T.BoxGeometry(w, h, d), mat(c)), new T.LineBasicMaterial({color: DARK, transparent: true, opacity: 0.35}));
m.position.set(x, 0.5 + h/2, z); m.userData = {d: delay}; m.castShadow = true; L1.add(m); blocks.push(m); return m;
}
block(4.2, 0.5, 0.2, -1.2, -1.9, DARK, 0);
block(2.8, 0.5, 0.2, -1.9, -1.0, DARK, 0.05);
block(5.2, 0.22, 0.12, -0.8, -0.1, PASIR, 0.1);
block(4.0, 0.22, 0.12, -1.4, 0.45, PASIR, 0.14);
block(1.9, 1.5, 0.32, -2.1, 2.1, PASIR, 0.2);
block(1.9, 1.5, 0.32, 0.0, 2.1, PASIR, 0.25);
block(1.9, 1.5, 0.32, 2.1, 2.1, TEAL, 0.3);
/* lapis 2: kaca dengan tombol */
var L2 = new T.Group(); scene.add(L2);
var glass = withEdges(flat(notched(), 0.12, mat(0xFFFFFF, {transparent: true, opacity: 0.32, roughness: 0.2, depthWrite: false})), new T.LineBasicMaterial({color: TEAL, transparent: true, opacity: 0.9}));
glass.castShadow = false; L2.add(glass);
var DX = 3.2, DZ = -3.2;
var dotMat = mat(KUNING, {roughness: 0.5});
var dot = new T.Mesh(new T.CylinderGeometry(1.25, 1.25, 0.8, 48), dotMat); dot.castShadow = true;
dot.add(new T.LineSegments(new T.EdgesGeometry(dot.geometry, 40), edgeMat));
var dotG = new T.Group(); dotG.position.set(DX, 0.52, DZ); dotG.add(dot); L2.add(dotG);
var ringMat = new T.MeshBasicMaterial({color: KUNING, transparent: true, opacity: 0, side: T.DoubleSide});
var ring = new T.Mesh(new T.RingGeometry(1.25, 1.45, 48), ringMat); ring.rotation.x = -Math.PI/2; ring.position.set(DX, 0.14, DZ); L2.add(ring);
/* garis penghubung antar lapis */
var pg = new T.BufferGeometry(), pp = [];
[[-5.6,-5.6],[5.6,-5.6],[5.6,5.6],[-5.6,5.6]].forEach(function(c){ pp.push(c[0], 0.5, c[1], c[0], Y2, c[1]); });
pg.setAttribute("position", new T.Float32BufferAttribute(pp, 3));
var pins = new T.LineSegments(pg, new T.LineDashedMaterial({color: TEAL, dashSize: 0.25, gapSize: 0.2, transparent: true, opacity: 0.45}));
pins.computeLineDistances(); scene.add(pins);
/* kursor */
var cs = new T.Shape(); [[0,0],[0,1.5],[0.4,1.15],[0.75,1.9],[1.0,1.75],[0.65,1.05],[1.15,1.0]].forEach(function(p,i){ var x = p[0]*1.0, y = -p[1]*1.0; i ? cs.lineTo(x, y) : cs.moveTo(x, y); });
var cur = new T.Mesh(new T.ExtrudeGeometry(cs, {depth: 0.07, bevelEnabled: false}), mat(DARK));
cur.geometry.rotateX(-Math.PI/2); cur.add(new T.LineSegments(new T.EdgesGeometry(cur.geometry), new T.LineBasicMaterial({color: 0xFFFFFF})));
var curG = new T.Group(); curG.add(cur); scene.add(curG);
/* kubus kecil melayang */
var bits = [];
[[-8.2,3.4,2.0,0.5,KUNING],[8.0,6.8,-1.0,0.42,TEAL],[-7.0,7.6,-4.5,0.36,PASIR],[7.6,2.6,5.2,0.4,KUNING],[-5.5,1.4,7.4,0.34,TEAL]].forEach(function(b,i){
var m = withEdges(new T.Mesh(new T.BoxGeometry(b[3], b[3], b[3]), mat(b[4]))); m.position.set(b[0], b[1], b[2]); m.userData = {y: b[1], i: i}; m.castShadow = !small; scene.add(m); bits.push(m);
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
var t0 = performance.now(), BUILD = 4.6;
document.getElementById("rebuild").addEventListener("click", function(){ t0 = performance.now(); });
var running = false, visible = true, onHome = true;
function frame(now){
var t = (now - t0) / 1000, p = reduce ? 1 : clamp(t / BUILD, 0, 1);
var post = reduce ? 0 : Math.max(0, t - BUILD);
var breathe = reduce ? 0 : Math.sin(post * 1.1) * 0.12;
var k0 = ss(0.03, 0.28, p);
base.scale.y = Math.max(0.001, k0); L0.visible = k0 > 0.002;
var k1 = ss(0.24, 0.52, p), spread = ss(0.5, 0.95, p);
L1.position.y = lerp(11, lerp(0.7, Y1, spread) + breathe * 0.6, k1);
L1.scale.setScalar(lerp(0.7, 1, k1)); L1.visible = k1 > 0.002;
blocks.forEach(function(b){ var k = back(clamp((p - 0.5 - b.userData.d * 0.9) / 0.14, 0, 1)); b.scale.setScalar(Math.max(0.001, k)); b.visible = k > 0.003; });
var k2 = ss(0.5, 0.78, p);
L2.position.y = lerp(14, lerp(1.4, Y2, spread) + breathe, k2);
L2.scale.setScalar(lerp(0.7, 1, k2)); L2.visible = k2 > 0.002;
pins.material.opacity = 0.45 * spread; pins.visible = spread > 0.01;
var kd = back(clamp((p - 0.82) / 0.16, 0, 1));
var pulse = reduce ? 0 : (Math.sin(post * 3.2) * 0.5 + 0.5);
var cyc = reduce ? 0 : (post % 5.2), press = 0, ringK = 0;
if (p >= 1 && !reduce) { press = ss(1.7, 1.85, cyc) * (1 - ss(1.85, 2.1, cyc)); ringK = clamp((cyc - 1.8) / 1.2, 0, 1); }
dotG.scale.set(Math.max(0.001, kd) * (1 + pulse * 0.04), Math.max(0.001, kd) * (1 - press * 0.4), Math.max(0.001, kd) * (1 + pulse * 0.04)); dotG.visible = kd > 0.003;
ring.visible = ringK > 0 && ringK < 1; ring.scale.setScalar(1 + ringK * 1.6); ringMat.opacity = (1 - ringK) * 0.85;
/* kursor menuju tombol */
var dwx = DX, dwz = DZ, dwy = L2.position.y + 1.3;
if (p >= 1 && !reduce){
var go = ss(0.2, 1.6, cyc), ret = ss(3.5, 4.9, cyc), f = go * (1 - ret);
curG.position.set(lerp(-1.0, dwx - 0.2, f), lerp(dwy + 3.2, dwy, f) - press * 0.35, lerp(5.5, dwz + 0.1, f)); curG.visible = true;
} else if (reduce){ curG.position.set(dwx - 0.2, dwy, dwz + 0.1); curG.visible = true; } else curG.visible = false;
var bk = ss(0.8, 1.0, p);
bits.forEach(function(b, i){ var k = clamp(bk * 1.8 - i * 0.18, 0, 1); b.scale.setScalar(Math.max(0.001, back(k))); b.visible = k > 0.01; b.position.y = b.userData.y + Math.sin(t * 0.8 + i * 1.9) * 0.25; b.rotation.y = t * 0.3 + i; b.rotation.x = t * 0.2; });
mx = lerp(mx, tmx, 0.05); my = lerp(my, tmy, 0.05);
if (!dragging){ dragV *= 0.94; drag += dragV; }
var polar = lerp(0.05, 0.98, ss(0.0, 0.55, p)) + my * 0.06;
var az = lerp(-0.5, 0.62, ss(0.0, 0.9, p)) + post * 0.07 + mx * 0.15 + drag;
var fit = Math.max(1, 1.05 / camera.aspect);
var radius = lerp(31, 31, p) * fit;
var ty = lerp(0, 2.4, ss(0.2, 0.8, p));
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
