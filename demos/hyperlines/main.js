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
camera.position.set(10, 10, 20);


/// ----------------------------------------------------------------------------------------------
/// CONTROLLER
const controls      = new OrbitControls( camera, renderer.domElement );
controls.enableZoom = false;

const clock = new tri.Clock();



// Add an ambient light to provide base illumination
const ambientLight = new tri.AmbientLight(0x333333); // soft white light
scene.add(ambientLight);



/// ----------------------------------------------------------------------------------------------
/// LINES

const lineHight         = 10;

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