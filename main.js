 import * as THREE from 'three';
    import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    document.body.appendChild(renderer.domElement);
    renderer.setSize(window.innerWidth, window.innerHeight);

    const scene = new THREE.Scene();
    const aspect = window.innerWidth / window.innerHeight;
    const camera = new THREE.OrthographicCamera(-10 * aspect, 10 * aspect, 10, -10, 0.1, 100);
    camera.position.set(0, 0, 10);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableRotate = false;
    controls.enableZoom = true;
    controls.enablePan = true;
    controls.screenSpacePanning = true; // Keep panning in the XY plane
    controls.minZoom = 0.5;
    controls.maxZoom = 4;

    const arrowGroup = new THREE.Group();
    scene.add(arrowGroup);

    const fieldSize = 10;
    const spacing = 2;
    const arrows = [];

    for (let x = -fieldSize; x <= fieldSize; x += spacing) {
      for (let y = -fieldSize; y <= fieldSize; y += spacing) {
        const origin = new THREE.Vector3(x, y, 0);
        const dir = new THREE.Vector3(1, 0, 0);
        const arrow = new THREE.ArrowHelper(dir, origin, 1, 0x0077ff);
        arrows.push({ arrow, x, y });
        arrowGroup.add(arrow);
      }
    }

    let mode = 'divergence';
    document.getElementById('btn-div').onclick = () => mode = 'divergence';
    document.getElementById('btn-curl').onclick = () => mode = 'curl';

    function vectorField(x, y) {
      if (mode === 'divergence') return new THREE.Vector2(x, y);
      else return new THREE.Vector2(-y, x);
    }

    function animate() {
      const t = performance.now() * 0.001;

      arrows.forEach(({ arrow, x, y }) => {
        const base = vectorField(x, y);
        if (mode === 'divergence') {
          const mag = base.length();
          const pulse = Math.sin(t * 2 + (x + y) * 0.5) * 0.5 + 1;
          base.setLength(mag * pulse);
        } else {
          base.rotateAround(new THREE.Vector2(0, 0), t * 0.5);
        }

        const dir3 = new THREE.Vector3(base.x, base.y, 0).normalize();
        arrow.setDirection(dir3);
        arrow.setLength(base.length(), 0.3, 0.2);
      });

      controls.update();
      renderer.render(scene, camera);
      requestAnimationFrame(animate);
    }

    animate();

    window.addEventListener('resize', () => {
      const ar = window.innerWidth / window.innerHeight;
      camera.left = -10 * ar;
      camera.right = 10 * ar;
      camera.top = 10;
      camera.bottom = -10;
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
    });