// main.js (Module pane)
import * as THREE from 'three';
import { OrbitControls } from 'three/controls/OrbitControls.js';

let scene = new THREE.Scene();
let camera = new THREE.PerspectiveCamera( 60, innerWidth/ innerHeight, 0.1, 100 );
camera.position.set(0, 5, 10);

let renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize( innerWidth, innerHeight );
document.body.appendChild( renderer.domElement );

window.addEventListener('resize', () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth/innerHeight;
  camera.updateProjectionMatrix();
});

let controls = new OrbitControls(camera, renderer.domElement);

// vector field parameters
const gridSize = 10;
const spacing = 1;
const arrows = [];
const arrowGroup = new THREE.Group();
scene.add(arrowGroup);

// helpers
const arrowDir = new THREE.Vector3();
function makeField() {
  for (let x = -gridSize; x <= gridSize; x += spacing) {
    for (let y = -gridSize; y <= gridSize; y += spacing) {
      for (let z = -gridSize; z <= gridSize; z += spacing) {
        const origin = new THREE.Vector3(x, y, z);
        arrowDir.set(0, 1, 0); // default upward
        const arrow = new THREE.ArrowHelper( arrowDir.clone(), origin, 0.5, 0x00ff00 );
        arrowGroup.add(arrow);
        arrows.push({ arrow, origin });
      }
    }
  }
}

makeField();

// interactive sphere
const sphereGeo = new THREE.SphereGeometry(1, 32, 32);
const sphereMat = new THREE.MeshPhongMaterial({ color: 0xff0000, opacity: 0.5, transparent: true });
const sphere = new THREE.Mesh(sphereGeo, sphereMat);
sphere.position.set(2, 0, 0);
scene.add(sphere);

const light = new THREE.DirectionalLight(0xffffff, 1);
light.position.set(5,10,7);
scene.add(light);

function animateField(time) {
  const spherePos = sphere.position;
  const radius = 2;
  arrows.forEach(obj => {
    const d = obj.origin.distanceTo(spherePos);
    if (d < radius*2) {
      // deflect vector: tangent around sphere
      const away = new THREE.Vector3().subVectors(obj.origin, spherePos).normalize();
      const tangent = new THREE.Vector3().crossVectors(away, new THREE.Vector3(0,1,0)).normalize();
      obj.arrow.setDirection( tangent );
      obj.arrow.setColor( new THREE.Color( 1 - d/(radius*2), d/(radius*2), 0 ) );
    } else {
      obj.arrow.setDirection( new THREE.Vector3(0,1,0) );
      obj.arrow.setColor( new THREE.Color(0,1,0) );
    }
    // optional magnitude oscillation
    const mag = 0.3 + 0.2 * Math.sin(time/500 + obj.origin.x);
    obj.arrow.setLength(mag);
  });
}

// move sphere in a loop
function updateSphere(time) {
  sphere.position.x = 2 * Math.cos(time/2000);
  sphere.position.z = 2 * Math.sin(time/2000);
}

function render(time) {
  animateField(time);
  updateSphere(time);
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(render);
}

requestAnimationFrame(render);
