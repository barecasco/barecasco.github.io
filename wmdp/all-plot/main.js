// ----------------------------------------------------------------------------- SCRIPT PARAMETER



// ----------------------------------------------------------------------------- DATA LOADING
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
    
    const addedLayout = {
        height          : 400,
        showlegend  : false,
        hovermode   : 'closest',
        xaxis: {
            title: {
                text: 'GDP per Capita'
            },
            showgrid: true,
            zeroline: false
        },
        yaxis: {
            title: {
                text: 'Percent'
            },
            showline: false
        }
    }

    const layout = deepMergeImmutable(defaultLayout, addedLayout);


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


    const addedLayout = {
        showlegend  : false,
        height      : 600,
        // width       : 900,

        xaxis: {
            showline        : true,
            showgrid        : false,
            showticklabels  : true,
            linecolor   : 'rgba(255, 255, 255, 1)',
            linewidth   : 2,
            tickmode    : 'linear',
            ticks       : 'outside',
            tickcolor   : 'rgba(255, 255, 255, 1)',
            tickwidth   : 2,
            ticklen     : 5,
            tickfont: {
                family  : 'Arial',
                size    : 12,
                color   : 'rgba(255, 255, 255, 1)'
            }
        },

        yaxis: {
            showgrid: false,
            zeroline: false,
            showline: false,
            showticklabels: false
        },
        // autosize: false,

        margin: {
            autoexpand: true,
            l: 100,
        },

        annotations: [
            {
                xref: 'paper',
                yref: 'paper',
                x: 0.5,
                y: -0.1,
                xanchor: 'center',
                yanchor: 'top',
                text: 'Source: Pew Research Center & Storytelling with data',
                showarrow: false,
                font: {
                    family: 'Arial',
                    size: 12,
                    color: 'rgba(255, 255, 255, 1)'
            }
            }
        ]
    };


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

        addedLayout.annotations.push(result, result2);
    }

    const layout = deepMergeImmutable(defaultLayout, addedLayout);


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
    updateMetrics(observerFish);
    createSummaryTable(observerFish);
    createTrophicDiversity(observerFish);
    createScatterPlotSample();
    createSlopGraphSample();
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