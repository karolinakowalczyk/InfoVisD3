const BIRTH_RATE_HSL = [303, 100];

const margin = {
  top: 20,
  right: 30,
  bottom: 40,
  left: 90,
};
const width = 600 - margin.left - margin.right;
const height = 400 - margin.top - margin.bottom;

function init() {
  createChordPlot("#vi1");
  defaultChordDiagram("#div-vi1");
  createScatterPlot("#vi2");
  createCustomizePlot("#vi3");
  drawSlides();
}

function getSeasonColor(season) {
  if (season === "winter") {
    return "blue";
  } else if (season === "spring") {
    return "green";
  } else if (season === "summer") {
    return "orange";
  } else if (season === "autumn") {
    return "brown";
  } else {
    return "grey";
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
      .scaleLog()
      .domain([10, d3.max(data, (d) => parseInt(d.Text_length))])
      .range([0, width]);

    const y = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

    svg
      .append("circle")
      .attr("cx", width)
      .attr("cy", height - 70)
      .attr("r", 8)
      .style("fill", "green");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width - 20)
      .attr("y", height - 66)
      .text("spring");

    svg
      .append("circle")
      .attr("cx", width)
      .attr("cy", height - 50)
      .attr("r", 8)
      .style("fill", "orange");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width - 20)
      .attr("y", height - 46)
      .text("summer");

    svg
      .append("circle")
      .attr("cx", width)
      .attr("cy", height - 30)
      .attr("r", 8)
      .style("fill", "brown");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width - 20)
      .attr("y", height - 26)
      .text("autumn");

    svg
      .append("circle")
      .attr("cx", width)
      .attr("cy", height - 6)
      .attr("r", 8)
      .style("fill", "blue");

    svg
      .append("text")
      .attr("text-anchor", "end")
      .attr("x", width - 20)
      .attr("y", height)
      .text("winter");

    svg
      .selectAll("circle.circleValues")
      .data(data, (d) => d.Review_ID)
      .join("circle")
      .attr("class", "circleValues itemValue")
      .attr("cx", (d) => x(d.Text_length))
      .attr("cy", (d) => y(d.Polarity))
      .attr("r", 4)
      .style("fill", (d) => getSeasonColor(d.season));

    svg
      .append("g")
      .attr("id", "gXAxis")
      .attr("transform", `translate(0, ${height / 2})`)
      .call(d3.axisBottom(x));

    svg.append("g").attr("id", "gYAxis").call(d3.axisLeft(y));

    svg
      .append("text")
      .attr("id", "xLabelScatterPlot")
      .attr("text-anchor", "end")
      .attr("x", width)
      .attr("y", height / 2 + 40)
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

