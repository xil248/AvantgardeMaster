import * as d3 from 'd3'

export class axis{
	constructor(parent,chart){
		this.parent = parent;
		this.chart = chart;
	}

	draw(){
		// add the x Axis
		var xAxis = this.parent.element.append("g")
			.attr("transform", "translate(0," + this.chart.height + ")")
			.call(d3.axisBottom(this.chart.x))
		xAxis.selectAll(".tick").remove()

		xAxis.append("text")
				.attr("x", this.chart.width)
				.attr("dx", "2em")
				.attr("dy", 15)
				.style("text-anchor", "end")
				.style("fill","black")
				.text(this.chart.bins.label);



		// add the y Axis
		this.parent.element.append("g")
			.call(d3.axisLeft(this.chart.y))
			.append("text")
				.attr("transform", "rotate(-90) translate(-30,0)")
				.attr("y", 6)
				.attr("dy", ".71em")
				.style("text-anchor", "end")
				.style("fill","black")
				.text("# of people");
	}

}