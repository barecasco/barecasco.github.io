/*
 * Author: Agra Barecasco
 * Created: August 5, 2025
 * Last Modified: August 5, 2025
 * Contact: barecasco@gmail.com
*/

import * as tri from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { TransformControls } from 'three/addons/controls/TransformControls.js';
import { GUI } from 'three/addons/libs/lil-gui.module.min.js';
import { Line2 } from 'three/addons/lines/Line2.js';
import { LineMaterial } from 'three/addons/lines/LineMaterial.js';
import { LineGeometry } from 'three/addons/lines/LineGeometry.js';


/// ----------------------------------------------------------------------------------------------
/// UNIVERSE SET
const numBodies         = 3;
const circleRadius      = 0.5;
const coronaDepth       = 0.35;
const coronaRadius      = circleRadius + coronaDepth;
const circleSegments    = 32;
const coronaOpacity     = 0.4;
const auraOpacity       = 0.0;
const bulbIntensity     = 200;
const circles           = [];
const coronas           = [];
const auras             = [];
const initials          = [];
const trails            = [];
const trailLines        = [];
const velocityArrows    = []; // New array for velocity arrows
const baseTime              = Date.now();
let currentTime             = Date.now() - baseTime;
const bodyColors            = [0xf075a4, 0xa4f075, 0x75a4f0]; // [blue, red, green]
const arrowColors           = [0xffffff, 0xffffff, 0xffffff];
const bodyIndices           = {"red": 0, "green": 1, "blue": 2};
const maxTrailPoints        = 500;
const trailSegmentLength    = 500;
const origin                = new tri.Vector3(0,0,0);


/// VELOCITY ARROW PARAMETERS
let arrowScaleFactor        = 14.0;
const arrowHeadLength       = 0.7; 
const arrowHeadWidth        = 0.3; 
const arrowShaftRadius      = 0.02;
let showVelocityArrows      = true;

/// WALLS
const DEPLOY_LENGTH     = 20;
const TRAVERSE_LIMIT    = 100;

/// SIMULATION CONTROLS
let isAnimating     = true;
let animationId     = null;

/// CONTROL MODE PARAMETERS
let controlMode                     = 'position';
let currentlyControlledBodyIndex    = -1; 
let attachedObject                  = null;

/// VELOCITY MAGNITUDE CONTROL
const intersets                 = []; 
let velocityMagnitudeControl    = null;
let currentVelocityMagnitude    = 0;
let gravityControl              = null;
let timestepControl             = null;
let arrowScaleControl           = null;
let redMassControl              = null;
let greenMassControl            = null;
let blueMassControl             = null;

/// GUI PARAMETERS
const guiParams = {
    isPlaying           : true,
    controlMode         : 'position',
    velocityMagnitude   : 0,
    startPause          : function() {
        if (isAnimating) {
            pauseAnimation();
        } else {
            startAnimation();
        }
    },
    reset: function() {
        resetBodies();
    }
};

/// ----------------------------------------------------------------------------------------------
/// THREE-BODY SYSTEM PARAMETERS
let G               = 1.0;
let dt              = 0.03;
const baseMass      = 2.5;
let redMass         = baseMass;
let greenMass       = baseMass;
let blueMass        = baseMass;
const massNames     = {
    0: "red",
    1: "green",
    2: "blue"
};
const pmasses   = {
    red     : redMass,
    green   : greenMass,
    blue    : blueMass
};
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
camera.position.set(30, 30, 80);


/// ----------------------------------------------------------------------------------------------
/// GRIDS
const grid_xyd_w                   = new tri.GridHelper(200, 100);
grid_xyd_w.position.y              = 0.0;
grid_xyd_w.material.opacity        = 0.22;
grid_xyd_w.material.transparent    = true;
scene.add( grid_xyd_w );


// const grid_yzd                  = new tri.GridHelper(10, 30);
// grid_yzd.rotation.x             = Math.PI/2;
// grid_yzd.position.z             = 0.0;
// grid_yzd.material.opacity       = 0.15;
// grid_yzd.material.transparent   = true;
// grid_yzd.scale.set(20, 1, 1);
// scene.add( grid_yzd );


// const grid_xzd                  = new tri.GridHelper(10, 30);
// grid_xzd.rotation.z             = Math.PI/2;
// grid_xzd.position.x             = 0.0;
// grid_xzd.material.opacity       = 0.15;
// grid_xzd.material.transparent   = true;
// grid_xzd.scale.set(1, 1, 20);
// scene.add( grid_xzd );


// z line
const zmat = new tri.LineBasicMaterial({ 
    color       : 0x818181,
    opacity     : 0.3,
    transparent : true
});

const zstart = new tri.Vector3(0, -100, 0);
const zend   = new tri.Vector3(0, 100, 0);

