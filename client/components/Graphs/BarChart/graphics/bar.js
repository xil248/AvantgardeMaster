// import { bindBar } from '../interaction/bar'

export class bar{
	
	constructor(parent,chart){
		this.parent = parent;
		this.chart = chart;
	}

	draw(){
		var bar = this.parent.element.selectAll("g")
	 		.data(this.parent.bins.container)
	  		.enter().append("g")
		    	.attr("class", "bar")
		    	.attr("transform", this.getTransform.bind(this))
		    	.style('cursor','pointer')
		this.element = bar;
		// bindBar(this)

	}

	getTransform(d,i){

		// console.log(i);
		var translateX = this.parent.rectX[i],
			translateY = this.parent.y(d.value());

		return "translate(" + translateX + "," + translateY + ")"; 
	}

}