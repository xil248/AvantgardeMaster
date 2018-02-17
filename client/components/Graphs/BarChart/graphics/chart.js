import * as d3 from 'd3'
import { toolTip } from "./toolTip"

export class chart{

	constructor(bins,rectWidth,root){

		this.root = root;
		// bins config
		this.bins = bins

		// svg config
		this.margin = {top: 30, right: 30, bottom: 50, left: 50}
		this.width = 350 - this.margin.left - this.margin.right
		this.height = 200 - this.margin.top - this.margin.bottom

		// rectangle config
		this.rectInterval = 20
		if(rectWidth != null){
    		this.rectWidth = rectWidth;
  		}else{
  			this.rectWidth = (this.width-(2*this.rectInterval))/this.bins.container.length;
  		}


		// bar config
		this.rectX = this.getRectX()

		// triangle config
		this.triLength = 5;
		this.triPadding = 40;

		// tag config
		this.tagPadding = 20;

		// axis config
		this.x = d3.scaleLinear()
		          .range([0, this.width])
		          .domain([0, this.bins.maxX]);
		this.y = d3.scaleLinear()
		          .range([this.height, 0])
		          .domain([0, this.bins.maxY]);


		// toolTip
		this.tip = new toolTip(this,this);

		// toolTip config
		// this.tip = createToolTip(bar,config);


	}

	draw(){
		console.log(this.root)
		var svg = d3.select(this.root)
	      .append("svg")
	      .attr("width", this.width + this.margin.left + this.margin.right)
	      .attr("height", this.height + this.margin.top + this.margin.bottom)
	    var wrap = svg.append("g")
	      .attr("class","chart")
	      .attr("transform",
	            "translate(" + this.margin.left + "," + this.margin.top + ")");


		this.realElement = svg;
		this.element = wrap;

	}

	clear(){
		d3.selectAll("svg").remove();
		d3.selectAll(".d3-tip").remove();
	}



	// return an array of x positions of bars
	getRectX(){

		var arr = []

		var bins = this.bins;
		var start = this.rectInterval;


		for(var i=0; i<bins.container.length;i++){
			var length = bins.container[i].size() / bins.interval;
			start = start + ( this.rectWidth * length )
			arr.push( start - ( this.rectWidth * length/2 ) )
		}


		return arr;

	}
}


