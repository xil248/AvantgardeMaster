// triganle
import * as d3 from "d3";

import { main } from "../core/index.js"
import { rectangle } from "../graphics/rectangle"

var currentX = 0;
var rectX = 0;
var oldWidth = 0;
var num = 0;
var combine = true;
var sub = null;

export function bindTriangle(tri){
	var i = tri.parent.i;
	if(i != 0){
		tri.element[0].call(d3.drag()
			.on("start",selectedTriangleLL.bind(tri))
		  	.on("drag",moveTriangleLL.bind(tri))
		  	.on("end",dropTriangleLL.bind(tri))
		)

	}else{
		// tri.element[0].style("cursor","not-allowed")
		d3.select("#selection .ll").remove()
	}


	if(i != tri.chart.bins.container.length-1){
		tri.element[1].call(d3.drag()
			.on("start",selectedTriangleRR.bind(tri))
		  	.on("drag",moveTriangleRR.bind(tri))
		  	.on("end",dropTriangleRR.bind(tri))
		)
	}else{
		// tri.element[1].style("cursor","not-allowed")
		d3.select("#selection .rr").remove()
	}
	tri.element[2].call(d3.drag()
			.on("start",selectedTriangleLR.bind(tri))
		  	.on("drag",moveTriangleLR.bind(tri))
		  	.on("end",dropTriangleLR.bind(tri))
	)
	tri.element[3].call(d3.drag()
			.on("start",selectedTriangleRL.bind(tri))
		  	.on("drag",moveTriangleRL.bind(tri))
		  	.on("end",dropTriangleRL.bind(tri))
	)
}

function selectedTriangle(){
	var d = this.chart.bins.container[this.parent.i];
	currentX = d3.event.x;
	oldWidth = new rectangle(null,this.chart).getWidth(d)
	rectX = -(oldWidth/2)
}




// LL Triangle
function selectedTriangleLL(){
	var d = this.chart.bins.container[this.parent.i];
	currentX = d3.event.x;
	oldWidth = new rectangle(null,this.chart).getWidth(d)
	rectX = -(oldWidth/2)
	sub = this.chart.bins.addSub(d)
}

function moveTriangleLL(){

	// set up
	var selection = d3.select("#selection")
	var rect = d3.select("#selection rect")
	var leftTri = d3.select("#selection .ll")
	var rightTri = d3.select("#selection .lr")
	var line = d3.select("#selection .l")

	// calculate mouse move
	var dx = d3.event.x - currentX;
	if(dx > 0){
		dx = 0
	}
	var newWidth = oldWidth - dx

	// change selection
	rect.attr("width",newWidth)
		.attr("x",rectX+dx)
	leftTri.attr("points",
		generatePoints(this.triangles[0],dx))
	rightTri.attr("points",
		generatePoints(this.triangles[2],dx))
	line.attr("transform","translate("+dx+",0)")

	// change tooltip
	var x = this.chart.bins.container[this.parent.i]
	var x1 = calcLL(rect,this.parent)
	var x2 = x.rangeMax()
	var pos1 = sub.i
	var pos2 = x.next == null ? this.chart.bins.size() : x.next.i
	// this.chart.tip.updateCombine(dx,x1,x2,pos1,pos2)
}


function calcLL(rect,selection){
	var chart = selection.chart
	var i = selection.i
	var d = chart.bins.container[i]
	var dx =  rectX - parseFloat(rect.attr('x'))


	// calculate number
	var x = d.rangeMin();
	while(d.pre != null){

		d = d.pre;

		// in rectangle
		var width = d.size()/chart.bins.interval*chart.rectWidth
		// console.log(width)
		var ratio = dx/width;
		dx -= width;
		if(ratio < 1){
			x = (1-ratio)*d.size()+d.rangeMin()
			break;
		}
		x = d.rangeMin()
	}

	x = parseInt(x)
	// record change
	chart.bins.combineLeft(sub,x)

	return x;
}

function dropTriangleLL(){
	this.chart.bins.updateLL(sub);
	this.chart.clear();
	main(this.chart.bins,this.chart.rectWidth)
}





// RR
function selectedTriangleRR(){
	var d = this.chart.bins.container[this.parent.i];
	currentX = d3.event.x;
	oldWidth = new rectangle(null,this.chart).getWidth(d)
	rectX = -(oldWidth/2)
	sub = this.chart.bins.addSub(d)
	sub.pre = sub.next.pre
	// sub.min = sub.pre.max
	// sub.max = sub.next.min

}

