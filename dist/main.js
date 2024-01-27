import * as THREE from 'three';
import { camera } from './camera.js';
import { createDirectionalLight, createPointLight } from './lights.js';
import { loadingGame } from './game.js';

// Create a scene
var scene = new THREE.Scene();

export { scene };

// Create a renderer
var renderer = new THREE.WebGLRenderer({
    alpha: true,
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Create lights
const directionalLight = createDirectionalLight();
const pointLight = createPointLight();

// Add lights to the scene
scene.add(directionalLight);
scene.add(pointLight);

loadingGame(scene, camera, renderer);


// Handle window resize
const onWindowResize = () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
};


window.addEventListener('resize', onWindowResize);


