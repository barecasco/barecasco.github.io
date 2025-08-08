/*
 * Author: Agra Barecasco
 * Created: June 1, 2025
 * Last Modified: August 5, 2025
 * Contact: barecasco@gmail.com
*/


import * as tri from 'three';

///--- STAGE
const scene     = new tri.Scene();
const container = document.getElementById('simulation-container');
const width     = container.clientWidth;
const height    = container.clientHeight;

const camera        = new tri.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0.5, 0.5, 1.85);
const camRotRate    = 0.005;


///--- SPH PARAM
const SIMSCALE       = 1;
const sys_max        = new tri.Vector2(SIMSCALE, SIMSCALE);
const sys_min        = new tri.Vector2(0, 0);
const xHat           = new tri.Vector2(1,0);
const yHat           = new tri.Vector2(0,1);
const rho0           = 1000; 
const gamma_tait     = 7.0;
const alpha_av       = 0.03;     // artificial viscousity
const M_PI           = Math.PI;

///--- WALL PARAMETER
const springLength     = 0;
const EPSILON          = 0.0001;
const stiff            = 10000.0;
const damp             = 10;

///--- FLUID GEOMETRY
const fluidDim          = 0.65 * SIMSCALE;
const init_min          = new tri.Vector2(springLength,  springLength);
const init_max          = new tri.Vector2(fluidDim, fluidDim);

///--- FLUID PARAMETER
const NSPACING      = 20;
const spacing       = (init_max.x-init_min.x)/NSPACING;
const mass          = spacing * spacing * spacing * rho0 * 0.3;
const hKernel       = 0.93 * spacing;
const h2            = Math.pow(hKernel, 2.);
const h3            = Math.pow(hKernel, 3.);
const gravDef       = -9.8;
const gas_const     = 30. * Math.abs(gravDef);
const grav          = 1.8;
let gravAngle       = camera.rotation.z;
let gravity         = new tri.Vector2(Math.sin(gravAngle)*grav, -Math.cos(gravAngle) * grav);
const c_sound       = Math.sqrt(gas_const);
const cell_length   = 2.*hKernel;


///--- SIMULATION TIMESTEP
// const  cfl          = 0.03;
const  cfl          = 1.0;
const dt            = cfl * 2 * hKernel / c_sound;


///--- DETAILS OF SPHERE
const mesh         = 16;
const zero         = 1e-30;
const drawRadius   = 0.25 * hKernel;

const PARTICLE_RADIUS   = drawRadius;
const PARTICLE_SEGMENT  = 8;


const renderer = new tri.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
container.appendChild(renderer.domElement);


/// NOCLASS PARTICLE OBJECT
let ptotal      = 0;
const pPos      = [];
const pMass     = [];
const pRho      = [];
const pPress    = [];
const pDrhoDt   = [];
const pDrDt     = [];
const pDvDt     = [];

// visuals
const pGeom     = [];
const pMat      = [];
const pMesh     = [];

// KERNELS
const beta_cbspline   = 1.5/(M_PI*h3);



// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
function createLine(xMin, yMin, xMax, yMax) {
    let geometry    = new tri.BufferGeometry().setFromPoints([
        new tri.Vector2(xMin, yMin), 
        new tri.Vector2(xMax, yMax)
    ]);
    let material    = new tri.LineBasicMaterial( {color: 0xffffff});
    let line       = new tri.Line(geometry, material);
    return line;
}


// ARRANGE POSITIONS
function setupParticles() {
    let index = 0;

    for(let y = init_min.y; y < (init_max.y + spacing/2.); y+=spacing)
    {
        for(let x = init_min.x; x < (init_max.x + spacing/2.); x+=spacing)
        {
            pPos[index] = new tri.Vector2(x, y);
            index++;
        }
    }
    
    ptotal = index;
    
    for (let i=0; i < ptotal; i++) {
        // behaviors
        pMass.push(mass);
        pRho.push(rho0);
        pPress.push(0.0);
        pDrhoDt.push(0.0);
        pDrDt.push(new tri.Vector2(0.0, 0.0));
        // pDrDt.push(new tri.Vector2(Math.random(), Math.random()));
        pDvDt.push(new tri.Vector2(0, 0));
        // visuals
        const geom  = new tri.CircleGeometry(PARTICLE_RADIUS, PARTICLE_SEGMENT);
        const mat   = new tri.MeshBasicMaterial({color: 0x004488}); 
        const mesh  = new tri.Mesh(geom, mat); 
        mesh.position.set(pPos[i].x, pPos[i].y, 0.0);
        scene.add(mesh);
        pGeom.push(geom);
        pMat.push(mat);
        pMesh.push(mesh);
    }
}


// KERNELS
function kernel(distVec)
{
    const q = distVec.length()/hKernel;

    if( 2. <= q )
    {
        return 0;
    }
    else if( 1. <= q)
    {
        return beta_cbspline * (1./6) * (2-q)*(2-q)*(2-q);
    }
    else
    {
        return beta_cbspline * (2./3 - q*q + 0.5*q*q*q);
    }
}


function dkernel(distVec){
    const q         = distVec.length()/hKernel;
    const normal    = distVec.normalize();

    //if the distance is greater that 2*h
    if ( 2. <= q) {
        return new tri.Vector2(0,0);
    }
    else if ( 1. <= q ) {
        const val = beta_cbspline/hKernel * (-0.5) * (2.-q)*(2.-q);
        return normal.multiplyScalar(val);
    }
    else {
        const val = beta_cbspline/hKernel * (-2.*q + 1.5*q*q)
        return normal.multiplyScalar(val);
    }   
}


