const DENSITY_OF_REVIEWERS_HSL = [303, 100];
const BIRTH_RATE_HSL = DENSITY_OF_REVIEWERS_HSL;
const SCENTED_WIDGET_COUNTRY_HSL = DENSITY_OF_REVIEWERS_HSL;
const SCENTED_WIDGET_BRANCH_HSL = DENSITY_OF_REVIEWERS_HSL;
const CHORD_HSL = [39, 100];

const INIT_START_YEAR_CUSTOMIZED_PLOT = 2010;
const COUNTRY_SELECTOR_BG = "rgba(100, 100, 0, 0.5)";

const DISNEDY_BRANCHES = [
  "Disneyland_Paris",
  "Disneyland_HongKong",
  "Disneyland_California",
];

const DISNEY_COLORS = {
  Disneyland_Paris: "blue",
  Disneyland_HongKong: "red",
  Disneyland_California: "green",
};

const SEASONS = {
  winter: [12, 1, 2],
  spring: [3, 4, 5],
  summer: [6, 7, 8],
  autumn: [9, 10, 11],
};

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

let countriesFilter = [];
let branchesFilter = [];

let months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
let selectedSeason = null;

let sInput = 2010;
let eInput = 2019;

let disneyData = [];
let crudeBirthRateFiltered = [];

async function init() {
  disneyData = await loadDisneyData();
  crudeBirthRateFiltered = await loadBirthRateData();

  drawSlides();
  drawCountryFilter();
  drawBranchesFilter();
  createScatterPlotSeasonLabels();
  createScatterPlot();
  createCustomizePlot();
  createChordDiagram();
  // createChordDiagram2(disneyData);
}

function getSeasonColor(season) {
  if (season === "winter") {
    return "rgba(135,206,250, 0.5)";
  } else if (season === "spring") {
    return "rgba(0,255,0, 0.5)";
  } else if (season === "summer") {
    return "rgba(255,215,0, 0.5)";
  } else if (season === "autumn") {
    return "rgba(55, 27, 7, 0.5)";
  } else {
    return "grey";
  }
}

const loadDisneyData = async () => {
  const data = await d3.csv("data/disneyland_final_without_missing.csv");
  return data;
};

const loadBirthRateData = async () => {
  const data = await d3.csv("data/crude_birth_rate-filtered.csv");
  return data;
};

const drawCountryFilter = () => {
  const countries = disneyData
    .map(({ Reviewer_Location }) => Reviewer_Location)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => (a < b ? -1 : 1));

  const grouped = _.groupBy(
    disneyData,
    ({ Reviewer_Location }) => Reviewer_Location
  );
  const reviewsPerCountry = {};
  Object.entries(grouped).forEach(([country, array]) => {
    reviewsPerCountry[country] = array.length;
  });

  const list = document.getElementById("country-filter");

  while (list.lastElementChild) {
    list.removeChild(list.lastElementChild);
  }

  const maxReviews = _.max(Object.values(reviewsPerCountry));
  const minReviews = _.min(Object.values(reviewsPerCountry));

  countries.forEach((country) => {
    const div = document.createElement("div");

    const rgba = HSLToRGB(
      SCENTED_WIDGET_COUNTRY_HSL[0],
      SCENTED_WIDGET_COUNTRY_HSL[1],
      100 -
        80 *
          ((reviewsPerCountry[country] - minReviews + 1) /
            (maxReviews - minReviews + 1))
    );

    div.style.background = rgba;
    div.dataset.selected = "false";

    const para = document.createElement("p");
    para.style = "margin: 0";
    para.innerText = country;
    div.appendChild(para);

    div.addEventListener("click", async (e) => {
      if (div.dataset.selected === "true") {
        div.dataset.selected = "false";
        para.innerText = `${country}`;
        countriesFilter = countriesFilter.filter((c) => c !== country);
      } else {
        countriesFilter.push(country);
        para.innerText = `>>>>> ${country}`;
        div.dataset.selected = "true";
      }
      const startYear = document.getElementById("start-year-input").value;
      const endYear = document.getElementById("end-year-input").value;

      createChordDiagram(countriesFilter, branchesFilter);

      updateCustomizePlot(
        startYear,
        endYear,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        countriesFilter,
        branchesFilter
      );
      updateScatterPlot(
        startYear,
        endYear,
        countriesFilter,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        months,
        branchesFilter
      );
    });

    list.appendChild(div);
  });
};

