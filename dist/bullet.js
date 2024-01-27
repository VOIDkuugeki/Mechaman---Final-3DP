import * as THREE from 'three';
import { scene } from './main.js';

var bullet = new THREE.Mesh(
    new THREE.SphereGeometry(0.5, 8, 8),
    new THREE.MeshBasicMaterial({color:0xffffff})
)


function disposeBullet(bullet) {
    bullet.geometry.dispose();
    bullet.material.dispose();
    scene.remove( bullet );
}


export { disposeBullet }