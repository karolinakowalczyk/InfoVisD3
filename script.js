const margin = {
  top: 20,
  right: 30,
  bottom: 40,
  left: 90,
};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

let minPolarity = -1;
let maxPolarity = 1;
let minTextLength = 0;
let maxTextLength = 20756;

let sInput = 1990;
let eInput = 2019;


function init() {
  createChordPlot("#vi1");
  createScatterPlot("#vi2");
  createCustomizePlot("#vi3");
  createScatterPlotSeasonLabels("#seasons-labels");
  drawSlides();
}

function getSeasonColor(season) {
  if (season === "winter") {
    return "blue";
  } else if (season === "spring") {
    return "green";
  } else if (season === "summer") {
    return "Gold";
  } else if (season === "autumn") {
    return "SaddleBrown";
  } else {
    return "grey";
  }
}


function createScatterPlotSeasonLabels(id){
  const svg = d3
  .select(id)
  .attr("width", width + margin.left + margin.right)
  .attr("height", 50 + margin.top + margin.bottom)
  .append("g")
  .attr("id", "gSeasonsLabels")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg
      .append("circle")
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("r", 8)
      .style("fill", "green");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", 55)
      .attr("y", 3)
      .text("spring");

    svg
      .append("circle")
      .attr("cx", 80)
      .attr("cy", 0)
      .attr("r", 8)
      .style("fill", "Gold");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", 145)
      .attr("y", 3)
      .text("summer");

    svg
      .append("circle")
      .attr("cx", 170)
      .attr("cy", 0)
      .attr("r", 8)
      .style("fill", "SaddleBrown");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", 230)
      .attr("y", 3)
      .text("autumn");

    svg
      .append("circle")
      .attr("cx", 250)
      .attr("cy", 0)
      .attr("r", 8)
      .style("fill", "blue");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", 305)
      .attr("y", 3)
      .text("winter");

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
      .scaleLog()
      .domain([10, d3.max(data, (d) => parseInt(d.Text_length))])
      .range([0, width]);

    const y = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    function makeBrush() {

      const sel = d3.brushSelection(this);
    
      let left_top = sel[0][0];
      let right_top = sel[1][0];
      let left_bottom = sel[0][1];
      let right_bottom = sel[1][1];

      minPolarity = y.invert(right_bottom);
      maxPolarity = y.invert(left_bottom);
      minTextLength = x.invert(left_top);
      maxTextLength = x.invert(right_top);

      updateCustomizePlot(sInput, eInput, minPolarity, maxPolarity, minTextLength, maxTextLength);
    
    }

    function brushended() {
      if (!d3.brushSelection(this)) {
        minPolarity = -1;
        maxPolarity = 1;
        minTextLength = 0;
        maxTextLength = 20756;
        updateCustomizePlot(sInput, eInput, minPolarity, maxPolarity, minTextLength, maxTextLength);
        
      }   
    }  

    svg
      .selectAll("circle.circleValues")
      .data(data, (d) => d.Review_ID)
      .join("circle")
      .attr("class", "circleValues itemValue")
      .attr("cx", (d) => x(d.Text_length))
      .attr("cy", (d) => y(d.Polarity))
      .attr("r", 4)
      .style("fill", (d) => getSeasonColor(d.season));

    svg.call(d3.brush()
      .on("brush", makeBrush)
      .extent([[0, 0],[width, height]])
      .on("end", brushended)
    );

    svg
      .append("g")
      .attr("id", "gXAxisScatter")
      .attr("transform", `translate(0, ${height / 2})`)
      .call(d3.axisBottom(x));

    svg.append("g").attr("id", "gYAxisScatter").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("id", "xLabelScatterPlot")
      .attr("text-anchor", "end")
      .attr("fill", "black")
      .attr("x", width)
      .attr("y", height / 2 + 40)
      .text("text length");

    svg
      .append("text")
      .attr("class", "yLabelScatterPlot")
      .attr("text-anchor", "end")
      .attr("fill", "black")
      .attr("y", -50)
      .attr("dy", ".75em")
      .attr("transform", "rotate(-90)")
      .text("polarity");
 
  });
}











function createChordPlot(id) {
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
  });
}