const zgeom  = new tri.BufferGeometry().setFromPoints([zstart, zend]);
const zline  = new tri.Line(zgeom, zmat);
scene.add(zline);


// x line
const xmat = new tri.LineBasicMaterial({ 
    color       : 0x818181,
    opacity     : 0.3,
    transparent : true
});

const xstart = new tri.Vector3(-100, 0, 0);
const xend   = new tri.Vector3(100, 0, 0);

const xgeom  = new tri.BufferGeometry().setFromPoints([xstart, xend]);
const xline  = new tri.Line(xgeom, xmat);
scene.add(xline);


// y line
const ymat = new tri.LineBasicMaterial({ 
    color       : 0x818181,
    opacity     : 0.3,
    transparent : true
});

const ystart = new tri.Vector3(0, 0, -100);
const yend   = new tri.Vector3(0, 0, 100);

const ygeom  = new tri.BufferGeometry().setFromPoints([ystart, yend]);
const yline  = new tri.Line(ygeom, ymat);
scene.add(yline);


/// WALLS
const wall_mat = new tri.MeshStandardMaterial({ 
    color: 0x444444, 
    side: tri.DoubleSide 
});

const wall_geom = new tri.PlaneGeometry(200, 200);
const wall_xy   = new tri.Mesh(wall_geom, wall_mat);
wall_xy.rotation.x = Math.PI/2;
wall_xy.position.y = 0;
wall_xy.material.opacity        = 0.5;
wall_xy.material.transparent    = true;
// wall_xy.receiveShadow = true; // Add this
// scene.add(wall_xy);


// Add an ambient light to provide base illumination
const ambientLight = new tri.AmbientLight(0xffffff); // soft white light
scene.add(ambientLight);


/// ----------------------------------------------------------------------------------------------
/// GUI SETUP
const gui       = new GUI();

gui.add(guiParams, 'startPause').name('Start/Pause');
gui.add(guiParams, 'reset').name('Reset Bodies');


// Add physics parameters
const physicsFolder = gui.addFolder('Physics');

gravityControl      = physicsFolder.add({ G }, 'G', 0.1, 2.0, 0.1).name('Gravity').onChange((value) => {
    G = value;
});

timestepControl     = physicsFolder.add({ dt }, 'dt', 0.001, 0.1, 0.001).name('Time Step').onChange((value) => {
    dt = value;
});

redMassControl      = physicsFolder.add({redMass}, 'redMass', 0.5, 20, 0.1).name('Red Mass').onChange((value) => {
    let i           = bodyIndices['red'];
    pmasses['red']  = value;
    circles[i].mass = value;
    let mratio      = value/baseMass;
    let nscale      = Math.pow(mratio, 1/3.0);
    let cscale      = (coronaDepth + nscale * circleRadius)/(coronaDepth + circleRadius);

    circles[i].scale.setScalar(nscale);
    coronas[i].scale.setScalar(cscale);
});

greenMassControl        = physicsFolder.add({greenMass}, 'greenMass', 0.5, 20, 0.1).name('Green Mass').onChange((value) => {
    let i               = bodyIndices['green'];
    pmasses['green']    = value;
    circles[i].mass = value;
    let mratio      = value/baseMass;
    let nscale      = Math.pow(mratio, 1/3.0);
    let cscale      = (coronaDepth + nscale * circleRadius)/(coronaDepth + circleRadius);

    circles[i].scale.setScalar(nscale);
    coronas[i].scale.setScalar(cscale);
});

blueMassControl     = physicsFolder.add({blueMass}, 'blueMass', 0.5, 20, 0.1).name('Blue Mass').onChange((value) => {
    let i           = bodyIndices['blue'];
    pmasses['blue'] = value;
    circles[i].mass = value;
    let mratio      = value/baseMass;
    let nscale      = Math.pow(mratio, 1/3.0);
    let cscale      = (coronaDepth + nscale * circleRadius)/(coronaDepth + circleRadius);

    circles[i].scale.setScalar(nscale);
    coronas[i].scale.setScalar(cscale);
});



// Add velocity arrow controls
const arrowFolder       = gui.addFolder('Velocity Arrows');
arrowFolder.add({ showVelocityArrows }, 'showVelocityArrows').name('Show Arrows').onChange((value) => {
    showVelocityArrows  = value;
    velocityArrows.forEach(arrow => {
        arrow.visible   = value;
    });
});
arrowScaleControl = arrowFolder.add({ arrowScaleFactor }, 'arrowScaleFactor', 1.0, 20.0, 1.0).name('Arrow Scale').onChange((value) => {
    arrowScaleFactor = value;
});


