import * as d3 from "d3"
import { selection } from "../graphics/selection"
var DragSelect = require("dragselect");

// setting up drag-select

export class dragselect{

	constructor(chart0){
		this.proxy = new DragSelect({
	    	selectables: document.getElementsByClassName('bar'),
	    	area: chart0.element.node().parentNode.parentNode,
	    	callback: function(elements) {
	      		
	      		if(elements.length==chart0.bins.container.length){
	      			// for(var i=0; i< elements.length;i++){
		        // 		d3.select(elements[i]).select("rect").style("fill","red")
	      			// }
	      			var select = new selection(chart0, chart0,"numBin")
	        		
	        		d3.select("#selection").remove()
	        		chart0.tip.hide()

	        		select.x = chart0.rectInterval/2;
	        		select.width = chart0.width - chart0.rectInterval
	        		select.height = chart0.height
	        		select.draw()

	        		
	        		select.element.append("text")
	        			.attr("class","tip")
						.attr("x", chart0.width/2)
						.attr("dy", -20)
						.style("text-anchor", "middle")
						.style("fill","black")
						.text("# of Bins: "+chart0.bins.container.length)
						.attr("stroke","black")

			      	}
	    	}
		});	

	}

}