function createCustomizePlot(id) {
  const svg = d3
    .select(id)
    .attr("width", width * 1.3)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "gLineChart")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  svg
    .append("text")
    .attr("class", "yLabelScatterPlot")
    .attr("text-anchor", "end")
    .attr("y", -50)
    .attr("dy", ".75em")
    .attr("transform", "rotate(-90)")
    .text("Live births, per 1,000 people");

  svg
    .append("text")
    .attr("id", "xLabelScatterPlot")
    .attr("text-anchor", "end")
    .attr("x", width)
    .attr("y", height + 30)
    .text("year");

  d3.csv("data/crude_birth_rate-filtered.csv").then(function (_data) {
    const data = _data.filter(function (elem) {
      return 1990 <= elem.Year && elem.Year <= 2019;
    });
    const birthRateGroupedByYear = _.groupBy(data, (elem) =>
      _.toInteger(elem.Year)
    );

    const meanBirthRateByYear = {};
    Object.entries(birthRateGroupedByYear).forEach(([year, list]) => {
      meanBirthRateByYear[year] =
        _.sumBy(list, (e) => _.toInteger(e["Birth rate"])) / list.length;
    });

    const yearsList = _.orderBy(Object.keys(meanBirthRateByYear), (v) =>
      _.toInteger(v)
    );

    const array = yearsList.map((year) => ({
      year: _.toInteger(year),
      birthRate: meanBirthRateByYear[year],
    }));

    const x = d3
      .scalePoint()
      .domain(array.map((d) => d.year))
      .range([0, width]);
    svg
      .append("g")
      .attr("id", "gXAxis")
      .attr("transform", `translate(0, ${height})`)
      .call(
        d3.axisBottom(x).tickFormat((x) => {
          if (x % 5) return "";
          return x;
        })
      );

    const y = d3
      .scaleLinear()
      .domain([0, d3.max(array, (d) => d.birthRate) + 1])
      .range([height, 0]);

    svg.append("g").attr("id", "gYAxis").call(d3.axisLeft(y));

    svg
      .append("path")
      .datum(array)
      .attr("class", "pathValue")
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.year))
          .y((d) => y(d.birthRate))
      );

    d3.csv("data/disneyland_final_without_missing.csv").then(function (
      disneyData
    ) {
      const disneyGroupedByYear = _.groupBy(disneyData, (d) => {
        const { Year_Month } = d;
        const [year, month] = Year_Month.split("-").map((v) => _.toInteger(v));
        return year;
      });
      const list = Object.entries(disneyGroupedByYear).map(([year, l]) => ({
        year: _.toInteger(year),
        reviews: l.length,
      }));
      const maxReviews = d3.max(list, (l) => l.reviews);
      const minReviews = d3.min(list, (l) => l.reviews);

      svg
        .selectAll("circle.circleValues")
        .data(array)
        .join("circle")
        .attr("class", "circleValues itemValue")
        .attr("cx", (a) => x(a.year))
        .attr("cy", (a) => y(a.birthRate))
        .attr("r", 8)
        .style("fill", (a) => {
          const { year } = a;
          const array = disneyGroupedByYear[year];
          if (!array) return "rgba(0, 0, 0, 0)";
          const value = array.length;
          const rgba = HSLToRGB(
            0,
            100,
            75 - 60 * ((value - minReviews + 1) / (maxReviews - minReviews + 1))
          );

          return rgba;
        })
        //   .on("mouseover", (event, a) => handleMouseOver(a))
        //   .on("mouseleave", (event, a) => handleMouseLeave())
        .append("title")
        .text((a) => a.year);
    });
  });
}




function updateScatterPlot(_start, _finish) {
  const start = _.toInteger(_start);
  const finish = _.toInteger(_finish);
  
  d3.csv("data/disneyland_final_without_missing.csv").then(function (data) {
    data = data.filter(function (elem) {
        return start <= elem.year && elem.year <= finish;
    });

    const svg = d3.select("#gScatterPlot");

    const x = d3
      .scaleLog()
      .domain([10, d3.max(data, (d) => parseInt(d.Text_length))])
      .range([0, width]);

    const y = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    svg
        .selectAll("circle.circleValues")
        .data(data, (d) => d.Review_ID)
        .join(
            (enter) => {
                circles = enter
                    .append("circle")
                    .attr("class", "circleValues itemValue")
                    .attr("cx", (d) => x(d.Text_length))
                    .attr("cy", (d) => y(d.Polarity))
                    .attr("r", 4)
                    .style("fill", (d) => getSeasonColor(d.season))
            },
            (update) => {
                update
                    .transition()
                    .duration(1000)
                    .attr("cx", (d) => x(d.Text_length))
                    .attr("cy", (d) => y(d.Polarity))
                    .attr("r", 4);
            },
            (exit) => {
                exit.remove();
            }
        );
  });
}


