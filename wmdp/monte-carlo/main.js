// ----------------------------------------------------------------------------- SCRIPT PARAMETER



// ----------------------------------------------------------------------------- DATA LOADING
function loadObserveFishData() {
    try {
        // Try to load the JSON files synchronously using XMLHttpRequest
        const observeRequest = new XMLHttpRequest();
        observeRequest.open('GET', '../data/observe_fish.json', false);
        observeRequest.send();

        if (observeRequest.status === 200) {
            const observerFish = JSON.parse(observeRequest.responseText);
            return observerFish;
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
    const mpaValues = [...new Set(observerFish.map(d => d['control/mpa']))];
    const yearValues = [...new Set(observerFish.map(d => d.year))].sort();
    const trophicValues = [...new Set(observerFish.map(d => d.trophic))];
    const familyValues = [...new Set(observerFish.map(d => d.family))];

    populateSelect('mpa-control-filter', mpaValues);
    populateSelect('year-filter', yearValues);
    populateSelect('trophic-filter', trophicValues);
    populateSelect('family-filter', familyValues);
}

function populateSelect(selectId, values) {
    const select = document.getElementById(selectId);
    values.forEach(value => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
    });
}




// ----------------------------------------------------------------------------- FILTER DATA FUNCTION
// Filter data function
function filterData() {
    const mpaControl = document.getElementById('mpa-control-filter').value;
    const year = document.getElementById('year-filter').value;
    const trophic = document.getElementById('trophic-filter').value;
    const family = document.getElementById('family-filter').value;

    let filtered = observerFish.slice();

    if (mpaControl !== 'all') {
        filtered = filtered.filter(d => d['control/mpa'] === mpaControl);
    }
    if (year !== 'all') {
        filtered = filtered.filter(d => d.year == year);
    }
    if (trophic !== 'all') {
        filtered = filtered.filter(d => d.trophic === trophic);
    }
    if (family !== 'all') {
        filtered = filtered.filter(d => d.family === family);
    }

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
        width: 0.6,
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


    const layout = loadLayouts("./layouts.json", "trophic_diversity");

    let trophic_config = {
        responsive      : true,
        modeBarButtons  : [
            ['toImage', 'pan2d', 'resetViews']
        ]    
    }

    Plotly.newPlot('trophic-diversity', [trace], layout, trophic_config);
}



// Create site map
function createSiteMap(data) {
    const siteData = {};
    data.forEach(d => {
        if (!siteData[d.sea_site_id]) {
            const site = siteFish.find(s => s.sea_site_id === d.sea_site_id);
            siteData[d.sea_site_id] = {
                lat: site.latitude,
                lon: site.longitude,
                site_name: site.site_name,
                mpa_control: site['mpa/control'],
                biomass: [],
                density: []
            };
        }
        siteData[d.sea_site_id].biomass.push(d['biomass_(kg/ha)']);
        siteData[d.sea_site_id].density.push(d['density_(n/ha)']);
    });

    const siteArray = Object.values(siteData);
    const avgBiomass = siteArray.map(site => 
        site.biomass.reduce((a, b) => a + b, 0) / site.biomass.length
    );

    const trace = {
        type: 'scattermapbox',
        lat: siteArray.map(s => s.lat),
        lon: siteArray.map(s => s.lon),
        mode: 'markers',
        marker: {
            size: avgBiomass.map(b => Math.max(2, 3*Math.log(b))),
            color: siteArray.map(s => s.mpa_control === 'MPA' ? 'rgb(59,117,175)' : 'rgb(239,134,54)'),
            opacity: 0.7
        },
        text: siteArray.map(s => `${s.site_name}<br>lat: ${s.lat}<br>lon: ${s.lon}<br>mpa: ${s.mpa_control}<br>avg_bmass: ${(s.biomass.reduce((a, b) => a + b, 0) / s.biomass.length).toFixed(2)} kg/ha`),
        hovertemplate: '%{text}<extra></extra>'
    };

    const layout = {
        title: {
            text: 'Site Locations',
            x: 0.02,          
            y: 0.96,   
            xanchor: 'left', 
            yanchor: 'top',
            font: {
                family: 'Arial, sans-serif',
                size: 19,
                weight: 'bold',
                color: '#ffffff'
            }
        },
        mapbox: {
            style: 'carto-darkmatter',
            center: { lat: -0.02739, lon: 128.66352 },
            zoom: 7
        },
        height: 430,
        margin: { t: 0, b: 0, l: 0, r: 0 },
        paper_bgcolor: "#121212",
    };

    let site_config = {
        responsive: true, 
        scrollZoom: true,
        modeBarButtons: [
            ['toImage', 'resetViews']
        ]
    }
    Plotly.newPlot('site-map', [trace], layout, site_config);
}



function createScatterPlotSample() {
    var trace1 = {
        x: [52698, 43117],
        y: [53, 31],
        mode: 'markers',
        name: 'North America',
        text: ['United States', 'Canada'],
        marker: {
            color: 'rgb(164, 194, 244)',
            size: 12,
            line: {
            color: 'white',
            width: 0.5
            }
        },
        type: 'scatter'
    };

    var trace2 = {
        x: [39317, 37236, 35650, 30066, 29570, 27159, 23557, 21046, 18007],
        y: [33, 20, 13, 19, 27, 19, 49, 44, 38],
        mode: 'markers',
        name: 'Europe',
        text: ['Germany', 'Britain', 'France', 'Spain', 'Italy', 'Czech Rep.', 'Greece', 'Poland'],
        marker: {
            color: 'rgb(255, 217, 102)',
            size: 12
        },
        type: 'scatter'
    };

    var trace3 = {
        x: [42952, 37037, 33106, 17478, 9813, 5253, 4692, 3899],
        y: [23, 42, 54, 89, 14, 99, 93, 70],
        mode: 'markers',
        name: 'Asia/Pacific',
        text: ['Australia', 'Japan', 'South Korea', 'Malaysia', 'China', 'Indonesia', 'Philippines', 'India'],
        marker: {
            color: 'rgb(234, 153, 153)',
            size: 12
        },
        type: 'scatter'
    };

    var trace4 = {
        x: [19097, 18601, 15595, 13546, 12026, 7434, 5419],
        y: [43, 47, 56, 80, 86, 93, 80],
        mode: 'markers',
        name: 'Latin America',
        text: ['Chile', 'Argentina', 'Mexico', 'Venezuela', 'Venezuela', 'El Salvador', 'Bolivia'],
        marker: {
            color: 'rgb(142, 124, 195)',
            size: 12
        },
        type: 'scatter'
    };
    

    const layout = loadLayouts("./layouts.json", "scatter_plot");


    // Plot configuration
    const config = {
        responsive      : true,
        displayModeBar  : true,
        modeBarButtons  : [
            ['toImage', 'pan2d', 'resetViews']
        ]   
    };
    
    // Create the plot
    const dataset = [trace1, trace2, trace3, trace4];

    Plotly.newPlot('scatter-plot-container', dataset, layout, config);
}


function createSlopGraphSample() {

    var xData = [
        [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013],
        [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013],
        [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013],
        [2001, 2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2013]
    ];

    var yData = [
        [74, 82, 80, 74, 73, 72, 74, 70, 70, 66, 66, 69],
        [45, 42, 50, 46, 36, 36, 34, 35, 32, 31, 31, 28],
        [13, 14, 20, 24, 20, 24, 24, 40, 35, 41, 43, 50],
        [18, 21, 18, 21, 16, 14, 13, 18, 17, 16, 19, 23]
    ];

    var colors = [
        'rgba(67,67,67,1)', 
        'rgba(115,115,115,1)', 
        'rgba(49,130,189, 1)',
        'rgba(189,189,189,1)'
    ];

    var lineSize    = [2, 2, 4, 2];
    var labels      = ['Television', 'Newspaper', 'Internet', 'Radio'];
    var data        = [];

    for ( var i = 0 ; i < xData.length ; i++ ) {
        var result = {
            x       : xData[i],
            y       : yData[i],
            type    : 'scatter',
            mode    : 'lines',
            line    : {
                color   : colors[i],
                width   : lineSize[i]
            }
        };
        
        var result2 = {
            x       : [xData[i][0], xData[i][11]],
            y       : [yData[i][0], yData[i][11]],
            type    : 'scatter',
            mode    : 'markers',
            marker  : {
            color   : colors[i],
            size    : 12
            }
        };

        data.push(result, result2);
    }


    const layout = loadLayouts("./layouts.json", "slope_graph")

    for( var i = 0 ; i < xData.length ; i++ ) {
        var result = {
            xref    : 'paper',
            x       : 0.05,
            y       : yData[i][0],
            xanchor : 'right',
            yanchor : 'middle',
            text    : labels[i] + ' ' + yData[i][0] +'%',
            font    : {
                family  : 'Arial',
                size    : 14,
                color   : 'white',
            },
            showarrow: false,
        };

        let lastIndex = yData[i].length - 1;
        var result2 = {
            xref    : 'paper',
            x       : 0.95,
            y       : yData[i][lastIndex],
            xanchor : 'left',
            yanchor : 'middle',
            text    : yData[i][lastIndex] +'%',
            font    : {
                family  : 'Arial',
                size    : 14,
                color   : 'white'
            },
            showarrow : false
        };

        layout.annotations.push(result, result2);
    }


    // Plot configuration
    const config = {
        responsive      : true,
        displayModeBar  : true,
        modeBarButtons  : [
            ['toImage', 'pan2d', 'resetViews']
        ]   
    };
    // Create the plot

    Plotly.newPlot('slopegraph-container', data, layout, config);    
}


// ----------------------------------------------------------------------------- UPDATE VISUALIZATIONS
function updateDashboard() {
    const filteredData = filterData();
    
    updateMetrics(filteredData);
    // createSizeDistribution(filteredData);
    createTrophicDiversity(filteredData);
    // createTemporalTrends(filteredData);
    // createBiomassBoxplot(filteredData);
    createSiteMap(filteredData);
    // createEnvironmentalFactors(filteredData);
    createSummaryTable(filteredData);
    createSlopGraphSample();
}


// ----------------------------------------------------------------------------- EVENT LISTENERS
document.getElementById('mpa-control-filter').addEventListener('change', updateDashboard);
document.getElementById('year-filter').addEventListener('change', updateDashboard);
document.getElementById('trophic-filter').addEventListener('change', updateDashboard);
document.getElementById('family-filter').addEventListener('change', updateDashboard);



// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 
// MAIN
// + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + + 

initializeFilters();
updateDashboard();


// ----------------------------------------------------------------------------- Handle window resize
window.addEventListener('resize', function() {
    // const plotIds = ['biomass-boxplot', 'trophic-diversity', 'temporal-trends', 'size-distribution', 'site-map', 'environmental-factors'];
    // plotIds.forEach(id => {
    //     Plotly.Plots.resize(id);
    // });
});