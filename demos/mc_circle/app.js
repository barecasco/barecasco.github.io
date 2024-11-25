// ------------------------------------------------------------------------------
// PARAMETERS

// The circle
const cx = 0.5;
const cy = 0.5;
const r  = 0.3;
const text_margin = 0.03;
const text_ldiff  = 0.07;
const font_family = 'Arial, Helvetica, sans-serif';

const reshot_button = document.getElementById('reshoot-button');
const nshot_input   = document.getElementById('numberInput');

// Number of points
let numPoints = 10;

const displayConfig = {
    displayModeBar: false,
    responsive: true
};

var layout   = {
    autosize  : true,
    showlegend: false,
    dragmode: false,
    title: {
        text: "Monte Carlo Area Estimation",
        x: 0.5,
        xanchor: 'center',
        y: 0.95
    },
    // width    : 500,
    // height    : 500,
    margin    : {
        l : 30,
        r : 30,
        b : 10,
        t : 50,
        pad:4
    },
    xaxis: {
        ticks: 'none',
        showticklabels: false,
        range: [0, 1],
        autorange: false,
        showgrid: false,    // removes x-axis grid lines
        zeroline: false,     // removes x-axis zero line
    },
    yaxis: {
        ticks: 'none',
        showticklabels: false,
        range: [0, 1],
        autorange: false,
        showgrid: false,    // removes y-axis grid lines
        zeroline: false,     // removes y-axis zero line
        scaleanchor: "x",
        scaleratio: 1  // 1:1 ratio, modify as needed
    },

    shapes: [
        {
            type: 'circle',
            xref: 'x',
            yref: 'y',
            x0: 0.2,
            y0: 0.2,
            x1: 0.8,
            y1: 0.8,
            // fillcolor: 'rgba(50, 171, 96, 0.7)',
            line: {
                color: 'rgba(50, 171, 96, 1)'
            }
        },
        {
            type: 'rect',
            xref: 'x',
            yref: 'y',
            x0: 0,
            y0: 0,
            x1: 1,
            y1: 1,
            line: {
                width: 1.,
                color: 'rgba(100, 100, 100, 0.4)'
            }
        }
      ]
};


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
    const n_input = parseInt(nshot_input.value, 10);
    let res       = n_input;
    
    if (n_input < 10) {
        res = 10;
    }
    
    if (n_input > 3000) {
        res = 3000;
    }

    nshot_input.value = res;
    return res;
}

// ------------------------------------------------------------------------------
// LOGIC

function update_layout(numPoints, numHits, estimated_area, true_area) {
    const annotations = [
        // {
        //     text: 'Shots:' + String(numPoints),
        //     x: 1.2 - text_margin,
        //     y: 1. - text_margin,
        //     xanchor: 'right',
        //     yref: 'paper',
        //     align: 'right',
        //     showarrow: false,
        //     font: {
        //         family: font_family,
        //         color: "black",
        //         size: 12
        //     },
        //     bgcolor: '#ffffff',
        //     bordercolor: '#c7c7c7',
        //     borderwidth: 2,
        //     borderpad: 4,      
        // },
        {
            text: 'Est. area: ' + String(numHits) + "/" + String(numPoints) + " x 1" + " = " + String(estimated_area.toFixed(4)),
            x: 0.5,
            y: 0.95,
            xanchor: 'center',
            yref: 'paper',
            xref: 'paper',
            align: 'center',
            showarrow: false,
            font: {
                family: font_family,
                color: "black",
                size: 12
            },
            bgcolor: '#ffffff',
            bordercolor: '#c7c7c7',
            borderwidth: 2,
            borderpad: 4,     
        }
    ]

    return annotations;
}

function init_plot() {
    numPoints           = getInputNumber();
    const randomPoints  = generateRandomPoints(numPoints);

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

    const mc_shots = {
        x: outCircles.map(point => point.x),
        y: outCircles.map(point => point.y),
        mode: 'markers',
        type: 'scatter',
        color: 'blue',
        hoverinfo: 'none'
    };

    const mc_hits = {
        x: inCircles.map(point => point.x),
        y: inCircles.map(point => point.y),
        mode: 'markers',
        type: 'scatter',
        color: 'red',
        hoverinfo: 'none'
    };

    const true_area      = Math.PI * r * r;
    const estimated_area = inCircles.length/randomPoints.length;

    layout.annotations = update_layout(numPoints, inCircles.length, estimated_area, true_area);

    Plotly.newPlot("main-screen", [mc_shots, mc_hits], layout, displayConfig);
}


function replot() {
    numPoints           = getInputNumber();
    const randomPoints = generateRandomPoints(numPoints);

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

    const mc_shots = {
        x: outCircles.map(point => point.x),
        y: outCircles.map(point => point.y),
        mode: 'markers',
        type: 'scatter',
        color: 'blue'
    };

    const mc_hits = {
        x: inCircles.map(point => point.x),
        y: inCircles.map(point => point.y),
        mode: 'markers',
        type: 'scatter',
        color: 'red'
    };
    
    const true_area      = Math.PI * r * r;
    const estimated_area = inCircles.length/randomPoints.length;

    layout.annotations = update_layout(numPoints, inCircles.length, estimated_area, true_area);

    Plotly.animate('main-screen', 
        {
            data    : [mc_shots, mc_hits],
            traces  : [0,1],
            layout  : layout,
            config  : displayConfig
        }, 
        {
            transition: 
            {
                duration: 300,
                easing  : 'cubic-out'
            },
            frame: 
            {
                duration: 300
            }
        }
    )

}


init_plot();

reshot_button.addEventListener('click', () => {
    replot();
});

window.addEventListener('resize', function() {
    console.log("resizing");
    // Plotly.Plots.resize('main-screen');
});
