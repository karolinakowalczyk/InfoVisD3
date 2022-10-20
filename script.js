function init() {
    console.log('init')
    drawScatterPlot()
}

function drawScatterPlot(){
    d3.csv('data/disneyland_reviews_filtered.csv')
        .then (data =>{
            console.log(data)
        })
        .catch(error => {
            console.error('Error loading the data!')
        })
}