function loop_phase1() //reset particles, set first shift pressure and position
{
    for(let i = 0; i < ptotal; i++)
    {
        // clamp the speed
        pDrDt[i].clampLength(0, 1.0);
        pDvDt[i]        = new tri.Vector2(0, 0);
        pDrhoDt[i]      = 0.;

        //first shift of position [1]
        pPos[i].add(pDrDt[i].clone().multiplyScalar(dt/2));
        
        //calculate pressure (Tait's Equation)
        pPress[i] = (rho0 * gas_const)/gamma_tait * (Math.pow(pRho[i]/rho0, gamma_tait) - 1.);
        // pPress[i] = Math.min(2000, pPress[i]);
    }
}


///================ add gravity acc., add wall acc., filter boundary status
function loop_phase2()
{
    let adj  = 0;
    let diff = 0;
    let mu_ij = 0;
    let PI_ij = 0;

    for(let i = 0; i < ptotal; i++)
    {
        ///--- Acceleration that comes from gravity
        pDvDt[i].add(gravity);
    
        ///--- X-axis walls
        diff = springLength - (pPos[i].x);
        if (diff > EPSILON)
        {
            adj             = stiff * diff - damp * pDrDt[i].dot(xHat);
            const reverse   = xHat.clone().multiplyScalar(adj);
            pDvDt[i].add(reverse);
        }

        diff = springLength - (sys_max.x - pPos[i].x);
        if (diff > EPSILON)
        {
            adj = stiff * diff - damp * pDrDt[i].dot(xHat.clone().negate());
            const reverse = xHat.clone().negate().multiplyScalar(adj); 
            pDvDt[i].add(reverse);
        }

        // ///--- Y-axis walls
        diff = springLength - (pPos[i].y);
        if (diff > EPSILON)
        {
            adj             = stiff * diff - damp  * pDrDt[i].dot(yHat);
            const reverse   = yHat.clone().multiplyScalar(adj); 
            pDvDt[i].add(reverse);
        }

        diff = springLength - (sys_max.y - pPos[i].y);
        if (diff > EPSILON)
        {
            adj = stiff * diff - damp * pDrDt[i].dot(yHat);
            pDvDt[i].add(yHat.clone().negate().multiplyScalar(adj));
        }

        ///--- Neighbors summation
        for(let j = 0; j < ptotal; j++) {
            if (j == i) {continue;}
            const posDif_ij = pPos[i].clone().sub(pPos[j]);
            const v_ij      = pDrDt[i].clone().sub(pDrDt[j]);
            
            // if (posDif_ij.length() > 2 * hKernel) {
            //     continue;
            // }

            if (v_ij.dot(posDif_ij) < 0) {
                mu_ij = hKernel * posDif_ij.dot(v_ij) /(posDif_ij.lengthSq() + 0.00001);
                PI_ij = 2./(pRho[i] + pRho[j]) * (-alpha_av * c_sound * mu_ij);                
            }
            else {
                PI_ij = 0;
            }
            // total acceleration
            const addval = -pMass[j] * ( PI_ij + (pPress[i]+pPress[j]) / (pRho[j] * pRho[i]));
            pDvDt[i].add(dkernel(posDif_ij).multiplyScalar(addval));
        }

        ///--- set next velocity
        pDrDt[i].add(pDvDt[i].clone().multiplyScalar(dt));
    }
}


function loop_phase3()
{

    for(let i = 0; i < ptotal; i++)
    {
        for(let j = 0; j < ptotal; j++) {
            if (j == i) {continue;}
            const posDif_ij = pPos[i].clone().sub(pPos[j]);
            const diffDrDt  = pDrDt[i].clone().sub(pDrDt[j]);            
            pDrhoDt[i]      += pMass[j] * diffDrDt.dot(dkernel(posDif_ij));

        }
        // ///--- udpate density
        pRho[i] += dt * pDrhoDt[i];
        
        ///--- set new position
        pPos[i].add(pDrDt[i].clone().multiplyScalar(dt/2));
        pMesh[i].position.set(pPos[i].x, pPos[i].y, 0.0);
    }
}



function advance()
{
    loop_phase1();
    loop_phase2();
    loop_phase3();
}

// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

const dw          = 0.05;
const bottomWall  = createLine(0, -dw, SIMSCALE, -dw);
const topWall     = createLine(0, SIMSCALE + dw, SIMSCALE, SIMSCALE + dw);
const leftWall    = createLine(-dw, 0, -dw, SIMSCALE);
const rightWall   = createLine(SIMSCALE + dw, 0, SIMSCALE + dw, SIMSCALE);
scene.add(bottomWall);
scene.add(topWall);
scene.add(leftWall);
scene.add(rightWall);
setupParticles();


// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =
// control
document.addEventListener('keydown', onKeyDown);
document.addEventListener('keyup', onKeyUp);

const keys = {};
function onKeyDown(event) {
    keys[event.code] = true;
}

function onKeyUp(event) {
    keys[event.code] = false;
}



// = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = = =

const animate = () => {
    // console.log(dt);
    // console.log(pPos[3].y);
    advance();    

    if (keys['KeyD']) { 
        camera.rotation.z += camRotRate;
        gravAngle = camera.rotation.z;
        gravity   = new tri.Vector2(Math.sin(gravAngle), -Math.cos(gravAngle));
        // console.log(gravAngle, gravity);
    }

    if (keys['KeyA']) {
        camera.rotation.z -= camRotRate;
        gravAngle = camera.rotation.z;
        gravity   = new tri.Vector2(Math.sin(gravAngle), -Math.cos(gravAngle));
        // console.log(gravAngle, gravity);
    }

    renderer.render(scene, camera);
    requestAnimationFrame(animate);

};
animate();


