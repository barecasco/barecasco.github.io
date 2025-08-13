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

// const observerFish      = loadObserveFishData();
// const siteFish          = loadSiteFishData();


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
// create scatter plot example
function createMultiTrace() {
    let trace1 = {
        x       : [1, 2, 3, 4],
        y       : [10, 15, 13, 17],
        mode    : 'markers',
        marker  : {
            color   : 'rgb(219, 64, 82)',
            size    : 12
        }
    };

    let trace2 = {
        x       : [2, 3, 4, 5],
        y       : [16, 5, 11, 9],
        mode    : 'lines',
        line    : {
            color   : 'rgb(55, 128, 191)',
            width   : 3
        }
    };

    let trace3 = {
        x       : [1, 2, 3, 4],
        y       : [12, 9, 15, 12],
        mode    : 'lines+markers',
        marker  : {
            color   : 'rgb(128, 0, 128)',
            size    : 8
        },
        line    : {
            color   : 'rgb(128, 0, 128)',
            width   : 1
        }
    };
    
    const layout = loadLayouts("./layouts.json", "multi_trace");

    // Plot configuration
    const config = {
        responsive      : true,
        displayModeBar  : true,
        modeBarButtons  : [
            ['toImage', 'pan2d', 'resetViews']
        ]   
    };
    
    // Create the plot
    const dataset = [trace1, trace2, trace3];

    Plotly.newPlot('multi-trace-container', dataset, layout, config);
}


function createColorAssignment() {
    var trace1 = {
        x: [52698, 43117],
        y: [53, 31],
        mode: 'lines',
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
        mode: 'lines',
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
        mode: 'lines',
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
        mode: 'lines',
        name: 'Latin America',
        text: ['Chile', 'Argentina', 'Mexico', 'Venezuela', 'Venezuela', 'El Salvador', 'Bolivia'],
        marker: {
            color: 'rgb(142, 124, 195)',
            size: 12
        },
        type: 'scatter'
    };
    
    const addedLayout = {

    }

    const layout = loadLayouts("./layouts.json", "color_assignment");

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

    Plotly.newPlot('color-assignment-container', dataset, layout, config);
}



function createInterpolation() {
    var trace1 = {
        x: [1, 2, 3, 4, 5],
        y: [1, 3, 2, 3, 1],
        mode: 'lines+markers',
        name: 'linear',
        line: {shape: 'linear'},
        type: 'scatter'
    };

    var trace2 = {
        x: [1, 2, 3, 4, 5],
        y: [6, 8, 7, 8, 6],
        mode: 'lines+markers',
        name: 'spline',
        text: ['tweak line smoothness<br>with "smoothing" in line object', 'tweak line smoothness<br>with "smoothing" in line object', 'tweak line smoothness<br>with "smoothing" in line object', 'tweak line smoothness<br>with "smoothing" in line object', 'tweak line smoothness<br>with "smoothing" in line object', 'tweak line smoothness<br>with "smoothing" in line object'],
        line: {
            shape       : 'spline', 
            smoothing   : 1,
            dash        : "dot"
        },
        type: 'scatter'
    };

    var trace3 = {
        x: [1, 2, 3, 4, 5],
        y: [11, 13, 12, 13, 11],
        mode: 'lines+markers',
        name: 'vhv',
        line: {shape: 'vhv'},
        type: 'scatter'
    };

    var trace4 = {
        x: [1, 2, 3, 4, 5],
        y: [16, 18, 17, 18, 16],
        mode: 'lines+markers',
        name: 'hvh',
        line: {shape: 'hvh'},
        type: 'scatter'
    };

    var trace5 = {
        x: [1, 2, 3, 4, 5],
        y: [21, 23, 22, 23, 21],
        mode: 'lines+markers',
        name: 'vh',
        line: {shape: 'vh'},
        type: 'scatter'
    };

    var trace6 = {
        x: [1, 2, 3, 4, 5],
        y: [26, 28, 27, 28, 26],
        mode: 'lines+markers',
        name: 'hv',
        line: {shape: 'hv'},
        type: 'scatter'
    };

    var data        = [trace1, trace2, trace3, trace4, trace5, trace6];
    const layout    = loadLayouts("./layouts.json", "interpolation");

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

    Plotly.newPlot('interpolation-container', dataset, layout, config);
}


