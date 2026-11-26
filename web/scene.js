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
/* kotak: lencana teal + tiga batang membulat */
var base = withEdges(flat(rounded(6.2, 2.8), 0.5, mat(TEAL)), new T.LineBasicMaterial({color: DARK, transparent: true, opacity: 0.5}));
var baseG = new T.Group(); baseG.add(base); scene.add(baseG);
function pill(L, hz){
var s = new T.Shape();
s.moveTo(hz, -hz); s.lineTo(L-hz, -hz); s.absarc(L-hz, 0, hz, -Math.PI/2, Math.PI/2, false);
s.lineTo(hz, hz); s.absarc(hz, 0, hz, Math.PI/2, 1.5*Math.PI, false);
return s;
}
var barGs = [];
[{x:-4, z:-2.375, L:8, c:PUTIH, d:0}, {x:-2.25, z:0, L:6.25, c:PUTIH, d:0.1}, {x:-4, z:2.375, L:5, c:KUNING, d:0.2}].forEach(function(b){
var m = withEdges(flat(pill(b.L, 0.875), 0.5, mat(b.c, b.c === KUNING ? {roughness: 0.5} : {})));
var g = new T.Group(); g.position.set(b.x, 0.5, b.z); g.add(m); scene.add(g); barGs.push({g: g, d: b.d});
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
var t0 = performance.now(), BUILD = 3.8;
document.getElementById("rebuild").addEventListener("click", function(){ t0 = performance.now(); });
var running = false, visible = true, onHome = true;
function frame(now){
var t = (now - t0) / 1000, p = reduce ? 1 : clamp(t / BUILD, 0, 1);
var post = reduce ? 0 : Math.max(0, t - BUILD);
var k0 = ss(0.03, 0.28, p), k1 = ss(0.22, 0.5, p);
base.scale.y = Math.max(0.001, k0); baseG.visible = k0 > 0.002;
barGs.forEach(function(b){ var k = back(clamp((p - 0.4 - b.d) / 0.28, 0, 1)); b.g.scale.x = Math.max(0.001, k); b.g.visible = k > 0.003; });
mx = lerp(mx, tmx, 0.05); my = lerp(my, tmy, 0.05);
if (!dragging){ dragV *= 0.94; drag += dragV; }
var polar = lerp(0.05, 0.95, ss(0.0, 0.55, p)) + my * 0.06;
var az = lerp(-0.5, 0.62, ss(0.0, 0.9, p)) + post * 0.07 + mx * 0.15 + drag;
var fit = Math.max(1, 1.05 / camera.aspect);
var radius = 35 * fit;
var ty = lerp(0, 1.6, ss(0.2, 0.8, p));
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
