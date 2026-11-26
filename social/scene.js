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
var TEAL = 0xD6336C, DARK = 0x3A1224, PASIR = 0xF3D1DF, KUNING = 0xFFD166, PUTIH = 0xFFF8FB;
var renderer = new T.WebGLRenderer({canvas: canvas, context: gl, antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
renderer.setClearColor(0xFFF0F5, 0);
renderer.shadowMap.enabled = !small; renderer.shadowMap.type = T.PCFSoftShadowMap;
var scene = new T.Scene();
var camera = new T.PerspectiveCamera(30, 1, 0.1, 200);
scene.add(new T.HemisphereLight(0xFFFFFF, 0xE8C8D6, 0.7));
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
function quarter(){
var s = new T.Shape(), r = 5.2, cx = -3.9, cy = -3.9;
s.moveTo(cx, cy); s.lineTo(cx, cy + r); s.absarc(cx, cy, r, Math.PI/2, 0, true); s.lineTo(cx, cy);
return s;
}
/* kotak: lencana teal + halaman putih bertakik */
var base = withEdges(flat(rounded(6.2, 2.8), 0.5, mat(TEAL)), new T.LineBasicMaterial({color: DARK, transparent: true, opacity: 0.5}));
var baseG = new T.Group(); baseG.add(base); scene.add(baseG);
var page = withEdges(flat(quarter(), 0.5, mat(PUTIH)));
var pageG = new T.Group(); pageG.position.y = 0.5; pageG.add(page); scene.add(pageG);
/* ikon play (Reels) dari segitiga 3D */
var code = new T.Group(), codeParts = [];
var ts = new T.Shape(); ts.moveTo(-0.9, -1.1); ts.lineTo(-0.9, 1.1); ts.lineTo(1.1, 0); ts.lineTo(-0.9, -1.1);
var tri = withEdges(new T.Mesh(new T.ExtrudeGeometry(ts, {depth: 0.5, bevelEnabled: false}), mat(TEAL)), new T.LineBasicMaterial({color: DARK, transparent: true, opacity: 0.45}));
tri.geometry.rotateX(-Math.PI/2); tri.geometry.translate(0, 0.5, 0); tri.userData = {d: 0}; tri.castShadow = true; tri.rotation.y = 0; code.add(tri); codeParts.push(tri);
code.position.set(-2.0, 0, 1.9); pageG.add(code);
/* bulet kuning terpisah, melayang di atas takik */
var DX = 2.6, DZ = -2.6, REST = 0.95, HOVER = 4.6;
var dotMat = mat(KUNING, {roughness: 0.5});
var dot = new T.Mesh(new T.CylinderGeometry(1.5, 1.5, 0.8, 48), dotMat); dot.castShadow = true;
dot.add(new T.LineSegments(new T.EdgesGeometry(dot.geometry, 40), edgeMat));
var dotG = new T.Group(); dotG.position.set(DX, HOVER, DZ); dotG.add(dot); scene.add(dotG);
var pgeo = new T.BufferGeometry(); pgeo.setAttribute("position", new T.Float32BufferAttribute([DX, 0.5, DZ, DX, HOVER - 0.4, DZ], 3));
var pin = new T.Line(pgeo, new T.LineDashedMaterial({color: TEAL, dashSize: 0.22, gapSize: 0.18, transparent: true, opacity: 0.5})); pin.computeLineDistances(); scene.add(pin);
function mkRing(){ var m = new T.MeshBasicMaterial({color: KUNING, transparent: true, opacity: 0, side: T.DoubleSide}); var r = new T.Mesh(new T.RingGeometry(1.5, 1.7, 48), m); r.rotation.x = -Math.PI/2; r.visible = false; scene.add(r); return r; }
var ringA = mkRing(), ringB = mkRing();
/* hati yang naik saat diklik */
var hs = new T.Shape(); hs.moveTo(0, -0.5); hs.bezierCurveTo(-0.9, 0.1, -0.7, 0.9, 0, 0.55); hs.bezierCurveTo(0.7, 0.9, 0.9, 0.1, 0, -0.5);
var hearts = [0,1,2].map(function(i){ var m = new T.Mesh(new T.ExtrudeGeometry(hs, {depth: 0.18, bevelEnabled: false}), new T.MeshBasicMaterial({color: TEAL, transparent: true, opacity: 0})); m.geometry.rotateX(-Math.PI/2); m.visible = false; scene.add(m); return m; });
/* kursor */
var cs = new T.Shape(); [[0,0],[0,1.5],[0.4,1.15],[0.75,1.9],[1.0,1.75],[0.65,1.05],[1.15,1.0]].forEach(function(p,i){ var x = p[0], y = -p[1]; i ? cs.lineTo(x, y) : cs.moveTo(x, y); });
var cur = new T.Mesh(new T.ExtrudeGeometry(cs, {depth: 0.07, bevelEnabled: false}), mat(DARK));
cur.geometry.rotateX(-Math.PI/2); cur.add(new T.LineSegments(new T.EdgesGeometry(cur.geometry), new T.LineBasicMaterial({color: 0xFFFFFF})));
var curG = new T.Group(); curG.add(cur); scene.add(curG);
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
page.scale.y = Math.max(0.001, k1); pageG.visible = k1 > 0.002;
codeParts.forEach(function(m){ var k = back(clamp((p - 0.5 - m.userData.d) / 0.18, 0, 1)); m.scale.setScalar(Math.max(0.001, k)); m.visible = k > 0.003; });
var kd = back(clamp((p - 0.8) / 0.18, 0, 1));
var c = reduce ? 0 : post % 6.0, bob = reduce ? 0 : Math.sin(post * 1.6) * 0.18;
var y;
if (c < 1.8) y = HOVER + bob;
else if (c < 2.5){ var f = (c - 1.8) / 0.7; y = lerp(HOVER, REST, f*f); }
else if (c < 3.3) y = REST + Math.max(0, Math.sin((c - 2.5) * 8)) * 0.15 * (1 - (c-2.5)/0.8);
else if (c < 4.6) y = lerp(REST, HOVER + bob, ss(3.3, 4.6, c));
else y = HOVER + bob;
var press = (p >= 1 && !reduce) ? ss(1.2, 1.35, c) * (1 - ss(1.35, 1.65, c)) : 0;
dotG.position.y = y; dotG.rotation.y = reduce ? 0 : post * 0.6;
dotG.scale.set(Math.max(0.001, kd), Math.max(0.001, kd) * (1 - press * 0.4), Math.max(0.001, kd)); dotG.visible = kd > 0.003;
pin.visible = kd > 0.5 && y > REST + 0.6; pin.material.opacity = 0.5 * clamp((y - REST) / 2, 0, 1);
var r1 = (p >= 1 && !reduce) ? clamp((c - 1.3) / 1.0, 0, 1) : 0, r2 = (p >= 1 && !reduce) ? clamp((c - 2.4) / 1.0, 0, 1) : 0;
ringA.visible = r1 > 0 && r1 < 1; ringA.position.set(DX, HOVER - 0.4, DZ); ringA.scale.setScalar(1 + r1 * 1.5); ringA.material.opacity = (1 - r1) * 0.85;
ringB.visible = r2 > 0 && r2 < 1; ringB.position.set(DX, 0.56, DZ); ringB.scale.setScalar(1 + r2 * 1.5); ringB.material.opacity = (1 - r2) * 0.85;
if (p >= 1 && !reduce){
var arrive = ss(0.0, 1.2, c) * (1 - ss(3.3, 4.6, c)), ty2 = y + 1.6 - press * 0.4;
curG.position.set(lerp(-1.5, DX - 0.3, arrive), lerp(ty2 + 3.5, ty2, arrive), lerp(6.0, DZ + 0.2, arrive)); curG.visible = arrive > 0.01;
} else if (reduce){ curG.position.set(DX - 0.3, HOVER + 1.6, DZ + 0.2); curG.visible = true; } else curG.visible = false;
hearts.forEach(function(h, i){ var k = (p >= 1 && !reduce) ? clamp((c - 1.35 - i * 0.25) / 1.3, 0, 1) : 0; h.visible = k > 0 && k < 1; h.position.set(DX + (i - 1) * 1.1, HOVER + 0.4 + k * 3.2, DZ - 0.2); h.scale.setScalar(0.8 + k * 0.5); h.rotation.y = k * 2; h.material.opacity = (1 - k) * 0.95; });
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
