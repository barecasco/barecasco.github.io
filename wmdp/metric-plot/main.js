// ----------------------------------------------------------------------------- Script parameters
const chart_bg = "#1a1a1a"


// ----------------------------------------------------------------------------- Data loading
function loadDataFromFiles() {
    try {
        // Try to load the JSON files synchronously using XMLHttpRequest
        const observeRequest = new XMLHttpRequest();
        observeRequest.open('GET', '../data/observe_fish.json', false);
        observeRequest.send();

        const siteRequest = new XMLHttpRequest();
        siteRequest.open('GET', '../data/site_fish.json', false);
        siteRequest.send();

        if (observeRequest.status === 200 && siteRequest.status === 200) {
            const observeFish = JSON.parse(observeRequest.responseText);
            const siteFish = JSON.parse(siteRequest.responseText);
            return { observeFish, siteFish };
        } else {
            throw new Error('Failed to load data files');
        }
    } catch (error) {
        console.error('Error loading data files:', error);
    }
}

const { observeFish, siteFish } = loadDataFromFiles();



// ----------------------------------------------------------------------------- Initialize filters
function initializeFilters() {
    const trophicValues = [...new Set(observeFish.map(d => d.trophic))];
    populateSelect('trophic-filter', trophicValues);
}

function populateSelect(selectId, values) {
    const select = document.getElementById(selectId);
    values.forEach(value => {
        const option        = document.createElement('option');
        option.value        = value;
        option.textContent  = value;
        select.appendChild(option);
    });
}


// ----------------------------------------------------------------------------- Filter data function
function filterData() {
    const trophic  = document.getElementById('trophic-filter').value;
    let filtered    = observeFish.slice();

    if (trophic !== 'all') {
        filtered = filtered.filter(d => d.trophic === trophic);
    }

    return filtered;
}


// ----------------------------------------------------------------------------- Update plot
function updateMetrics(data) {
    const totalObs      = data.length;
    const uniqueSpecies = new Set(data.map(d => d.species)).size;
    // const avgBiomass    = data.length > 0 ? (data.reduce((sum, d) => sum + d['biomass_(kg/ha)'], 0) / data.length).toFixed(2) : '0.00';
    const totalSites    = new Set(data.map(d => d.site_name)).size;

    document.getElementById('total-observations').textContent   = totalObs.toLocaleString();
    document.getElementById('total-species').textContent        = uniqueSpecies.toLocaleString();
    document.getElementById('total-sites').textContent          = totalSites.toLocaleString();
}


// ----------------------------------------------------------------------------- Update dashboard
function updateDashboard() {
    const filteredData = filterData();
    updateMetrics(filteredData);
}


// ----------------------------------------------------------------------------- Event listeners
document.getElementById('trophic-filter').addEventListener('change', updateDashboard);


// ----------------------------------------------------------------------------- Initialize
initializeFilters();
updateDashboard();


// ----------------------------------------------------------------------------- Handle window resize
window.addEventListener('resize', function() {
    // const plotIds = ['biomass-boxplot', 'trophic-diversity', 'temporal-trends', 'size-distribution', 'site-map', 'environmental-factors'];
    // plotIds.forEach(id => {
    //     Plotly.Plots.resize(id);
    // });
});