function defaultChordDiagram(id) {
  const svg = d3
    .select(id)
    .append("svg")
    .attr("width", 440)
    .attr("height", 440)
    .append("g")
    .attr("transform", "translate(220,220)");

  d3.csv("data/disneyland_final_without_missing.csv").then(function (_data) {
    const data = _data.filter(({ Branch, Reviewer_Location }) => {
      return ["Portugal", "Spain", "France", "Monaco", "Germany"].includes(
        Reviewer_Location
      );
    });
    // create input data: a square matrix that provides flow between entities
    // const matrix = [
    //   [11975, 5871, 8916, 2868],
    //   [1951, 10048, 2060, 6171],
    //   [8010, 16145, 8090, 8045],
    //   [1013, 990, 940, 6907],
    // ];

    const obj = {}; // {source: {target: value}}

    data.forEach(({ Branch, Reviewer_Location }) => {
      if (!obj.hasOwnProperty(Branch)) obj[Branch] = {};
      if (!obj[Branch].hasOwnProperty(Reviewer_Location))
        obj[Branch][Reviewer_Location] = 0;
      obj[Branch][Reviewer_Location]++;
    });

    const array = [];
    Object.entries(obj).forEach(([branch, branchObj]) => {
      Object.entries(branchObj).forEach(([originCountry, value]) => {
        array.push({ source: originCountry, target: branch, value });
      });
    });
    console.log('"Start Filter"', "Start Filter");
    const names = data
      .map(({ Branch, Reviewer_Location }) => [Branch, Reviewer_Location])
      .flatMap((num) => num)
      .filter((value, index, self) => self.indexOf(value) === index);

    console.log("names", names);
    const color = d3.scaleOrdinal(names, d3.schemeCategory10);

    const index = new Map(names.map((name, i) => [name, i]));
    const matrix = Array.from(index, () => new Array(names.length).fill(0));
    for (const { source, target, value } of array) {
      matrix[index.get(source)][index.get(target)] += value;
    }

    // give this matrix to d3.chord(): it will calculates all the info we need to draw arc and ribbon
    const res = d3
      .chord()
      .padAngle(0.05) // padding between entities (black arc)
      .sortSubgroups(d3.descending)(matrix);

    // add the groups on the inner part of the circle
    svg
      .datum(res)
      .append("g")
      .selectAll("g")
      .data(function (d) {
        return d.groups;
      })
      .enter()
      .append("g")
      .append("path")
      .style("fill", "grey")
      .style("stroke", "black")
      .attr("d", d3.arc().innerRadius(230).outerRadius(240));

    // Add a tooltip div. Here I define the general feature of the tooltip: stuff that do not depend on the data point.
    // Its opacity is set to 0: we don't see it by default.
    const tooltip = d3
      .select("#vi1")
      .append("div")
      .style("opacity", 0)
      .attr("class", "tooltip")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px");

    // A function that change this tooltip when the user hover a point.
    // Its opacity is set to 1: we can now see it. Plus it set the text and position of tooltip depending on the datapoint (d)
    const showTooltip = function (d) {
      console.log("d", d);
      tooltip
        .style("opacity", 1)
        .html(
          "Source: " +
            names[d.target.__data__.source.index] +
            "<br>Target: " +
            names[d.target.__data__.target.index]
        )
        .attr("id", "TOOLTIP")
        .style("left", d.pageX + 15 + "px")
        .style("top", d.pageY - 28 + "px");
    };

    // A function that change this tooltip when the leaves a point: just need to set opacity to 0 again
    const hideTooltip = function (d) {
      tooltip.transition().duration(1000).style("opacity", 0);
    };

    // Add the links between groups
    svg
      .datum(res)
      .append("g")
      .selectAll("path")
      .data(function (d) {
        return d;
      })
      .enter()
      .append("path")
      .attr("d", d3.ribbon().radius(220))
      .style("fill", "#69b3a2")
      .style("stroke", "black")
      .on("mouseover", showTooltip)
      .on("mouseleave", hideTooltip);
  });
}

