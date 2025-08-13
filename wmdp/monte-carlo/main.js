// ----------------------------------------------------------------------------- SCRIPT PARAMETER




// ----------------------------------------------------------------------------- DATA LOADING




// ----------------------------------------------------------------------------- INITIALIZE FILTERS




// ----------------------------------------------------------------------------- FILTER DATA FUNCTION




// ----------------------------------------------------------------------------- CREATE & UPDATE PLOT




// ----------------------------------------------------------------------------- UPDATE VISUALIZATIONS
function updateDashboard() {

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