const drawBranchesFilter = () => {
  const branches = disneyData
    .map(({ Branch }) => Branch)
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort((a, b) => (a < b ? -1 : 1));

  const grouped = _.groupBy(disneyData, ({ Branch }) => Branch);
  const reviewsPerBranch = {};
  Object.entries(grouped).forEach(([branch, array]) => {
    reviewsPerBranch[branch] = array.length;
  });

  const list = document.getElementById("branch-filter");

  while (list.lastElementChild) {
    list.removeChild(list.lastElementChild);
  }

  const maxReviews = _.max(Object.values(reviewsPerBranch));
  const minReviews = _.min(Object.values(reviewsPerBranch));

  branches.forEach((branch) => {
    const div = document.createElement("div");

    const rgba = HSLToRGB(
      SCENTED_WIDGET_BRANCH_HSL[0],
      SCENTED_WIDGET_BRANCH_HSL[1],
      80 -
        20 *
          ((reviewsPerBranch[branch] - minReviews + 1) /
            (maxReviews - minReviews + 1))
    );

    div.style.background = rgba;
    div.dataset.selected = "false";

    const para = document.createElement("p");
    para.style = "margin: 0";
    para.innerText = branch;
    div.appendChild(para);

    div.addEventListener("click", async (e) => {
      if (div.dataset.selected === "true") {
        div.dataset.selected = "false";
        para.innerText = `${branch}`;
        branchesFilter = branchesFilter.filter((c) => c !== branch);
      } else {
        branchesFilter.push(branch);
        para.innerText = `>>>>> ${branch}`;
        div.dataset.selected = "true";
      }
      const startYear = document.getElementById("start-year-input").value;
      const endYear = document.getElementById("end-year-input").value;

      createChordDiagram(countriesFilter, branchesFilter);

      updateCustomizePlot(
        startYear,
        endYear,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        countriesFilter,
        branchesFilter
      );
      updateScatterPlot(
        startYear,
        endYear,
        countriesFilter,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        months,
        branchesFilter
      );
    });

    list.appendChild(div);
  });
};

function createScatterPlotSeasonLabels() {
  const winter = document.getElementById("season_label-winter");
  const spring = document.getElementById("season_label-spring");
  const summer = document.getElementById("season_label-summer");
  const autumn = document.getElementById("season_label-autumn");

  const divs = [
    { div: winter, season: "winter" },
    { div: summer, season: "summer" },
    { div: spring, season: "spring" },
    { div: autumn, season: "autumn" },
  ];

  divs.forEach(({ div, season }) => {
    div.addEventListener("click", async (e) => {
      if (season === selectedSeason) {
        months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
        selectedSeason = null;
        divs.forEach(({ div }) => (div.style.opacity = 1));
      } else {
        months = SEASONS[season];
        selectedSeason = season;
        divs.forEach(({ div, season }) => {
          if (season === selectedSeason) {
            div.style.opacity = 1;
          } else {
            div.style.opacity = 0.5;
          }
        });
      }
      updateScatterPlot(
        sInput,
        eInput,
        countriesFilter,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        months
      );
    });
  });
}

