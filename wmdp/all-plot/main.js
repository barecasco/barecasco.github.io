// ----------------------------------------------------------------------------- SCRIPT PARAMETER



// ----------------------------------------------------------------------------- DATA LOADING
function loadDefaultLayout() {
    try {
        const layoutRequest = new XMLHttpRequest();
        layoutRequest.open('GET', '../layout.json', false);
        layoutRequest.send();

        if (layoutRequest.status === 200) {
            const defaultLayout = JSON.parse(layoutRequest.responseText);
            return defaultLayout;
        } else {
            throw new Error('Failed to load data file');
        }
    } catch (error) {
        console.error('Error loading data files:', error);
    }    
}


function loadObserveFishData() {
    try {
        // Try to load the JSON files synchronously using XMLHttpRequest
        const observeRequest = new XMLHttpRequest();
        observeRequest.open('GET', '../data/observe_fish.json', false);
        observeRequest.send();

        if (observeRequest.status === 200) {
            const observeFish = JSON.parse(observeRequest.responseText);
            return observeFish;
        } else {
            throw new Error('Failed to load data file');
        }
    } catch (error) {
        console.error('Error loading data files:', error);
    }    
}


function loadSiteFishData() {
    try {
        const siteRequest = new XMLHttpRequest();
        siteRequest.open('GET', '../data/site_fish.json', false);
        siteRequest.send();

        if (siteRequest.status === 200) {
            const siteFish = JSON.parse(siteRequest.responseText);
            return siteFish;
        } else {
            throw new Error('Failed to load data files');
        }
    } catch (error) {
        console.error('Error loading data file:', error);
    }
}

const observerFish  = loadObserveFishData();
const siteFish      = loadSiteFishData();
const defaultLayout = loadDefaultLayout();



// ----------------------------------------------------------------------------- INITIALIZE FILTERS
function populateSelect(selectId, values) {
    const select = document.getElementById(selectId);
    values.forEach(value => {
        const option        = document.createElement('option');
        option.value        = value;
        option.textContent  = value;
        select.appendChild(option);
    });
}


function initializeFilters() {
    const trophicValues = [...new Set(observeFish.map(d => d.trophic))];
    populateSelect('trophic-filter', trophicValues);
}





// ----------------------------------------------------------------------------- FILTER DATA FUNCTION
// Apply filters before updating the dashboard
function filterData() {
    let filtered    = observeFish.slice();

    // const trophic  = document.getElementById('trophic-filter').value;

    // if (trophic !== 'all') {
    //     filtered = filtered.filter(d => d.trophic === trophic);
    // }

    return filtered;
}




// ----------------------------------------------------------------------------- CREATE & UPDATE PLOT
function updateMetrics(data) {
    const totalObs      = data.length;
    const uniqueSpecies = new Set(data.map(d => d.species)).size;
    const totalSites    = new Set(data.map(d => d.site_name)).size;

    document.getElementById('total-observations').textContent   = totalObs.toLocaleString();
    document.getElementById('total-species').textContent        = uniqueSpecies.toLocaleString();
    document.getElementById('total-sites').textContent          = totalSites.toLocaleString();
}


