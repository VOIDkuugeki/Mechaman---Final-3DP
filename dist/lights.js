import * as THREE from 'three';

const createDirectionalLight = () => {
  const color = 0xffffff;
  const directionalLight = new THREE.DirectionalLight(color);
  directionalLight.intensity = 2;
  directionalLight.castShadow = true;
  directionalLight.position.set(10, 10, 10);

  return directionalLight;
};

const createPointLight = () => {
  const color = 0xffffff;
  const pointLight = new THREE.PointLight(color, 100);
  pointLight.position.set(-2, 5, 0);
  pointLight.castShadow = true;
  pointLight.distance = 100;

  return pointLight;
};

export { createDirectionalLight, createPointLight };
