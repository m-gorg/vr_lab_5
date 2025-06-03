import './style.css'

import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

let camera, scene, renderer;
let torusMesh, tubeMesh, extrudeMesh; 
let controls;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    // Сцена
    scene = new THREE.Scene();

    // Камера
    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    // Об'єкт рендерингу
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

    // 2. Створюємо об'єкт Torus Knot
    const torusGeometry = new THREE.TorusKnotGeometry(0.35, 0.15, 100, 16);
    // Матеріал для другого
    const torusMaterial = new THREE.MeshPhysicalMaterial({
        color: 0x0000ff, 
        emissive: 0x00aa00, 
        emissiveIntensity: 0.5, 
        metalness: 1,
        roughness: 1,
        clearcoat: 1
    });
    // Створюємо наступний меш
    torusMesh = new THREE.Mesh(torusGeometry, torusMaterial);
    torusMesh.position.x = -1.5
    torusMesh.position.z = -1.5
    scene.add(torusMesh);

    class CustomSinCurve extends THREE.Curve {

	constructor( scale = 1 ) {
		super();
		this.scale = scale;
	}

	getPoint( t, optionalTarget = new THREE.Vector3() ) {

		const tx = t * 3 - 1.5;
		const ty = Math.sin( 2 * Math.PI * t ) * 2;
		const tz = 0;

		return optionalTarget.set( tx, ty, tz ).multiplyScalar( this.scale );
        }
    }

    const path = new CustomSinCurve(0.2);
    const tubeGeometry = new THREE.TubeGeometry(path, 256, 0.12, 16, false);

    const tubeMaterial = new THREE.MeshPhysicalMaterial({
        side: THREE.DoubleSide,
        color: 0xff5500,
        metalness: 1,
        roughness: 0.3,
    });

    tubeMesh = new THREE.Mesh(tubeGeometry, tubeMaterial);
    tubeMesh.position.z = -1.5
    scene.add( tubeMesh );

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
    
    const extrudeMaterial = new THREE.MeshPhysicalMaterial( {
        color: 0xff8888,
        transparent: true,
        opacity: 0.5,
        roughness: 0,
        clearcoat: 1,
    } );

    extrudeMesh = new THREE.Mesh( extrudeGeometry, extrudeMaterial ) ;
    extrudeMesh.position.x = 1
    extrudeMesh.position.z = -1.5

    scene.add( extrudeMesh );
    
    // Позиція для камери
    camera.position.z = 3;

    // Контролери для 360 огляду на вебсторінці, але не під час AR-сеансу
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    document.body.appendChild(ARButton.createButton(renderer));

    window.addEventListener('resize', onWindowResize, false);
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

function render() {
    rotateObjects();
    renderer.render(scene, camera);
}
    
function rotateObjects() {
    torusMesh.rotation.x = torusMesh.rotation.x - 0.005;
    tubeMesh.rotation.x = tubeMesh.rotation.x - 0.005;
    extrudeMesh.rotation.x = extrudeMesh.rotation.x - 0.005
}