function moveTriangleRR(){

	// set up
	var selection = d3.select("#selection")
	var rect = d3.select("#selection rect")
	var leftTri = d3.select("#selection .rl")
	var rightTri = d3.select("#selection .rr")
	var line = d3.select("#selection .r")

	// calculate mouse move
	var dx = d3.event.x - currentX;
	if(dx < 0){
		dx = 0
	}
	var newWidth =  oldWidth + dx

	// change selection

	rect.attr("x",rectX)
		.attr("width",newWidth)
	leftTri.attr("points",
		generatePoints(this.triangles[1],dx))
	rightTri.attr("points",
		generatePoints(this.triangles[3],dx))
	line.attr("transform","translate("+dx+",0)")

	// change tooltip
	var x = this.chart.bins.container[this.parent.i]
	// console.log(x)
	var x1 = x.rangeMin()
	var x2 = calcRR(rect,this.parent)
	var pos1 = x.i
	var pos2 = sub.i
	// console.log(pos1,pos2)
	// this.chart.tip.updateCombine(dx,x1,x2,pos1,pos2)
}

function calcRR(rect,selection){
	var chart = selection.chart
	var i = selection.i
	var d = chart.bins.container[i]
	var dx =  parseFloat(rect.attr('width')) - oldWidth;

	// console.log(dx)
	// calculate number
	var x = d.rangeMax();
	while(d.next != null){

		d = d.next;

		// in rectangle
		var width = d.size()/chart.bins.interval*chart.rectWidth
		// console.log(width)
		var ratio = dx/width;
		dx -= width;
		if(ratio < 1){
			x = ratio*d.size()+d.rangeMin()
			break;
		}
		x = d.rangeMax()
	}

	x = parseInt(x)

	// record change
	chart.bins.combineRight(sub,parseInt(x))
	return x;
}

function dropTriangleRR(){
	this.chart.bins.updateRR(sub);
	this.chart.clear();
	main(this.chart.bins,this.chart.rectWidth)
}








// LR

function selectedTriangleLR(){
	var d = this.chart.bins.container[this.parent.i];
	currentX = d3.event.x;
	oldWidth = new rectangle(null,this.chart).getWidth(d)
	rectX = -(oldWidth/2)
	sub = this.chart.bins.addSub(d)
	sub.pre = d;
	sub.next = d.next;


}
function moveTriangleLR(){

	var selection = d3.select("#selection")
	var rect = d3.select("#selection rect")
	var leftTri = d3.select("#selection .ll")
	var rightTri = d3.select("#selection .lr")
	var line = d3.select("#selection .l")

	var dx = d3.event.x - currentX;
	if(dx < 0 ){
		dx = 0
	}
	if(dx > oldWidth-1){
		dx = oldWidth-1
	}
	var newWidth =  oldWidth - dx

	rect.attr("width",newWidth)
		.attr("x",rectX+dx)

	leftTri.attr("points",
		generatePoints(this.triangles[2],dx))
	rightTri.attr("points",
		generatePoints(this.triangles[0],dx))
	line.attr("transform","translate("+dx+",0)")

	var x = this.chart.bins.container[this.parent.i]
	var x1 = calcLR(rect,this.parent)
	var x2 = x.rangeMax()
	var pos1 = sub.i
	var pos2 = x.next == null ? this.chart.bins.data.length : x.next.i
	// this.chart.tip.updateCombine(dx,x1,x2,pos1,pos2)
}

function calcLR(rect,selection){
	var chart = selection.chart
	var i = selection.i
	var d = chart.bins.container[i]
	var length = chart.bins.container[selection.i].size()

	var dx =  parseInt(rect.attr("x")) - rectX + 1;
	var pos = parseInt(dx / oldWidth * chart.bins.container[selection.i].size())  + d.rangeMin();

	chart.bins.splitLeft(sub,pos);
	return pos;

}

function dropTriangleLR(){
	this.chart.bins.updateLR(sub);
	this.chart.clear();
	main(this.chart.bins,this.chart.rectWidth)
}







