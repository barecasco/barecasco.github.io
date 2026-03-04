// constrained access key
Cesium.Ion.defaultAccessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiJiOTYzMDEyNS05ZjRjLTQ1NDctODNlMC1jMzljMmRiOTFmODEiLCJpZCI6NjM2NDMsImlhdCI6MTc3MTEzMTAzNX0.hSrbZEKtACGXiqGqTzjKh-mzo_1COi3UYtj2CA6wmMo';


// ── GLOBAL VARS ──────────────────────────────────────────────────────────────────────────────────────────────────────
const flareUrlDeploymentCoordinates = "/data/deployment-coordinates.json"
const flareUrlMpaData               = "/data/area-data.geojson"
const flareUrlWaypoint              = "/data/ship-waypoints.json"
const flareUrlDeploymentSpecies     = "/data/deployment-species.json"
const deploymentEntities    = {};
let enabledDeployments      = [];

const upwellEntities        = {};
const ebsaEntities          = {};
const occurAbundEntities    = {};

const globalEntities        = [];
const proposedMpaEntities   = [];
const existingMpaEntities   = [];

let maxAbundance            = 0;
let maxOccurence            = 0;

const markerSize            = 12;
const markerPadding         = 2;
const triangleImageUsed     = createFilledTriangle(markerSize, "#7fee8e55", 1).toDataURL();
const triangleImageUnused   = createFilledTriangle(markerSize, "#5d5d5d55", 1).toDataURL();
const triangleSelectorImage = createOutlineTriangle(markerSize,"#f3f716", 1.5).toDataURL();

const squareImageUsed       = createOutlineSquare(markerSize, "#7fee8e", 0.5).toDataURL();
const squareImageUnused     = createOutlineSquare(markerSize, "#696969", 0.5).toDataURL();
const beamImageUsable       = createOutlineBeam(markerSize, "#E6E6FA", 1).toDataURL();
const beamImageUnused       = createOutlineBeam(markerSize, "#696969", 1).toDataURL();
const boxImageUpwell        = createBoxy(markerSize * 3/5, 3, "#ba69df").toDataURL();
const boxImageEbsa          = createBoxy(markerSize * 3/5, 3, "#4479f4").toDataURL();
const crossHairImage        = createCrosshairImage(40, "#f3f716", 2).toDataURL();

const lockedEntities        = [];
const deploymentSpecies     = {};

let latlonData    = null;
let areaData      = null;
let speciesData   = null;

const speciesSelection  = [];
const uniqueSpecies     = [];
const selectedSpecies   = new Set();


const entity_types = {
    DEPLOYMENT  : 0,
    EBSA        : 1,
    UPWELL      : 2,
    ABUNDANCE   : 3,
}


const imageryProviders      = {
    STADIA_DARK : new Cesium.UrlTemplateImageryProvider({
        url: 'https://tiles.stadiamaps.com/tiles/alidade_smooth_dark/{z}/{x}/{y}.png',
        minimumLevel: 0,
        maximumLevel: 20,
        credit: '© Stadia Maps, © OpenMapTiles, © OpenStreetMap contributors'
    }),

    CARTO_DARK : new Cesium.UrlTemplateImageryProvider({
        url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png',
        subdomains: ['a', 'b', 'c', 'd'],
        credit: '© OpenStreetMap contributors, © CARTO'
    }),

    OPENSTREET : new Cesium.UrlTemplateImageryProvider({
        url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
        credit: '© OpenStreetMap contributors'
    }),
}


// const imageryProvider = new Cesium.UrlTemplateImageryProvider({
//   url: 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}.png',
//   subdomains: ['a', 'b', 'c', 'd'],
//   credit: '© OpenStreetMap contributors, © CARTO'
// });

// const imageryProvider = new Cesium.UrlTemplateImageryProvider({
//   url: 'https://tiles.stadiamaps.com/tiles/stamen_toner_lite/{z}/{x}/{y}.png',
//   credit: '© Stadia Maps, © Stamen Design, © OpenMapTiles, © OpenStreetMap contributors'
// });


// ── CESIUM VIEWER ──────────────────────────────────────────────────────────────────────────────────────────────────

// Initialize Cesium Viewer
const viewer = new Cesium.Viewer('cesiumContainer', {
    baseLayer           : new Cesium.ImageryLayer(imageryProviders.CARTO_DARK),
    //   terrain: Cesium.Terrain.fromWorldTerrain(),
    timeline            : false,
    animation           : false,
    baseLayerPicker     : false,
    geocoder            : false,
    homeButton          : false,
    navigationHelpButton: false,
    sceneModePicker     : false,
    selectionIndicator  : false,
    infoBox             : false,
    fullscreenButton: false
    // creditContainer: document.createElement('div'),
});

viewer.selectedEntityChanged.addEventListener(() => {
    setTimeout(() => {
        const path = document.querySelector(".cesium-selection-wrapper svg g path");
        if (path) {
            const offset = 13; // increase to bring closer together

            path.setAttribute("d", `
                M ${13.25 - offset} ${-34 + offset} L ${15.25 - offset} ${-32 + offset} L ${30 - offset} ${-32 + offset} L ${30 - offset} ${-15.25 + offset} L ${32 - offset} ${-13.25 + offset} L ${32 - offset} ${-34 + offset} L ${13.25 - offset} ${-34 + offset} z
                M ${-34 + offset} ${13.25 - offset} L ${-34 + offset} ${34 - offset} L ${-13.25 + offset} ${34 - offset} L ${-15.25 + offset} ${32 - offset} L ${-32 + offset} ${32 - offset} L ${-32 + offset} ${15.25 - offset} L ${-34 + offset} ${13.25 - offset} z
            `);
        }
    }, 50);
});