// Add control mode selector
gui.add(guiParams, 'controlMode', ['position', 'velocity']).name('Control Mode').onChange((value) => {
    controlMode = value;
    transformControl.detach();
    currentlyControlledBodyIndex = -1;
    
    if (velocityMagnitudeControl) {
        velocityMagnitudeControl.hide();
    }
    
    velocityArrows.forEach(arrow => {
        if (controlMode === 'velocity') {
            arrow.velocityHelper.material.opacity = 0.7;
            arrow.velocityHelper.visible = true;
        } else {
            arrow.velocityHelper.material.opacity = 0.0;
            arrow.velocityHelper.visible = false;
        }
    });
});


// Add velocity magnitude control (initially hidden)
velocityMagnitudeControl = gui.add(guiParams, 'velocityMagnitude', 0.01, 2.0).name('Velocity Magnitude').onChange((value) => {
    if (currentlyControlledBodyIndex >= 0 && controlMode === 'velocity') {
        updateVelocityMagnitude(value);
    }
});
velocityMagnitudeControl.hide();

intersets.push(velocityMagnitudeControl);
intersets.push(gravityControl);
intersets.push(timestepControl);
intersets.push(arrowScaleControl);
intersets.push(redMassControl);
intersets.push(greenMassControl);
intersets.push(blueMassControl);

physicsFolder.open();
arrowFolder.open();



/// ----------------------------------------------------------------------------------------------
/// VELOCITY MAGNITUDE UPDATE FUNCTION
function updateVelocityMagnitude(newMagnitude) {
    if (currentlyControlledBodyIndex < 0 || controlMode !== 'velocity') return;
    
    const circle = circles[currentlyControlledBodyIndex];
    const currentVelocity = circle.velocity;
    
    // Calculate current direction (normalized)
    const currentMagnitude = Math.sqrt(
        currentVelocity.x * currentVelocity.x + 
        currentVelocity.y * currentVelocity.y + 
        currentVelocity.z * currentVelocity.z
    );
    
    if (currentMagnitude > 0) {
        const direction = {
            x: currentVelocity.x / currentMagnitude,
            y: currentVelocity.y / currentMagnitude,
            z: currentVelocity.z / currentMagnitude
        };
        
        // Apply new magnitude
        circle.velocity.x = direction.x * newMagnitude;
        circle.velocity.y = direction.y * newMagnitude;
        circle.velocity.z = direction.z * newMagnitude;
    } else {
        // If current velocity is zero, set velocity in positive x direction
        circle.velocity.x = newMagnitude;
        circle.velocity.y = 0;
        circle.velocity.z = 0;
    }
    
    currentVelocityMagnitude = newMagnitude;
    const arrow = velocityArrows[currentlyControlledBodyIndex];
    updateVelocityArrowOnly(arrow, circle.velocity, circle.position, currentlyControlledBodyIndex);
}


/// ----------------------------------------------------------------------------------------------
/// GRID CUBES

// const gridSize       = 50;
// const totalInstances = gridSize * gridSize * gridSize; // 125,000
// const spacing        = 2;
// const boxSize        = 0.05;

// const geometry = new tri.SphereGeometry(boxSize, 4, 4);
// const material = new tri.MeshStandardMaterial({ 
//     color: 0xffffff,
//     roughness: 0.5,
//     metalness: 0.7
// });

// const instancedMesh         = new tri.InstancedMesh(geometry, material, totalInstances);
// instancedMesh.castShadow    = false;
// instancedMesh.receiveShadow = false;

// const matrix    = new tri.Matrix4();
// const position  = new tri.Vector3();
// const color     = new tri.Color();

// let instanceIndex   = 0;
// const offset        = (gridSize - 1) * spacing * 0.5; // Center the grid

// for (let x = 0; x < gridSize; x++) {
//     for (let y = 0; y < gridSize; y++) {
//         for (let z = 0; z < gridSize; z++) {
//             // Calculate position
//             position.set(
//                 x * spacing - offset,
//                 y * spacing - offset,
//                 z * spacing - offset
//             );

//             // Set matrix for this instance
//             matrix.setPosition(position);
//             instancedMesh.setMatrixAt(instanceIndex, matrix);

//             instanceIndex++;
//         }
//     }
// }

// instancedMesh.instanceMatrix.needsUpdate = true;
// if (instancedMesh.instanceColor) {
//     instancedMesh.instanceColor.needsUpdate = true;
// }

// scene.add(instancedMesh);


