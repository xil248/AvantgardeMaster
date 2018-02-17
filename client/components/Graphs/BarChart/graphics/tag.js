import * as d3 from 'd3'
import { bindTag } from '../interaction/tag'

export class tag{
	constructor(parent,chart){
		this.parent = parent;
		this.chart = chart;
	}

	draw(){
		var tag = this.parent.element.append("text")
			.text(this.getTag)
			.attr("transform",this.getTransform.bind(this))
			.style("text-anchor", "middle")
			.style("fill","black")
			.style("font","9px sans-serif")

		this.element = tag
		bindTag(this)
	}

	getTag(d){
		return d.rangeMin() + " - " + d.rangeMax();
	}

	getTransform(d){
		var dy = this.chart.height-this.chart.y(d.value()) + this.chart.tagPadding

		var transform = "translate(0,"+dy+"), rotate(45)"
		return transform;
	}
}
