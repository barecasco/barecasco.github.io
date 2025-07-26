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

var layout = {
    autosize: true,
    showlegend: false,
    dragmode: false,
    plot_bgcolor: "#121212",       // dark plot background
    paper_bgcolor: "#121212",      // dark overall background
    font: {
        family: font_family,
        color: "#EEE"           // light font color
    },
    title: {
        text: "Monte Carlo Area Estimation",
        x: 0.5,
        xanchor: 'center',
        y: 0.97,
        font: {
            color: "#FFF"       // title font color
        }
    },
    margin: {
        l: 25,
        r: 25,
        b: 25,
        t: 25,
        pad: 4
    },
    xaxis: {
        ticks: 'none',
        showticklabels: false,
        range: [0, 1],
        autorange: false,
        showgrid: false,
        zeroline: false,
        color: '#CCC'
    },
    yaxis: {
        ticks: 'none',
        showticklabels: false,
        range: [0, 1],
        autorange: false,
        showgrid: false,
        zeroline: false,
        scaleanchor: "x",
        scaleratio: 1,
        color: '#CCC'
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
            line: {
                color: '#362a0cff'
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
                width: 0.5,
                color: 'rgba(255, 255, 255, 0.2)'
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
            y: 0.0,
            xanchor: 'center',
            yref: 'paper',
            xref: 'paper',
            align: 'center',
            showarrow: false,
            font: {
                family: font_family,
                color: "white",
                size: 12
            },
            bgcolor: '#121212',
            // bordercolor: '#c7c7c7',
            // borderwidth: 2,
            // borderpad: 4,     
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
        marker: { color: '#c5c6c6ff', size: 3}, // updated
        hoverinfo: 'none'
    };

    const mc_hits = {
        x: inCircles.map(point => point.x),
        y: inCircles.map(point => point.y),
        mode: 'markers',
        type: 'scatter',
        marker: { color: '#dbac34ff', size: 3 }, // updated
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
        marker: { color: '#c5c6c6ff', size: 3}, // updated
        // hoverinfo: 'none'
    };

    const mc_hits = {
        x: inCircles.map(point => point.x),
        y: inCircles.map(point => point.y),
        mode: 'markers',
        type: 'scatter',
        marker: { color: '#dbac34ff', size: 3 }, // updated
        // hoverinfo: 'none'
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