viewer.resolutionScale          = window.devicePixelRatio;  // fix resolution
viewer.scene.skyAtmosphere.show = false;                    // Remove atmosphere
viewer.scene.skyBox.show        = false;                    // Remove stars
viewer.scene.backgroundColor    = Cesium.Color.BLACK;       // Optionally, also set the background color to black or another color
viewer.scene.globe.showGroundAtmosphere = false;            // Remove ground atmosphere

viewer.scene.screenSpaceCameraController.minimumZoomDistance = 1000; 
viewer.scene.screenSpaceCameraController.maximumZoomDistance = 3000000;
// viewer.scene.screenSpaceCameraController.enableRotate     = false; 
// viewer.scene.screenSpaceCameraController.enableLook       = false;   
// viewer.scene.screenSpaceCameraController.enableTilt       = false;   

// viewer.infoBox.frame.sandbox.add('allow-scripts');
// viewer.scene.globe.enableLighting = true;


const crossHair = viewer.entities.add({
    name        : "cross hair",
    position    : Cesium.Cartesian3.fromDegrees(0, 0, 10),
    billboard: {
        image            : crossHairImage,
        verticalOrigin   : Cesium.VerticalOrigin.CENTER,
        HorizontalOrigin : Cesium.HorizontalOrigin.CENTER,
        heightReference  : Cesium.HeightReference.CLAMP_TO_GROUND,
        disableDepthTestDistance: Number.POSITIVE_INFINITY,
    }
});
crossHair.show = false;

// ── UI HANDLERS ──────────────────────────────────────────────────────────────────────────────────────────────────────

// Open popup on entity click
function openPopup(title, html) {
    document.getElementById('popup-title').textContent = title || 'Station';
    document.getElementById('popup-body').innerHTML = html || '';
    document.getElementById('popup').style.display = 'block';
}

function closePopup() {
    document.getElementById('popup').style.display = 'none';
}

viewer.screenSpaceEventHandler.setInputAction(click => {
    const picked = viewer.scene.pick(click.position);
    if (Cesium.defined(picked) && picked.id) {
        const entity = picked.id;
        if (!lockedEntities.includes(entity.id)) {
            crossHair.position = entity.position;
            console.log(crossHair.position);
            crossHair.show     = true;
            openPopup(entity.name, entity.description?.getValue());
        }
    } else {
        closePopup();
        crossHair.show = false;
    }
}, Cesium.ScreenSpaceEventType.LEFT_CLICK);

// ── Mouse coords ──
const handler = new Cesium.ScreenSpaceEventHandler(viewer.canvas);
handler.setInputAction(movement => {
    const ray = viewer.camera.getPickRay(movement.endPosition);
    const pos = viewer.scene.globe.pick(ray, viewer.scene);
    if (pos) {
        const carto = Cesium.Cartographic.fromCartesian(pos);
        document.getElementById('coordLat').textContent = Cesium.Math.toDegrees(carto.latitude).toFixed(4) + '°';
        document.getElementById('coordLng').textContent = Cesium.Math.toDegrees(carto.longitude).toFixed(4) + '°';
        document.getElementById('coordAlt').textContent = (carto.height >= 0 ? carto.height.toFixed(0) : 0) + ' m';
    }
}, Cesium.ScreenSpaceEventType.MOUSE_MOVE);



// ── UI Logic ─────────────────────────────────────────────────────────────────────────────────────────────────────────
function countFilters() {
    let count = 0;
    if (document.getElementById('toggleUpwelling').checked) count++;
    if (document.getElementById('toggleEBSA').checked) count++;
    if (document.getElementById('toggleExistingMPA').checked) count++;
    if (document.getElementById('toggleOccurAbund').checked) count++;
    if (document.getElementById('toggleDeploymentLabel').checked) count++;

    const depthVal = document.querySelector('input[name="depth"]:checked').value;
    if (depthVal !== 'all') count++;

    document.querySelectorAll('.chip-item input[type="checkbox"]:checked').forEach(() => count++);

    document.getElementById('filterCount').textContent = count + ' active';

    // Mark button as pending
    const btn = document.getElementById('applyBtn');
    btn.classList.remove('applied');
    btn.textContent = '⬡ Apply Filters';
    document.getElementById('applyHint').textContent = count > 0 ? count + ' filter(s) pending — click apply' : 'Select filters above, then apply';
}
window.countFilters = countFilters;


function updateDepthBadge() {
    const val = document.querySelector('input[name="depth"]:checked').value;
}
window.updateDepthBadge = updateDepthBadge;



function toggleSpecies(value) {
    if (selectedSpecies.has(value)) {
        selectedSpecies.delete(value);
    } else {
        selectedSpecies.add(value);
    }
    updateSpeciesCount();
    // re-render keeping current search
    buildSpeciesList(document.getElementById('speciesSearch').value);
    countFilters();
}
window.toggleSpecies = toggleSpecies;


function clearSpecies() {
    selectedSpecies.clear();
    updateSpeciesCount();
    buildSpeciesList(document.getElementById('speciesSearch').value);
    countFilters();
}
window.clearSpecies = clearSpecies;


function updateSpeciesCount() {
    document.getElementById('speciesSelectedCount').textContent =
        `${selectedSpecies.size} SELECTED`;
}
window.updateSpeciesCount  = updateSpeciesCount;


