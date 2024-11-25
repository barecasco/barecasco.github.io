// ------------------------------------------------------------------------------
// PARAMETERS

// The circle
const cx = 0.5;
const cy = 0.5;
const r  = 0.3;
const true_area   = Math.PI * r * r;
const text_margin = 0.03;
const text_ldiff  = 0.07;
const font_family = 'Arial, Helvetica, sans-serif';

const simulate_button = document.getElementById('simulate-button');
const nrepeat_input   = document.getElementById('numberInput');


const conv_displayConfig = {
    displayModeBar: false,
    responsive: true
};


let convergence_layout   = {
    plot_bgcolor: '#f5f5f5',
    grid: {
        rows: 2,
        columns: 1,
        pattern: 'independent',
        roworder: 'top to bottom',
    },
    legend: {
        orientation: 'h',
        x: 0.49,
        y: 0.52 // Slightly above the plot
    },
    autosize  : true,
    height : 600,
    // width : 750,
    dragmode: false,
    title: {
        text: "Monte Carlo Convergence Simulation",
        // x: 0.5,
        // xanchor: 'center',
        // y: 1.0,
        standoff:30,
        font: {
            size: 18,
            // color: '#7f7f7f'
          }
    },
    margin    : {
        l : 80,
        r : 80,
        b : 50,
        t : 50,
    },
    xaxis: {
        showticklabels: false,
        showgrid: true,    
        zeroline: false,
        showline:true,
        mirror: true,
        linecolor: 'rgba(100, 100, 100, 0.5)', // Red line color
        linewidth: 2, 
        range: [0,3000]
    },
    yaxis: {
        title: 'Estimated Area',
        showticklabels: true,
        autorange: true,
        showgrid: true,
        zeroline: false,
        domain: [0.53, 0.95],
        showline:true,
        mirror: true,
        linecolor: 'rgba(100, 100, 100, 0.5)', // Red line color
        linewidth: 2, 
        ticksuffix: '  ',
        tickprefix: '    '
    },
    xaxis2: {
        title: 'N random points',
        showticklabels: true,
        // autorange: true,
        showgrid: true,   
        showline: true,
        mirror: true, 
        linecolor: 'rgba(100, 100, 100, 0.5)', // Red line color
        linewidth: 2, 
        zeroline: false,
        range: [0,3000]
    },
    yaxis2: {
        title: 'Estimated area',
        showticklabels: true,
        autorange: true,
        showgrid: true,
        zeroline: false,
        // range: [0.25, 0.35],
        domain: [0.05, 0.45],
        showline:true,
        mirror: true,
        linecolor: 'rgba(100, 100, 100, 0.5)', // Red line color
        linewidth: 2, 
        ticksuffix: '  ',
        tickprefix: '    '

    },

    shapes: [
        {
            type: 'line',
            x0: 0,
            y0: true_area,
            x1: 3000,
            y1: true_area,
            line: {
                color: '#DD99BB',
                width: 2
            },
            name:"True Area"
        },
        {
            type: 'line',
            x0: 0,
            y0: true_area,
            x1: 3000,
            y1: true_area,
            line: {
                color: '#DD99BB',
                width: 2
            },
            name:"True Area",
            xref: 'x2',
            yref: 'y2'
        },
    ],

};

const annotations = [
    {
        text: 'The red dots are repeated estimations per N random points',
        x: 0.98,
        y: 0.92,
        xanchor: 'right',
        yref: 'paper',
        xref: 'paper',
        align: 'left',
        showarrow: false,
        font: {
            family: font_family,
            color: "black",
            size: 14
        },
        bgcolor: '#ffffff',
        bordercolor: '#333333',
        borderwidth: 1,
        borderpad: 4,     
        // ax : 20,
        // ay : 0
    },
    {
        text: 'True Area',
        x: 3000,
        y: true_area,
        xanchor: 'left',
        yanchor: 'center',
        // yref: 'paper',
        // xref: 'paper',
        align: 'left',
        showarrow: true,
        font: {
            family: font_family,
            color: "black",
            size: 13
        },
        bgcolor: '#ffffff',
        // bordercolor: '#333333',
        // borderwidth: 1,
        borderpad: 3,     
        ax : 20,
        ay : 0
    },
    {
        text: 'True Area',
        x: 3000,
        y: true_area,
        xanchor: 'left',
        yanchor: 'center',
        xref: 'x2', 
        yref: 'y2',
        align: 'left',
        showarrow: true,
        font: {
            family: font_family,
            color: "black",
            size: 13
        },
        bgcolor: '#ffffff',
        borderpad: 3,     
        ax : 20,
        ay : 0
    }
]

