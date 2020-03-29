var width  = 800;
var height = 800;

var radius = d3.scale.sqrt()
	.domain([0, 30])
	.range([0, 15]);

var svg = d3.select("#nzmap")
	.attr("width", width)
	.attr("height", height)
	.style("background-color","#f0f8ff");
var g =	svg.append("g");
	// .attr("transform", "translate(0,0)");
var projection = d3.geo.mercator()
					.center([173.388, -41.2508])
					.scale(2500)
					.translate([width/2, height/2]);

var path = d3.geo.path()
				.projection(projection);

var tooltip = d3.select("body").append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

// svg.on("click",function(){tooltip.transition().duration(200).style("opacity", 0)});

var color = d3.scale.category20();

queue()
	.defer(d3.json, "nz.json")
	.defer(d3.json, "nzdata.json")
	.await(ready);

function ready(error, nz, nzdata) {
	if (error)
		return console.error(error);

	// set caption
	$('#dateDesc').text(nzdata.caption);
	var dataGroup = [nz.features, nzdata];
	// show map
	g.selectAll("path")
		.data(dataGroup[0])
		.enter()
		.append("path")
		.attr("class", "city")
		.attr("d", path )
		// .attr("class",function(d,i){
		// 	var dataDetailArr = nzdata.features.filter(function(D){
		// 		return D.properties.name == d.properties.name;
		// 	});
		// 	if (dataDetailArr.length > 0){
		// 		dataDetail = dataDetailArr[0];
		// 		num = dataDetail.properties.number
		// 		if (num>20)
		// 			return 'level3'
		// 		else if(num>10)
		// 			return 'level2'
		// 		else if(num>5)
		// 			return 'level1'
		// 	}
		// 	return 'city'
		// })

	// bubble shape
	var jobBubble = g.selectAll(".bubble")
	  .data(nzdata.features)
	  .enter();
	 jobBubble.append("path")
	  // .attr("class", "bubble")
	  .attr("class", function(d) {
		  num = d.properties.num;
		  if (num < 10)
			  return 'bubble level1'
		  else if (num < 20)
			  return 'bubble level2'
		  else
			  return 'bubble level3'
	  })
	  .attr("d", path.pointRadius(function(d) { return radius(d.properties.num); }))
	 .on("click",function(d,i){
		console.log(d)
	 })
	.on("mouseover",function(d,i){
		d3.select(this)
			.classed("bubble_focus",true);
		tooltip.transition()
			.duration(200)
			.style("opacity", .9);
		tooltip.html(d.properties.name)
			.style("left", (d3.event.pageX) + "px")
			.style("top", (d3.event.pageY - 28) + "px");
		window.event.stopPropagation();
	})
	.on("mouseout",function(d,i){
		d3.select(this)
			.classed("bubble_focus",false);
		tooltip.transition()
			.duration(200)
			.style("opacity", 0);
	});
	// bubble number
	 jobBubble.append("text")
	  .attr("class", "label")
	  .attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
		 .text(function(d) { return d.properties.num > 4?d.properties.num:'';})

	// jobBubble.append("text")
	// 	.attr("class", "tooltip")
	// 	.attr("transform", function(d) { return "translate(" + path.centroid(d) + ")"; })
	// 	.text(function(d) { return d.properties.num > 4?d.properties.name:'';})
	// 	// .style("font-size", function(d) { return Math.min(2 * d.r, (2 * d.r - 8) / this.getComputedTextLength() * 24) + "px"; });

}

var zoom = d3.behavior.zoom()
	.scaleExtent([0.5, 3])
	.on("zoom",function() {
		g.attr("transform","translate("+
			d3.event.translate.join(",")+")scale("+d3.event.scale+")");
		g.selectAll("circle")
			.attr("d", path.projection(projection));
		g.selectAll("path")
			.attr("d", path.projection(projection));
		tooltip.transition()
			.duration(100)
			.style("opacity", 0);
	});

svg.call(zoom)

var jobNum=-1;
function drawPie(jobdata,i){
	if(jobNum == i)
		return;
	$("#chart").html("");

	jobNum = i;
	/*  pie data */
	var w = 400;
	var h = 400;
	var r = h/2;
	var aColor = d3.scale.category20();

	var vis = d3.select('#chart').append("svg").data([jobdata]).attr("width", w).attr("height", h).append("svg:g").attr("transform", "translate(" + r + "," + r + ")");

	var pie = d3.layout.pie().value(function(d){return d.value;});

	// Declare an arc generator function
	var arc = d3.svg.arc().outerRadius(r);

	// Select paths, use arc generator to draw
	var arcs = vis.selectAll("g.slice").data(pie).enter().append("g").attr("class", "slice");
	arcs.append("path")
		.attr("fill", function(d, i){return aColor(i);})
		.attr("d", function (d) {return arc(d);})
		.on("mouseover",function(d,i){
			d3.select(this)
				.attr("fill","#999");
			$("#categoryName").text(d.data.category);
		})
		.on("mouseout",function(d,i){
			d3.select(this)
				.attr("fill",aColor(i));
			$("#categoryName").text("");
		});
	// Add the text
	arcs.append("text")
		.attr("transform", function(d){
			d.innerRadius = 100; /* Distance of label to the center*/
			d.outerRadius = r;
			return "translate(" + arc.centroid(d) + ")";}
		)
		.attr("text-anchor", "middle")
		.text( function(d, i) {return jobdata[i].value + '%';});
}