function filterSpeciesOptions() {
    buildSpeciesList(document.getElementById('speciesSearch').value);
}
window.filterSpeciesOptions = filterSpeciesOptions;



function applyFilters() {
    // Collect all current filter state
    const filters = {
        upwelling: document.getElementById('toggleUpwelling').checked,
        ebsa: document.getElementById('toggleEBSA').checked,
        existingMpa: document.getElementById('toggleExistingMPA').checked,
        occurAbundChart: document.getElementById('toggleOccurAbund').checked,
        deploymentLabel: document.getElementById('toggleDeploymentLabel').checked,
        failedDeployment: document.getElementById('toggleFailedDeployment').checked,
        depth: document.querySelector('input[name="depth"]:checked').value,
        substrates: [...document.querySelectorAll('.chip-item.substrate input:checked')].map(i => i.value),
        species   : Array.from(selectedSpecies),
    };

    console.log(filters);
    // ── YOUR JS LOGIC HOOK ──
    // depth selections 10, 30, all
    const depth_string   = filters.depth;
    let selectedDepths   = [];
    if (depth_string == "10"){
        selectedDepths  = [10];
    }
    if (depth_string == "30") {
        selectedDepths = [30];
    }
    if (depth_string == "all") {
        selectedDepths = [10, 30];
    }

    let intersectionNames      = new Set(getDeploymentByDepths(selectedDepths));
    if (filters.substrates.length > 0){
        let deploymentBySubstrates = new Set(getDeploymentBySubstrates(filters.substrates));
        intersectionNames = intersectionNames.intersection(deploymentBySubstrates);
    }
    if (filters.species.length > 0) {
        let deploymentBySpecies = new Set(getDeploymentBySpecies(filters.species));
        console.log(deploymentBySpecies);
        intersectionNames       = intersectionNames.intersection(deploymentBySpecies);
    }

    enabledDeployments = Array.from(intersectionNames);

    recalculateOccurAbundEntities(enabledDeployments, filters.species);

    for (let entity of globalEntities) {
        let deployment  = entity.deployment;
        let entity_type = entity.entity_type;
        let is_usable   = entity.is_usable;
    
        entity.show = false;

        if (entity_type == entity_types.DEPLOYMENT) {
            entity.show = true;
            entity.label.show = filters.deploymentLabel;
        }
    
        if (entity_type == entity_types.UPWELL) {
            entity.show = filters.upwelling;
        }

        if (entity_type == entity_types.EBSA) {
            entity.show = filters.ebsa;
        }

        if (entity_type == entity_types.ABUNDANCE) {
            entity.show = filters.occurAbundChart;
        }

        if (!is_usable && !filters.failedDeployment) {
            entity.show = false;
        }

        if (!enabledDeployments.includes(deployment)) {
            entity.show = false;
        }

    }

    showAllExistingMpaEntities(filters.existingMpa);


    // UI feedback
    const btn = document.getElementById('applyBtn');
    btn.textContent = '✓ Filters Applied';
    btn.classList.add('applied');
    document.getElementById('applyHint').textContent = 'Last applied — ' + new Date().toLocaleTimeString();

    // Flash
    const flash = document.getElementById('flashOverlay');
    flash.classList.add('flash');
    setTimeout(() => flash.classList.remove('flash'), 500);
}
window.applyFilters = applyFilters;



// ─────────────────────────────────────────────────────────────────────────────────────────────────────────────────────
// utils function

function getPolygonCentroid(coords) {
    let area = 0;
    let cx = 0;
    let cy = 0;
    const n = coords.length;

    for (let i = 0; i < n; i++) {
        const j = (i + 1) % n;
        const xi = coords[i].longitude;
        const yi = coords[i].latitude;
        const xj = coords[j].longitude;
        const yj = coords[j].latitude;

        const cross = (xi * yj) - (xj * yi);
        area += cross;
        cx += (xi + xj) * cross;
        cy += (yi + yj) * cross;
    }

    area = area / 2;
    cx = cx / (6 * area);
    cy = cy / (6 * area);

    return { longitude: cx, latitude: cy };
}


function capitalizeFirstLetter(word) {
    if (!word) return ""; // Handle empty or null input
    return word.charAt(0).toUpperCase() + word.slice(1);
}

function randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}


function randomIntNormal(min, max, mean, spread) {
    // Box-Muller transform to get a normally distributed value
    const u1 = Math.random();
    const u2 = Math.random();
    const z = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);

    // Scale by spread and shift by mean
    let value = Math.round(z * spread + mean);

    // Clamp to [min, max]
    value = Math.max(min, Math.min(max, value));

    return value;
}


function randomHexColor() {
    const r = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const g = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    const b = Math.floor(Math.random() * 256).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}


function randomPastelColor() {
    const r = Math.floor((Math.random() * 127) + 128).toString(16).padStart(2, '0');
    const g = Math.floor((Math.random() * 127) + 128).toString(16).padStart(2, '0');
    const b = Math.floor((Math.random() * 127) + 128).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
}


function valueToColor(value, min, max, alpha=0.1) {
    const ratio = (value - min) / (max - min); // normalize to 0–1
    const r = Math.floor(255 * (1 - ratio));
    const g = Math.floor(255 * ratio);
    const b = 0;
    return `rgb(${r}, ${g}, ${b}, ${alpha})`;
}


