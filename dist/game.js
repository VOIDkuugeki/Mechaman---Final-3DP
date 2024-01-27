import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { loadHall, loadFloor } from './stage.js';
import { PlayerInfo } from './playerInfo.js';
import { disposeBullet } from './bullet.js';
import { playershotAudio, mobshotAudio, boosterAudio, victoryAudio, defeatAudio } from './sounds.js';

export function loadingGame(scene, camera, renderer) {

    // Load stage
    const hall = loadHall(scene);
    const floor = loadFloor(scene);

    scene.add(hall);
    scene.add(floor);


    // PLAYER
    let mixer;
    let defaultAction, idleAction, shootingAction;
    let backwardStartAction, backwardOngoingAction, backwardStopAction, backwardShootingAction;
    let forwardStartAction, forwardOngoingAction, forwardStopAction, forwardShootingAction;
    let defeatAction, victoryAction;

    const createAnimatedPlayer = () => {
        const gltfLoader = new GLTFLoader();

        const playerMesh = new THREE.Object3D();

        gltfLoader.load('Model/Character/main_anim.gltf', (gltf) => {
            const model = gltf.scene;

            model.scale.set(0.1, 0.1, 0.1);

            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });

            const clips = gltf.animations;
            mixer = new THREE.AnimationMixer(model);

            // DEFAULT ANIMATION
            defaultAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Default'));
            // defaultAction.play();

            // IDLE ANIMATION
            idleAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Idle'));
            // idleAction.loop= THREE.LoopOnce;
            idleAction.play();

            // SHOOTING ANIMATION
            shootingAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Shooting stance'));
            shootingAction.loop = THREE.LoopOnce;

            // BACKWARD ANIMATION
            backwardStartAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Fly backward - Starting'));
            backwardStartAction.loop = THREE.LoopOnce;
            backwardStartAction.timeScale = 0.5;
            backwardOngoingAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Fly backward - Ongoing'));
            backwardStopAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Fly backward - Stop'));
            backwardStopAction.loop = THREE.LoopOnce;
            backwardShootingAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Fly backward - Shooting'));
            backwardShootingAction.loop = THREE.LoopOnce;

            // FORWARD ANIMATION
            forwardStartAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Fly forward - Starting'));
            forwardStartAction.loop = THREE.LoopOnce;
            forwardStartAction.timeScale = 0.5;
            forwardOngoingAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Fly forward - Ongoing'));
            forwardStopAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Fly forward - Stop'));
            forwardStopAction.loop = THREE.LoopOnce;
            forwardShootingAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Fly forward - Shooting'));
            forwardShootingAction.loop = THREE.LoopOnce;

            // VICTORY ANIMATION
            victoryAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Victory'));

            // DEFEAT ANIMATION
            defeatAction = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Man Im ded'));

            mixer.addEventListener('finished', function (e) {
                var clipName = e.action._clip.name;

                switch (clipName) {
                    case 'Fly backward - Starting':
                        mixer.stopAllAction();
                        backwardOngoingAction.play();
                        break;
                    case 'Fly forward - Starting':
                        mixer.stopAllAction();
                        forwardOngoingAction.play();
                        break;
                    case 'Fly backward - Ongoing':
                        break;
                    case 'Fly forward - Ongoing':
                        break;
                    case 'Fly backward - Shooting':
                        mixer.stopAllAction();
                        backwardOngoingAction.play();
                        break;
                    case 'Fly forward - Shooting':
                        mixer.stopAllAction();
                        forwardOngoingAction.play();
                        break;
                    case 'Victory':
                        break;
                    case 'Man Im ded':
                        break;
                    default:
                        mixer.stopAllAction();
                        defaultAction.play();
                        break;
                }
            });

            playerMesh.add(model);
            playerMesh.position.set(0, 0.3, 3.75);
        });

        scene.add(playerMesh);

        return playerMesh;
    };

    var player = createAnimatedPlayer();
    player.rotation.set(0, Math.PI, 0);

    const clock = new THREE.Clock();

    var playerInfo = new PlayerInfo();

    // CONTROL
    var goal, keys, follow;

    var temp = new THREE.Vector3;
    var dir = new THREE.Vector3;
    var a = new THREE.Vector3;
    var b = new THREE.Vector3
    var coronaSafetyDistance = 2;
    var goalDistance = coronaSafetyDistance;
    var velocity = 0.0;
    var speed = 0.0;
    var normalSpeed = 0.02;
    var boostedSpeed = 0.07;
    var isBoosted = false;

    camera.lookAt(player.position);


    goal = new THREE.Object3D;
    follow = new THREE.Object3D;
    follow.position.z = -coronaSafetyDistance;
    player.add(follow);

    goal.add(camera);
    scene.add(player);


    // IDLE COUNT
    // let idleTimer;
    // const idleTimeout = 10; // 10 seconds

    // function resetIdleTimer() {
    //     idleTimer = clock.getElapsedTime();
    // }

    keys = {
        a: false,
        s: false,
        d: false,
        w: false,
        space: false
    };

    // Function to check if specific animations are playing
    function isBackwardAnimationPlaying() {
        return (
            backwardStartAction.isRunning() ||
            backwardOngoingAction.isRunning() ||
            backwardStopAction.isRunning()
        );
    }

    function isForwardAnimationPlaying() {
        return (
            forwardStartAction.isRunning() ||
            forwardOngoingAction.isRunning() ||
            forwardStopAction.isRunning()
        );
    }

    // KEY DOWN
    document.body.addEventListener('keydown', function (e) {
        // resetIdleTimer();

        var key = e.code.replace('Key', '').toLowerCase();

        if (keys[key] !== undefined) {
            keys[key] = true;

            // Play Backward Animation when key S is pressed
            if (e.code === 'KeyS' && !isBackwardAnimationPlaying()) {
                // mixer.stopAllAction();
                backwardStartAction.play();
            }

            // Play Backward Animation when key W is pressed
            if (e.code === 'KeyW' && !isForwardAnimationPlaying()) {
                // mixer.stopAllAction();
                forwardStartAction.play();
            }

            // Check if the spacebar is pressed
            if (e.code === 'Space') {
                // Boost the speed when the spacebar is pressed
                boosterAudio.play();
                isBoosted = true;
            }
        }
    });

    // KEY UP
    document.body.addEventListener('keyup', function (e) {
        var key = e.code.replace('Key', '').toLowerCase();

        if (keys[key] !== undefined) {
            keys[key] = false;

            // Check if the spacebar is released
            if (e.code === 'Space') {
                // Return to normal speed when the spacebar is released
                isBoosted = false;
            }

            // Stop animation
            if (e.code === 'KeyS') {
                mixer.stopAllAction();
                backwardStopAction.play();
            }
            if (e.code === 'KeyW') {
                mixer.stopAllAction();
                forwardStopAction.play();
            }
        }
    });

    // Update Control
    function updateControl(speed) {
        speed = 0.0;

        if (keys.w) {
            speed = isBoosted ? boostedSpeed : normalSpeed;
        } else if (keys.s) {
            speed = isBoosted ? -boostedSpeed : -normalSpeed;
        }

        velocity += (speed - velocity) * 0.3;
        player.translateZ(velocity);

        if (keys.a)
            player.rotateY(0.01);
        else if (keys.d)
            player.rotateY(-0.01);

        // Set boundary
        player.position.x = Math.max(-2.7, Math.min(2.7, player.position.x));
        player.position.z = Math.max(-34, Math.min(4.0, player.position.z));


        let dis = a.distanceTo(b) - goalDistance;

        goal.position.addScaledVector(dir, dis);
        temp.setFromMatrixPosition(follow.matrixWorld);
        goal.position.lerp(temp, 0.02);


        var lookAtPoint = new THREE.Vector3();
        lookAtPoint.copy(player.position).add(new THREE.Vector3(0, 1.25, 0)); // Adjust the values based on your scene

        camera.lookAt(lookAtPoint);
    }


    // MOBS

    const createAnimatedMob2 = () => {
        const gltfLoader = new GLTFLoader();

        const mob = new THREE.Object3D();
        mob.hp = 5;
        mob.mixer = null;
        mob.idleM2Action = null;
        mob.shootingM2Action = null;
        mob.deadM2Action = null;
        mob.canShoot = true;

        gltfLoader.load('Model/Mob/mob2_anim.gltf', (gltf) => {
            const model = gltf.scene;
            model.position.y = 0.5;
            model.scale.set(0.1, 0.1, 0.1);
            model.rotation.set(0, Math.PI, 0);

            model.traverse((node) => {
                if (node.isMesh) {
                    node.castShadow = true;
                }
            });

            const clips = gltf.animations;
            mob.mixer = new THREE.AnimationMixer(model);

            // MOVING ANIMATION
            mob.movingM2Action = mob.mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Moving'));
            // mob.movingM2Action.play();

            // IDLE ANIMATION
            mob.idleM2Action = mob.mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Idle'));
            // mob.idleM2Action.loop = THREE.LoopOnce;
            // mob.idleM2Action.play();

            // SHOOTING ANIMATION
            mob.shootingM2Action = mob.mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Shooting'));
            mob.shootingM2Action.loop = THREE.LoopOnce;

            // DEAD ANIMATION
            mob.deadM2Action = mob.mixer.clipAction(THREE.AnimationClip.findByName(clips, 'Dead'));
            mob.deadM2Action.loop = THREE.LoopOnce;

            mob.add(model);
        });

        scene.add(mob);

        return mob;
    };


    // SPAWN MOBS
    const mobs = [];
    const numBeginMobs = 7;

    function getRandomInRange(min, max) {
        return Math.random() * (max - min) + min;
    }

    function spawnMobs() {
        for (let i = 0; i < numBeginMobs; i++) {
            const mob = createAnimatedMob2();
            mob.position.set(
                getRandomInRange(-2, 2),
                0.5,
                getRandomInRange(-30, -12)
            );

            mobs.push(mob);
        }
    }

    spawnMobs();

    // Update mobs
    function updateMobs() {
        for (let i = 0; i < mobs.length; i++) {
            const mob = mobs[i];


            // For now, let's make mobs idle
            if (mob.mixer) {
                mob.mixer.update(clock.getDelta());
            }
        }
    }

    var spotDis = 5;
    const mobBullets = [];

    function isPlayerInRange(mob, distance) {
        return player.position.distanceTo(mob.position) < distance;
    }

    function updateMobsAndInteractions() {
        updateMobs();

        // Look at the player before shooting
        for (let i = 0; i < mobs.length; i++) {
            const mob = mobs[i];
            if (isPlayerInRange(mob, 5)) {
                mob.lookAt(player.position);
            }
        }

        // Check if the player is within shooting distance
        for (let i = 0; i < mobs.length; i++) {
            const mob = mobs[i];

            if (isPlayerInRange(mob, spotDis)) {
                // Player is within shooting distance, trigger shooting animation for the mob
                if (mob.shootingM2Action) {
                    mob.mixer.stopAllAction();
                    mob.shootingM2Action.play();
                }

            } else {
                if (mob.idleM2Action) {
                    mob.mixer.stopAllAction();
                    mob.movingM2Action.play();
                }
            }
        }
    }




    // BULLET
    var bullets = [];
    var lastShotTime = 0;
    var shootDelay = 300; // Delay 0.3s between shoots

    function createBullet() {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('Material/Bullet/bullet.png');

        // Create a material with the texture
        const material = new THREE.PointsMaterial({
            map: texture,
            size: 1,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            opacity: 0.7,
        });

        // Create a point geometry
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([0, 0, 0]); // single point at the origin
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Create points with the geometry and material
        const points = new THREE.Points(geometry, material);

        return points;
    }

    var bullet = createBullet();

    // SHOOT
    function shootEvent(bullet) {

        // Check playing Animations
        switch (true) {
            case isForwardAnimationPlaying():
                mixer.stopAllAction();
                forwardShootingAction.play();
                break;
            case isBackwardAnimationPlaying():
                mixer.stopAllAction();
                backwardShootingAction.play();
                break;
            default:
                mixer.stopAllAction();
                shootingAction.play();
                break;
        }

        // Play the gunshot audio
        playershotAudio.play();

        var currentTime = Date.now();

        // Check if enough time has passed since the last shot
        if (currentTime - lastShotTime < shootDelay) {
            return; // Do not shoot if the delay hasn't passed
        }

        lastShotTime = currentTime;

        bullet.alive = true;
        bullet.position.set(
            player.position.x,
            player.position.y + 0.85,
            player.position.z,
        );

        bullet.velocity = new THREE.Vector3(
            -Math.sin(player.rotation.y),
            0,
            -Math.cos(player.rotation.y) * Math.cos(player.rotation.x)
        );

        scene.add(bullet);

        bullets.push(bullet);

        // Set a timeout to remove the bullet after a certain time
        setTimeout(function () {
            bullet.alive = false;
            scene.remove(bullet);
        }, 1000);
    }

    let canShoot = true;

    document.addEventListener('mousedown', function (event) {
        // resetIdleTimer();

        if (event.button === 0 && canShoot) {
            shootEvent(bullet);
            canShoot = false;

            setTimeout(function () {
                canShoot = true;
            }, 500); // CD 0.5s
        }
    });

    // Update bullets
    function updateBullets(bullets) {
        for (var index = 0; index < bullets.length; index += 1) {
            if (bullets[index] === undefined) continue;
            if (bullets[index].alive == false) {
                disposeBullet(bullets[index]);
                bullets.splice(index, 1);
                continue;
            }

            bullets[index].position.sub(bullets[index].velocity);
        }
    }

    function checkBulletMobCollision() {
        for (let i = 0; i < bullets.length; i++) {
            const bullet = bullets[i];

            for (let j = 0; j < mobs.length; j++) {
                const mob = mobs[j];

                // Check if the bullet and mob intersect
                if (bullet.position.distanceTo(mob.position) < 1.0) {
                    // Bullet hit the mob
                    mob.hp -= 1;

                    // Remove bullet
                    bullet.alive = false;
                    scene.remove(bullet);

                    // Check if mob's HP is zero, remove mob
                    if (mob.hp <= 0) {
                        scene.remove(mob);
                        mobs.splice(j, 1);
                    }

                    return; // Exit after handling the first collision per frame
                }
            }
        }
    }

    // function checkIdling() {
    //     // Check if idle timer exceeds the timeout
    //     if (idleTimer - clock.getElapsedTime() > idleTimeout) {
    //         if (!idleAction.isRunning()) {
    //             mixer.stopAllAction();
    //             idleAction.play();
    //         }
    //     }
    // }


    // BULLET FOR MOBS
    function createMobBullet() {
        const textureLoader = new THREE.TextureLoader();
        const texture = textureLoader.load('Material/Bullet/mob_bullet.png');

        // Create a material with the texture
        const material = new THREE.PointsMaterial({
            map: texture,
            size: 1,
            blending: THREE.AdditiveBlending,
            depthTest: false,
            transparent: true,
            opacity: 0.7,
        });

        // Create a point geometry
        const geometry = new THREE.BufferGeometry();
        const vertices = new Float32Array([0, 0, 0]); // single point at the origin
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));

        // Create points with the geometry and material
        const points = new THREE.Points(geometry, material);

        return points;
    }

    // Function to shoot from mobs
    function mobShootEvent(mob, mobBullet) {

        if (mob.canShoot) {
            mobshotAudio.play();

            mob.shootingM2Action.play();

            const mobBulletClone = mobBullet.clone();
            mobBulletClone.alive = true;
            mobBulletClone.position.copy(mob.position);

            // Decrease the velocity by multiplying with a factor (adjust as needed)
            const velocityFactor = 0.5;
            mobBulletClone.velocity = new THREE.Vector3(
                -Math.sin(mob.rotation.y) * velocityFactor,
                0,
                -Math.cos(mob.rotation.y) * velocityFactor
            );

            scene.add(mobBulletClone);

            mobBullets.push(mobBulletClone);

            // Set a timeout to remove the bullet after a certain time
            setTimeout(function () {
                mobBulletClone.alive = false;
                scene.remove(mobBulletClone);
            }, 1000);

            // Set cooldown (adjust as needed)
            mob.canShoot = false;
            setTimeout(function () {
                mob.canShoot = true;
            }, 2000); // Cooldown period (2 seconds in this example)
        }
    }

    // Update mob bullets
    function updateMobBullets(bullets) {
        for (let index = 0; index < bullets.length; index += 1) {
            if (bullets[index] === undefined) continue;
            if (bullets[index].alive == false) {
                disposeBullet(bullets[index]);
                bullets.splice(index, 1);
                continue;
            }

            bullets[index].position.sub(bullets[index].velocity);
        }
    }

    // Update mob bullets and check for collisions with the player
    function updateMobBulletsAndCollisions() {
        updateMobBullets(mobBullets);

        // Check if mob bullets collide with the player
        for (let i = 0; i < mobBullets.length; i++) {
            const mobBullet = mobBullets[i];

            // Check if the bullet and player intersect
            if (mobBullet.position.distanceTo(player.position) < 0.5) {
                playerInfo.hit();

                // Remove bullet
                mobBullet.alive = false;
                scene.remove(mobBullet);
            }
        }
    }


    function updateMobsInteractionsAndBullets() {
        updateMobsAndInteractions();

        // Shoot bullets from mobs
        for (let i = 0; i < mobs.length; i++) {
            const mob = mobs[i];
            const mobBullet = createMobBullet();

            if (isPlayerInRange(mob, 5)) {
                // Player is within shooting distance, trigger shooting animation for the mob
                mobShootEvent(mob, mobBullet);
            }
        }
    }


    function animate() {

        requestAnimationFrame(animate);

        if (mixer)
            mixer.update(clock.getDelta());


        updateControl(speed);
        updateBullets(bullets);
        updateMobsInteractionsAndBullets();
        updateMobBulletsAndCollisions();
        // checkIdling();

        // console.log(idleTimer);
        checkBulletMobCollision();

        // Check for game over condition
        if (playerInfo.getHealth() <= 0) {
            setTimeout(() => {
                showGameOverScreen();
            }, 1000);
            return;
        }

        // Check for victory condition
        if (mobs.length === 0) {
            setTimeout(() => {
                showVictoryScreen();
            }, 1000);
            return;
        }
        renderer.render(scene, camera);
    }

    animate();

    function showGameOverScreen() {
        mixer.stopAllAction();
        defeatAction.play();
        defeatAudio.play();
        document.getElementById('gameOverScreen').style.display = 'block';
    }
    
    // Show victory screen
    function showVictoryScreen() {
        // Play victory animation here (you may need to adjust this part)
        if (victoryAction) {
            mixer.stopAllAction();
            victoryAction.play();
            victoryAudio.play();
        }
    
        document.getElementById('victoryScreen').style.display = 'block';
    }
};