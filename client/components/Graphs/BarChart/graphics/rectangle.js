import * as d3 from 'd3'
import { bindRectangle } from '../interaction/rectangle.js'

export class rectangle{

	constructor(parent,chart){
		this.parent = parent;
		this.chart = chart;
	}

	draw(){
		var rect = this.parent.element.append("rect")
			.attr("class", "rect")
			.attr("x", this.getX.bind(this))
			.attr("width", this.getWidth.bind(this))
			.attr("height", this.getHeight.bind(this))
			.style("fill","#3690c0")
			.style("stroke","black")

	    this.element = rect
	    bindRectangle(this)

	}

	// return x of rect relative to bar
	getX(d){
		return -(this.chart.rectWidth/2*d.size()/this.chart.bins.interval)
	}

	// return width of rect 
	getWidth(d){
		return d.size()*this.chart.rectWidth/this.chart.bins.interval
	}

	// return height of rect
	getHeight(d){
		return this.chart.height - this.chart.y(d.value());
	}
}