function generateDeploymentDescription (
    note_description,
    usableDesc,
    depth_level,
    substrate_type,
    upwell_description,
    ebsa_description,
    speciesList
) {
    let speciesRows = ""
    if (speciesList) {
        speciesRows = speciesList
            .map(({ species, maxn }) => `<tr><td style="text-align: right;">${maxn}</td><td <p style="text-transform: uppercase; ">${species}</td></tr>`)
            .join("");
    }
    else {
        speciesRows = `<tr><td> - </td><td> - </td></tr>`
    }
    const result = `
    <div style="font-size:11px; ">
        <table style="border-collapse: separate; border-spacing: 10px 5px; padding-bottom:10px;" >
            <tr><td> Depth</td><td>${depth_level} </td></tr>
            <tr><td> Substrate</td><td>${substrate_type} </td></tr>
            <tr><td> Upwelling</td><td>${upwell_description} </td></tr>
            <tr><td> EBSA </td><td>${ebsa_description} </td></tr>
        </table>
        <table style="border-collapse: separate; border-spacing: 10px 5px;padding-bottom:10px;" >
            <tr>
            <th style="text-align: left; font-size:11px">MaxN</th>
            <th style="text-align: left; font-size:11px">Species</th>
            </tr>
            ${speciesRows}
        </table>
    </div>
    `
    return result;
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// custom shapes
function createCrosshairImage(size, color, lineWidth = 1) {
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext("2d");

    const center = size / 2;
    const gap    = size * 0.1;      // gap around center
    const pad    = size * 0.2;      // length of each arm

    ctx.strokeStyle = color;
    ctx.lineWidth = lineWidth;

    const angle = 45;
    ctx.translate(center, center);
    ctx.rotate(angle * Math.PI / 180);
    ctx.translate(-center, -center);
    
    ctx.beginPath();

    // ctx.moveTo(pad, center - gap);
    // ctx.lineTo(pad, pad);
    // ctx.lineTo(center-gap, pad);

    ctx.moveTo(center + gap, pad);
    ctx.lineTo(size-pad, pad);
    ctx.lineTo(size-pad, center - gap);

    // ctx.moveTo(size-pad, center + gap);
    // ctx.lineTo(size-pad, size-pad);
    // ctx.lineTo(center + gap, size-pad);

    ctx.moveTo(center - gap, size-pad);
    ctx.lineTo(pad, size-pad);
    ctx.lineTo(pad, center + gap);
    // ctx.closePath();
    ctx.stroke();

    return canvas;
}


function createBoxy(width, height, color) {
    const canvas    = document.createElement("canvas");
    canvas.width    = width;
    canvas.height   = height;
    const ctx       = canvas.getContext("2d");

    const padding   = 0;

    const x1 = padding;
    const y1 = padding;

    const x2 = width - padding;
    const y2 = padding;

    const x3 = width - padding;
    const y3 = height - padding;

    const x4 = padding;
    const y4 = height - padding;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4); // fixed: x5 -> x4
    ctx.closePath();

    ctx.fillStyle = color;
    ctx.fill();

    return canvas;
}


function createOutlineBoxy(width, height, color) {
    const canvas    = document.createElement("canvas");
    canvas.width    = width;
    canvas.height   = height;
    const ctx       = canvas.getContext("2d");

    const xpad   = 0;
    const ypad   = 0;

    const x1 = xpad;
    const y1 = ypad;

    const x2 = width - xpad;
    const y2 = ypad;

    const x3 = width - xpad;
    const y3 = height - ypad;

    const x4 = xpad;
    const y4 = height - ypad;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4); // fixed: x5 -> x4
    ctx.closePath();

    // ctx.fillStyle   = "rgba(216, 241, 255, 0.02)";
    ctx.fillStyle   = color;
    ctx.fill();

    // ctx.strokeStyle = "#7fee8e";
    // ctx.lineWidth   = 0.7;
    // ctx.stroke();

    return canvas;
}


function createFilledTriangle(size, outlineColor, lineWidth = 1) {
    const canvas    = document.createElement("canvas");
    canvas.width    = size;
    canvas.height   = size;
    const ctx       = canvas.getContext("2d");

    const padding = 0;

    const x1 = padding;
    const y1 = padding;

    const x2 = size-padding;
    const y2 = padding;

    const x3 = size/2;
    const y3 = size - padding;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x2, y2);
    ctx.closePath();

    ctx.fillStyle   = outlineColor
    ctx.fill();

    // ctx.strokeStyle = outlineColor;
    // ctx.lineWidth   = lineWidth;
    // ctx.stroke();

    return canvas;
}


function createOutlineTriangle(size, outlineColor, lineWidth = 1) {
    const canvas    = document.createElement("canvas");
    canvas.width    = size;
    canvas.height   = size;
    const ctx       = canvas.getContext("2d");
    const padding   = 2;

    const x1 = padding;
    const y1 = padding;

    const x2 = size-padding;
    const y2 = padding;

    const x3 = size/2;
    const y3 = size - padding;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x2, y2);
    ctx.closePath();

    ctx.strokeStyle = outlineColor;
    ctx.lineWidth   = lineWidth;
    ctx.stroke();

    return canvas;
}



