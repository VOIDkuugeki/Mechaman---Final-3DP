import * as THREE from 'three';
import { OBJLoader } from 'three/addons/loaders/OBJLoader.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { scene } from './main.js';


// Load Hallway
const loadHall = () => {
  const textureLoader = new THREE.TextureLoader();
  const objectLoader = new OBJLoader();

  const hallMat = new THREE.MeshPhysicalMaterial({
    map: textureLoader.load('Material/Hallway/map_hall.png'),
    normalMap: textureLoader.load('Material/Hallway/normal_map_stage.png'),
    metalness: 0.8,
    metalnessMap: textureLoader.load('Material/Hallway/glossy_map_stage.png'),
    bumpMap: textureLoader.load('Material/Hallway/TCom_Scifi_Panel_512_height.png'),
    roughness: 0.5,
    roughnessMap: textureLoader.load('Material/Hallway/roughness_map_stage.png')
  });

  const hallObject = new THREE.Object3D();

  objectLoader.load('Model/Stage/hall.obj', (object) => {

    object.scale.set(5, 5, 5);
    object.position.set(0, 0.25, 0);

    object.traverse((child) => {
      child.material = hallMat;
    });

    hallObject.add(object);

  });

  return hallObject;
};

const loadFloor = () => {
  const textureLoader = new THREE.TextureLoader();
  const objectLoader = new OBJLoader();

  const floorMat = new THREE.MeshPhysicalMaterial({
    map: textureLoader.load('Material/Floor/map_floor.png'),
    normalMap: textureLoader.load('Material/Floor/normal_map_floor.png'),
    envMap: textureLoader.load('Material/Floor/env_map_floor.png'),
    metalness: 0.5,
    metalnessMap: textureLoader.load('Material/Floor/glossy_map_floor.png'),
    bumpMap: textureLoader.load('Material/Floor/TCom_Scifi_Panel_512_height.png'),
    roughness: 0.5,
    roughnessMap: textureLoader.load('Material/Floor/roughness_map_floor.png')
  });

  const floorObject = new THREE.Object3D();

  objectLoader.load('Model/Stage/floor.obj', (object) => {

    object.scale.set(5, 5, 5);
    object.position.set(0, 0.25, 0);

    object.traverse((child) => {
      child.material = floorMat;
    });

    floorObject.add(object)

  });

  return floorObject;
};


export { loadHall, loadFloor };