/// ----------------------------------------------------------------------------------------------
/// VELOCITY ARROW
function createVelocityArrow(color) {
    const arrowGroup = new tri.Group();
    
    // arrow shaft (cylinder)
    const shaftGeometry = new tri.CylinderGeometry(arrowShaftRadius, arrowShaftRadius, 1, 8);
    const shaftMaterial = new tri.MeshBasicMaterial({ 
        color: color,
    });
    const shaft = new tri.Mesh(shaftGeometry, shaftMaterial);
    shaft.position.y = 0.5; // Position shaft so it starts at origin
    arrowGroup.add(shaft);
    
    // arrow head (cone)
    const headGeometry = new tri.ConeGeometry(arrowHeadWidth, arrowHeadLength, 4);
    const headMaterial = new tri.MeshBasicMaterial({ 
        color: color,
        wireframe: true
    });
    const head = new tri.Mesh(headGeometry, headMaterial);
    head.position.y = 1 + arrowHeadLength/2; // Position at top of shaft
    head.visible = true;
    arrowGroup.add(head);
    
    // references to shaft and head for scaling
    arrowGroup.shaft    = shaft;
    arrowGroup.head     = head;
    
    // helper object for velocity rotation control
    const helperGeometry = new tri.ConeGeometry(arrowHeadWidth, arrowHeadLength, 4);
    const helperMaterial = new tri.MeshBasicMaterial({ 
        color: color,
        wireframe: true
    });

    const velocityHelper        = new tri.Mesh(helperGeometry, helperMaterial);
    arrowGroup.velocityHelper   = velocityHelper;
    
    return arrowGroup;
}

/// Function to update velocity arrow
function updateVelocityArrow(arrowGroup, velocity, position, bodyIndex) {
    if (!showVelocityArrows) {
        arrowGroup.visible = false;
        return;
    }
    
    arrowGroup.visible = true;
    
    // Calculate velocity magnitude
    const velMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    
    // If velocity is too small, hide the arrow
    if (velMagnitude < 0.01) {
        arrowGroup.visible = false;
        return;
    }
    
    // Scale the arrow based on velocity magnitude
    const scaledLength = velMagnitude * arrowScaleFactor;
    
    // Update shaft length
    arrowGroup.shaft.scale.y    = scaledLength;
    arrowGroup.shaft.position.y = scaledLength / 2;
    
    // Update head position
    arrowGroup.head.position.y  = scaledLength + arrowHeadLength/2;
    
    // Position the arrow at the body's position
    arrowGroup.position.copy(position);
    
    // Update helper visibility based on control mode
    if (controlMode === 'velocity') {
        arrowGroup.velocityHelper.visible = true;
        arrowGroup.velocityHelper.material.opacity = 0.7;
    } else {
        arrowGroup.velocityHelper.visible = false;
        arrowGroup.velocityHelper.material.opacity = 0.0;
    }
        
    // Orient the arrow in the direction of velocity
    const velocityVector = new tri.Vector3(velocity.x, velocity.y, velocity.z).normalize();
    
    // Calculate rotation to align arrow with velocity vector
    if (velocityVector.length() > 0) {
        arrowGroup.lookAt(
            position.x + velocityVector.x,
            position.y + velocityVector.y,
            position.z + velocityVector.z
        );
        // Rotate 90 degrees around X axis because arrow points up by default
        arrowGroup.rotateX(Math.PI / 2);
        
        // Update helper position
        arrowGroup.velocityHelper.rotation.copy(arrowGroup.rotation);
        arrowGroup.head.getWorldPosition(arrowGroup.velocityHelper.position);
    }
}


function updateVelocityArrowOnly(arrowGroup, velocity, position, bodyIndex) {
    if (!showVelocityArrows) {
        arrowGroup.visible = false;
        return;
    }
    
    arrowGroup.visible = true;
    
    // Calculate velocity magnitude
    const velMagnitude = Math.sqrt(velocity.x * velocity.x + velocity.y * velocity.y + velocity.z * velocity.z);
    
    // If velocity is too small, hide the arrow
    if (velMagnitude < 0.01) {
        arrowGroup.visible = false;
        return;
    }
    
    // Scale the arrow based on velocity magnitude
    const scaledLength = velMagnitude * arrowScaleFactor;
    
    // Update shaft length
    arrowGroup.shaft.scale.y    = scaledLength;
    arrowGroup.shaft.position.y = scaledLength / 2;
    
    // Update head position
    arrowGroup.head.position.y  = scaledLength + arrowHeadLength/2;
    
    // Position the arrow at the body's position
    arrowGroup.position.copy(position);
    
    // Update helper visibility based on control mode
    if (controlMode === 'velocity') {
        arrowGroup.velocityHelper.visible = true;
        arrowGroup.velocityHelper.material.opacity = 0.7;
    } else {
        arrowGroup.velocityHelper.visible = false;
        arrowGroup.velocityHelper.material.opacity = 0.0;
    }
        
    // Orient the arrow in the direction of velocity
    const velocityVector = new tri.Vector3(velocity.x, velocity.y, velocity.z).normalize();
    
    // Calculate rotation to align arrow with velocity vector
    if (velocityVector.length() > 0) {
        arrowGroup.lookAt(
            position.x + velocityVector.x,
            position.y + velocityVector.y,
            position.z + velocityVector.z
        );
        // Rotate 90 degrees around X axis because arrow points up by default
        arrowGroup.rotateX(Math.PI / 2);
    }
}



