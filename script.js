const margin = {
    top: 20,
    right: 30,
    bottom: 40,
    left: 90
};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

function init() {
    createScatterPlot("#vi2");
    drawSlides()
}

function getSeasonColor(season) {
    if (season === 'winter'){
        return "blue"
    }
    else if (season === 'spring'){
        return "green"
    }
    else if (season === 'summer'){
        return "orange"
    }
    else if (season === 'autumn'){
        return "brown"
    }
    else {
        return "grey"
    }
}

function createScatterPlot(id) {
    const svg = d3
        .select(id)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("id", "gScatterPlot")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    d3.csv("data/disneyland_final_without_missing.csv").then(function (data) {

        const x = d3
            .scaleLinear()
            .domain([0, d3.max(data, (d) => parseInt(d.Text_length))])
            .range([0, width]);

        const y = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

        svg
         .append("circle")
         .attr("cx", width)
         .attr("cy", height-70)
         .attr("r", 8)
         .style("fill", "green")
        
        svg
         .append("text")
         .attr("text-anchor", "end")
         .attr("x", width-20)
         .attr("y", (height-66))
         .text("spring");

        svg
         .append("circle")
         .attr("cx", width)
         .attr("cy", height-50)
         .attr("r", 8)
         .style("fill", "orange")
        
        svg
         .append("text")
         .attr("text-anchor", "end")
         .attr("x", width-20)
         .attr("y", (height-46))
         .text("summer");

        svg
         .append("circle")
         .attr("cx", width)
         .attr("cy", height-30)
         .attr("r", 8)
         .style("fill", "brown")
        
        svg
         .append("text")
         .attr("text-anchor", "end")
         .attr("x", width-20)
         .attr("y", (height-26))
         .text("autumn");

         svg
         .append("circle")
         .attr("cx", width)
         .attr("cy", height-6)
         .attr("r", 8)
         .style("fill", "blue")
        
        svg
         .append("text")
         .attr("text-anchor", "end")
         .attr("x", width-20)
         .attr("y", (height))
         .text("winter");

        svg
            .selectAll("circle.circleValues")
            .data(data, (d) => d.Review_ID)
            .join("circle")
            .attr("class", "circleValues itemValue")
            .attr("cx", (d) => x(d.Text_length))
            .attr("cy", (d) => y(d.Polarity))
            .attr("r", 4)
            .style("fill", (d) => getSeasonColor(d.season))
        
        svg
            .append("g")
            .attr("id", "gXAxis")
            .attr("transform", `translate(0, ${height/2})`)
            .call(d3.axisBottom(x));

        
        svg
            .append("g")
            .attr("id", "gYAxis")
            .call(d3.axisLeft(y));
        
        svg
            .append("text")
            .attr("id", "xLabelScatterPlot")
            .attr("text-anchor", "end")
            .attr("x", width)
            .attr("y", (height/2) + 40)
            .text("text length");

        svg
            .append("text")
            .attr("class", "yLabelScatterPlot")
            .attr("text-anchor", "end")
            .attr("y", -50)
            .attr("dy", ".75em")
            .attr("transform", "rotate(-90)")
            .text("polarity");

        

    });
}


function drawSlides(){
    function createslider(element) {
        const inputs = element.querySelectorAll('input');
    
        const thumbLeft = element.querySelector('.thumb.left');
        const thumbRight = element.querySelector('.thumb.right');
        const rangeBetween = element.querySelector('.range-between');
        const labelMin = element.querySelector('.range-label-start');
        const labelMax = element.querySelector('.range-label-end');
    
        const [inputStart, inputEnd] = inputs;
        const min = parseInt(inputStart.value);
        const max = parseInt(inputEnd.value);
    
        setStartValueCustomSlider(inputStart, inputEnd, thumbLeft, rangeBetween);
        setEndValueCustomSlider(inputEnd, inputStart, thumbRight, rangeBetween);
      
        setEvents(inputStart, inputEnd, thumbLeft, thumbRight, labelMin, labelMax, rangeBetween);
    }
    

    function setLabelValue(label, input) {
        label.innerHTML = `${input.value}`;
    }
    
    
    function setStartValueCustomSlider(inputStart, inputEnd, pseudoEl, range) {
        const maximum = Math.min(parseInt(inputStart.value), parseInt(inputEnd.value) - 1);
        const percent = ((maximum - inputStart.min) / (inputStart.max - inputStart.min)) * 100;
        pseudoEl.style.left = percent + '%';
        range.style.left = percent + '%';
    }
    
    function setEndValueCustomSlider(inputEnd, inputStart ,pseudoEl, range) {
        const minimun = Math.max(parseInt(inputEnd.value), parseInt(inputStart.value) + 1);
        const percent = ((minimun - inputEnd.min) / (inputEnd.max - inputEnd.min)) * 100;
        pseudoEl.style.right = 100 - percent + '%';
        range.style.right = 100 - percent + '%';   
    }
    
    
    function setEvents(
        inputStart,
        inputEnd,
        thumbLeft,
        thumbRight,
        labelMin,
        labelMax,
        rangeBetween,
        rangesValues
    ) {
        inputStart.addEventListener('input', () => {
            setStartValueCustomSlider(inputStart, inputEnd, thumbLeft, rangeBetween);
            setLabelValue(labelMin, inputStart);
        });
      
        inputEnd.addEventListener('input', () => {
            setEndValueCustomSlider(inputEnd, inputStart, thumbRight, rangeBetween);
            setLabelValue(labelMax, inputEnd);
        });
      
        inputStart.addEventListener('mouseover', function () {
            thumbLeft.classList.add('hover');
        });
        inputStart.addEventListener('mouseout', function () {
            thumbLeft.classList.remove('hover');
        });
        inputStart.addEventListener('mousedown', function () {
            thumbLeft.classList.add('active');
        });
        inputStart.addEventListener('pointerup', function () {
            thumbLeft.classList.remove('active');
        });
    
        inputEnd.addEventListener('mouseover', function () {
            thumbRight.classList.add('hover');
        });
        inputEnd.addEventListener('mouseout', function () {
            thumbRight.classList.remove('hover');
        });
        inputEnd.addEventListener('mousedown', function () {
            thumbRight.classList.add('active');
        });
        inputEnd.addEventListener('pointerup', function () {
            thumbRight.classList.remove('active');
        });
    
        inputStart.addEventListener('touchstart', function () {
            thumbLeft.classList.add('active');
        });
        inputStart.addEventListener('touchend', function () {
            thumbLeft.classList.remove('active');
        });
        inputEnd.addEventListener('touchstart', function () {
            thumbRight.classList.add('active');
        });
        inputEnd.addEventListener('touchend', function () {
            thumbRight.classList.remove('active');
        });
    }
    
    const slider = document.querySelector(".range-slider");
    console.log(document.querySelector(".range-slider"))
    
    createslider(slider)
      
}