function createChordPlot(id) {
  // const svg = d3
  //   .select(id)
  //   .attr("width", width + margin.left + margin.right)
  //   .attr("height", height + margin.top + margin.bottom)
  //   .append("g")
  //   .attr("id", "gScatterPlot")
  //   .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const svg = d3
    .select(id)
    .attr("viewBox", [-width / 2, -height / 2, width, height]);

  const innerRadius = Math.min(width, height) * 0.5 - 20;
  const outerRadius = innerRadius + 6;
  const formatValue = (x) => `${x.toFixed(0)}B`;

  const ribbon = d3
    .ribbonArrow()
    .radius(innerRadius - 0.5)
    .padAngle(1 / innerRadius);
  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);
  const chord = d3
    .chordDirected()
    .padAngle(12 / innerRadius)
    .sortSubgroups(d3.descending)
    .sortChords(d3.descending);

  d3.csv("data/disneyland_final_without_missing.csv").then(function (data) {
    const obj = {}; // {source: {target: value}}

    data.forEach(({ Branch, Reviewer_Location }) => {
      if (!obj.hasOwnProperty(Branch)) obj[Branch] = {};
      if (!obj[Branch].hasOwnProperty(Reviewer_Location))
        obj[Branch][Reviewer_Location] = 0;
      obj[Branch][Reviewer_Location]++;
    });

    const array = [];
    Object.entries(obj).forEach(([branch, branchObj]) => {
      Object.entries(branchObj).forEach(([originCountry, value]) => {
        array.push({ source: originCountry, target: branch, value });
      });
    });

    const names = data
      .map(({ Branch, Reviewer_Location }) => [Branch, Reviewer_Location])
      .flatMap((num) => num)
      .filter((value, index, self) => self.indexOf(value) === index);

    const color = d3.scaleOrdinal(names, d3.schemeCategory10);

    const index = new Map(names.map((name, i) => [name, i]));
    const matrix = Array.from(index, () => new Array(names.length).fill(0));
    for (const { source, target, value } of array) {
      const row = matrix[index.get(source)];
      const col = (row[index.get(target)] += value);
    }

    const chords = chord(matrix);
    console.log("matrix", matrix);
    console.log("chords", chords);

    const textId = "chord-diagram";

    svg
      .append("path")
      .attr("id", textId)
      .attr("fill", "none")
      .attr(
        "d",
        d3.arc()({ outerRadius, startAngle: 0, endAngle: 2 * Math.PI })
      );

    svg
      .append("g")
      .attr("fill-opacity", 0.75)
      .selectAll("g")
      .data(chords)
      .join("path")
      .attr("d", ribbon)
      .attr("fill", (d) => color(names[d.target.index]))
      .style("mix-blend-mode", "multiply")
      .append("title")
      .text(
        (d) =>
          `${names[d.source.index]} owes ${names[d.target.index]} ${formatValue(
            d.source.value
          )}`
      );

    svg
      .append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10)
      .selectAll("g")
      .data(chords.groups)
      .join("g")
      .call((g) =>
        g
          .append("path")
          .attr("d", arc)
          .attr("fill", (d) => color(names[d.index]))
          .attr("stroke", "#fff")
      )
      .call((g) =>
        g
          .append("text")
          .attr("dy", -3)
          .append("textPath")
          .attr("xlink:href", textId)
          .attr("startOffset", (d) => d.startAngle * outerRadius)
          .text((d) => names[d.index])
      )
      .call((g) =>
        g.append("title").text(
          (d) => `${names[d.index]}
      owes ${formatValue(d3.sum(matrix[d.index]))}
      is owed ${formatValue(d3.sum(matrix, (row) => row[d.index]))}`
        )
      );
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
            BIRTH_RATE_HSL[0],
            BIRTH_RATE_HSL[1],
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

  d3.csv("data/disneyland_final_without_missing.csv").then(function (_data) {
    const data = _data.filter(function (elem) {
      const { Year_Month } = elem;
      const year = _.toInteger(Year_Month.split("-")[0]);
      return start <= year && year <= finish;
    });

    const svg = d3.select("#gScatterPlot");
  });
}

function updateCustomizePlot(
  _start,
  _finish,
  min_polarity = -1,
  max_polarity = 1,
  min_text_length = 0,
  max_text_length = 20000
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
                  BIRTH_RATE_HSL[0],
                  BIRTH_RATE_HSL[1],
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
                  BIRTH_RATE_HSL[0],
                  BIRTH_RATE_HSL[1],
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
      updateCustomizePlot(inputStart.value, inputEnd.value);
      updateScatterPlot(inputStart.value, inputEnd.value);
    });

    inputEnd.addEventListener("input", () => {
      setEndValueCustomSlider(inputEnd, inputStart, thumbRight, rangeBetween);
      setLabelValue(labelMax, inputEnd);
      updateCustomizePlot(inputStart.value, inputEnd.value);
      updateScatterPlot(inputStart.value, inputEnd.value);
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
