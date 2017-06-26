var w = 900;
var h = 600;
var padding = 90;
var causes = ["eat", "cloth", "hotel", "transport", "edu", "shopping"];
var causesCHT = ["食", "衣", "住", "行", "文教", "百貨"];
var causeColor = [];
var cScale = d3.scale.category20();
for (var i = 0; i < causes.length; i++) {
	var setColor = cScale(causes[i]);
	causeColor.push(setColor);
}


svg();
d3.csv("credStack_data.csv", row, function (dataSet) {
	//console.log(dataSet);
	//TODO-找出符合
	//    var fDataSet = dataSet.filter(function (d) {
	//        return d.date <= "2014/2/1";
	//    });


	//console.log(fDataSet);

	//fDataSet.sort(function(a, b) { return b.date - a.date; });
	//                        console.log("bankData",bankData);
	//stack
	var layers = d3.layout.stack()(causes.map(function (c) {
		return dataSet.map(function (d) {
			return {
				x: d.date,
				y: +d[c],
				type: c,
			};
		})
	}));
	console.log(layers);

	bind(layers);
	render(layers);
	listItems(layers);
});

function row(d) {
	d.amount = +d.amount;
	d.count = +d.count;
	return d;
}


function svg() {
	d3.select("body").append("div").attr({
			"class": "title"
		})
		.html("<h3><img src='img/title.png'>2014-2016年信用卡消費類別分析</h3>");
	d3.select("body").append("svg").attr({
		width: w,
		height: h,
		"id": "credit2D"
	});
	d3.select("svg").append("g").append("rect").attr({
		width: "100%",
		height: "100%",
		fill: "white"
	});
	d3.select("body").append("div").attr({
		"id": "buttonList"
	});
	d3.select("#credit2D").append("g").attr("id", "axisX");
	d3.select("#credit2D").append("g").attr("id", "axisY");
}

function bind(dataSet) {
	//4.2 Stacked-to-Grouped bind()
	var arrd3 = d3.select("svg")
		.selectAll(".layer")
		.data(dataSet)
		.attr({
			"class": "layer",
			fill: function (d, i) {
				return causeColor[i];
			}
		});
	arrd3.enter().append("g")
		.attr("class", "layer")
		.style({
			fill: function (d, i) {
				//console.log(causes[i]);
				return cScale(i);
			}
		});
	arrd3.exit().remove();


	var rect = arrd3.selectAll("rect")
		.data(function (d) {
			return d;
		});

	rect.enter().append("rect");
	rect.exit().remove();

}

function render(dataSet) {
	var xScale = d3.time.scale().domain([
            new Date("2014/1/1"),
            new Date("2016/12/1")
            ]).range([padding, w - padding]);

	var yScale = d3.scale.linear()
		.domain([0, d3.max(dataSet[dataSet.length - 1], function (d) {
			//console.log(d.y0 + d.y);
			return d.y0 + d.y;
		})])
		.range([h - padding, padding]);

	var fScale = d3.scale.category20();


	//建立render()繪圖

	var layer = d3.select("svg#credit2D")
		.selectAll(".layer")
		.data(dataSet);
	layer.selectAll("#rect")
		.data(function (d) {
			return d;
		})
		.enter().append("rect")
		.transition()
		.duration(5000)
		.ease("exp")
		.delay(function (d, i) {
			return i * 10;
		})
		.attr({
			x: function (d, i) {
				//console.log("x " + d.x);
				return xScale(new Date(d.x));
			},
			y: function (d, i) {
				//console.log(d.y + d.y0);
				return yScale(d.y + d.y0);
			},
			height: function (d, i) {
				//console.log(yScale(d.amount));
				return yScale(d.y0) - yScale(d.y + d.y0);;
			},
			width: 12,

		});
	layer.selectAll("rect")
		.on("mouseover", function (d, i) {
			var posX = d3.mouse(this)[0] - 15;
			var posY = d3.mouse(this)[1] - 25;
			var tooltip = d3.select("#tooltip")
				.style({
					left: (+posX + 20) + "px",
					top: (+posY + 20) + "px"
				});
			tooltip.select("#date").text(function () {
				return "年月:" + d.x;
			});
			tooltip.select("#amount").text(function () {
				//console.log(this);
				return "簽帳金額:" + d.y;
			});
			d3.select("#tooltip").select("#type").html(function () {
				var typeIndex = causes.indexOf(d.type);
				return "類別:<img src='img/" + d.type + ".png'>" + causesCHT[typeIndex];
			});
			tooltip.classed("hidden", false);
		})

		.on("mouseout", function (d) {
			d3.select("#tooltip").classed("hidden", true);
		});


	//開始畫x,y軸線 
	var xAxis = d3.svg.axis().scale(xScale).orient("bottom");
	var yAxis = d3.svg.axis().scale(yScale).orient("left").tickFormat(function (d) {
		return d / 1000000000 + " B";
	});
	d3.select("svg")
		.select("g#axisY")
		.attr("class", "axis")
		.attr("transform", "translate(" + (padding - 10) + ",0)")
		.call(yAxis);
	d3.select("svg")
		.select("g#axisX")
		.attr("class", "axis")
		.attr("transform", "translate(0," + (h - padding + 10) + ")")
		.call(xAxis);


}

function listItems(dataSet) {
	//bind input
	var selection = d3.select("body>#buttonList")
		.selectAll("button")
		.data(causes);
	selection.enter().append("button");
	selection.exit().remove();


	//render
	d3.selectAll("#buttonList>button")
		.attr({
			value: function (d, i) {
				return d;
			},
			class: "button",
			type: "button",
			onclick: function (d) {
				return "update('" + d + "')";
			}
		})
		.html(function (d, i) {
			//console.log(i);
			return "<img src='img/" + causes[i] + ".png'>" + causesCHT[i];
		});
	d3.select("#buttonList").insert("button", ":first-child")
		.attr("value", "All")
		.attr("class", "button")
		.attr("onclick", "update('All')")
		.html("<img src='img/all.png'>全部");

}

function update(typeName) {
	console.log(typeName);
	var newCauses = [];
	var typeIndex = causes.indexOf(typeName);
	var queryType = "";
	//console.log(causes[typeIndex]);
	if (typeName === "All") {
		newCauses = causes;

	} else {
		var newCauses = causes.filter(function (d) {
			return d === typeName;
		});
		queryType = typeName;
	}
	//console.log(newCausesCHT);
	//stack
	d3.csv("credStack_data.csv", row, function (dataSet) {
		var newLayers = d3.layout.stack()(newCauses.map(function (c) {
			return dataSet.map(function (d) {
				return {
					x: d.date,
					y: +d[c],
					type: c
				};
			})
		}));
		bind(newLayers);
		d3.selectAll(".layer")
			.transition().duration(5000)
			.ease("circle");
		render(newLayers);
	});

}