/// ----------------------------------------------------------------------------------------------
/// SPHERES

// Create circles and their trails
for (let i = 0; i < numBodies; i++) {
    const init = {
        position : {
            x : (Math.random() - 0.5) * DEPLOY_LENGTH * 2,
            y : (Math.random() - 0.5) * DEPLOY_LENGTH * 2,
            z : (Math.random() - 0.5) * DEPLOY_LENGTH * 2
        },
        velocity: {
            x : (Math.random() - 0.5) * 0.3 * (i+1),
            y : (Math.random() - 0.5) * 0.3 * (i+1),
            z : (Math.random() - 0.5) * 0.3 * (i+1)
        }
    }
        
    initials.push(init);
}

// Compute average position and velocity
let totalPos = { x: 0, y: 0, z: 0 };
let totalVel = { x: 0, y: 0, z: 0 };

for (const obj of initials) {
    totalPos.x += obj.position.x;
    totalPos.y += obj.position.y;
    totalPos.z += obj.position.z;

    totalVel.x += obj.velocity.x;
    totalVel.y += obj.velocity.y;
    totalVel.z += obj.velocity.z;
}

const avgPos = {
    x: totalPos.x / numBodies,
    y: totalPos.y / numBodies,
    z: totalPos.z / numBodies
};

const avgVel = {
    x: totalVel.x / numBodies,
    y: totalVel.y / numBodies,
    z: totalVel.z / numBodies
};

// Subtract average from each body
for (const obj of initials) {
    obj.position.x -= avgPos.x;
    obj.position.y -= avgPos.y;
    obj.position.z -= avgPos.z;

    obj.velocity.x -= avgVel.x;
    obj.velocity.y -= avgVel.y;
    obj.velocity.z -= avgVel.z;
}