function createSummaryTable(data) {
    const summary = {};
    data.forEach(d => {
        const key = `${d.family}_${d.trophic}_${d['control/mpa']}`;
        if (!summary[key]) {
            summary[key] = {
                family: d.family,
                trophic: d.trophic,
                'control/mpa': d['control/mpa'],
                species: new Set(),
                biomass: [],
                density: [],
                size: []
            };
        }
        summary[key].species.add(d.species);
        summary[key].biomass.push(d['biomass_(kg/ha)']);
        summary[key].density.push(d['density_(n/ha)']);
        summary[key].size.push(d['size_(cm)']);
    });

    const tableData = Object.values(summary).map(s => ({
        family: s.family,
        trophic: s.trophic,
        'control/mpa': s['control/mpa'],
        species: s.species.size,
        'biomass_(kg/ha)': (s.biomass.reduce((a, b) => a + b, 0) / s.biomass.length).toFixed(2),
        'density_(n/ha)': (s.density.reduce((a, b) => a + b, 0) / s.density.length).toFixed(2),
        'size_(cm)': (s.size.reduce((a, b) => a + b, 0) / s.size.length).toFixed(2)
    }));

    let tableHtml = `
        <table>
            <thead>
                <tr>
                    <th>Family</th>
                    <th>Trophic</th>
                    <th>Control/MPA</th>
                    <th>Species Count</th>
                    <th>Avg Biomass (kg/ha)</th>
                    <th>Avg Density (n/ha)</th>
                    <th>Avg Size (cm)</th>
                </tr>
            </thead>
            <tbody>
    `;

    tableData.slice(0, 6).forEach(row => {
        tableHtml += `
            <tr>
                <td>${row.family}</td>
                <td>${row.trophic}</td>
                <td>${row['control/mpa']}</td>
                <td>${row.species}</td>
                <td>${row['biomass_(kg/ha)']}</td>
                <td>${row['density_(n/ha)']}</td>
                <td>${row['size_(cm)']}</td>
            </tr>
        `;
    });

    tableHtml += '</tbody></table>';
    document.getElementById('summary-table').innerHTML = tableHtml;
}


// Create bar chart example
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



    const addedLayout = {
        height          : 400,
        yaxis: { 
            title: {
                text: 'Number of Species',
            },
        },
    };

    const layout = {...defaultLayout, ...addedLayout}

    let trophic_config = {
        responsive      : true,
        modeBarButtons  : [
            ['toImage', 'pan2d', 'resetViews']
        ]    
    }

    Plotly.newPlot('trophic-diversity', [trace], layout, trophic_config);
}


// create scatter plot example
function createScatterPlotSample(data) {
           const x = [];
            const y = [];
            
            for (let i = 0; i < 100; i++) {
                x.push(Math.random() * 100); // Random x between 0 and 100
                y.push(Math.random() * 100); // Random y between 0 and 100
            }
            
            // Create the scatter plot data
            const trace = {
                x: x,
                y: y,
                mode: 'markers',
                type: 'scatter',
                name: 'Random Points',
                marker: {
                    color: 'rgb(31, 119, 180)',
                    size: 8,
                    opacity: 0.7
                }
            };
            

            const addedLayout = {
                height          : 400,
                xaxis           : { 
                    title: {
                        text: 'X Axis',
                    },
                    range   : [-5, 105],
                },

                yaxis: { 
                    range   : [-5, 105],
                    title: {
                        text   : 'Y Axis',
                    },
                },
                
                showlegend: false,
                hovermode: 'closest'
            };
            const layout = {...defaultLayout, ...addedLayout};
            
            // Plot configuration
            const config = {
                responsive      : true,
                displayModeBar  : true,
                modeBarButtons  : [
                    ['toImage', 'pan2d', 'resetViews']
                ]   
            };
            
            // Create the plot
            Plotly.newPlot('scatter-plot-container', [trace], layout, config);
}


// ----------------------------------------------------------------------------- UPDATE VISUALIZATIONS
function updateDashboard() {
    updateMetrics(observerFish);
    createSummaryTable(observerFish);
    createTrophicDiversity(observerFish);
    createScatterPlotSample();
}


// ----------------------------------------------------------------------------- EVENT LISTENERS
// document.getElementById('trophic-filter').addEventListener('change', updateDashboard);



// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
// MAIN
// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 

// initializeFilters();
updateDashboard();


// ----------------------------------------------------------------------------- Handle window resize
window.addEventListener('resize', function() {
    // const plotIds = ['biomass-boxplot', 'trophic-diversity', 'temporal-trends', 'size-distribution', 'site-map', 'environmental-factors'];
    // plotIds.forEach(id => {
    //     Plotly.Plots.resize(id);
    // });
});