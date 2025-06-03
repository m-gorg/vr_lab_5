import './style.css'

import * as THREE from "three"
import { ARButton } from "three/addons/webxr/ARButton.js"
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

let camera, scene, renderer;
let loader;
let model;

init();
animate();

function init() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    scene = new THREE.Scene();

    camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.01, 40);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.outputEncoding = THREE.sRGBEncoding;

    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.xr.enabled = true; // Не забуваємо про цей рядок коду.
    container.appendChild(renderer.domElement);

    const directionalLight = new THREE.DirectionalLight(0xffffff, 2); 
    directionalLight.position.set(5, 5, 5);
    scene.add(directionalLight);

    const ambientLight = new THREE.AmbientLight(0xffffff, 2); 
    scene.add(ambientLight);
    
    // Додаємо GLTF модель на сцену
    const modelUrl = 'https://vr-lab-5.s3.eu-north-1.amazonaws.com/scene.gltf?response-content-disposition=inline&X-Amz-Content-Sha256=UNSIGNED-PAYLOAD&X-Amz-Security-Token=IQoJb3JpZ2luX2VjEA8aCmV1LW5vcnRoLTEiRjBEAiByZLvFY%2FGkHMO0yaznJcWtCftg5eDauqdWZdiSXx5ePwIgKF%2BKYj2mnVyim8mCNdUkKdj7qG6koELxNZEtYTbRAfwqvgMI2P%2F%2F%2F%2F%2F%2F%2F%2F%2F%2FARAAGgw4MDg5NTM0MjA4NDEiDGllnyn2fTf6bSVd9yqSA5tv898Y1yXz6esu%2BOYfoIJyNhXf4AffAwX5q48vkI4bYLNelWVHSdeV%2FckbVqnBMq1eqK%2FMluKzLyZy9Revw2zAQCVS426EkChk%2B6K9PsRxQMONDGkr0P%2FHIhKavikWy%2Fo3NPBWqw2bQhaY29vN0dsHs9l%2BNwZaJZG9Coe9P3LKTh7OZJMIIyMomYDD1ccOL3Y6rqW0%2BXAsoSAU7%2B5I6W0BwT42zU%2Ba%2BjCDiT9HQye4xg1hDPb0oc4Z3Pgpb5UHndxBe%2FAbkDmkhVr20cGHqjcWAafA3yeoYyKK838SJ8ll85iqP534nLojqPlTfeiT5Xyd%2Ft6X7UUibyNLwYQ%2BHxAaCrulz%2Bdah0ZsBb8thZzvJcDQ44917emohMHnlXkCCmXxEdrpXiPN0wlU1%2Br1ZeXqqwKEkN6SeHifLu0HvP9e3V8Qh2oD2xapKDPLLsgzLgDkFro5OpX2lpG1rEcCU4NHbdAJ4c8o1zZLYOhjNXKCgu7Jm7VGiW1PNkbw4Uf30F6tGbw3%2BhIuRohnH%2BcehSO9RjDpzPHBBjrfAhNIGPV%2FT6GFc7KTZuKuKeKMb2DBks6zkiWWxho1QbUgbM3yZ36uzGn1xiPZdtuBCrH2vRoDUX01eZNBKrKi5XbjgE7LZNfFfpXa20zdHIBsiEBp9Q8WPcjwYWqbjVSJ6ZO1grSGqNRctLYICgZ%2BoS98yeORfpSQ35qLJf0SDm5d3qIsBCXCzOryolNEyyskxnhn%2BEIXggllGnYJW6lOMYDyerCnZ5tn4%2Bm7siDCb7aCP%2BZr498GPmmLuz9CCDuzx0qTukiWm02yFoQRcZ2PgT1hIqnEc%2B4MBvkN7gWz4N2V2yHBxcm5jVKjmRIM4yeHEboQLnZgt4bWAa8%2FB1QB5uYNFBNTfz1uSXK1oxNUCyCDTwyFVvFK3pw%2FPOtQfMuqXFRK5dy%2FuzbnM90UwOBfMGJkcmaOGKRt5dMn6Xxw%2FZx3zl3CQbkSfXXuMavxDHr88tUsBpEwgA08qh%2BPq%2FeTWw%3D%3D&X-Amz-Algorithm=AWS4-HMAC-SHA256&X-Amz-Credential=ASIA3YWLBTQUVNALWRCZ%2F20250601%2Feu-north-1%2Fs3%2Faws4_request&X-Amz-Date=20250601T150004Z&X-Amz-Expires=43200&X-Amz-SignedHeaders=host&X-Amz-Signature=f879ba2abe626993672d25baec6323909968ca37423047b648ed84e0357654a1'


    // Створюємо завантажувач
    loader = new GLTFLoader();
	loader.load(
        modelUrl,
        function (gltf) {
            model = gltf.scene;
            model.position.z = -1;
            scene.add(model);

            // Створюємо матеріал для моделі (якщо потрібно)
            // const goldMaterial = new THREE.MeshStandardMaterial({
            //     color: 0xffd700, // Золотий колір
            //     metalness: 1,
            //     roughness: 0.1,
            // });
            
            // Змінюємо модель (якщо потрібно)
            // model.traverse((child) => {
            //     if (child.isMesh) {
            //         child.material = goldMaterial;
            //         child.material.needsUpdate = true;
            //     }
            // });

            console.log("Model added to scene");
        },

        function (xhr) {
            // console.log((xhr.loaded / xhr.total * 100) + '% loaded' );
        },

        function (error) {
            console.error(error);
        }
    );

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
}

function render() {
    rotateModel();
    renderer.render(scene, camera);
}
    
let degrees = 0; // кут для оберту нашої моделі
    
function rotateModel() {
    if (model !== undefined) {
        // допустима межа градусів - від 0 до 360
        // Після 360 three.js сприйматиме 360 як 0, 361 як 1, 362 як 2 і так далі
        degrees = degrees + 0.2; 
        model.rotation.x = THREE.MathUtils.degToRad(degrees); // тут перетворюємо градуси у радіани
    } 
}