var svgWidth = 960;
var svgHeight = 500;

var margin = { top: 20, right: 40, bottom: 80, left: 100 };

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart, and shift the latter by left and top margins.
var svg = d3.select(".iframeContainer")
    .append("svg")
    .attr("width", svgWidth)
    .attr("height", svgHeight)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("text")
    .attr("x", (width / 2))             
    .attr("y", 0 - (margin.top / 2)+5)
    .attr("text-anchor", "middle")  
    .style("font-size", "16px") 
    .style("text-decoration", "underline")  
    .text("Some Interesting Correlations!");

var chart = svg.append("g");

d3.csv("healthData.csv", function(err, healthData) {
    if (err) {
        throw err;
    }

    healthData.forEach(function(data) {
        data.married = +data.married;
        data.less_education = +data.less_education;
        data.walked_or_biked_to_work = +data.walked_or_biked_to_work;
        data.obese_or_overweight = +data.obese_or_overweight;
        data.abbr = data.abbr;
    });

    var dots = svg.selectAll("g.dot")
    .data(healthData)
    .enter().append('g');


    // Create scale functions
    var yLinearScale = d3.scaleLinear()
        .range([height, 0]);

    var xLinearScale = d3.scaleLinear()
        .range([0, width]);

    // Create axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    var educationMax = d3.max(healthData, function(data) {
        return +data.less_education*1.05;})
    var educationMin = d3.min(healthData, function(data) {
        return +data.less_education*0.95;})

    var marriedMax = d3.max(healthData, function(data) {
        return +data.married*1.05;})
    var marriedMin = d3.min(healthData, function(data) {
        return +data.married*0.95;})
    
    // Scale the domain
    xLinearScale.domain([educationMin, educationMax]);
    yLinearScale.domain([marriedMin, marriedMax]);

    // xCommuteLinearScale.domain([])

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -100])
        .style("opacity", .9)        
        .html(function(data) {
            var state = data.state;
            var lessEducation = +data.less_education;
            var married = +data.married
            var obeseOverweight = +data.obese_or_overweight;
            var walkBikeToWork = +data.walked_or_biked_to_work;
            ;
            
            return ("<b>" + state + "</b>" + "<br> Married (%): " + married + 
                    "<br> Less Than HighSchool (%): " + lessEducation +
                    "<br> Obese or Overweight (%): " + obeseOverweight +
                    "<br> Walk or Bike to Work (%): " + walkBikeToWork 
                );
        });

    dots.call(toolTip);

    dots.append('circle')
        .attr("cx", function(data, index) {
            return xLinearScale(data.less_education);
        })
        .attr("cy", function(data, index) {
            return yLinearScale(data.married);
        })
        .attr("r", "10")
        .attr("fill", "LightBlue")
        .on("mouseover", toolTip.show)
        .on("mouseout", toolTip.hide);
       

    dots.append("text")
        .text(function(data){
            var abbrevation = data.abbr;
            return abbrevation;
        })
        .style("font-size", "8px")
        .style("font-weight", "bold")
        .style("color", "black")
        .attr("class", "state-abb")
        .attr("x", function(data, index) {
            return xLinearScale(data.less_education -0.15);
        })
        .attr("y", function(data, index) {
            return yLinearScale(data.married-0.27);
        });
        

    chart.append("g")
        .attr("transform", `translate(0, ${height})`)
        .attr("class", "x-axis")
        .call(bottomAxis);

    chart.append("g")
        // .attr("transform", `translate(0,${width})`)
        .attr("class", "y-axis")
        .call(leftAxis);

    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "axis-text active")       
        .attr("data-axis-name", "married")                
        .text("Married People (%)");

    
    chart.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left + 40)
        .attr("x", 0 - (height / 2))
        .attr("dy", "-0.15em")
        .attr("class", "axis-text inactive")   
        .attr("data-axis-name", "obese_or_overweight")        
        .text("Obese or Overweight people (%)");

    // Append x-axis labels
    chart.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 30) + ")")
        .attr("class", "axis-text active")
        .attr("data-axis-name", "less_education")
        .text("People Who've Studied Less Than High School(%)");

    chart
        .append("text")
        .attr("transform", "translate(" + width / 2 + " ," + (height + margin.top + 45) + ")")
        // This axis label is inactive by default
        .attr("class", "axis-text inactive")
        .attr("data-axis-name",  "walked_or_biked_to_work")
        .text("People who Walked or Biked to Work (%)");

    // Change an axis's status from inactive to active when clicked (if it was inactive)
    // Change the status of all active axes to inactive otherwise
    function labelChange(clickedAxis) {
        d3
            .selectAll(".axis-text")
            .filter(".active")
        // An alternative to .attr("class", <className>) method. Used to toggle classes.
            .classed("active", false)
            .classed("inactive", true);

        clickedAxis.classed("inactive", false).classed("active", true);
    }

    function findMinAndMax(dataColumnX) {
        return d3.extent(healthData, function(data) {
            return +data[dataColumnX]*1.05;
        });
    }

    function findMinAndMaxY(dataColumnY) {
        return d3.extent(healthData, function(data) {
            return +data[dataColumnY];
        });
    }


    d3.selectAll(".axis-text").on("click", function() {
    // Assign a variable to current axis
        var clickedSelection = d3.select(this);
        // "true" or "false" based on whether the axis is currently selected
        var isClickedSelectionInactive = clickedSelection.classed("inactive");
        // console.log("this axis is inactive", isClickedSelectionInactive)
        // Grab the data-attribute of the axis and assign it to a variable
        // e.g. if data-axis-name is "poverty," var clickedAxis = "poverty"
     
        var clickedAxis = clickedSelection.attr("data-axis-name");
        // var clickedYAxis = clickedSelection.attr("data-yaxis-name");

        if (clickedAxis === "walked_or_biked_to_work") {
            clickedYAxis = "obese_or_overweight";
        }
        else if (clickedAxis === "obese_or_overweight") {
            clickedAxis ="walked_or_biked_to_work";
            clickedYAxis = "obese_or_overweight";
        }
        else if (clickedAxis === "less_education") {
            clickedYAxis = "married";            
        } 
        else if (clickedAxis === "married") {
            clickedAxis = "less_education";
            clickedYAxis = "married";
        };
        console.log("current Xaxis: ", clickedAxis,
                    "current Yaxis: ", clickedYAxis);
        
        // The onclick events below take place only if the x-axis is inactive
        // Clicking on an already active axis will therefore do nothing
        if (isClickedSelectionInactive) {
            // Set the domain for the x-axis

            var minX = findMinAndMax(clickedAxis)[0] *0.85;
            var maxX = findMinAndMax(clickedAxis)[1] *1.05;
            var minY = findMinAndMax(clickedYAxis)[0] *0.85;
            var maxY = findMinAndMax(clickedYAxis)[1] *1.05;

            xLinearScale.domain([minX,maxX]);
            yLinearScale.domain([minY,maxY]);

            console.log(findMinAndMax(clickedAxis)[0]);

            cyValue = function(data) {
                return yLinearScale(+data[clickedYAxis]);
            };

            cxValue = function(data) {
                return xLinearScale(+data[clickedAxis]);
            };
            // Create a transition effect for the x-axis
            svg.select(".x-axis")
                .transition()
            // .ease(d3.easeElastic)
                .duration(1800)
                .call(bottomAxis);

            svg.select(".y-axis")
                .transition()
            // .ease(d3.easeElastic)
                .duration(1800)
                .call(leftAxis);
            
                
            var items = ["LightPink","LightSalmon","Lavender","DarkSeaGreen","Bisque"];
            var item = items[Math.floor(Math.random()*items.length)];
            
            // var item = jQuery.rand(items);
            // Select all circles to create a transition effect, then relocate its horizontal location
            // based on the new axis that was selected/clicked
            d3.selectAll("circle").each(function() {
                d3
                    .select(this)
                    .transition()
                // .ease(d3.easeBounce)
                    .attr("fill", item)
                    .attr("cx", cxValue)
                    .attr("cy", cyValue)                    
                    .duration(1800);
            });

            d3.selectAll(".state-abb").each(function() {
                d3.select(this)
                .transition()
                .attr("x", function(data) {
                    return xLinearScale(+data[clickedAxis] -0.15);
                })
                .attr("y", function(data) {
                    return yLinearScale(+data[clickedYAxis] -0.1);
                })
                .duration(1800)  ;
                
            });

            // Change the status of the axes. See above for more info on this function.
            labelChange(clickedSelection);
        }
    });
});



