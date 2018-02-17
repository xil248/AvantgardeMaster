// rectangle
import * as d3 from "d3";
import { selection } from "../graphics/selection"
import { bar } from "../graphics/bar"

export function bindRectangle(rect){

	rect.element.on('click', selectRectangle.bind(rect))
				.on('mouseover', reduceOpacity)
				.on('mouseout', fullOpacity)

}


function selectRectangle(d,i){

	var chart = this.chart
	// chart.tip.hide(d)
	// reset
	var selected = d3.select("#selection")


	if(selected.empty()){

		var selection0 = new selection(this.chart, this.chart)
		selection0.clone(this,d,i)
		selection0.draw()
		selection0.element.attr("i",i)

		// show tooltip
		// chart.tip.show(d)
	}else{

		if(parseInt(selected.attr("i")) == i){
			selected.remove()

		}else{
			selected.remove()


			var selection0 = new selection(this.chart, this.chart)
			selection0.clone(this,d,i)
			selection0.draw()
			selection0.element.attr("i",i)

			// show tooltip
			// chart.tip.show(d)

		}
	}




}

function reduceOpacity(){
	d3.select(this).style("opacity","0.8")
}

function fullOpacity(){
	d3.select(this).style("opacity","1")
}