for (let i = 0; i < 3; i++) {
    const geometry      = new tri.SphereGeometry(coronaRadius, circleSegments, circleSegments);
    const material      = new tri.MeshBasicMaterial({ 
        color       : bodyColors[i],
        transparent : true,
        opacity     : coronaOpacity
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


// center circles
for (let i = 0; i < 3; i++) {
    const geometry      = new tri.SphereGeometry(circleRadius, circleSegments, circleSegments);
    const bulb          = new tri.PointLight(bodyColors[i], bulbIntensity, 200, 2);
    const bulbMat       = new tri.MeshStandardMaterial({
        emissive: 0xffffee,
        emissiveIntensity: 1,
        color: 0xffffff,
        wireframe: true,
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

    bulb.mass = pmasses[massNames[i]];
    
    scene.add(bulb);
    circles.push(bulb);
    trails.push([]);
}

// Create velocity arrows for each body
for (let i = 0; i < 3; i++) {
    const arrow = createVelocityArrow(arrowColors[i]);
    scene.add(arrow);
    scene.add(arrow.velocityHelper);
    velocityArrows.push(arrow);
}


// trail lines
for (let i = 0; i < 3; i++) {
    const trailSegments = [];
    for (let j = 0; j < trailSegmentLength; j++) {
        const segmentGeometry = new LineGeometry();
        const segmentMaterial = new LineMaterial({ 
            color       : bodyColors[i],
            linewidth   : 1,
            resolution  : new tri.Vector2(window.innerWidth, window.innerHeight),
            transparent : true,
            blending    : tri.NormalBlending,
            depthTest   : true,
            depthWrite  : false,
            opacity     : (trailSegmentLength - (j+1))/trailSegmentLength,

        });

        const segmentLine   = new Line2(segmentGeometry, segmentMaterial);
        scene.add(segmentLine);
        trailSegments.push({ geometry: segmentGeometry, line: segmentLine, material: segmentMaterial });
    }
    trailLines.push(trailSegments);
}


function updateTrailLine(index) {
    const points    = trails[index];
    const segments  = trailLines[index];
    
    if (points.length < 2) return;

    let pointsLength    = points.length;
    let segmentsLength  = segments.length

    for (let i = 0; i < segmentsLength; i++) {
        if (i < (pointsLength-1)) {
            const startIdx  = i;
            const endIdx    = Math.min((i + 1), points.length);
            
            segments[i].line.visible = true;
            const segPos  = [
                points[startIdx].x, points[startIdx].y, points[startIdx].z,
                points[endIdx].x, points[endIdx].y, points[endIdx].z
            ];
            segments[i].geometry.setPositions(segPos);
        }
        else {
            segments[i].line.visible = false;
        }

    }
}



/// ----------------------------------------------------------------------------------------------
/// PHYSICS FUNCTIONS

// Calculate gravitational force between two bodies
function calculateGravitationalForce(body1, body2) {
    const dx = body2.position.x - body1.position.x;
    const dy = body2.position.y - body1.position.y;
    const dz = body2.position.z - body1.position.z;
    
    const distanceSquared = dx*dx + dy*dy + dz*dz;
    const distance = Math.sqrt(distanceSquared);
    
    // Avoid division by zero and add small softening parameter
    const softening         = 0.5;
    const forceMagnitude    = G * body1.mass * body2.mass / (distanceSquared + softening*softening);
    
    const forceX = forceMagnitude * dx / distance;
    const forceY = forceMagnitude * dy / distance;
    const forceZ = forceMagnitude * dz / distance;
    
    return { x: forceX, y: forceY, z: forceZ };
}


// Euler integration step
function eulerStep() {
    // Calculate forces on each body
    const forces = circles.map(() => ({ x: 0, y: 0, z: 0 }));
    
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            const force = calculateGravitationalForce(circles[i], circles[j]);
            
            // Apply force to body i (attraction towards body j)
            forces[i].x += force.x;
            forces[i].y += force.y;
            forces[i].z += force.z;
            
            // Apply equal and opposite force to body j
            forces[j].x -= force.x;
            forces[j].y -= force.y;
            forces[j].z -= force.z;
        }
    }
    
    // Update velocities and positions using Euler method
    for (let i = 0; i < circles.length; i++) {
        const body = circles[i];
        
        // Update velocity: v = v + (F/m) * dt
        body.velocity.x += (forces[i].x / body.mass) * dt;
        body.velocity.y += (forces[i].y / body.mass) * dt;
        body.velocity.z += (forces[i].z / body.mass) * dt;
        
        // Update position: x = x + v * dt
        body.position.x += body.velocity.x * dt;
        body.position.y += body.velocity.y * dt;
        body.position.z += body.velocity.z * dt;
    }
}


function updateBodiesByControl() {
    if (!transformControl.object) return;
    
    if (controlMode === 'position') {
        // Find which aura is being transformed
        const transformedObject = transformControl.object;
        const coronaIndex = coronas.indexOf(transformedObject);
        if (coronaIndex === -1) return;
        
        // Update the corresponding circle's position to match the aura
        circles[coronaIndex].position.x = transformedObject.position.x;
        circles[coronaIndex].position.y = transformedObject.position.y;
        circles[coronaIndex].position.z = transformedObject.position.z;
        
        // Optional: Reset velocity when manually positioning
        // circles[coronaIndex].velocity.x = 0;
        // circles[coronaIndex].velocity.y = 0;
        // circles[coronaIndex].velocity.z = 0;
        
        // Update corona position as well
        coronas[coronaIndex].position.x = transformedObject.position.x;
        coronas[coronaIndex].position.y = transformedObject.position.y;
        coronas[coronaIndex].position.z = transformedObject.position.z;
        
        const arrow     = velocityArrows[coronaIndex];
        const circle    = circles[coronaIndex];
        updateVelocityArrow(arrow, circle.velocity, circle.position, coronaIndex);

    } else if (controlMode === 'velocity') {
        // Find which velocity helper is being transformed
        const transformedObject = transformControl.object;
        let velocityHelperIndex = -1;
        
        for (let i = 0; i < velocityArrows.length; i++) {
            if (velocityArrows[i].velocityHelper === transformedObject) {
                velocityHelperIndex = i;
                break;
            }
        }
        
        if (velocityHelperIndex === -1) return;
        
        // Calculate the new velocity direction from new helper position
        let arrow           = velocityArrows[velocityHelperIndex];
        let vhelper         = arrow.velocityHelper;
        let circle          = circles[velocityHelperIndex];
        let dirpos          = transformedObject.position;
        let heading         = dirpos.clone().sub(circle.position).normalize();
        
        arrow.lookAt(
            dirpos.x,
            dirpos.y,
            dirpos.z
        );
        // Rotate 90 degrees around X axis because arrow points up by default
        arrow.rotateX(Math.PI / 2);
    
        const currentVelocity   = circles[velocityHelperIndex].velocity;
        const currentMagnitude  = Math.sqrt(
            currentVelocity.x * currentVelocity.x + 
            currentVelocity.y * currentVelocity.y + 
            currentVelocity.z * currentVelocity.z
        );

        // Update the velocity to maintain magnitude but change direction
        circle.velocity.x = heading.x * currentMagnitude;
        circle.velocity.y = heading.y * currentMagnitude;
        circle.velocity.z = heading.z * currentMagnitude;

        // update orientation of the helper
        vhelper.rotation.copy(arrow.rotation);

        // Update helper position
        renderer.render(scene, camera);
    }
}

/// ----------------------------------------------------------------------------------------------
/// ANIMATION CONTROL FUNCTIONS

function startAnimation() {
    if (!isAnimating) {
        isAnimating         = true;
        guiParams.isPlaying = true;
        transformControl.detach();
        intersets.forEach(control => control.disable());
    }
}

function pauseAnimation() {
    isAnimating         = false;
    guiParams.isPlaying = false;
    intersets.forEach(control => control.enable());
}

function resetBodies() {
    // Clear trails
    trails.forEach(trail => trail.length = 0);
    
    // Reset positions and velocities to initial values
    for (let i = 0; i < circles.length; i++) {
        circles[i].position.x = initials[i].position.x;
        circles[i].position.y = initials[i].position.y;
        circles[i].position.z = initials[i].position.z;
        
        circles[i].velocity.x = initials[i].velocity.x;
        circles[i].velocity.y = initials[i].velocity.y;
        circles[i].velocity.z = initials[i].velocity.z;
        
        coronas[i].position.x = initials[i].position.x;
        coronas[i].position.y = initials[i].position.y;
        coronas[i].position.z = initials[i].position.z;
    }
    
    // Clear trail lines
    trailLines.forEach(segments => {
        segments.forEach(segment => {
            segment.line.visible = false;
        });
    });
    
    // Detach any controls
    transformControl.detach();
    currentlyControlledBodyIndex = -1;
    
    // Hide velocity magnitude control
    if (velocityMagnitudeControl) {
        velocityMagnitudeControl.hide();
    }
    
    render();
}

/// ----------------------------------------------------------------------------------------------
/// CONTROLLER
const controls      = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = true;
const clock         = new tri.Clock();
const point         = new tri.Vector3();

const raycaster         = new tri.Raycaster();
const pointer           = new tri.Vector2();
const onUpPosition      = new tri.Vector2();
const onDownPosition    = new tri.Vector2();

let transformControl  = new TransformControls( camera, renderer.domElement );
transformControl.size = 0.65;
transformControl.addEventListener( 'change', render );
transformControl.addEventListener( 'dragging-changed', function ( event ) {
    controls.enabled = ! event.value;
} );
scene.add( transformControl.getHelper() );


transformControl.addEventListener( 'objectChange', function () {
    updateBodiesByControl();
} );


let canimateId = null;
function changeRotationCenter(newTarget) {
    if (canimateId) {
        cancelAnimationFrame(canimateId);
    }
    function canimate() {
        const distance = controls.target.distanceTo(newTarget);
        if (distance > 0.01) {
            controls.target.lerp(newTarget, 0.2);
            controls.update();
            canimateId  = requestAnimationFrame(canimate);
        } else {
            controls.target.copy(newTarget);
            controls.update();
        }
    }
    canimate();
}


function onPointerDown( event ) {

    if (isAnimating) {
        return;
    }

    onDownPosition.x = event.clientX;
    onDownPosition.y = event.clientY;


    pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
    pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
    raycaster.setFromCamera( pointer, camera );

    
    if (controlMode === 'position') {
        const intersects = raycaster.intersectObjects( coronas, false );
        if ( intersects.length > 0 ) {
            const object = intersects[ 0 ].object;
            if ( object !== transformControl.object ) {
                transformControl.setMode('translate');
                transformControl.attach( object );
                attachedObject  = object;
                const newTarget = new tri.Vector3(object.position.x, object.position.y, object.position.z);
                changeRotationCenter(newTarget);

                currentlyControlledBodyIndex = coronas.indexOf(object);
                
                if (velocityMagnitudeControl) {
                    velocityMagnitudeControl.hide();
                }
            }
        }
    } else if (controlMode === 'velocity') {
        const velocityHelpers = velocityArrows
            .map(arrow => arrow.velocityHelper)
            .filter(helper => helper.visible);

        const intersects = raycaster.intersectObjects( velocityHelpers, false );
        
        if ( intersects.length > 0 ) {
            const object = intersects[ 0 ].object;

            if ( object !== transformControl.object ) {
                transformControl.setMode('translate');
                transformControl.attach( object );

                // find body helper belongs to
                for (let i = 0; i < velocityArrows.length; i++) {
                    if (velocityArrows[i].velocityHelper === object) {
                        currentlyControlledBodyIndex = i;
                        break;
                    }
                }
                const body      = coronas[currentlyControlledBodyIndex];
                const newTarget = new tri.Vector3(body.position.x, body.position.y, body.position.z);
                changeRotationCenter(newTarget);
                attachedObject  = body;
                
                // show magnitude control and update value
                if (velocityMagnitudeControl && currentlyControlledBodyIndex >= 0) {
                    const currentVel = circles[currentlyControlledBodyIndex].velocity;
                    currentVelocityMagnitude = Math.sqrt(
                        currentVel.x * currentVel.x + 
                        currentVel.y * currentVel.y + 
                        currentVel.z * currentVel.z
                    );
                    guiParams.velocityMagnitude = Math.round(currentVelocityMagnitude * 1000) / 1000; // round 2 decimal
                    velocityMagnitudeControl.updateDisplay();
                    velocityMagnitudeControl.show();
                }
            }
        }
    }
}


function onPointerUp( event ) {
    onUpPosition.x = event.clientX;
    onUpPosition.y = event.clientY;
    if (attachedObject) {
        changeRotationCenter(attachedObject.position);
    }
}


function onPointerMove( event ) {

}


function onEscapePressed(event) {
    velocityMagnitudeControl.hide();
    transformControl.detach();
    changeRotationCenter(origin);
    attachedObject = null;
}


function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize( window.innerWidth, window.innerHeight );
    render();
}


function render() {
    renderer.render( scene, camera );
}


document.addEventListener( 'pointerdown', onPointerDown );
document.addEventListener( 'pointerup', onPointerUp );
document.addEventListener( 'pointermove', onPointerMove );
window.addEventListener( 'resize', onWindowResize );
document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    onEscapePressed();
  }
});



