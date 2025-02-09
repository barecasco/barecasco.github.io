const scene          = new THREE.Scene();
const camera         = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer       = new THREE.WebGLRenderer();
renderer.sortObjects = false;
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Set camera position
camera.position.z = 50;

// Define boundary walls
let WALL_POSITION = 30;
const walls1 = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x5995f7 })
);
const walls2 = new THREE.LineSegments(
    new THREE.BufferGeometry(),
    new THREE.LineBasicMaterial({ color: 0x5995f7 })
);

// Create wall vertices (rectangle)
const wallVertices1 = new Float32Array([
    // Left wall
    -WALL_POSITION, -WALL_POSITION, 0,
    -WALL_POSITION, WALL_POSITION, 0,
    // Right wall
    WALL_POSITION, -WALL_POSITION, 0,
    WALL_POSITION, WALL_POSITION, 0,
    // Top wall
    -WALL_POSITION, WALL_POSITION, 0,
    WALL_POSITION, WALL_POSITION, 0,
    // Bottom wall
    -WALL_POSITION, -WALL_POSITION, 0,
    WALL_POSITION, -WALL_POSITION, 0,
]);

WALL_POSITION = 30.5;
const wallVertices2 = new Float32Array([
    // Left wall
    -WALL_POSITION, -WALL_POSITION, 0,
    -WALL_POSITION, WALL_POSITION, 0,
    // Right wall
    WALL_POSITION, -WALL_POSITION, 0,
    WALL_POSITION, WALL_POSITION, 0,
    // Top wall
    -WALL_POSITION, WALL_POSITION, 0,
    WALL_POSITION, WALL_POSITION, 0,
    // Bottom wall
    -WALL_POSITION, -WALL_POSITION, 0,
    WALL_POSITION, -WALL_POSITION, 0,
]);
WALL_POSITION = 30
;
walls1.geometry.setAttribute('position', new THREE.BufferAttribute(wallVertices1, 3));
walls2.geometry.setAttribute('position', new THREE.BufferAttribute(wallVertices2, 3));
scene.add(walls1);
scene.add(walls2);

// Circle properties
const circleRadius      = 0.5;
const coronaRadius      = 1.4;
const auraRadius        = 3;
const circleSegments    = 32;
const coronaOpacity     = 0.7;
const auraOpacity       = 0.3;
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
    const init          = {
        position : {
            x : (Math.random() - 0.5) * WALL_POSITION * 2,
            y : (Math.random() - 0.5) * WALL_POSITION * 2
        },
        velocity: {
            x : (-0.5 + Math.random()) * 0.3 * (i+1),
            y : (Math.random() - 0.5) * 0.3 * (i+1)
        }
    }
        
    initials.push(init);
}


for (let i = 0; i < 3; i++) {
    const geometry      = new THREE.CircleGeometry(coronaRadius, circleSegments);
    const material      = new THREE.MeshBasicMaterial({ 
        color       : auraColors[i],
        transparent : true,
        opacity     : auraOpacity
    });
    const corona        = new THREE.Mesh(geometry, material);

    corona.position.x = initials[i].position.x;
    corona.position.y = initials[i].position.x;
    
    corona.velocity = {
        x: initials[i].velocity.x,
        y: initials[i].velocity.y
    };
    
    scene.add(corona);
    coronas.push(corona);
}

for (let i = 0; i < 3; i++) {
    const geometry      = new THREE.CircleGeometry(auraRadius, circleSegments);
    const material      = new THREE.MeshBasicMaterial({ 
        color       : auraColors[i],
        transparent : true,
        opacity     : coronaOpacity
    });
    const aura          = new THREE.Mesh(geometry, material);

    aura.position.x = initials[i].position.x;
    aura.position.y = initials[i].position.x;
    
    aura.velocity = {
        x: initials[i].velocity.x,
        y: initials[i].velocity.y
    };
    
    scene.add(aura);
    auras.push(aura);
}

// center circles
for (let i = 0; i < 3; i++) {
    const geometry      = new THREE.CircleGeometry(circleRadius, circleSegments);
    const material      = new THREE.MeshBasicMaterial({ color: circleColors[i] });
    const circle        = new THREE.Mesh(geometry, material);
    circle.renderOrder  = 0;
    circle.position.x = initials[i].position.x;
    circle.position.y = initials[i].position.y;

    circle.velocity = {
        x: initials[i].velocity.x,
        y: initials[i].velocity.y
    };
    
    scene.add(circle);
    circles.push(circle);
    trails.push([]);
}

// Function to create trail point
function createTrailPoint(position, color) {
    const geometry = new THREE.CircleGeometry(circleRadius, 16);
    const material = new THREE.MeshBasicMaterial({ 
        color: color,
        transparent: true,
        opacity: 0.6
    });
    const point = new THREE.Mesh(geometry, material);
    point.position.copy(position);
    point.position.z = 0;
    point.createdAt = Date.now();
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
        
        // Bounce off walls
        if (Math.abs(circle.position.x) > WALL_POSITION - circleRadius) {
            circle.velocity.x *= -1;
            // Keep circle inside bounds
            circle.position.x = Math.sign(circle.position.x) * (WALL_POSITION - circleRadius);
        }
        if (Math.abs(circle.position.y) > WALL_POSITION - circleRadius) {
            circle.velocity.y *= -1;
            // Keep circle inside bounds
            circle.position.y = Math.sign(circle.position.y) * (WALL_POSITION - circleRadius);
        }
        
        auras[index].position.x     = circle.position.x;
        auras[index].position.y     = circle.position.y;
        coronas[index].position.x   = circle.position.x;
        coronas[index].position.y   = circle.position.y;
        circle.position.z = 0.1;

        // Slightly change velocity randomly
        circle.velocity.x += (Math.random() - 0.5) * 0.1;
        circle.velocity.y += (Math.random() - 0.5) * 0.1;
        
        // Limit velocity
        const maxVelocity = 0.5;
        circle.velocity.x = Math.max(Math.min(circle.velocity.x, maxVelocity), -maxVelocity);
        circle.velocity.y = Math.max(Math.min(circle.velocity.y, maxVelocity), -maxVelocity);
        
        // Create new trail point
        if (currentFloor >= nextCeil) {
            const trailPoint = createTrailPoint(circle.position, auraColors[index]);
            trails[index].push(trailPoint);

            const scaleSet = 1 + Math.random() * 0.3;
            auras[index].scale.set(scaleSet, scaleSet ,1);
            coronas[index].scale.set(scaleSet, scaleSet ,1);

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
    renderer.render(scene, camera);
}

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();