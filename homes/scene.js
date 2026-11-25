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
var KAPUR = 0xF3F1EB, ARANG = 0x252522, PASIR = 0xD9CFC1, LUMUT = 0x5E6B5A;
var renderer = new T.WebGLRenderer({canvas: canvas, context: gl, antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(devicePixelRatio || 1, small ? 1.5 : 2));
renderer.setClearColor(KAPUR, 0);
renderer.shadowMap.enabled = !small; renderer.shadowMap.type = T.PCFSoftShadowMap;
var scene = new T.Scene();
var camera = new T.PerspectiveCamera(30, 1, 0.1, 200);
scene.add(new T.HemisphereLight(0xFFFFFF, 0xCFC7BA, 0.6));
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
var pts = [[540,330],[540,557],[59,557],[59,59],[540,59],[540,299.5],[475,299.5],[475,485],[132.5,485],[132.5,121]].map(function(p){ return [(p[0]-300)/60, (p[1]-300)/60]; });
var plan = new T.Group(), walls = new T.Group(), wallMat = mat(0xFBFAF7), planMat = new T.MeshBasicMaterial({color: ARANG});
for (var i = 0; i < pts.length - 1; i++){
var a = pts[i], b = pts[i+1], dx = b[0]-a[0], dz = b[1]-a[1], len = Math.hypot(dx, dz), outer = i < 5, th = outer ? 0.32 : 0.22, ang = Math.atan2(dz, dx);
var line = new T.Mesh(new T.BoxGeometry(len + 0.3, 0.02, 0.3), planMat);
line.position.set((a[0]+b[0])/2, 0.012, (a[1]+b[1])/2); line.rotation.y = -ang; plan.add(line);
var g = new T.BoxGeometry(len + th, 1, th); g.translate(0, 0.5, 0);
var w = withEdges(new T.Mesh(g, wallMat));
w.position.set((a[0]+b[0])/2, 0, (a[1]+b[1])/2); w.rotation.y = -ang; w.castShadow = w.receiveShadow = true;
w.userData = {h: outer ? 2.7 : 2.1, d: i * 0.09}; walls.add(w);
}
scene.add(plan); scene.add(walls);
var floor = new T.Mesh(new T.BoxGeometry(8, 0.12, 8), mat(0xE9E4DA)); floor.position.y = 0.06; floor.receiveShadow = true; scene.add(floor);
var roofG = new T.BoxGeometry(10.2, 0.26, 9.6); roofG.translate(0.35, 0, 0);
var roofMat = mat(0xF7F5F0, {transparent: true, opacity: 0});
var roof = withEdges(new T.Mesh(roofG, roofMat)); roof.children[0].material = edgeMat.clone(); roof.castShadow = true; scene.add(roof);
var extras = new T.Group();
var deck = withEdges(new T.Mesh(new T.BoxGeometry(10.2, 0.14, 3.4), mat(0xB89A7C))); deck.position.set(0.35, 0.07, 5.9); deck.receiveShadow = true; extras.add(deck);
var water = new T.Mesh(new T.BoxGeometry(6.2, 0.06, 1.9), mat(0x8FA39B, {roughness: 0.2, metalness: 0.1})); water.position.set(-0.4, 0.16, 6.1); extras.add(water);
[[-4.6,-4.6],[5.3,-4.6],[5.3,4.6],[-4.6,4.6]].forEach(function(p){ var c = withEdges(new T.Mesh(new T.BoxGeometry(0.16, 2.7, 0.16), mat(ARANG))); c.position.set(p[0], 1.35, p[1]); c.castShadow = true; extras.add(c); });
var leaf = mat(LUMUT, {flatShading: true}), leaf2 = mat(0x7A866F, {flatShading: true}), trees = [];
[[-6.6,3.2,1.25],[-7.2,-1.2,0.9],[7.3,2.6,1.05],[6.9,-3.4,1.3],[-6.0,-5.6,0.8],[3.8,8.4,0.85]].forEach(function(p,k){
var t = new T.Group();
var trunk = new T.Mesh(new T.CylinderGeometry(0.06, 0.09, p[2]*1.4, 6), mat(0x6B5644)); trunk.position.y = p[2]*0.7; t.add(trunk);
var crown = new T.Mesh(new T.IcosahedronGeometry(p[2], 0), k % 2 ? leaf : leaf2); crown.position.y = p[2]*2; crown.castShadow = !small; t.add(crown);
t.position.set(p[0], 0, p[1]); extras.add(t); trees.push(crown);
});
scene.add(extras);
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
var t0 = performance.now(), BUILD = 4.2;
document.getElementById("rebuild").addEventListener("click", function(){ t0 = performance.now(); });
var running = false, visible = true, onHome = true;
function frame(now){
var t = (now - t0) / 1000, p = reduce ? 1 : clamp(t / BUILD, 0, 1);
var rise = ss(0.05, 0.45, p);
walls.children.forEach(function(w){ var k = ss(0.05 + w.userData.d * 0.35, 0.45 + w.userData.d * 0.35, p); w.scale.y = Math.max(0.001, k * w.userData.h); w.visible = k > 0.002; });
floor.visible = rise > 0.01;
var rf = ss(0.5, 0.75, p);
roof.position.set(0, lerp(7.5, 2.83, rf), 0); roofMat.opacity = rf; roof.children[0].material.opacity = rf * 0.85; roof.visible = rf > 0.01;
var ex = ss(0.7, 1.0, p);
extras.children.forEach(function(o, i){ var k = clamp(ex * 1.8 - i * 0.07, 0, 1); var e = k < 1 ? 1 - Math.pow(1 - k, 3) * Math.cos(k * 6) * 0.3 : 1; o.scale.setScalar(Math.max(0.001, k === 0 ? 0 : e)); o.visible = k > 0.01; });
trees.forEach(function(c, i){ c.rotation.y = Math.sin(t * 0.6 + i) * 0.08; });
water.material.color.setHSL(0.42, 0.1, 0.58 + Math.sin(t * 1.5) * 0.02);
mx = lerp(mx, tmx, 0.05); my = lerp(my, tmy, 0.05);
if (!dragging){ dragV *= 0.94; drag += dragV; }
var polar = lerp(0.05, 1.0, ss(0.0, 0.6, p)) + my * 0.06;
var az = lerp(-0.6, 0.55, ss(0.0, 0.9, p)) + (reduce ? 0 : Math.max(0, t - BUILD) * 0.07) + mx * 0.15 + drag;
var fit = Math.max(1, 1.05 / camera.aspect);
var radius = lerp(36, 40, ss(0, 0.6, p)) * fit;
var ty = lerp(0, 0.9, ss(0.1, 0.6, p));
camera.position.set(Math.sin(polar) * Math.sin(az) * radius, ty + Math.cos(polar) * radius, Math.sin(polar) * Math.cos(az) * radius + 0.0001);
camera.lookAt(0, ty, 0.9 * ss(0.6, 1, p));
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
