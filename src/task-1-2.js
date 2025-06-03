import * as THREE from "three";
import { ARButton } from "three/addons/webxr/ARButton.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

class CustomSinCurve extends THREE.Curve {

  constructor( scale = 1 ) {
    super();
    this.scale = scale;
  }

  getPoint( t, optionalTarget = new THREE.Vector3() ) {

    const tx = t * 4 - 1.5;
    const ty = Math.sin( 2 * Math.PI * t ) * 3;
    const tz = 0;

    return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
    }
  }

const tubePath = new CustomSinCurve(0.2);


let camera, scene, renderer;
let torusMesh, tubeMesh, extrudeMesh;
let controls;
let particles; // Special Effect
let hue = 0;

// Стани анімацій
let rotationEnabled = true;
let pulseMoveEnabled = true;
let colorEmitEnabled = true;
let speedMode = "normal";
let texturesEnabled = true;
let rotationDirection = 1; // 1: Вперед; -1: Назад
let specialEffectActive = false;
let specialEffectTimer = 0;

// Матеріали з текстурами та без текстур
let torusMaterial, torusMaterialNoTexture;
let extrudeMaterial, extrudeMaterialNoTexture;
let tubeMaterial, tubeMaterialNoTexture;

init();
animate();

function init() {
  const container = document.createElement("div");
  document.body.appendChild(container);

  // Сцена
  scene = new THREE.Scene();

  // Камера
  camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

  // Рендеринг
  renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.xr.enabled = true; // Життєво важливий рядок коду для вашого застосунку!
  container.appendChild(renderer.domElement);

  // Світло
  const directionalLight = new THREE.DirectionalLight(0xffffff, 4);
  directionalLight.position.set(3, 3, 3);
  scene.add(directionalLight);

  const pointLight = new THREE.PointLight(0xffffff, 10, 10);
  pointLight.position.set(-2, 2, 2);
  scene.add(pointLight);

  const ambientLight = new THREE.AmbientLight(0xffffff, 1.2);
  scene.add(ambientLight);

  // Завантаження текстур
  const textureLoader = new THREE.TextureLoader();
  const snakeTexture = textureLoader.load(
    "/textures/snake.jpg"
  );
  const pipeTexture = textureLoader.load(
    "/textures/pipe.jpg"
  );
  const brickTexture = textureLoader.load(
    "/textures/brick.jpg"
  );

  // TORUS

  const torusGeometry = new THREE.TorusKnotGeometry(0.35, 0.15, 100, 16);
  torusMaterial = new THREE.MeshPhysicalMaterial({
    map: snakeTexture,
    transparent: true,
    opacity: 0.7,
    roughness: 0.5,
    metalness: 0.3,
    transmission: 0.6,
  });
  torusMaterialNoTexture = new THREE.MeshPhysicalMaterial({
      color: 0x0000ff, 
      emissive: 0x00aa00, 
      emissiveIntensity: 0.5, 
      metalness: 1,
      roughness: 1,
      clearcoat: 1
  });
  torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
  torusMesh.position.set(-1.5, 0, -5);
  scene.add(torusMesh);

  // TUBE 
  
  const tubeGeometry = new THREE.TubeGeometry(tubePath, 256, 0.16, 16, false);

  tubeMaterial = new THREE.MeshStandardMaterial({
    side: THREE.DoubleSide,
    map: pipeTexture,
    metalness: 0.8,
    roughness: 0.2,
  })
  tubeMaterialNoTexture = new THREE.MeshStandardMaterial({
      side: THREE.DoubleSide,
      color: 0xff5500,
      metalness: 1,
      roughness: 0.3,
  });

  
  tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
  tubeMesh.position.set(0, 0, -5);
  scene.add(tubeMesh);

  // EXTRUDE

  extrudeMaterial = new THREE.MeshStandardMaterial({
    map: brickTexture,
    emissive: 0xff0000,
    emissiveIntensity: 0,
    metalness: 0,
    roughness: 1,
  });

  extrudeMaterialNoTexture = new THREE.MeshPhysicalMaterial({
      color: 0xff8888,
      transparent: true,
      // opacity: 0.5,
      roughness: 0,
      clearcoat: 1,
  });

  const length = 0.4, width = 0.4;

  const shape = new THREE.Shape();
  shape.moveTo(-length / 2, -width / 2);
  shape.lineTo(-length / 2, width / 2);
  shape.lineTo(length / 2, width / 2);
  shape.lineTo(length / 2, -width / 2);
  shape.lineTo(-length / 2, -width / 2);

  const extrudeSettings = {
      steps: 2,
      depth: 0.5,
      bevelEnabled: true,
      bevelThickness: 0.2,
      bevelSize: 0.1,
      bevelOffset: 0,
      bevelSegments: 64
  };

  const extrudeGeometry = new THREE.ExtrudeGeometry( shape, extrudeSettings );

  extrudeMesh = new THREE.Mesh(extrudeGeometry, extrudeMaterial);
  extrudeMesh.position.set(1.5, 0, -5);


  extrudeMesh.material.map.wrapS = THREE.RepeatWrapping;
  extrudeMesh.material.map.wrapT = THREE.RepeatWrapping;


  scene.add(extrudeMesh);

  // Special Effect
  createParticles();

  // Позиція камери
  camera.position.z = 3;

  // Контролери для 360 огляду на вебсторінці
  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  // Налаштування AR-режиму
  const button = ARButton.createButton(renderer, {
    onSessionStarted: () => {
      renderer.domElement.style.background = "transparent";
      document.getElementById("controls").style.display = "flex";
    },
    onSessionEnded: () => {
      document.getElementById("controls").style.display = "flex";
    },
  });
  document.body.appendChild(button);
  renderer.domElement.style.display = "block";

  // Додаємо Listener для кнопок
  document
    .getElementById("toggleRotationBtn")
    .addEventListener("click", toggleRotation);
  document
    .getElementById("togglePulseBtn")
    .addEventListener("click", togglePulseMove);
  document
    .getElementById("toggleColorBtn")
    .addEventListener("click", toggleColorEmit);
  document
    .getElementById("toggleSpeedBtn")
    .addEventListener("click", toggleSpeed);
  document
    .getElementById("toggleTexturesBtn")
    .addEventListener("click", toggleTextures);
  document
    .getElementById("toggleDirectionBtn")
    .addEventListener("click", toggleDirection);
  document
    .getElementById("specialEffectBtn")
    .addEventListener("click", triggerSpecialEffect);

  window.addEventListener("resize", onWindowResize, false);
}