// RL
function selectedTriangleRL(){
	var d = this.chart.bins.container[this.parent.i];
	currentX = d3.event.x;
	oldWidth = new rectangle(null,this.chart).getWidth(d)
	rectX = -(oldWidth/2)
	sub = this.chart.bins.addSub(d)
	sub.pre = d;
	sub.next = d.next;
}
function moveTriangleRL(){

	var selection = d3.select("#selection")
	var rect = d3.select("#selection rect")
	var leftTri = d3.select("#selection .rl")
	var rightTri = d3.select("#selection .rr")
	var line = d3.select("#selection .r")

	var dx = d3.event.x - currentX;
	if(dx > 0){
		dx = 0
	}
	if(dx < -oldWidth+1){
		dx = -oldWidth+1
	}
	var newWidth =  oldWidth + dx
	rect.attr("x",rectX)
		.attr("width",newWidth)

	leftTri.attr("points",
		generatePoints(this.triangles[3],dx))

	rightTri.attr("points",
		generatePoints(this.triangles[1],dx))
	line.attr("transform","translate("+dx+",0)")

	var x = this.chart.bins.container[this.parent.i]
	var x1 = x.rangeMin()
	var x2 = calcRL(rect,this.parent)
	var pos1 = x.i
	var pos2 = sub.i
	// this.chart.tip.updateCombine(dx,x1,x2,pos1,pos2)
}

function calcRL(rect,selection){
	var chart = selection.chart;
	var i = selection.i
	var d = chart.bins.container[i]
	var length = chart.bins.container[selection.i].size()

	var dx =  oldWidth - parseFloat(rect.attr("width")) + 1;
	var pos = d.rangeMax() -  parseInt(dx / oldWidth * chart.bins.container[selection.i].size()) ;
	// console.log(pos)

	chart.bins.splitRight(sub,pos);
	return pos;
}


function dropTriangleRL(){
	this.chart.bins.updateRL(sub);
	this.chart.clear();
	main(this.chart.bins,this.chart.rectWidth)
}




// Num of Bin

export function bindTriangle1(tri){

	d3.select("#selection .ll").remove()
	d3.select("#selection .lr").remove()

	tri.element[1].call(d3.drag()
		.on("start",selectedTriangle1.bind(tri))
	  	.on("drag",moveTriangleRR1.bind(tri))
	  	.on("end",dropTriangle1.bind(tri))
	)


	tri.element[3].call(d3.drag()
		.on("start",selectedTriangle1.bind(tri))
	  	.on("drag",moveTriangleRL1.bind(tri))
	  	.on("end",dropTriangle1.bind(tri))
	)
}

function selectedTriangle1(){
	currentX = d3.event.x;
	oldWidth = this.parent.width
	rectX = this.parent.x
}

function moveTriangleRR1(){

	// set up
	var selection = d3.select("#selection")
	var rect = d3.select("#selection rect")
	var leftTri = d3.select("#selection .rl")
	var rightTri = d3.select("#selection .rr")
	// var tip = d3.select("#selection .tip")

	// calculate mouse move
	var dx = d3.event.x - currentX;
	if(dx < 0){
		dx = 0
	}
	var newWidth =  oldWidth + dx

	// change selection

	rect.attr("x",rectX)
		.attr("width",newWidth)
	leftTri.attr("points",
		generatePoints(this.triangles[1],dx))
	rightTri.attr("points",
		generatePoints(this.triangles[3],dx))

	num = this.chart.bins.container.length
	var add = parseInt(dx/this.chart.rectWidth);
	num = add >= 10 ? num + 10 : num + add;
	// tip.text("# of Bins: "+num)


}

function moveTriangleRL1(){

	var selection = d3.select("#selection")
	var rect = d3.select("#selection rect")
	var leftTri = d3.select("#selection .rl")
	var rightTri = d3.select("#selection .rr")
	// var tip = d3.select("#selection .tip")

	var dx = d3.event.x - currentX;
	if(dx > 0){
		dx = 0
	}
	if(dx < -oldWidth+1){
		dx = -oldWidth+1
	}
	var newWidth =  oldWidth + dx
	rect.attr("x",rectX)
		.attr("width",newWidth)

	leftTri.attr("points",
		generatePoints(this.triangles[3],dx))

	rightTri.attr("points",
		generatePoints(this.triangles[1],dx))

	num = this.chart.bins.container.length
	var add = parseInt(dx/this.chart.rectWidth);
	num = num + add > 0 ? num + add : 1;
	// console.log(tip)
	// tip.text("# of Bins: "+num)

}

function dropTriangle1(){
	console.log(num)
	this.chart.bins.createArrange(num);
	this.chart.clear();
	var range = this.chart.bins.getMaxX()-this.chart.bins.getMinX()
	var rectWidth = (this.chart.width-(2*this.chart.rectInterval))/parseInt(range/this.chart.bins.interval);
	main(this.chart.bins,rectWidth)
}


// helper function

function generatePoints(points,dx){
	return (points[0]+dx)+","+points[1]+" "+(points[2]+dx)+","+points[3]+" "+(points[4]+dx)+","+points[5]
}



