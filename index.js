
var display = function (projection_data){

    var width = 960,
        height = 550;

    var svg = d3.select("body").append("svg")
        .attr("width", width)
        .attr("height", height)
        .style("display", "block")
        .style("margin", "auto");

    // Append Div for tooltip to SVG
    var div = d3.select("body")
                .append("div")
                .attr("class", "tooltip")
                .style("opacity", 0);


    d3.json("saudiarabia/region.json", function(error, data) {
        if (error) return console.error(error);

        var subunits = topojson.feature(data, data.objects.countries)
        console.log(data);
        //console.log(subunits); subunits is a featurecollection with features
        // features is an array of 282 objectsfor India
        // each of these objects has geometry and properties
        // Line 68 of topojson/blob/master/test/feature-test.js describes
        // topojson.feature returns a featurecollection with features that has
        // geometry and properties

        var projection = d3.geoAlbers()
            .center(projection_data.center)
            .rotate(projection_data.rotate)
            .parallels(projection_data.parallels)
            .scale(projection_data.scale)
            .translate([width / 2, height / 2]);

        var path = d3.geoPath()
            .projection(projection);

        svg.append("path")
            .datum(subunits)
            .attr("d", path);

        d3.json("saudiarabia/population.json", function(error, population) {
          console.log("here");
            var color = d3.scaleThreshold()
                .domain([1, 2, 4, 7, 9].map(function(x){return x*1000000;}))
                .range(["#fdbb84", "#fc8d59", "#ef6548", "#d7301f", "#b30000", "#7f0000"]);
            console.log(population);

            var formatNumber = d3.format(".2s");

            svg.selectAll(".subunit")

                .data(topojson.feature(data, data.objects.countries).features)
                .enter().append("path")
                .style("fill", function(d){
                    console.log("in fill")
                    if(d.properties.countryname)
                    //console.log(d.properties.countryname);
                    //function was name
                        return color(population[d.properties.countryname]);
                })

                .attr("class", function(d) {
                //countryname is null if the country is India
                // instead name stores the name of the state
                    if(d.properties.countryname)
                        return "subunit background";
                    else
                        return "subunit";
                })
                .attr("d", path)
                .on("mouseover", function(d) {
                    if(d.properties.countryname){

                        d3.select(this).attr("class", "highlight");

                        div.transition()
                            .duration(200)
                            .style("opacity", .9);
                        div.style("left", (d3.event.pageX) + "px")
                            .style("top", (d3.event.pageY - 28) + "px");
                        div.append("div").text(d.properties.countryname);
                        div.append("div").text(formatNumber(population[d.properties.countryname]));
                    }
                })
                // fade out tooltip on mouse out
                .on("mouseout", function(d) {
                    d3.select(this).classed("highlight", false);
                    div.selectAll("*").remove();
                    div.transition()
                        .duration(0)
                        .style("opacity", 0);
                });


            var x = d3.scaleLog()
                .domain([900000, 120000000])
                .range([0, 480]);

            var xAxis = d3.axisBottom()
                .scale(x)
                .tickSize(13)
                .tickValues(color.domain())
                .tickFormat(function(d) { return d >= 100 ? formatNumber(d) : null; });

            var g = svg.append("g")
                .attr("transform", "translate(460,40)");
console.log("after");
            g.selectAll("rect")
                .data(color.range().map(function(d, i) {
                    return {
                        x0: i ? x(color.domain()[i - 1]) : x.range()[0],
                        x1: i < color.domain().length ? x(color.domain()[i]) : x.range()[1],
                        z: d
                    };
                }))

                .enter().append("rect")
                .attr("height", 8)
                .attr("x", function(d) { return d.x0; })
                .attr("width", function(d) { return d.x1 - d.x0; })
                .style("fill", function(d) { return d.z; });
console.log("after");
            g.call(xAxis).append("text")
                .attr("class", "caption")
                .attr("y", -6)
                .attr("fill", "#000")
                .text("Total population");
        });

    });
};