// Special Effect
function createParticles() {
  const particleGeometry = new THREE.BufferGeometry();
  const particleCount = 300;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  for (let i = 0; i < particleCount; i++) {
    positions[i * 3] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
    positions[i * 3 + 2] = (Math.random() - 0.5) * 10 - 8;

    colors[i * 3] = Math.random();
    colors[i * 3 + 1] = Math.random();
    colors[i * 3 + 2] = Math.random();
  }

  particleGeometry.setAttribute(
    "position",
    new THREE.BufferAttribute(positions, 3)
  );
  particleGeometry.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const particleMaterial = new THREE.PointsMaterial({
    size: 0.1,
    vertexColors: true,
    transparent: true,
    opacity: 0,
  });

  particles = new THREE.Points(particleGeometry, particleMaterial);
  scene.add(particles);
}

function toggleRotation() {
  rotationEnabled = !rotationEnabled;
  document.getElementById("toggleRotationBtn").textContent = rotationEnabled
    ? "Disable Rotation"
    : "Enable Rotation";
}

function togglePulseMove() {
  pulseMoveEnabled = !pulseMoveEnabled;
  document.getElementById("togglePulseBtn").textContent = pulseMoveEnabled
    ? "Disable Pulse/Move"
    : "Enable Pulse/Move";
}

function toggleColorEmit() {
  colorEmitEnabled = !colorEmitEnabled;
  document.getElementById("toggleColorBtn").textContent = colorEmitEnabled
    ? "Disable Color/Emit"
    : "Enable Color/Emit";
}