convergence_layout.annotations = annotations;


// ------------------------------------------------------------------------------
// UTILITIES

function generateRandomPoints(numPoints) {
    const points = [];

    for (let i = 0; i < numPoints; i++) {
        const point = {
            x: Math.random(),
            y: Math.random()
        };
        points.push(point);
    }

    return points;
}


function isPointInCircle(x, y, cx, cy, r) {
    // Calculate the distance between the point (x, y) and the circle's center (cx, cy)
    const distance = Math.sqrt(Math.pow(x - cx, 2) + Math.pow(y - cy, 2));
  
    // Check if the distance is less than or equal to the radius
    return distance <= r;
}


function getInputNumber() {
    const n_input = parseInt(nrepeat_input.value, 10);
    let res       = n_input;
    
    if (n_input < 10) {
        res = 10;
    }
    
    if (n_input > 300) {
        res = 300;
    }

    nrepeat_input.value = res;
    return res;
}


function StandardDeviation(arr) {
    // returns std and the mean
    // Creating the mean with Array.reduce
    let mean = arr.reduce((acc, curr) => {
        return acc + curr
    }, 0) / arr.length;

    // Assigning (value - mean) ^ 2 to
    // every array item
    arr = arr.map((k) => {
        return (k - mean) ** 2
    });

    // Calculating the sum of updated array 
    let sum = arr.reduce((acc, curr) => acc + curr, 0);

    // Calculating the variance
    let variance = sum / arr.length

    // Returning the standard deviation
    let std = Math.sqrt(variance);

    return [std, mean]
}


// ------------------------------------------------------------------------------
// LOGIC
function simulate_convergence() {

    function calculate_mc(nsample) {
        const randomPoints = generateRandomPoints(nsample);

        const inCircles     = [];
        const outCircles    = [];
        for (const point of randomPoints) {
            if (isPointInCircle(point.x, point.y, cx, cy, r)) {
                inCircles.push(point);
            }
            else {
                outCircles.push(point);
            }
        }
    
        const estimated_area = inCircles.length/randomPoints.length;
        return estimated_area
    }

    const repeat         = getInputNumber();
    const conv_traces    = [];
    const nsamples       = [];
    const nvalues_ls     = [];
    const stds           = [];
    const means          = [];

    for (let q = 2; q < 60; q++) {
        nsamples.push(q * 50);
        nvalues_ls.push([]);
    }

    for (let i = 0; i < repeat; i++) {
        const trace_data = [];

        //for (let nsample of nsamples) {
        for (let i = 0; i < nsamples.length; i++){
            nsample = nsamples[i];
            estarea = calculate_mc(nsample);
            trace_data.push(estarea);
            nvalues_ls[i].push(estarea);
        }
        
        let conv_trace = {
            showlegend: false,
            x: nsamples,
            y: trace_data,
            mode: 'markers',
            type: 'scatter',
            line: {
                color: 'rgba(219, 64, 82, 0.1)',
                width: 1,
            },
            // xaxis: 'x',
            yaxis: 'y',
            hoverinfo: 'none'
        };    
        conv_traces.push(conv_trace);
    }
    
    for (let nvalues of nvalues_ls) {
        const descs = StandardDeviation(nvalues);
        std     = descs[0];
        mean    = descs[1];
        stds.push(mean + std);
        means.push(mean);

    }

    let mean_traces = {
        showlegend: true,
        name: "Average of estimations",
        x: nsamples,
        y: means,
        mode: 'lines + markers',
        type: 'scatter',
        line: {
            color: '#B74C',
            width: 2,
        },
        xaxis: 'x2',
        yaxis: 'y2'
    };

    let std_traces = {
        showlegend: true,
        name: "Average + standard deviation",
        x: nsamples,
        y: stds,
        mode: 'lines + markers',
        type: 'scatter',
        line: {
            color: '#46CCB4',
            width: 2,
        },
        xaxis: 'x2',
        yaxis: 'y2'
    };

    conv_traces.push(mean_traces);
    conv_traces.push(std_traces);


    Plotly.newPlot("disperse-plot", conv_traces, convergence_layout, conv_displayConfig);    
}

simulate_convergence();

simulate_button.addEventListener('click', () => {
    simulate_convergence();
});

window.addEventListener('resize', function() {
    console.log("resizing");
    Plotly.Plots.resize('disperse-plot');
});
