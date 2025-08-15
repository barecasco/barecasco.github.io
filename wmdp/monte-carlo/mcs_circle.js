// ------------------------------------------------------------------------------
// PARAMETERS

// The circle
// const cx = 0.5;
// const cy = 0.5;
// const r  = 0.3;
// const text_margin = 0.03;
// const text_ldiff  = 0.07;
// const font_family = 'Arial, Helvetica, sans-serif';

const true_area       = Math.PI * r * r;
const simulate_button = document.getElementById('simulate-button');
const nrepeat_input   = document.getElementById('mcs-number-input');


const conv_displayConfig = {
    displayModeBar: false,
    responsive: true
};


let convergence_layout   = {
    plot_bgcolor: '#121212',
    paper_bgcolor: '#121212',
    font: {
        color: '#ffffff'
    },
    grid: {
        rows: 2,
        columns: 1,
        pattern: 'independent',
        roworder: 'top to bottom',
    },
    legend: {
        orientation: 'h',
        x: 0.52,
        y: 0.45, // Slightly above the plot
        font: {
            color: '#ffffff'
        },
        bgcolor: '#121212',
        // bordercolor: '#555555',
        // borderwidth: 1
    },
    // autosize  : true,
    height : 600,
    // width : 750,
    dragmode: false,
    // title: {
    //     text: "Monte Carlo Convergence Simulation",
    //     // x: 0.5,
    //     // xanchor: 'center',
    //     // y: 1.0,
    //     standoff:30,
    //     font: {
    //         size: 18,
    //         color: '#ffffff'
    //       }
    // },
    margin    : {
        l : 80,
        r : 80,
        b : 50,
        t : 30,
    },
    xaxis: {
        showticklabels: false,
        showgrid: false,    
        zeroline: false,
        showline:false,
        mirror: true,
        linecolor: '#555555',
        linewidth: 1,
        gridcolor: '#404040',
        range: [0,3000],
        tickfont: {
            color: '#ffffff'
        }
    },
    yaxis: {
        title: {
            text: 'Estimated Area',
            font: {
                color: '#ffffff'
            }
        },
        showticklabels: true,
        autorange: true,
        showgrid: false,
        zeroline: false,
        domain: [0.57, 0.97],
        showline:true,
        mirror: false,
        linecolor: '#555555',
        linewidth: 1,
        gridcolor: '#404040',
        ticksuffix: '  ',
        tickprefix: '    ',
        tickfont: {
            color: '#ffffff'
        }
    },
    xaxis2: {
        title: {
            text: 'N random points',
            font: {
                color: '#ffffff'
            }
        },
        showticklabels: true,
        // autorange: true,
        showgrid: false,   
        showline: false,
        mirror: true, 
        linecolor: '#555555',
        linewidth: 0,
        gridcolor: '#404040',
        zeroline: false,
        range: [0,3000],
        tickfont: {
            color: '#ffffff'
        }
    },
    yaxis2: {
        title: {
            text: 'Estimated area',
            font: {
                color: '#ffffff'
            }
        },
        showticklabels: true,
        autorange: true,
        showgrid: false,
        showline: false,
        zeroline: false,
        // range: [0.25, 0.35],
        domain: [0.0, 0.45],
        // showline:true,
        mirror: false,
        linecolor: '#555555',
        linewidth: 0,
        gridcolor: '#404040',
        ticksuffix: '  ',
        tickprefix: '    ',
        tickfont: {
            color: '#ffffff'
        }

    },

    shapes: [
        {
            type: 'line',
            x0: 0,
            y0: true_area,
            x1: 3000,
            y1: true_area,
            line: {
                color: '#FF6B9D',
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
                color: '#FF6B9D',
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
        x: 0.97,
        y: 0.95,
        xanchor: 'right',
        yref: 'paper',
        xref: 'paper',
        align: 'left',
        showarrow: false,
        font: {
            family: font_family,
            color: "#ffffff",
            size: 12
        },
        bgcolor: '#121212',
        bordercolor: '#666666',
        borderwidth: 1,
        borderpad: 7,     
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
        arrowcolor: '#dfdfdf',
        font: {
            family: font_family,
            color: "#ffffff",
            size: 12
        },
        bgcolor: '#121212',
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
        arrowcolor: '#dfdfdf',
        font: {
            family: font_family,
            color: "#ffffff",
            size: 12
        },
        bgcolor: '#121212',
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


function getMcsInputNumber() {
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

    const repeat         = getMcsInputNumber();
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
            marker: {
                color: 'rgba(255, 107, 157, 0.3)',
                size: 3
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
        mode: 'lines+markers',
        type: 'scatter',
        line: {
            color: '#4ECDC4',
            width: 1,
        },
        marker: {
            color: '#4ECDC4',
            size: 4
        },
        xaxis: 'x2',
        yaxis: 'y2'
    };

    let std_traces = {
        showlegend: true,
        name: "Average + standard deviation",
        x: nsamples,
        y: stds,
        mode: 'lines+markers',
        type: 'scatter',
        line: {
            color: '#FFE066',
            width: 1,
        },
        marker: {
            color: '#FFE066',
            size: 4
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