import * as d3 from "d3";


export function bindSelection(selection){
	selection.element.on("click",removeSelection.bind(selection))
}
function removeSelection(d){
	d3.select("#selection").remove();
	// this.chart.tip.hide(d)
}
