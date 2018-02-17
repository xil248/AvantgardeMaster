import * as d3 from 'd3'
import { triangle } from "./triangle"
import { bindSelection } from "../interaction/selection"

export class selection{

	constructor(parent,chart,mode){
		this.parent = parent;
		this.chart = chart;
		this.mode = mode
	}

	draw(){
		var selection = this.parent.element.append('g')
							.attr("id","selection")
							.attr("transform",this.transform)

		this.element = selection

		selection.append("rect")
	      .attr("class", "rect")
	      .attr("x", this.x)
	    //   .attr("i",this.i)
	      .attr("width", this.width)
	      .attr("height", this.height)
	      .style("fill","#ff7f00")
	      .attr("stroke","black")
	      .style("opacity","0.5")
	    this.adapt()
	    var triangle0 = new triangle(this,this.chart)
	    triangle0.draw()
		// console.log(this.chart.element)
		// this.chart.props.change = !this.chart.props.change;
	    bindSelection(this)
	    // this.parent.element.appendChild(selection)

	}

	clone(rect,d,i){
		this.x = rect.getX(d)
		this.width = rect.getWidth(d)
		this.height = rect.getHeight(d)
		this.transform = rect.parent.getTransform(d,i)
		this.i = i;

	}

	adapt(){
		var selection = this.element
		var rect = this.element.select("rect")
		var tri = this.element.selectAll(".draggable")
		// var tooltip = this.chart.tip

		var width = parseInt(rect.attr("width"))
		var height = parseInt(rect.attr("height"))
		if(height < 100){
			selection.append("path")
				.attr("class","l")
				.attr("d","m "+(-width/2)+" "+height+
						  "l 0 -100\
				")
				.attr("stroke","red")
				.attr("stroke-dasharray","5,5")
			selection.append("path")
				.attr("class","r")
				.attr("d","M "+(width/2)+" "+height+
						 " l 0 -100\
				")
				.attr("stroke","red")
				.attr("stroke-dasharray","5,5")
			rect.attr("height",100)
				.attr("y",-100+height)
				.style("stroke","none")
				.style("opacity","0.5")

			// tooltip.element.offset([-130+height,0])
		}
	}

	removeAdapt(){
		// var tooltip = this.chart.tip;
		// tooltip.offset([0,0])
	}

}