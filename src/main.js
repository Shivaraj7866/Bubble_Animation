import * as THREE from "three";
import Stats from "three/examples/jsm/libs/stats.module.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import BubbleAnimation from "./Bubble_Confetti/Bubble.js";

async function loadTextures(imagArray) {
  let textureLoader = new THREE.TextureLoader();
  const promise = imagArray.map((texture) => {
    return new Promise((resolve, reject) => {
      textureLoader.load(texture.path, resolve, undefined, reject);
    });
  });

  return Promise.all(promise);
}

function initScene(texture) {
  const overlay = document.createElement("div");
  overlay.style.position = "absolute";
  overlay.style.top = "0";
  overlay.style.left = "100px";
  overlay.style.padding = "10px";
  overlay.style.color = "white";
  overlay.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
  document.body.appendChild(overlay);

  let stats = new Stats();
  stats.showPanel(2);
  document.body.appendChild(stats.dom);

  //Scene setup
  const scene = new THREE.Scene();
  let width = window.innerWidth;
  let height = window.innerHeight;

  //Camera setup
  const frustumSize = 100;
  const aspect = width / height;
  const camera = new THREE.OrthographicCamera(
    (frustumSize * aspect) / -2,
    (frustumSize * aspect) / 2,
    frustumSize / 2,
    frustumSize / -2,
    -1000,
    1000
  );
  camera.position.z = 10;

  //Renderer setup
  const renderer = new THREE.WebGLRenderer();
  renderer.setSize(width, height);
  document.body.appendChild(renderer.domElement);

  let Bubble = new BubbleAnimation(scene,frustumSize,width,height)

  let controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  //Overlay update
  function updateOverlay() {
    overlay.innerHTML = `
      <strong>Draw Calls:</strong> ${renderer.info.render.calls}<br>
      <strong>Frame:</strong> ${renderer.info.render.frame}<br>
      <strong>Textures:</strong> ${renderer.info.memory.textures}<br>
      <strong>Geometries:</strong> ${renderer.info.memory.geometries}
    `;
  }

  let clock = new THREE.Clock();
  let time = 0;

  function animate() {
    stats.begin();
    requestAnimationFrame(animate);

    controls.update();
    const delta = clock.getDelta();
    time += delta;

    Bubble.updateParticles()

    updateOverlay();
    renderer.render(scene, camera);
    stats.end();
  }

  animate();

  // Window resize handler
  window.addEventListener("resize", onWindowResize, true);

  function onWindowResize() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    const aspect = width / height;

    camera.left = (frustumSize * aspect) / -2;
    camera.right = (frustumSize * aspect) / 2;
    camera.top = frustumSize / 2;
    camera.bottom = frustumSize / -2;
    camera.updateProjectionMatrix();

    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.floor(Math.min(window.devicePixelRatio, 2)));
  }
}

const ribbonArray = [
  {
    name: "ribbon",
    path: "./particles/1.png",
  },
];

loadTextures(ribbonArray)
  .then((t) => initScene(t))
  .catch((e) => console.log("error---------", e));
