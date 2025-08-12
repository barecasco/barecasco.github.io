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
    let filtered    = observeFish.slice();

    // const trophic  = document.getElementById('trophic-filter').value;

    // if (trophic !== 'all') {
    //     filtered = filtered.filter(d => d.trophic === trophic);
    // }

    return filtered;
}


// ----------------------------------------------------------------------------- Update plot
// Create trophic diversity chart
function createTrophicDiversity(data) {
    const trophicCounts = {};
    data.forEach(d => {
        if (!trophicCounts[d.trophic]) {
            trophicCounts[d.trophic] = new Set();
        }
        trophicCounts[d.trophic].add(d.species);
    });

    const x = Object.keys(trophicCounts);
    const y = x.map(trophic => trophicCounts[trophic].size);

    const trace = {
        x: x,
        y: y,
        type: 'bar',
        marker: {
            color : [
                "#315A82",
                "#AF662E",
                "#417633",
                "#92302B",
                "#6B5189",
                "#64453E",
                "#9D5F8D",
                "#616161",
                "#8B8C38",
                "#458B97"
            ]
        },
    };

    const layout = {
        template: 'plotly_dark',
        paper_bgcolor: chart_bg,
        plot_bgcolor: chart_bg,
        height: 400,
        margin: { t: 20, b: 90, l: 60, r: 20 },
        xaxis: { 
            // title: {
            //     text: 'Trophic Level',
            //     font: { color: '#ffffff' }  // Add this
            // },
            tickfont: { color: '#ffffff' }
        },
        yaxis: { 
            title: {
                text: 'Number of Species',
                font: { color: '#ffffff' }  // Add this
            },
            tickfont: { color: '#ffffff' }
        },
        legend: {
            font: { color: '#ffffff' }
        }
    };

    let trophic_config = {
        responsive: true,
        modeBarButtons: [
            ['toImage', 'pan2d', 'resetViews']
        ]    
    }

    Plotly.newPlot('trophic-diversity', [trace], layout, trophic_config);
}


// ----------------------------------------------------------------------------- Update dashboard
function updateDashboard() {
    const filteredData = filterData();
    createTrophicDiversity(filteredData);
}


// ----------------------------------------------------------------------------- Event listeners
// document.getElementById('trophic-filter').addEventListener('change', updateDashboard);


// ----------------------------------------------------------------------------- Initialize
// initializeFilters();
updateDashboard();


// ----------------------------------------------------------------------------- Handle window resize
window.addEventListener('resize', function() {
    // const plotIds = ['biomass-boxplot', 'trophic-diversity', 'temporal-trends', 'size-distribution', 'site-map', 'environmental-factors'];
    // plotIds.forEach(id => {
    //     Plotly.Plots.resize(id);
    // });
});