function createScatterPlot() {
  const svg = d3
    .select("#scatter")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("id", "gScatterPlot")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

  const data = disneyData;

  const minLength = d3.min(data, (d) => parseInt(d.Text_length));
  const x = d3
    .scaleLog()
    .domain([
      _.max([minLength - 1, 1]),
      d3.max(data, (d) => parseInt(d.Text_length)),
    ])
    .range([0, width]);

  const y = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

  async function makeBrush() {
    const sel = d3.brushSelection(this);

    // var p = document.getElementById("p");

    let left_top = sel[0][0];
    let right_top = sel[1][0];
    let left_bottom = sel[0][1];
    let right_bottom = sel[1][1];

    minPolarity = y.invert(right_bottom);
    maxPolarity = y.invert(left_bottom);
    minTextLength = x.invert(left_top);
    maxTextLength = x.invert(right_top);

    // p.innerHTML =
    //   "( " +
    //   left_top +
    //   ", " +
    //   right_top +
    //   ", " +
    //   left_bottom +
    //   ", " +
    //   right_bottom +
    //   " )";

    updateCustomizePlot(
      sInput,
      eInput,
      minPolarity,
      maxPolarity,
      minTextLength,
      maxTextLength,
      countriesFilter
    );
    updateScatterPlot(
      sInput,
      eInput,
      countriesFilter,
      minPolarity,
      maxPolarity,
      minTextLength,
      maxTextLength
    );
  }

  async function brushended() {
    if (!d3.brushSelection(this)) {
      minPolarity = -1;
      maxPolarity = 1;
      minTextLength = 0;
      maxTextLength = 20756;
      updateCustomizePlot(
        sInput,
        eInput,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        countriesFilter
      );
      updateScatterPlot(
        sInput,
        eInput,
        countriesFilter,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength
      );
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

  svg.call(
    d3
      .brush()
      .on("brush", makeBrush)
      .extent([
        [0, 0],
        [width, height],
      ])
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
}
function chordPlot(matrix, tags) {
  const data = matrix;

  const genres = tags;
  const w = 600;
  const h = 1000;

  const svg = d3
    .select("#chord")
    .attr("width", w)
    .attr("height", h)
    .append("g")
    .attr("id", "MAIN_G")
    .attr("transform", `translate(${w / 10},${300})`);

  const outerRadius = Math.min(width, height) * 0.8 - 40;
  const innerRadius = outerRadius - 30;

  const formatValue = d3.formatPrefix(",.0", 1e3);

  const chord = d3.chord().padAngle(0.05).sortSubgroups(d3.ascending);

  const arc = d3.arc().innerRadius(innerRadius).outerRadius(outerRadius);

  const ribbon = d3.ribbon().radius(innerRadius);

  const g = svg
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")")
    .datum(chord(data));

  const group = g
    .append("g")
    .attr("class", "groups")
    .selectAll("g")
    .data(function (chords) {
      return chords.groups;
    })
    .enter()
    .append("g");

  group
    .append("path")
    .style("fill", function (d) {
      return "gold";
      // return color(d.index);
    })
    .style("stroke", function (d) {
      return "gold";
      // return d3.rgb(color(d.index)).darker();
    })
    .attr("id", function (d, i) {
      return "group" + d.index;
    })
    .attr("d", arc)
    .on("mouseover", fade(0.1))
    .on("mouseout", fade(1));

  group.append("title").text(function (d) {
    return groupTip(d);
  });

  group
    .append("text")
    .attr("x", 6)
    .attr("dy", 15)
    .append("textPath")
    .attr("xlink:href", function (d) {
      return "#group" + d.index;
    })
    .text(function (chords, i) {
      // return genres[i];
      return "";
    })
    .style("fill", "black");

  const groupTick = group
    .selectAll(".group-tick")
    .data(function (d) {
      return groupTicks(d);
    })
    .enter()
    .append("g")
    .attr("class", "group-tick")
    .attr("transform", function (d) {
      return (
        "rotate(" +
        ((d.angle * 180) / Math.PI - 90) +
        ") translate(" +
        outerRadius +
        ",0)"
      );
    });

  groupTick
    .append("line")
    .attr("x1", 1)
    .attr("y1", 0)
    .attr("x2", 5)
    .attr("y2", 0)
    .style("stroke", "#000");

  groupTick
    .filter(function (d) {
      return d.value % 1e3 === 0;
    })
    .append("text")
    .attr("x", 8)
    .attr("dy", ".35em")
    .attr("transform", function (d) {
      return d.angle > Math.PI ? "rotate(180) translate(-16)" : null;
    })
    .style("text-anchor", function (d) {
      return d.angle > Math.PI ? "end" : null;
    })
    .text(function (d) {
      return tags[d.index];
    });

  const ribbons = g
    .append("g")
    .attr("class", "ribbons")
    .selectAll("path")
    .data(function (chords) {
      return chords;
    })
    .enter()
    .append("path")
    .attr("d", ribbon)
    .style("fill", function (d) {
      return DISNEY_COLORS[tags[d.target.index]];
    })
    .style("stroke", function (d) {
      return d3.rgb(DISNEY_COLORS[tags[d.target.index]]).darker();
    });

  ribbons.append("title").text(function (d) {
    return chordTip(d);
  });

  // Returns an array of tick angles and values for a given group and step.
  function groupTicks(d) {
    return d3.range(0, 1, 1).map(function (value) {
      return {
        value: value,
        angle: (d.endAngle + d.startAngle) / 2,
        index: d.index,
      };
    });
  }

  function fade(opacity) {
    return function (ev, ribbon) {
      let countriesList = [];
      let branches = [];
      if (opacity !== 1) {
        if (DISNEDY_BRANCHES.includes(tags[ribbon.index])) {
          branches = [tags[ribbon.index]];
        } else {
          countriesList = [tags[ribbon.index]];
        }
      }
      updateScatterPlot(
        sInput,
        eInput,
        countriesList,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        months,
        branches
      );

      updateCustomizePlot(
        sInput,
        eInput,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        countriesList,
        branches
      );

      ribbons
        .filter(function (d) {
          return (
            d.source.index != ribbon.index && d.target.index != ribbon.index
          );
        })
        .transition(0)
        .style("opacity", opacity);
    };
  }

  function chordTip(d) {
    const j = d3.formatPrefix(",.0", 1e1);
    return (
      "Aantal boeken met genres:\n" +
      genres[d.target.index] +
      " en " +
      genres[d.source.index] +
      ": " +
      j(d.source.value)
    );
  }

  function groupTip(d) {
    const j = d3.formatPrefix(",.0", 1e1);
    return (
      "Totaal aantal boeken met het genre " +
      genres[d.index] +
      ":\n" +
      j(d.value)
    );
  }
}

function createChordDiagram(
  countries = [],
  branches = [],
  startYear = sInput,
  finishYear = eInput,
  min_polarity = minPolarity,
  max_polarity = maxPolarity,
  min_text_length = minTextLength,
  max_text_length = maxTextLength,
  _months = months
) {
  d3.select("#MAIN_G").remove();

  const start = _.toInteger(startYear);
  const finish = _.toInteger(finishYear);
  const data = disneyData.filter(
    ({ Year_Month, Polarity, Text_length, Reviewer_Location, Branch }) => {
      const year = _.toInteger(Year_Month.split("-")[0]);
      const month = _.toInteger(Year_Month.split("-")[1]);
      return (
        start <= year &&
        year <= finish &&
        min_polarity <= Polarity &&
        Polarity <= max_polarity &&
        min_text_length <= Text_length &&
        Text_length <= max_text_length &&
        _months.includes(month) &&
        (countries.length ? countries.includes(Reviewer_Location) : true) &&
        (branches.length ? branches.includes(Branch) : true)
      );
    }
  );
  console.log("data", data);
  const obj = {}; // {source: {target: value}}

  data.forEach(({ Branch, Reviewer_Location }) => {
    if (!obj.hasOwnProperty(Branch)) obj[Branch] = {};
    if (!obj[Branch].hasOwnProperty(Reviewer_Location))
      obj[Branch][Reviewer_Location] = 0;
    obj[Branch][Reviewer_Location]++;
  });
  "obj", obj;
  const array = [];
  Object.entries(obj).forEach(([branch, branchObj]) => {
    Object.entries(branchObj).forEach(([originCountry, value]) => {
      array.push({ source: branch, target: originCountry, value: 1 });
      array.push({ source: originCountry, target: branch, value });
    });
  });
  const names = data
    .map(({ Branch, Reviewer_Location }) => [Branch, Reviewer_Location])
    .flatMap((num) => num)
    .filter((value, index, self) => self.indexOf(value) === index);

  "names", names;
  const color = d3.scaleOrdinal(names, d3.schemeCategory10);

  const index = new Map(names.map((name, i) => [name, i]));
  const matrix = Array.from(index, () => new Array(names.length).fill(0));
  for (const { source, target, value } of array) {
    matrix[index.get(source)][index.get(target)] += value;
    // matrix[index.get(target)][index.get(source)] += value;
  }

  chordPlot(matrix, names);
  return;
}

function createCustomizePlot() {
  const svg = d3
    .select("#line")
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

  const data = crudeBirthRateFiltered.filter(function (elem) {
    return INIT_START_YEAR_CUSTOMIZED_PLOT <= elem.Year && elem.Year <= 2019;
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
}

function updateScatterPlot(
  startYear,
  finishYear,
  countries = [],
  min_polarity = minPolarity,
  max_polarity = maxPolarity,
  min_text_length = minTextLength,
  max_text_length = maxTextLength,
  _months = months,
  branches = []
) {
  const start = _.toInteger(startYear);
  const finish = _.toInteger(finishYear);

  const data = disneyData.filter(function (elem) {
    const { Year_Month, Polarity, Text_length, Reviewer_Location, Branch } =
      elem;
    const year = _.toInteger(Year_Month.split("-")[0]);
    const month = _.toInteger(Year_Month.split("-")[1]);
    return (
      start <= year &&
      year <= finish &&
      min_polarity <= Polarity &&
      Polarity <= max_polarity &&
      min_text_length <= Text_length &&
      Text_length <= max_text_length &&
      _months.includes(month) &&
      (countries.length ? countries.includes(Reviewer_Location) : true) &&
      (branches.length ? branches.includes(Branch) : true)
    );
  });

  const svg = d3.select("#gScatterPlot");

  const minLength = d3.min(data, (d) => parseInt(d.Text_length));
  const x = d3
    .scaleLog()
    .domain([
      _.max([minLength - 1, 1]),
      d3.max(data, (d) => parseInt(d.Text_length)),
    ])
    .range([0, width]);

  const y = d3.scaleLinear().domain([-1, 1]).range([height, 0]);

  svg
    .select("#gXAxisScatter")
    .attr("transform", `translate(0, ${height / 2})`)
    .call(d3.axisBottom(x));

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
          .style("fill", (d) => getSeasonColor(d.season));
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
}

function updateCustomizePlot(
  _startYear,
  _finishYear,
  min_polarity = minPolarity,
  max_polarity = maxPolarity,
  min_text_length = minTextLength,
  max_text_length = maxTextLength,
  countriesFilter,
  _months = months,
  branches = []
) {
  const start = _.toInteger(_startYear);
  const finish = _.toInteger(_finishYear);

  const data = crudeBirthRateFiltered.filter(function (elem) {
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
      0,
      // d3.min(array, (d) => d.birthRate) - 1,
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
  const disneyDataFiltered = disneyData.filter((d) => {
    const { Polarity, Text_length, Reviewer_Location, Branch } = d;
    return (
      min_polarity <= Polarity &&
      Polarity <= max_polarity &&
      min_text_length <= Text_length &&
      Text_length <= max_text_length &&
      (countriesFilter.length
        ? countriesFilter.includes(Reviewer_Location)
        : true) &&
      (branches.length ? branches.includes(Branch) : true)
    );
  });
  const disneyGroupedByYear = _.groupBy(disneyDataFiltered, (d) => {
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
                60 * ((value - minReviews + 1) / (maxReviews - minReviews + 1))
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
                60 * ((value - minReviews + 1) / (maxReviews - minReviews + 1))
            );
            return rgba;
          });
      },
      (exit) => {
        exit.remove();
      }
    );
}

function drawSlides() {
  function createslider(element) {
    const inputs = element.querySelectorAll("input");
    const [inputStart, inputEnd] = inputs;

    const thumbLeft = element.querySelector(".thumb.left");
    const thumbRight = element.querySelector(".thumb.right");
    const rangeBetween = element.querySelector(".range-between");
    const labelMin = element.querySelector(".range-label-start");
    const labelMax = element.querySelector(".range-label-end");

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
    rangeBetween
  ) {
    inputStart.addEventListener("input", async () => {
      setStartValueCustomSlider(inputStart, inputEnd, thumbLeft, rangeBetween);
      setLabelValue(labelMin, inputStart);
      updateCustomizePlot(
        inputStart.value,
        inputEnd.value,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        countriesFilter
      );
      updateScatterPlot(inputStart.value, inputEnd.value, countriesFilter);
      createChordDiagram(
        countriesFilter,
        branchesFilter,
        inputStart.value,
        inputEnd.value,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        months
      );
      sInput = inputStart.value;
    });

    inputEnd.addEventListener("input", async () => {
      setEndValueCustomSlider(inputEnd, inputStart, thumbRight, rangeBetween);
      setLabelValue(labelMax, inputEnd);
      updateCustomizePlot(
        inputStart.value,
        inputEnd.value,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        countriesFilter
      );
      updateScatterPlot(inputStart.value, inputEnd.value, countriesFilter);
      createChordDiagram(
        countriesFilter,
        branchesFilter,
        inputStart.value,
        inputEnd.value,
        minPolarity,
        maxPolarity,
        minTextLength,
        maxTextLength,
        months
      );
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

function reset() {
  minPolarity = -1;
  maxPolarity = 1;
  minTextLength = 0;
  maxTextLength = 20756;

  countriesFilter = [];
  branchesFilter = [];

  months = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
  selectedSeason = null;

  sInput = 2010;
  eInput = 2019;

  drawBranchesFilter();
  drawCountryFilter();
  createScatterPlotSeasonLabels();

  createChordDiagram(
    countriesFilter,
    branchesFilter,
    sInput,
    eInput,
    minPolarity,
    maxPolarity,
    minTextLength,
    maxTextLength,
    months
  );
  updateScatterPlot(
    sInput,
    eInput,
    countriesFilter,
    minPolarity,
    maxPolarity,
    minTextLength,
    maxTextLength,
    months,
    branchesFilter
  );
  updateCustomizePlot(
    sInput,
    eInput,
    minPolarity,
    maxPolarity,
    minTextLength,
    maxTextLength,
    countriesFilter,
    months,
    branchesfilter
  );
}