function updateCustomizePlot(
  _start,
  _finish,
  min_polarity = -1,
  max_polarity = 1,
  min_text_length = 0,
  max_text_length = 20756
) {
  const start = _.toInteger(_start);
  const finish = _.toInteger(_finish);

  d3.csv("data/crude_birth_rate-filtered.csv").then(function (_data) {
    const data = _data.filter(function (elem) {
      const year = _.toInteger(elem.Year);
      return start <= year && year <= finish;
    });

    const svg = d3.select("#gLineChart");

    const birthRateGroupedByYear = _.groupBy(data, (elem) =>
      _.toInteger(elem.Year)
    );
    const meanBirthRateByYear = {};
    Object.entries(birthRateGroupedByYear).forEach(([year, list]) => {
      meanBirthRateByYear[year] =
        _.sumBy(list, (e) => _.toInteger(e["Birth rate"])) / list.length;
    });

    const yearsList = _.orderBy(Object.keys(meanBirthRateByYear), (v) =>
      _.toInteger(v)
    );

    const array = yearsList.map((year) => ({
      year: _.toInteger(year),
      birthRate: meanBirthRateByYear[year],
    }));

    const x = d3
      .scalePoint()
      .domain(array.map((d) => d.year))
      .range([0, width]);

    svg.select("#gXAxis").call(
      d3.axisBottom(x).tickFormat((x) => {
        if (x % 5) return "";
        return x;
      })
    );

    const y = d3
      .scaleLinear()
      .domain([
        d3.min(array, (d) => d.birthRate) - 1,
        d3.max(array, (d) => d.birthRate) + 1,
      ])
      .range([height, 0]);
    svg.select("#gYAxis").call(d3.axisLeft(y));

    svg
      .select("path.pathValue")
      .datum(array)
      .transition()
      .duration(1000)
      .attr(
        "d",
        d3
          .line()
          .x((d) => x(d.year))
          .y((d) => y(d.birthRate))
      );
    d3.csv("data/disneyland_final_without_missing.csv").then(function (
      _disneyData
    ) {
      const disneyData = _disneyData.filter((d) => {
        const { Polarity, Text_length } = d;
        return (
          min_polarity <= Polarity &&
          Polarity <= max_polarity &&
          min_text_length <= Text_length &&
          Text_length <= max_text_length
        );
      });

      const disneyGroupedByYear = _.groupBy(disneyData, (d) => {
        const { Year_Month } = d;
        const [year, month] = Year_Month.split("-").map((v) => _.toInteger(v));
        return year;
      });
      const list = Object.entries(disneyGroupedByYear).map(([year, l]) => ({
        year: _.toInteger(year),
        reviews: l.length,
      }));
      const maxReviews = d3.max(list, (l) => l.reviews);
      const minReviews = d3.min(list, (l) => l.reviews);
      svg
        .selectAll("circle.circleValues")
        .data(array)
        .join(
          (enter) => {
            const circles = enter
              .append("circle")
              .attr("class", "circleValues itemValue")
              .attr("cx", (a) => x(a.year))
              .attr("cy", (a) => y(a.birthRate))
              .attr("r", 8)
              .style("fill", (a) => {
                const { year } = a;
                const array = disneyGroupedByYear[year];
                if (!array) return "rgba(0, 0, 0, 0)";
                const value = array.length;
                const rgba = HSLToRGB(
                  0,
                  100,
                  75 -
                    60 *
                      ((value - minReviews + 1) / (maxReviews - minReviews + 1))
                );

                return rgba;
              });
            //   .on("mouseover", (event, a) => handleMouseOver(a))
            //   .on("mouseleave", (event, a) => handleMouseLeave())
            circles
              .transition()
              .duration(1000)
              .attr("cy", (a) => y(a.birthRate));
            circles.append("title").text((a) => a.year);
          },
          (update) => {
            update
              .transition()
              .duration(1000)
              .attr("cx", (a) => x(a.year))
              .attr("cy", (a) => y(a.birthRate))
              .attr("r", 8)
              .style("fill", (a) => {
                const { year } = a;
                const array = disneyGroupedByYear[year];
                if (!array) return "rgba(0, 0, 0, 0)";
                const value = array.length;
                const rgba = HSLToRGB(
                  0,
                  100,
                  75 -
                    60 *
                      ((value - minReviews + 1) / (maxReviews - minReviews + 1))
                );
                return rgba;
              });
          },
          (exit) => {
            exit.remove();
          }
        );
    });
  });
}

