const languageRoot = document.querySelector("[data-language-globe]");

if (languageRoot) {
  const targets = [
    { name: "United Kingdom", lang: "English", prof: "C1" },
    { name: "Poland", lang: "Polish", prof: "B2" },
    { name: "Russia", lang: "Russian", prof: "Native" },
    { name: "Belarus", lang: "Belarusian", prof: "Native" },
  ];

  const svg = d3.select("#languageGlobe");
  const projection = d3
    .geoOrthographic()
    .scale(148)
    .translate([150, 150])
    .clipAngle(90);
  const path = d3.geoPath(projection);
  const graticule = d3.geoGraticule10();
  const langOut = document.getElementById("languageName");
  const profOut = document.getElementById("languageProf");
  const wrap = document.getElementById("languageGlobeWrap");

  let rotation = [-20, -52];
  let targetRotation = [-20, -52];
  let countryFeatures = [];
  let idleTimer = null;

  projection.rotate(rotation);

  svg
    .append("circle")
    .attr("cx", 150)
    .attr("cy", 150)
    .attr("r", 148)
    .attr("fill", "url(#sphereShade)");
  svg
    .append("circle")
    .attr("class", "sphere-outline")
    .attr("cx", 150)
    .attr("cy", 150)
    .attr("r", 148);
  svg
    .append("path")
    .datum(graticule)
    .attr("class", "graticule")
    .attr("d", path);
  const countriesGroup = svg.append("g");

  fetch("https://cdn.jsdelivr.net/npm/world-atlas@2.0.2/countries-110m.json")
    .then((r) => r.json())
    .then((topo) => {
      countryFeatures = topojson.feature(topo, topo.objects.countries).features;

      countriesGroup
        .selectAll("path")
        .data(countryFeatures)
        .enter()
        .append("path")
        .attr("class", "country")
        .attr("d", path);

      render();
      startLoop();
    });

  function render() {
    projection.rotate(rotation);
    svg.selectAll(".graticule").attr("d", path);
    countriesGroup.selectAll("path").attr("d", path);

    const centerLonLat = [-rotation[0], -rotation[1]];
    let activeName = null;
    let bestDist = Infinity;

    targets.forEach((target) => {
      const feature = countryFeatures.find(
        (f) => f.properties.name === target.name,
      );
      if (!feature) return;

      const centroid = d3.geoCentroid(feature);
      const dist = d3.geoDistance(centerLonLat, centroid);
      if (dist < bestDist) {
        bestDist = dist;
        activeName = target.name;
      }
    });

    countriesGroup
      .selectAll("path")
      .classed("active", (d) => d.properties.name === activeName);

    const active = targets.find((target) => target.name === activeName);
    if (active) {
      langOut.textContent = active.lang;
      profOut.textContent = active.prof;
    }

    return activeName;
  }

  function startLoop() {
    function tick() {
      const dx = targetRotation[0] - rotation[0];
      const dy = targetRotation[1] - rotation[1];

      if (Math.abs(dx) > 0.05 || Math.abs(dy) > 0.05) {
        rotation[0] += dx * 0.18;
        rotation[1] += dy * 0.18;
        render();
      }

      requestAnimationFrame(tick);
    }

    requestAnimationFrame(tick);
  }

  function scheduleSnap() {
    clearTimeout(idleTimer);
    idleTimer = setTimeout(() => {
      if (!countryFeatures.length) return;

      const centerLonLat = [-targetRotation[0], -targetRotation[1]];
      let bestDist = Infinity;
      let bestCentroid = null;

      targets.forEach((target) => {
        const feature = countryFeatures.find(
          (f) => f.properties.name === target.name,
        );
        if (!feature) return;

        const centroid = d3.geoCentroid(feature);
        const dist = d3.geoDistance(centerLonLat, centroid);
        if (dist < bestDist) {
          bestDist = dist;
          bestCentroid = centroid;
        }
      });

      if (bestCentroid) {
        targetRotation = [-bestCentroid[0], -bestCentroid[1]];
      }
    }, 260);
  }

  let dragging = false;
  let lastX = 0;
  let lastY = 0;

  wrap.addEventListener("pointerdown", (event) => {
    dragging = true;
    clearTimeout(idleTimer);
    lastX = event.clientX;
    lastY = event.clientY;
    wrap.setPointerCapture(event.pointerId);
  });

  wrap.addEventListener("pointermove", (event) => {
    if (!dragging) return;

    const dx = event.clientX - lastX;
    const dy = event.clientY - lastY;
    lastX = event.clientX;
    lastY = event.clientY;
    targetRotation[0] += dx * 0.4;
    targetRotation[1] = Math.max(
      -80,
      Math.min(80, targetRotation[1] - dy * 0.4),
    );
    rotation = targetRotation.slice();
    render();
  });

  wrap.addEventListener("pointerup", () => {
    dragging = false;
    scheduleSnap();
  });

  wrap.addEventListener("pointercancel", () => {
    dragging = false;
  });
}
