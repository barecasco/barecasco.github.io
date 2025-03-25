import * as tri from 'three';
// import { FirstPersonControls } from 'three/addons/controls/FirstPersonControls.js';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';



/// ----------------------------------------------------------------------------------------------
/// STAGE
const scene     = new tri.Scene();
const container = document.getElementById('plot-container');
const width     = container.clientWidth;
const height    = container.clientHeight;
const renderer  = new tri.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);


/// ----------------------------------------------------------------------------------------------
/// MAIN CAMERA
const camera         = new tri.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(70, 70, 120);


/// ----------------------------------------------------------------------------------------------
/// CONTROLLER
const controls = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;
// const controls          = new FirstPersonControls( camera, renderer.domElement );
// controls.movementSpeed  = 7;
// controls.lookSpeed      = 0.1;
const clock = new tri.Clock();


/// ----------------------------------------------------------------------------------------------
/// WALLS
// Define boundary walls
let WALL_POSITION = 25;

// const walls1 = new tri.LineSegments(
//     new tri.BufferGeometry(),
//     new tri.LineBasicMaterial({ color: 0x5995f7 })
// );
// const walls2 = new tri.LineSegments(
//     new tri.BufferGeometry(),
//     new tri.LineBasicMaterial({ color: 0x5995f7 })
// );

// // wall vertices (rectangle)
// const wallVertices1 = new Float32Array([
//     // Left wall
//     -WALL_POSITION, -WALL_POSITION, 0,
//     -WALL_POSITION, WALL_POSITION, 0,
//     // Right wall
//     WALL_POSITION, -WALL_POSITION, 0,
//     WALL_POSITION, WALL_POSITION, 0,
//     // Top wall
//     -WALL_POSITION, WALL_POSITION, 0,
//     WALL_POSITION, WALL_POSITION, 0,
//     // Bottom wall
//     -WALL_POSITION, -WALL_POSITION, 0,
//     WALL_POSITION, -WALL_POSITION, 0,
// ]);

// WALL_POSITION = 25.5;

// const wallVertices2 = new Float32Array([
//     // Left wall
//     -WALL_POSITION, -WALL_POSITION, 0,
//     -WALL_POSITION, WALL_POSITION, 0,
//     // Right wall
//     WALL_POSITION, -WALL_POSITION, 0,
//     WALL_POSITION, WALL_POSITION, 0,
//     // Top wall
//     -WALL_POSITION, WALL_POSITION, 0,
//     WALL_POSITION, WALL_POSITION, 0,
//     // Bottom wall
//     -WALL_POSITION, -WALL_POSITION, 0,
//     WALL_POSITION, -WALL_POSITION, 0,
// ]);

// WALL_POSITION = 25;

// walls1.geometry.setAttribute('position', new tri.BufferAttribute(wallVertices1, 3));
// walls2.geometry.setAttribute('position', new tri.BufferAttribute(wallVertices2, 3));
// scene.add(walls1);
// scene.add(walls2);


/// ----------------------------------------------------------------------------------------------
/// GRIDS
const grid_xyd                  = new tri.GridHelper(50, 3);
grid_xyd.position.y              = -WALL_POSITION + 0.1;
grid_xyd.material.opacity        = 0.5;
grid_xyd.material.transparent    = true;
scene.add( grid_xyd );

const grid_xyu                  = new tri.GridHelper(50, 1);
grid_xyu.position.y              = WALL_POSITION;
grid_xyu.material.opacity        = 0.25;
grid_xyu.material.transparent    = true;
scene.add( grid_xyu );

const grid_yzd                  = new tri.GridHelper(50, 3);
grid_yzd.rotation.x              = Math.PI/2;
grid_yzd.position.z             = -WALL_POSITION + 0.1;
grid_yzd.material.opacity       = 0.5;
grid_yzd.material.transparent   = true;
scene.add( grid_yzd );

const grid_yzu                  = new tri.GridHelper(50, 1);
grid_yzu.rotation.x              = Math.PI/2;
grid_yzu.position.z             = WALL_POSITION;
grid_yzu.material.opacity       = 0.25;
grid_yzu.material.transparent   = true;
scene.add( grid_yzu );

const grid_xzd                  = new tri.GridHelper(50, 3);
grid_xzd.rotation.z             = Math.PI/2;
grid_xzd.position.x             = -WALL_POSITION + 0.1;
grid_xzd.material.opacity       = 0.5;
grid_xzd.material.transparent   = true;
scene.add( grid_xzd );

const grid_xzu                  = new tri.GridHelper(50, 1);
grid_xzu.rotation.z             = Math.PI/2;
grid_xzu.position.x             = WALL_POSITION;
grid_xzu.material.opacity       = 0.25;
grid_xzu.material.transparent   = true;
scene.add( grid_xzu );