function toggleSpeed() {
  speedMode = speedMode === "normal" ? "fast" : "normal";
  document.getElementById("toggleSpeedBtn").textContent = `Speed: ${
    speedMode.charAt(0).toUpperCase() + speedMode.slice(1)
  }`;
}

function toggleTextures() {
  texturesEnabled = !texturesEnabled;
  document.getElementById("toggleTexturesBtn").textContent = texturesEnabled
    ? "Disable Textures"
    : "Enable Textures";

  torusMesh.material = texturesEnabled
    ? torusMaterial
    : torusMaterialNoTexture;
  tubeMesh.material = texturesEnabled ? tubeMaterial : tubeMaterialNoTexture;
  extrudeMesh.material = texturesEnabled
    ? extrudeMaterial
    : extrudeMaterialNoTexture;

  torusMesh.material.needsUpdate = true;
  tubeMesh.material.needsUpdate = true;
  extrudeMesh.material.needsUpdate = true;
}

function toggleDirection() {
  rotationDirection *= -1;
  document.getElementById("toggleDirectionBtn").textContent =
    rotationDirection === 1 ? "Direction: Forward" : "Direction: Backward";
}

function triggerSpecialEffect() {
  specialEffectActive = true;
  specialEffectTimer = 0;
  particles.material.opacity = 1;
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.setAnimationLoop(render);
  controls.update();
}

function render(timestamp) {
  animateObjects(timestamp);
  renderer.render(scene, camera);
}

function animateObjects(timestamp) {
  const speed = speedMode === "normal" ? 1 : 2;
  const specialSpeed = specialEffectActive ? 3 : 1;

  // Анімація додекаедра
  if (rotationEnabled) {
    torusMesh.rotation.y -=
      0.01 * speed * rotationDirection * specialSpeed;
  }
  if (pulseMoveEnabled) {
    const scale = 1 + 0.2 * Math.sin(timestamp * 0.002 * speed * specialSpeed);
    torusMesh.scale.set(scale, scale, scale);
    torusMesh.position.y =
      0.5 * Math.sin(timestamp * 0.002 * speed * specialSpeed);
    torusMesh.material.opacity =
      0.5 + 0.2 * Math.sin(timestamp * 0.003 * speed * specialSpeed);
  }

  // TUBE ANIMATION
  if (rotationEnabled) {
    tubeMesh.rotation.x -= 0.01 * speed * rotationDirection * specialSpeed;
  }
  if (pulseMoveEnabled) {
    const innerRadius =
      0.4 + 0.1 * Math.sin(timestamp * 0.002 * speed * specialSpeed);
    const outerRadius =
      0.6 + 0.1 * Math.sin(timestamp * 0.002 * speed * specialSpeed);
    tubeMesh.geometry = new THREE.TubeGeometry(tubePath, 256, 0.16, 16, false);
  }
  if (colorEmitEnabled) {
    hue += 0.005 * speed * specialSpeed;
    if (hue > 1) hue = 0;
    tubeMesh.material.color.setHSL(hue, 1, 0.5);
  }

  // EXTRUDE ANIMATION
  if (rotationEnabled) {
    extrudeMesh.rotation.x -=
      0.01 * speed * rotationDirection * specialSpeed;
    extrudeMesh.rotation.y -=
      0.01 * speed * rotationDirection * specialSpeed;
  }
  if (pulseMoveEnabled) {
    const jump =
      Math.abs(Math.sin(timestamp * 0.005 * speed * specialSpeed)) * 0.5;
    extrudeMesh.position.y = jump;
  }
  if (colorEmitEnabled) {
    extrudeMesh.material.emissiveIntensity =
      1.5 + Math.sin(timestamp * 0.003 * speed * specialSpeed);
  }

  // Анімація частинок
  if (specialEffectActive) {
    specialEffectTimer += 0.1 * speed * specialSpeed;
    particles.material.opacity = Math.max(0, 1 - specialEffectTimer / 5);
    if (specialEffectTimer >= 5) {
      specialEffectActive = false;
      particles.material.opacity = 0;
    }
  }
}