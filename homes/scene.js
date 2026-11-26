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
var KAPUR = 0xFFF3E6, ARANG = 0x3A2218, PASIR = 0xEBD3BC, JATI = 0xB4532A, EMAS = 0xF2B45C;
var renderer = new T.WebGLRenderer({canvas: canvas, context: gl, antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
renderer.setClearColor(KAPUR, 0);
renderer.shadowMap.enabled = !small; renderer.shadowMap.type = T.PCFSoftShadowMap;
var scene = new T.Scene();
var camera = new T.PerspectiveCamera(30, 1, 0.1, 200);
scene.add(new T.HemisphereLight(0xFFFFFF, 0xE6CDB6, 0.6));
var sun = new T.DirectionalLight(0xFFF6EA, 0.8);
sun.position.set(-9, 16, 7); sun.castShadow = !small; sun.shadow.mapSize.set(2048, 2048);
var sc = sun.shadow.camera; sc.left = -12; sc.right = 12; sc.top = 12; sc.bottom = -12; sc.near = 1; sc.far = 50; sun.shadow.bias = -0.0005;
scene.add(sun);
var shadowCatch = new T.Mesh(new T.CircleGeometry(13, 64), new T.ShadowMaterial({opacity: 0.10}));
shadowCatch.rotation.x = -Math.PI/2; shadowCatch.position.y = 0.003; shadowCatch.receiveShadow = true; scene.add(shadowCatch);
var grid = new T.PolarGridHelper(12, 16, 6, 64, PASIR, PASIR);
grid.position.y = 0.004; grid.material.transparent = true; grid.material.opacity = 0.5; scene.add(grid);
var mat = function(c, o){ return new T.MeshStandardMaterial(Object.assign({color: c, roughness: 0.92}, o || {})); };
var edgeMat = new T.LineBasicMaterial({color: ARANG, transparent: true, opacity: 0.85});
function withEdges(m){ m.add(new T.LineSegments(new T.EdgesGeometry(m.geometry), edgeMat)); return m; }
/* logo Homes: lencana oranye, lengkung krem, bulatan kuning. x=(px-50)*0.124, z=(py-50)*0.124 */
function flat(shape, depth, material){
var g = new T.ExtrudeGeometry(shape, {depth: depth, bevelEnabled: false, curveSegments: 32});
g.rotateX(-Math.PI/2);
var m = new T.Mesh(g, material); m.castShadow = m.receiveShadow = true; return m;
}
function sq(R, rr){
var s = new T.Shape();
s.moveTo(-R+rr, -R); s.lineTo(R-rr, -R); s.absarc(R-rr, -R+rr, rr, -Math.PI/2, 0, false);
s.lineTo(R, R-rr); s.absarc(R-rr, R-rr, rr, 0, Math.PI/2, false);
s.lineTo(-R+rr, R); s.absarc(-R+rr, R-rr, rr, Math.PI/2, Math.PI, false);
s.lineTo(-R, -R+rr); s.absarc(-R+rr, -R+rr, rr, Math.PI, 1.5*Math.PI, false);
return s;
}
function arch(){
var s = new T.Shape(), r = 2.38, b = -2.96;
s.moveTo(-r, b); s.lineTo(r, b); s.lineTo(r, 0); s.absarc(0, 0, r, 0, Math.PI, false); s.lineTo(-r, b);
return s;
}
var softEdge = new T.LineBasicMaterial({color: ARANG, transparent: true, opacity: 0.5});
var base = withEdges(flat(sq(6.2, 2.8), 0.5, mat(JATI)));
base.children[0].material = softEdge;
var baseG = new T.Group(); baseG.add(base); scene.add(baseG);
var gate = withEdges(flat(arch(), 0.5, mat(0xFFF3E6)));
var gateG = new T.Group(); gateG.position.y = 0.5; gateG.add(gate); scene.add(gateG);
/* bulatan kuning di atas lengkung: yang diklik */
var DX = 0, DZ = 0.58, REST = 1.0, DR = 0.89;
var dot = withEdges(new T.Mesh(new T.CylinderGeometry(DR, DR, 0.5, 48), mat(EMAS, {roughness: 0.5}))); dot.position.y = 0.25; dot.castShadow = true;
var dotG = new T.Group(); dotG.position.set(DX, REST, DZ); dotG.add(dot); scene.add(dotG);
var ring = new T.Mesh(new T.RingGeometry(DR, DR + 0.18, 48), new T.MeshBasicMaterial({color: EMAS, transparent: true, opacity: 0, side: T.DoubleSide}));
ring.rotation.x = -Math.PI/2; ring.visible = false; scene.add(ring);
/* kursor */
var cs = new T.Shape(); [[0,0],[0,1.5],[0.4,1.15],[0.75,1.9],[1.0,1.75],[0.65,1.05],[1.15,1.0]].forEach(function(p,i){ var x = p[0], y = -p[1]; i ? cs.lineTo(x, y) : cs.moveTo(x, y); });
var cur = new T.Mesh(new T.ExtrudeGeometry(cs, {depth: 0.07, bevelEnabled: false}), mat(ARANG));
cur.geometry.rotateX(-Math.PI/2); cur.add(new T.LineSegments(new T.EdgesGeometry(cur.geometry), new T.LineBasicMaterial({color: 0xFFFFFF})));
var curG = new T.Group(); curG.add(cur); scene.add(curG);
function resize(){
var W = stage.clientWidth, H = stage.clientHeight;
renderer.setSize(W, H, false); camera.aspect = W / H; camera.updateProjectionMatrix();
}
var drag = 0, dragV = 0, dragging = false, lastX = 0, mx = 0, my = 0, tmx = 0, tmy = 0;
canvas.addEventListener("pointerdown", function(e){ dragging = true; lastX = e.clientX; canvas.setPointerCapture(e.pointerId); });
canvas.addEventListener("pointermove", function(e){
if (dragging){ dragV = (e.clientX - lastX) * 0.006; drag += dragV; lastX = e.clientX; }
});
canvas.addEventListener("pointerup", function(){ dragging = false; });
canvas.style.touchAction = "pan-y";
addEventListener("pointermove", function(e){ if (e.pointerType !== "mouse") return; tmx = e.clientX / innerWidth - 0.5; tmy = e.clientY / innerHeight - 0.5; });
var t0 = performance.now(), BUILD = 3.8;
document.getElementById("rebuild").addEventListener("click", function(){ t0 = performance.now(); });
var running = false, visible = true, onHome = true;
function frame(now){
var t = (now - t0) / 1000, p = reduce ? 1 : clamp(t / BUILD, 0, 1);
var post = reduce ? 0 : Math.max(0, t - BUILD);
var k0 = ss(0.03, 0.28, p), k1 = ss(0.24, 0.5, p), kd = ss(0.46, 0.7, p);
base.scale.y = Math.max(0.001, k0); baseG.visible = k0 > 0.002;
gate.scale.y = Math.max(0.001, k1); gateG.visible = k1 > 0.002;
var c = reduce ? 0 : post % 4.5;
var press = (p >= 1 && !reduce) ? ss(1.05, 1.2, c) * (1 - ss(1.2, 1.55, c)) : 0;
dotG.scale.set(1, Math.max(0.001, kd) * (1 - press * 0.55), 1); dotG.visible = kd > 0.003;
var r1 = (p >= 1 && !reduce) ? clamp((c - 1.1) / 1.0, 0, 1) : 0;
ring.visible = r1 > 0 && r1 < 1; ring.position.set(DX, REST + 0.05, DZ); ring.scale.setScalar(1 + r1 * 1.1); ring.material.opacity = (1 - r1) * 0.85;
if (p >= 1 && !reduce){
var arrive = ss(0.0, 1.0, c) * (1 - ss(2.3, 3.4, c)), ty2 = REST + 0.7 - press * 0.4;
curG.position.set(lerp(-1.5, DX + 0.5, arrive), lerp(ty2 + 3.5, ty2, arrive), lerp(6.5, DZ + 0.2, arrive)); curG.visible = arrive > 0.01;
} else if (reduce){ curG.position.set(DX + 0.5, REST + 0.7, DZ + 0.2); curG.visible = true; } else curG.visible = false;
mx = lerp(mx, tmx, 0.05); my = lerp(my, tmy, 0.05);
if (!dragging){ dragV *= 0.94; drag += dragV; }
var polar = lerp(0.05, 1.0, ss(0.0, 0.6, p)) + my * 0.06;
var az = lerp(-0.6, 0.55, ss(0.0, 0.9, p)) + (reduce ? 0 : Math.max(0, t - BUILD) * 0.07) + mx * 0.15 + drag;
var fit = Math.max(1, 1.05 / camera.aspect);
var radius = 35 * fit;
var ty = lerp(0, 1.2, ss(0.1, 0.6, p));
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