// Animation loop
let frameCount = 0;
function animate() {

    animationId     = requestAnimationFrame(animate);

    if (isAnimating) {
        currentTime     = Date.now() - baseTime; 
        // Perform multiple physics steps per frame for better accuracy
        for (let step = 0; step < 3; step++) {
            eulerStep();
        }
        
        // Update circles
        circles.forEach((circle, index) => {        
            // auras[index].position.x     = circle.position.x;
            // auras[index].position.y     = circle.position.y;
            // auras[index].position.z     = circle.position.z;

            coronas[index].position.x   = circle.position.x;
            coronas[index].position.y   = circle.position.y;
            coronas[index].position.z   = circle.position.z;
            
            // Update velocity arrows
            updateVelocityArrow(velocityArrows[index], circle.velocity, circle.position, index);
            
            // Update velocity magnitude in GUI if this body is currently selected
            if (index === currentlyControlledBodyIndex && controlMode === 'velocity' && velocityMagnitudeControl) {
                const currentVel = circle.velocity;
                const newMagnitude = Math.sqrt(
                    currentVel.x * currentVel.x + 
                    currentVel.y * currentVel.y + 
                    currentVel.z * currentVel.z
                );
                const roundedMagnitude = Math.round(newMagnitude * 100) / 100; // Round to 2 decimal places
                if (Math.abs(roundedMagnitude - guiParams.velocityMagnitude) > 0.01) {
                    guiParams.velocityMagnitude = roundedMagnitude;
                    velocityMagnitudeControl.updateDisplay();
                }
            }
            
            // Add to trail every few frames
            if (frameCount % 2 === 0) {
                trails[index].unshift({
                    x: circle.position.x,
                    y: circle.position.y,
                    z: circle.position.z
                });

                // Limit trail length
                if (trails[index].length > maxTrailPoints) {
                    trails[index].pop();
                }
                
                updateTrailLine(index);
            }
        });

        frameCount++;
    }

    controls.update();
    renderer.render(scene, camera);
}


function animateOnce() {

    if (isAnimating) {
        currentTime     = Date.now() - baseTime; 
        // Perform multiple physics steps per frame for better accuracy
        for (let step = 0; step < 3; step++) {
            eulerStep();
        }
        
        // Update circles
        circles.forEach((circle, index) => {        
            // auras[index].position.x     = circle.position.x;
            // auras[index].position.y     = circle.position.y;
            // auras[index].position.z     = circle.position.z;

            coronas[index].position.x   = circle.position.x;
            coronas[index].position.y   = circle.position.y;
            coronas[index].position.z   = circle.position.z;
            
            // Update velocity arrows
            updateVelocityArrow(velocityArrows[index], circle.velocity, circle.position, index);
            
            // Add to trail every few frames
            // if (frameCount % 2 === 0) {
                trails[index].unshift({
                    x: circle.position.x,
                    y: circle.position.y,
                    z: circle.position.z
                });

                // Limit trail length
                if (trails[index].length > maxTrailPoints) {
                    trails[index].pop();
                }
                
                updateTrailLine(index);
            // }
        });

        frameCount++;
    }

    controls.update();
    renderer.render(scene, camera);
}


// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});


animateOnce();
pauseAnimation();

animate();