function drawSlides() {
  function createslider(element) {
    const inputs = element.querySelectorAll("input");

    const thumbLeft = element.querySelector(".thumb.left");
    const thumbRight = element.querySelector(".thumb.right");
    const rangeBetween = element.querySelector(".range-between");
    const labelMin = element.querySelector(".range-label-start");
    const labelMax = element.querySelector(".range-label-end");

    const [inputStart, inputEnd] = inputs;
    const min = parseInt(inputStart.value);
    const max = parseInt(inputEnd.value);

    setStartValueCustomSlider(inputStart, inputEnd, thumbLeft, rangeBetween);
    setEndValueCustomSlider(inputEnd, inputStart, thumbRight, rangeBetween);

    setEvents(
      inputStart,
      inputEnd,
      thumbLeft,
      thumbRight,
      labelMin,
      labelMax,
      rangeBetween
      // minPolarity,
      // maxPolarity,
      // minTextLength,
      // maxTextLength
    );
  }

  function setLabelValue(label, input) {
    label.innerHTML = `${input.value}`;
  }

  function setStartValueCustomSlider(inputStart, inputEnd, pseudoEl, range) {
    const maximum = Math.min(
      parseInt(inputStart.value),
      parseInt(inputEnd.value) - 1
    );
    const percent =
      ((maximum - inputStart.min) / (inputStart.max - inputStart.min)) * 100;
    pseudoEl.style.left = percent + "%";
    range.style.left = percent + "%";
  }

  function setEndValueCustomSlider(inputEnd, inputStart, pseudoEl, range) {
    const minimun = Math.max(
      parseInt(inputEnd.value),
      parseInt(inputStart.value) + 1
    );
    const percent =
      ((minimun - inputEnd.min) / (inputEnd.max - inputEnd.min)) * 100;
    pseudoEl.style.right = 100 - percent + "%";
    range.style.right = 100 - percent + "%";
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
    inputStart.addEventListener("input", () => {
      setStartValueCustomSlider(inputStart, inputEnd, thumbLeft, rangeBetween);
      setLabelValue(labelMin, inputStart);
      updateCustomizePlot(inputStart.value, inputEnd.value, minPolarity, maxPolarity, minTextLength, maxTextLength);
      updateScatterPlot(inputStart.value, inputEnd.value);
      sInput = inputStart.value;
    });

    inputEnd.addEventListener("input", () => {
      setEndValueCustomSlider(inputEnd, inputStart, thumbRight, rangeBetween);
      setLabelValue(labelMax, inputEnd);
      updateCustomizePlot(inputStart.value, inputEnd.value, minPolarity, maxPolarity, minTextLength, maxTextLength);
      updateScatterPlot(inputStart.value, inputEnd.value);
      eInput = inputEnd.value;
    });

    inputStart.addEventListener("mouseover", function () {
      thumbLeft.classList.add("hover");
    });
    inputStart.addEventListener("mouseout", function () {
      thumbLeft.classList.remove("hover");
    });
    inputStart.addEventListener("mousedown", function () {
      thumbLeft.classList.add("active");
    });
    inputStart.addEventListener("pointerup", function () {
      thumbLeft.classList.remove("active");
    });

    inputEnd.addEventListener("mouseover", function () {
      thumbRight.classList.add("hover");
    });
    inputEnd.addEventListener("mouseout", function () {
      thumbRight.classList.remove("hover");
    });
    inputEnd.addEventListener("mousedown", function () {
      thumbRight.classList.add("active");
    });
    inputEnd.addEventListener("pointerup", function () {
      thumbRight.classList.remove("active");
    });

    inputStart.addEventListener("touchstart", function () {
      thumbLeft.classList.add("active");
    });
    inputStart.addEventListener("touchend", function () {
      thumbLeft.classList.remove("active");
    });
    inputEnd.addEventListener("touchstart", function () {
      thumbRight.classList.add("active");
    });
    inputEnd.addEventListener("touchend", function () {
      thumbRight.classList.remove("active");
    });
  }

  const slider = document.querySelector(".range-slider");

  createslider(slider);
}

function HSLToRGB(h, s, l) {
  // Must be fractions of 1
  s /= 100;
  l /= 100;

  let c = (1 - Math.abs(2 * l - 1)) * s,
    x = c * (1 - Math.abs(((h / 60) % 2) - 1)),
    m = l - c / 2,
    r = 0,
    g = 0,
    b = 0;

  if (0 <= h && h < 60) {
    r = c;
    g = x;
    b = 0;
  } else if (60 <= h && h < 120) {
    r = x;
    g = c;
    b = 0;
  } else if (120 <= h && h < 180) {
    r = 0;
    g = c;
    b = x;
  } else if (180 <= h && h < 240) {
    r = 0;
    g = x;
    b = c;
  } else if (240 <= h && h < 300) {
    r = x;
    g = 0;
    b = c;
  } else if (300 <= h && h < 360) {
    r = c;
    g = 0;
    b = x;
  }
  r = Math.round((r + m) * 255);
  g = Math.round((g + m) * 255);
  b = Math.round((b + m) * 255);

  return "rgb(" + r + "," + g + "," + b + ")";
}