function createSlopeGraph() {

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

    const layout = loadLayouts("./layouts.json", "slope_graph");

    // programmatically add layout properties
    // for the annotation
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

    Plotly.newPlot('slope-graph-container', data, layout, config);
}


function createConditionalTrace() {
    const range     = [];
    const values    = [];
    const mcolors   = [];
    let rangeLength = 100;
    let step        = 2 * Math.PI / rangeLength;
    for (let i = 0; i < 100; i++) {
        let num = i * step;
        let val = Math.sin(num);
        let col = val < 0 ?'rgb(219, 64, 82)' : 'rgba(35, 98, 165, 1)';
        range.push(num);
        values.push(val);
        mcolors.push(col);
    }

    let trace1 = {
        x       : range,
        y       : values,
        mode    : 'markers',
        marker  : {
            color   : mcolors,
            size    : 2
        }
    };

    const layout = loadLayouts("./layouts.json", "conditional_trace");

    // Plot configuration
    const config = {
        responsive      : true,
        displayModeBar  : false,
    };
    
    // Create the plot
    const dataset = [trace1];

    Plotly.newPlot('conditional-trace-container', dataset, layout, config);
}


function createBandedPlot3() {
    const data = generateStochasticSineData(0.15);
    
    // Create 95% and 68% confidence intervals
    const upper95 = data.y.map(y => y + 0.5);
    const lower95 = data.y.map(y => y - 0.5);
    const upper68 = data.y.map(y => y + 0.25);
    const lower68 = data.y.map(y => y - 0.25);
    
    const traces = [
        // 95% CI
        {
            x: data.x,
            y: upper95,
            fill: 'tonexty',
            fillcolor: 'rgba(31,119,180,0)',
            line: { color: 'transparent' },
            name: '95% CI',
            showlegend: false,
            hoverinfo: 'skip'
        },
        {
            x: data.x,
            y: lower95,
            fill: 'tonexty',
            fillcolor: 'rgba(31,119,180,0.1)',
            line: { color: 'transparent' },
            name: '95% CI',
            legendgroup: '95%',
            hoverinfo: 'skip'
        },

        // 68% CI
        {
            x: data.x,
            y: upper68,
            fill: 'tonexty',
            fillcolor: 'rgba(31,119,180,0)',
            line: { color: 'transparent' },
            name: '68% CI',
            showlegend: false,
            hoverinfo: 'skip'
        },
        {
            x: data.x,
            y: lower68,
            fill: 'tonexty',
            fillcolor: 'rgba(31,119,180,0.2)',
            line: { color: 'transparent' },
            name: '68% CI',
            legendgroup: '68%',
            hoverinfo: 'skip'
        },

        // Main line
        {
            x: data.x,
            y: data.y,
            line: { color: 'rgb(31,119,180)', width: 1 },
            name: 'Mean',
            hovertemplate: 'Mean: %{y:.2f}<extra></extra>'
        }
    ];
    
    const layout = loadLayouts("./layouts.json", "banded_plot");
    Plotly.newPlot('banded-plot-container', traces, layout);
}

// ----------------------------------------------------------------------------- UPDATE VISUALIZATIONS
function updateDashboard() {
    createMultiTrace();
    createColorAssignment();
    createInterpolation();
    createSlopeGraph();
    createConditionalTrace();
    createBandedPlot3();
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
    // const plotIds = ['plot-div-id-1', 'plot-div-id-2', 'plot-div-id-etc'];
    // plotIds.forEach(id => {
    //     Plotly.Plots.resize(id);
    // });
});