function createOutlineSquare(size, outlineColor, lineWidth = 1) {
    const canvas    = document.createElement("canvas");
    canvas.width    = size;
    canvas.height   = size;
    const ctx       = canvas.getContext("2d");

    const padding = lineWidth + 1;

    const x1 = padding;
    const y1 = padding;

    const x2 = size - padding;
    const y2 = padding;

    const x3 = size - padding;
    const y3 = size - padding;

    const x4 = padding;
    const y4 = size - padding;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.lineTo(x4, y4);
    ctx.closePath();

    ctx.fillStyle   = "rgba(216, 241, 255, 0.02)";  // ← fill first, then stroke on top
    ctx.fill();
    
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth   = lineWidth;
    ctx.stroke();
    // No fill = transparent interior

    return canvas;
}


function createOutlineBeam(size, outlineColor, lineWidth=1) {
    const canvas    = document.createElement("canvas");
    canvas.width    = size;
    canvas.height   = size;
    const ctx       = canvas.getContext("2d");

    const padding = lineWidth + 1;

    const x1 = size/2;
    const y1 = padding;

    const x2 = size/2;
    const y2 = size - padding;

    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.closePath();

    ctx.strokeStyle = outlineColor;
    ctx.lineWidth   = lineWidth;
    ctx.stroke();
    // No fill = transparent interior

    return canvas;
}


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
// UPDATE CLICK HANDLER
// Remove old click handlers
// viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_CLICK);
// viewer.cesiumWidget.screenSpaceEventHandler.removeInputAction(Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);

// function selectEntity(event) {
//     var picked = viewer.scene.pick(event.position);
//     if (!picked) return;
    
//     if (!lockedEntities.includes(picked.id.id)){
//         viewer.selectedEntity = picked.id;
//     }
// }

// function trackEntity(event) {
//     var picked = viewer.scene.pick(event.position);
//     if (!picked) return;
//     if (!lockedEntities.includes(picked.id.id)){
//         viewer.trackedEntity = picked.id;
//     }
// }
// // Set new click handlers
// viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(selectEntity, Cesium.ScreenSpaceEventType.LEFT_CLICK);
// viewer.cesiumWidget.screenSpaceEventHandler.setInputAction(trackEntity, Cesium.ScreenSpaceEventType.LEFT_DOUBLE_CLICK);


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 

async function loadDeploymentCoordinatesData() {
    try {
        console.log('Fetching deployment coordinates data from server...');

        const response = await fetch(flareUrlDeploymentCoordinates);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const latlonData = await response.json();
        return latlonData;

    } catch (error) {
        console.error('Error loading deployment coordinates data:', error);
        alert('Failed to load deployment coordinates data. Please check that the server is running and check the console for details.');
    }
}


// Function to load and display area data from server
async function loadAreaData() {
    try {
        const dataSource = await Cesium.GeoJsonDataSource.load('/data/area-data.geojson', {
            stroke: Cesium.Color.BLACK,
            fill: Cesium.Color.DODGERBLUE.withAlpha(0.05),
            strokeWidth: 1,
        });
        return dataSource;
    } catch (error) {
        console.error('Error loading data:', error);
        alert('Failed to load data. Please check that the server is running and check the console for details.');
    }
}


async function loadSpeciesData() {
    try {
        const response = await fetch(flareUrlDeploymentSpecies);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const deploymentSpeciesData = await response.json();
        return deploymentSpeciesData;
    } catch (error) {
        console.error('Error loading species data:', error);
        alert('Failed to load data. Please check that the server is running and see console for details.');
    }
}


function calculateOccurAbund(deployName, exclusiveSpecies = []) {
    const speciesList = deploymentSpecies[deployName];
    let deplOccurence       = 1;        
    let deplAbundance       = 1;

    if (speciesList) {
        speciesList.forEach((record, index) => {
            if (exclusiveSpecies.length > 0) {
                if (exclusiveSpecies.includes(record.species)) {
                    deplAbundance += record.maxn;  
                    deplOccurence += 1;                  
                }
            }
            else {
                deplAbundance += record.maxn;
                deplOccurence += 1;                  

            }
        });
    }

    let deplBarHeight           = 1;
    let occurColor              = 1;        
    if (speciesList) {
        deplBarHeight          = 1 + (deplAbundance / maxAbundance * 50);
        occurColor             = valueToColor(deplOccurence, 1, (1 + maxOccurence), 0.2);
    }

    return [deplBarHeight, occurColor]
}