/// WALLS
const wall_mat = new tri.MeshStandardMaterial({ 
    color: 0x444444, 
    side: tri.DoubleSide 
});

// Enable shadow receiving for walls
const wall_geom = new tri.PlaneGeometry(50, 50);
const wall_xy = new tri.Mesh(wall_geom, wall_mat);
wall_xy.rotation.x = Math.PI/2;
wall_xy.position.y = -WALL_POSITION;
wall_xy.receiveShadow = true; // Add this
scene.add(wall_xy);

const wall_xz = new tri.Mesh(wall_geom, wall_mat);
wall_xz.position.z = -WALL_POSITION;
wall_xz.receiveShadow = true; // Add this
scene.add(wall_xz);

const wall_yz = new tri.Mesh(wall_geom, wall_mat);
wall_yz.rotation.y = Math.PI/2;
wall_yz.position.x = -WALL_POSITION;
wall_yz.receiveShadow = true; // Add this
scene.add(wall_yz);


// Add an ambient light to provide base illumination
const ambientLight = new tri.AmbientLight(0x333333); // soft white light
scene.add(ambientLight);

// Ensure renderer is set up for shadows
// renderer.shadowMap.enabled = true;
// renderer.shadowMap.type = tri.PCFSoftShadowMap; // Optional: for softer shadows


/// ----------------------------------------------------------------------------------------------
/// SPHERES
// Circle properties
const circleRadius      = 0.5;
const coronaRadius      = 1.4;
const auraRadius        = 3;
const wallThres         = auraRadius + 1;
const circleSegments    = 16;
const coronaOpacity     = 0.7;
const auraOpacity       = 0.3;
const bulbIntensity     = 200;
const circleColors      = [0xe8f2fc, 0xe8f2fc, 0xe8f2fc];
const auraColors        = [0x75a4f0, 0x75a4f0, 0x75a4f0];
const circles           = [];
const coronas           = [];
const auras             = [];
const trails            = [];
const initials          = [];
const baseTime          = Date.now();
let currentTime         = Date.now() - baseTime;
const trailTimeStep     = 100;
const trailDuration     = 1200;
let currentFloor        = 0;
let nextCeil            = 0;

// Create circles and their trails
for (let i = 0; i < 3; i++) {
    const init = {
        position : {
            x : (Math.random() - 0.5) * WALL_POSITION * 2,
            y : (Math.random() - 0.5) * WALL_POSITION * 2,
            z : (Math.random() - 0.5) * WALL_POSITION * 2
        },
        velocity: {
            x : (Math.random() - 0.5) * 0.3 * (i+1),
            y : (Math.random() - 0.5) * 0.3 * (i+1),
            z : (Math.random() - 0.5) * 0.3 * (i+1)
        }
    }
        
    initials.push(init);
}


for (let i = 0; i < 3; i++) {
    const geometry      = new tri.SphereGeometry(coronaRadius, circleSegments, circleSegments);
    const material      = new tri.MeshBasicMaterial({ 
        color       : auraColors[i],
        transparent : true,
        opacity     : auraOpacity
    });
    const corona        = new tri.Mesh(geometry, material);

    corona.position.x = initials[i].position.x;
    corona.position.y = initials[i].position.y;
    corona.position.z = initials[i].position.z;
    
    corona.velocity = {
        x: initials[i].velocity.x,
        y: initials[i].velocity.y,
        z: initials[i].velocity.z
    };
    
    scene.add(corona);
    coronas.push(corona);
}

for (let i = 0; i < 3; i++) {
    const geometry      = new tri.SphereGeometry(auraRadius, circleSegments, circleSegments);
    const material      = new tri.MeshBasicMaterial({ 
        color       : auraColors[i],
        transparent : true,
        opacity     : coronaOpacity
    });
    const aura          = new tri.Mesh(geometry, material);

    aura.position.x = initials[i].position.x;
    aura.position.y = initials[i].position.y;
    
    aura.velocity = {
        x: initials[i].velocity.x,
        y: initials[i].velocity.y,
        z: initials[i].velocity.z
    };
    
    scene.add(aura);
    auras.push(aura);
}


// center circles
for (let i = 0; i < 3; i++) {
    const geometry      = new tri.SphereGeometry(circleRadius, circleSegments, circleSegments);
    const bulb          = new tri.PointLight(0x75a4f0, bulbIntensity, 200, 2);
    const bulbMat       = new tri.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0xffffff
    });
    bulb.add(new tri.Mesh(geometry, bulbMat));
    // circle.renderOrder  = 0;
    bulb.position.x = initials[i].position.x; 
    bulb.position.y = initials[i].position.y;
    bulb.position.z = initials[i].position.z;

    bulb.velocity = {
        x: initials[i].velocity.x,
        y: initials[i].velocity.y,
        z: initials[i].velocity.z
    };
    
    scene.add(bulb);
    circles.push(bulb);
    trails.push([]);
}