function processDeploymentCoordinatesData(latlonData) {
    console.log(`Processing ${latlonData.length} records...`);

    // Process each MPA record
    let maskNumber  = 0;
    const waypoints = [];

    latlonData.forEach(record => {
        
        let name = "S-" + maskNumber;
        let {
            deployment, 
            latitude, longitude, 
            usable, 
            notes, 
            depth, 
            substrate, 
            is_ebsa, 
            is_upwelling } = record;

        waypoints.push(longitude, latitude, 0);

        if (!longitude) {
            return;
        }

        if(!latitude) {
            return;
        }


        let is_usable           = false;
        if (usable) {
            is_usable    = usable.toLowerCase() == "no" ? false : true;
        }
        const labelColor        = is_usable ? Cesium.Color.LAVENDER : Cesium.Color.DIMGREY;
        const usableDesc        = is_usable ? "Yes" : "No";
        const speciesList       = deploymentSpecies[deployment];

        let [deplBarHeight, occurColor] = calculateOccurAbund(deployment, []);

        let depth_level         = ""; 
        if (depth) {
            depth_level  = depth;
        }

        let substrate_type      = "Unknown";
        if (substrate) {
            substrate_type = substrate;
        }

        let is_ebsa_bool        = false;
        if (is_ebsa) {
            is_ebsa_bool   = is_ebsa.toLowerCase() == "yes" ? true : false;
        }
        let ebsa_description    = "No";
        if (is_ebsa_bool) {
            ebsa_description = "Yes";
        }

        let is_upwell_bool      = false;
        if(is_upwelling) {
            is_upwell_bool = is_upwelling.toLowerCase() == "yes" ? true : false;
        }
        let upwell_description  = "No";
        if (is_upwell_bool) {
            upwell_description = "Yes";
        }

        let note_description    = "";
        if (notes != "") {
            note_description = notes;
        }


        const deploymentEntity = viewer.entities.add({
            name        : deployment,
            description : generateDeploymentDescription(
                note_description,
                usableDesc,
                depth_level,
                substrate_type,
                upwell_description,
                ebsa_description,
                speciesList
            ) ,
            position    : Cesium.Cartesian3.fromDegrees(longitude, latitude, 10),
            billboard: {
                image           : is_usable ? triangleImageUsed : triangleImageUnused,
                verticalOrigin  : Cesium.VerticalOrigin.BOTTOM,
                heightReference : Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
            label: {
                // text            : "S"+maskNumber,
                text            : deployment,
                font            : "10px monospace",
                showBackground  : false,
                fillColor       : labelColor,
                horizontalOrigin: Cesium.HorizontalOrigin.LEFT,
                verticalOrigin  : Cesium.VerticalOrigin.BOTTOM,
                pixelOffset     : new Cesium.Cartesian2(markerSize/2 + markerPadding, -markerSize),
            },
        });
        deploymentEntity.is_usable       = is_usable;
        deploymentEntity.deployment      = deployment;
        deploymentEntity.entity_type     = entity_types.DEPLOYMENT;
        deploymentEntity.entity_depth    = depth_level;
        deploymentEntity.is_ebsa         = is_ebsa_bool;
        deploymentEntity.is_upwell       = is_upwell_bool;

        deploymentEntities[deployment]   = deploymentEntity;
        globalEntities.push(deploymentEntity);

        if (is_upwell_bool) {
            const ent = viewer.entities.add({
                position    : Cesium.Cartesian3.fromDegrees(longitude, latitude, 10),
                billboard: {
                    image           : boxImageUpwell,
                    verticalOrigin  : Cesium.VerticalOrigin.TOP,
                    horizontalOrigin  : Cesium.VerticalOrigin.CENTER,
                    pixelOffset     : new Cesium.Cartesian2(0, 0),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
            });
            lockedEntities.push(ent.id);
            ent.is_usable   = is_usable;
            ent.deployment  = deployment;
            ent.entity_type = entity_types.UPWELL;
            deploymentEntity.entity_depth    = depth_level;
            deploymentEntity.is_ebsa         = is_ebsa_bool;
            deploymentEntity.is_upwell       = is_upwell_bool;
            upwellEntities[deployment] = ent;
            globalEntities.push(ent);
        }

        if (is_ebsa_bool) {
            const ent = viewer.entities.add({
                position    : Cesium.Cartesian3.fromDegrees(longitude, latitude, 10),
                billboard: {
                    image            : boxImageEbsa,
                    verticalOrigin   : Cesium.VerticalOrigin.TOP,
                    horizontalOrigin : Cesium.VerticalOrigin.CENTER,
                    pixelOffset      : new Cesium.Cartesian2(0, 4),
                    heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                    disableDepthTestDistance: Number.POSITIVE_INFINITY,
                },
            });
            lockedEntities.push(ent.id);
            ent.is_usable       = is_usable;
            ent.deployment      = deployment;
            ent.entity_type     = entity_types.EBSA;
            ent.entity_depth    = depth_level;
            ent.is_ebsa         = is_ebsa_bool;
            ent.is_upwell       = is_upwell_bool;
            ebsaEntities[deployment] = ent;
            globalEntities.push(ent);
        }

        const barEntity = viewer.entities.add({
            position    : Cesium.Cartesian3.fromDegrees(longitude, latitude, 10),
            billboard: {
                // image           : createBoxy(5, randomInt(1,50), "#189cde"),
                image           : createOutlineBoxy(markerSize, deplBarHeight, occurColor),
                verticalOrigin  : Cesium.VerticalOrigin.BOTTOM,
                horizontalOrigin: Cesium.HorizontalOrigin.CENTER,
                pixelOffset     : new Cesium.Cartesian2(0, -markerSize - markerPadding),
                heightReference: Cesium.HeightReference.CLAMP_TO_GROUND,
                disableDepthTestDistance: Number.POSITIVE_INFINITY,
            },
        });
        lockedEntities.push(barEntity.id);
        barEntity.is_usable             = is_usable;
        barEntity.deployment            = deployment;
        barEntity.entity_type           = entity_types.ABUNDANCE;
        barEntity.entity_depth    = depth_level;
        barEntity.is_ebsa         = is_ebsa_bool;
        barEntity.is_upwell       = is_upwell_bool;
        occurAbundEntities[deployment]  = barEntity;
        globalEntities.push(barEntity);
        maskNumber += 1;
    });

     // Draw the route polyline
    viewer.entities.add({
        name: 'Ship Route',
        polyline: {
            positions: Cesium.Cartesian3.fromDegreesArrayHeights(waypoints),
            width: 0.5,
            material: new Cesium.PolylineDashMaterialProperty({
                color: Cesium.Color.SKYBLUE,
                dashLength: 7.0
            }),
            clampToGround: false
        }
    });

    console.log(`Successfully loaded ${waypoints.length} waypoints and drew ship route`);   
    console.log("Successfully loaded deployment coordinates data");
}


function recalculateMaxOccurAbund(deployNames, exclusiveSpecies = []) {
    maxAbundance = 0;
    maxOccurence = 0;

    Object.entries(deploymentSpecies).forEach(([depl, records]) => {
        let maxnSum    = 0;
        let occurCount = 0; 
        if (exclusiveSpecies.length > 0) {
            records.forEach((record, index) => {
                if (exclusiveSpecies.includes(record.species)) {
                    maxnSum     += record.maxn;
                    occurCount  += 1                    
                }
            });
        }
        else {
            records.forEach((record, index) => {
                maxnSum     += record.maxn;
                occurCount  += 1;
            });
        } 
    
        if (maxAbundance < maxnSum) {
            maxAbundance = maxnSum;
        }

        if (maxOccurence < occurCount) {
            maxOccurence = occurCount;
        }
    });

    console.log("maxAbundance", maxAbundance);
    console.log("maxOccurence", maxOccurence);
}


function recalculateOccurAbundEntities(deployNames, exclusiveSpecies) {
    recalculateMaxOccurAbund(deployNames, exclusiveSpecies);
    // if (exclusiveSpecies.length > 0) {
        for (let deployName of deployNames) {
            let chart                       = occurAbundEntities[deployName];
            let [deplBarHeight, occurColor] = calculateOccurAbund(deployName, exclusiveSpecies);
            chart.billboard.image           = createOutlineBoxy(markerSize, deplBarHeight, occurColor);
        }
    // }
}


function processAreaData(dataSource) {
    const ent = viewer.dataSources.add(dataSource);
    lockedEntities.push(ent.id);
    // viewer.zoomTo(dataSource);
}


// function processAreaData(areaData) {
//     console.log(`Processing ${areaData.length} MPA records...`);
//     const COLOR_MAP = {
//         'Proposed': Cesium.Color.YELLOW.withAlpha(0.15),
//         'Existing': Cesium.Color.DODGERBLUE.withAlpha(0.2)
//     };
//     const OUTLINE_COLOR = Cesium.Color.BLACK;

//     let polygonCount = 0;

//     // Process each MPA record
//     areaData.forEach(record => {
//         const { provinsi, mpaType, polygons } = record;

//         // Add each polygon to the viewer
//         polygons.forEach(polyCoords => {
//         if (polyCoords.length > 2 && mpaType == "MPA Existing") {
//         // if (polyCoords.length > 2) {
//             const positions = polyCoords.map(coord => 
//                 Cesium.Cartesian3.fromDegrees(coord.longitude, coord.latitude)
//             );

//             // Usage
//             const center = getPolygonCentroid(polyCoords);
//             const centerPosition = Cesium.Cartesian3.fromDegrees(center.longitude, center.latitude);


//             const color = COLOR_MAP[mpaType] || Cesium.Color.GRAY.withAlpha(0.3);

//             let fillEnt = viewer.entities.add({
//                 name: mpaType,
//                 position: centerPosition,
//                 description: `
//                 <div style="font-size:11px; ">
//                 <table style="border-collapse: separate; border-spacing: 10px 5px; padding-bottom:10px;" >
//                     <tr><td> MPA type</td><td>${mpaType} </td></tr>
//                     <tr><td> Province</td><td>${provinsi} </td></tr>
//                 </table>
//                 </div>
//                 `,
//                 polygon: {
//                     hierarchy: new Cesium.PolygonHierarchy(positions),
//                     material: color,
//                 }
//             });

//             // Separate entity for the outline
//             let lineEnt = viewer.entities.add({
//                 polyline: {
//                     positions : [...positions, positions[0]], // close the loop
//                     width     : 1,
//                     material  : OUTLINE_COLOR,
//                     clampToGround: true, // if your polygon is on the ground
//                 }
//             });
//             lockedEntities.push(lineEnt.id);
//             if (mpaType == "Existing") {
//                 existingMpaEntities.push(fillEnt);
//                 existingMpaEntities.push(lineEnt);
//             }
//             polygonCount++;
//         }
//         });
//     });

//     console.log(`Successfully loaded ${polygonCount} polygons from ${areaData.length} records`);
// }


function buildSpeciesList(filter = '') {
    const container = document.getElementById('speciesList');
    container.innerHTML = '';
    const q = filter.toLowerCase();

    speciesSelection.forEach(sp => {
        const labelMatch = sp.label.toLowerCase().includes(q);
        const valueMatch = sp.value.toLowerCase().includes(q);
        if (q && !labelMatch && !valueMatch) return;

        const isSelected = selectedSpecies.has(sp.value);

        // highlight matched text
        const displayLabel = q && labelMatch
        ? sp.label.replace(new RegExp(`(${q})`, 'gi'), '<span class="match-highlight">$1</span>')
        : sp.label;
        const displayValue = q && !labelMatch && valueMatch
        ? sp.value.replace(new RegExp(`(${q})`, 'gi'), '<span class="match-highlight">$1</span>')
        : sp.value;

        const row = document.createElement('div');
        row.className = `species-option${isSelected ? ' selected' : ''}`;
        row.dataset.value = sp.value;
        row.innerHTML = `
        <div class="species-checkbox">${isSelected ? '✓' : ''}</div>
        <div style="text-transform: uppercase;" class="species-name">
            ${capitalizeFirstLetter(displayValue)}
        </div>
        `;
        row.addEventListener('click', () => toggleSpecies(sp.value));
        container.appendChild(row);
    });

    // show "no results" if empty
    if (container.children.length === 0) {
        container.innerHTML = `
        <div style="padding:14px 10px; text-align:center; font-family:'Arial'; font-size:10px; color:#4a6070;">
            No species found
        </div>`;
    }
}


function processSpeciesData(speciesData) {
    console.log(`Processing ${speciesData.length} records...`);

    speciesData.forEach(record => {
        let {Deployment, Species, MaxN} = record;
        if (!deploymentSpecies[Deployment]) {
            deploymentSpecies[Deployment] = [];
        }

        deploymentSpecies[Deployment].push({ species: Species, maxn: parseInt(MaxN)});

        if (!uniqueSpecies.includes(Species)){
            speciesSelection.push({
                value: Species,
                label: "-"
            });
            uniqueSpecies.push(Species);
        }
    });

    Object.entries(deploymentSpecies).forEach(([depl, records]) => {
        let recordsLength = records.length;
        if (recordsLength > maxOccurence) {
            maxOccurence = recordsLength;
        }

        let maxnSum = 0;
        records.forEach((record, index) => {
            maxnSum += record.maxn;
        });

        if (maxAbundance < maxnSum) {
            maxAbundance = maxnSum;
        }
    });

    buildSpeciesList();

    console.log("max Occurence", maxOccurence);
    console.log("max Abundance", maxAbundance);

}




// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
function getDeploymentBySpecies(species_selections) {
    const result = [];
    for (const record of speciesData) {
        const deployName = record.Deployment;
        const species    = record.Species;
        if (species_selections.includes(species)) {
            if (!result.includes(deployName)) {
                result.push(deployName);
            }
        }
    }
    return result;
}
window.getDeploymentBySpecies = getDeploymentBySpecies;



function getDeploymentByDepths(depth_selections) {
    const result = [];
    for (const record of latlonData) {
        const deployName = record.deployment;
        const depth      = record.depth;
        if (depth_selections.includes(depth)) {
            result.push(deployName);
        }
    }
    return result;
}
window.getDeploymentByDepths = getDeploymentByDepths;


function getDeploymentBySubstrates(substrate_selections) {
    const result = [];
    substrate_selections.push(null);
    for (const record of latlonData) {
        const deployName = record.deployment;
        const substrate  = record.substrate;
        if (substrate_selections.includes(substrate)) {
            result.push(deployName);
        }
    }
    return result;
}
window.getDeploymentBySubstrates = getDeploymentBySubstrates;


// FILTER FUNCTION
function showAllDeploymentEntities(bool) {
    Object.entries(deploymentEntities).forEach(([depl, entity]) => {
        if (enabledDeployments.includes(depl)) {
            entity.show = bool;
        }
        else {
            entity.show = false;
        }
    });
}
window.showAllDeploymentEntities = showAllDeploymentEntities;


function showAllFailedDeploymentEntities(bool) {
    for (let entity of globalEntities) {
        if (bool && !entity.is_usable) {
            if (enabledDeployments.includes(entity.deployment)) {
                entity.show = true;
            }
        }

        if (!bool  && !entity.is_usable) {
            entity.show = false;
        }
    }

}
window.showAllFailedDeploymentEntities = showAllFailedDeploymentEntities;


function showAllOccurAbundEntities(bool) {
    Object.entries(occurAbundEntities).forEach(([depl, entity]) => {
        if (enabledDeployments.includes(depl)) {
            entity.show = bool;
        }
        else {
            entity.show = false;
        }
    });
}
window.showAllOccurAbundEntities = showAllOccurAbundEntities;


function showAllExistingMpaEntities(bool) {
    for (let ent of existingMpaEntities) {
        ent.show = bool;
    }
}
window.showAllExistingMpaEntities = showAllExistingMpaEntities;


function showAllProposedMpaEntities(bool) {
    for (let ent of proposedMpaEntities) {
        ent.show = bool;
    }
}
window.showAllProposedMpaEntities = showAllProposedMpaEntities;


function showAllEbsaEntities(bool) {
    for (const [deplName, entity] of Object.entries(ebsaEntities)) {
        if (enabledDeployments.includes(deplName)) {
            entity.show = bool;
        }
        else {
            entity.show = false;
        }
    }
}
window.showAllEbsaEntities = showAllEbsaEntities;


function showAllUpwellEntities(bool) {
    for (const [deplName, entity] of Object.entries(upwellEntities)) {
        if (enabledDeployments.includes(deplName)) {
            entity.show = bool;
        }
        else {
            entity.show = false;
        }
    }
}
window.showAllUpwellEntities = showAllUpwellEntities;

function showAllDeploymentLabels(bool) {
    for (const [deplName, entity] of Object.entries(deploymentEntities)) {
        if (enabledDeployments.includes(deplName)) {
            entity.label.show = bool;
        }
        else {
            entity.label.show = false;
        }
    }
}
window.showAllDeploymentLabels = showAllDeploymentLabels;


// - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - - 
async function main() {
    const [promLatlonData, promAreaData, promSpeciesData] = await Promise.all([
        loadDeploymentCoordinatesData(),
        loadAreaData(),
        loadSpeciesData()
    ]);

    latlonData      = promLatlonData;
    areaData        = promAreaData;
    speciesData     = promSpeciesData;


    processSpeciesData(speciesData);
    processDeploymentCoordinatesData(latlonData);
    processAreaData(areaData);

    // Fly to Sumatra region
    viewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(108.0, -3.0, 2000000),
        duration: 3
    });

    applyFilters();
}

main();