// Function to create trail point
function createTrailPoint(position, color) {
    const geometry = new tri.SphereGeometry(circleRadius, 16, 16);
    const material = new tri.MeshBasicMaterial({ 
        color       : color,
        transparent : true,
        opacity     : 0.6
    });
    const point         = new tri.Mesh(geometry, material);
    point.position.copy(position);
    point.createdAt     = Date.now();
    scene.add(point);
    return point;
}

// Animation loop
function animate() {
    requestAnimationFrame(animate);
    
    currentTime     = Date.now() - baseTime;
    currentFloor    = Math.floor(currentTime/trailTimeStep);
    // Update circles
    circles.forEach((circle, index) => {
        // Random movement
        circle.position.x += circle.velocity.x;
        circle.position.y += circle.velocity.y;
        circle.position.z += circle.velocity.z;
        
        // Bounce off walls
        if (Math.abs(circle.position.x) > WALL_POSITION - wallThres) {
            circle.velocity.x *= -1;
            circle.position.x = Math.sign(circle.position.x) * (WALL_POSITION - wallThres);
        }

        if (Math.abs(circle.position.y) > WALL_POSITION - wallThres) {
            circle.velocity.y *= -1;
            circle.position.y = Math.sign(circle.position.y) * (WALL_POSITION - wallThres);
        }

        if (Math.abs(circle.position.z) > WALL_POSITION - wallThres) {
            circle.velocity.z *= -1;
            circle.position.z = Math.sign(circle.position.z) * (WALL_POSITION - wallThres);
        }
        
        auras[index].position.x     = circle.position.x;
        auras[index].position.y     = circle.position.y;
        auras[index].position.z     = circle.position.z;

        coronas[index].position.x   = circle.position.x;
        coronas[index].position.y   = circle.position.y;
        coronas[index].position.z   = circle.position.z;
        // circle.position.z = 0.1;

        // Slightly change velocity randomly
        circle.velocity.x += (Math.random() - 0.5) * 0.1;
        circle.velocity.y += (Math.random() - 0.5) * 0.1;
        circle.velocity.z += (Math.random() - 0.5) * 0.1;
        
        // Limit velocity
        const maxVelocity = 0.5;
        circle.velocity.x = Math.max(Math.min(circle.velocity.x, maxVelocity), -maxVelocity);
        circle.velocity.y = Math.max(Math.min(circle.velocity.y, maxVelocity), -maxVelocity);
        circle.velocity.z = Math.max(Math.min(circle.velocity.z, maxVelocity), -maxVelocity);
        
        
        if (currentFloor >= nextCeil) {
            const trailPoint = createTrailPoint(circle.position, auraColors[index]);
            trails[index].push(trailPoint);

            const scaleSet = 1 + Math.random() * 0.3;
            auras[index].scale.set(scaleSet, scaleSet ,1);
            coronas[index].scale.set(scaleSet, scaleSet ,1);
            circle.intensity = bulbIntensity * scaleSet * 2;

            const opacMod      = (1 + (-0.5 + Math.random() * 0.5))
            auras[index].material.opacity   = auraOpacity * opacMod;
            coronas[index].material.opacity = coronaOpacity * opacMod;
    
        }

        // Update trail points
        trails[index] = trails[index].filter(point => {
            const age = Date.now() - point.createdAt;
            if (age > trailDuration) {
                scene.remove(point);
                return false;
            }
            point.material.opacity = 0.6 - 0.6 * (age / trailDuration);
            return true;
        });

    });
    nextCeil = Math.ceil(currentTime/trailTimeStep);
    // controls.update(clock.getDelta());
    controls.update();
    renderer.render(scene, camera);
}


function updateOverlayText() {
    const textElement = document.getElementById('info');
    const canvasRect = renderer.domElement.getBoundingClientRect();
    
    // Convert 3D position to screen coordinates
    const vector = new tri.Vector3();
    vector.setFromMatrixPosition(yourTextMesh.matrixWorld);
    vector.project(camera);
    
    const x     = (vector.x * 0.5 + 0.5) * canvasRect.width;
    const y     = (-vector.y * 0.5 + 0.5) * canvasRect.height;
    
    // Set position
    textElement.style.left      = `${x}px`;
    textElement.style.top       = `${y}px`;
    
    // Set responsive font size
    const viewportWidth         = window.innerWidth;
    const baseFontSize          = 16; 
    const scaleFactor           = viewportWidth / 1920;
    const responsiveFontSize    = Math.max(
        baseFontSize * scaleFactor, 
        12
    );
    
    textElement.style.fontSize = `${responsiveFontSize}px`;
}



// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();