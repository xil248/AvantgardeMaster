
import * as d3 from "d3"

export class bins {

	constructor(data,label,interval){
		this.container = [];
		this.label = label;
		this.interval = interval;

		var container = []

		// Get max num
		var max=0;
		data.forEach(function(d){
		  var num = parseInt(d[label]/interval)     
		  max = num > max ? num : max;
		})

		// classify data from 0 to max
		for(var i=0;i<max+1;i++){
			container.push([])
		}
		data.forEach(function(d) {
		if(d[label]!=0)
		  container[parseInt(d[label]/interval)].push(d);
		})

		// rearrange to discret set
		var newBin = []
		for(var i=0;i<max+1;i++){
			if(container[i].length > 0){
			  var a = new bin(container[i],newBin.length,this)
			  newBin.push(a)
			}
		}

		// set up maxX, maxY
		this.maxX = max*interval;
		var maxY = 0;
		newBin.forEach(function(d){
			d.data.forEach(function(b){
				maxY = b.length > maxY? b.length : maxY
			})
		})
		this.maxY = maxY


		this.container = newBin
	}	

	combine(index1,index2){

		var newContainer = [];
		// add bins before index1
		for(var i=0; i<index1 ; i++){
			newContainer.push(this.container[i])
		}
		// combine
		var bin1 = this.container[index1];

		for(var i=index1+1;i<=index2;i++){
			bin1.combine(this.container[i])
		}
		newContainer.push(bin1)
		// add bins after index2
		for(var i=index2+1;i<this.container.length;i++){
			this.container[i].index -= (index2-index1)
			newContainer.push(this.container[i])
		}
		this.container = newContainer;

		var newMaxY = bin1.value()
		this.maxY = newMaxY > this.maxY ? newMaxY : this.maxY;

	}

	split(index1,pos){
		
		if(pos >= this.container[index1].size() || pos <= 0){
			return ;
		}
		var newContainer = []
		// add bins before index1
		for(var i=0; i<index1; i++){
			newContainer.push(this.container[i])
		}
		
		// split new bin
		var data = this.container[index1].data[0];
		this.container[index1].data.shift()
		this.container[index1].index += 1;
		var index = index1;
		var bin1 = new bin(data,index,this)
		for(var i=1; i<pos; i++){
			bin1.data.push(this.container[index1].data[0])
			this.container[index1].data.shift()
		}
		
		newContainer.push(bin1)
		newContainer.push(this.container[index1])


		// add bins after index1
		for(var i=index1+1;i<this.container.length;i++){
			this.container[i].index += 1;
			newContainer.push(this.container[i])
		}

		var a = bin1.value();
		var b = this.container[index1].value();

		var maxY = 0;
		newContainer.forEach(function(d){
			maxY = d.value() > maxY? d.value() : maxY
		})
		this.maxY = maxY
		this.container = newContainer;
		
	}


}


class bin{
	constructor(data,index,parent){
		this.data = [];
		this.data.push(data)
		this.index = index;
		this.parent = parent;
	}

	combine(bin){

		this.data = this.data.concat(bin.data);
	}

	size(){
		return this.data.length;
	}

	value(){
		var sum = 0;
		this.data.forEach(function(d){
			sum += d.length;
		})
		return sum;
	}

	rangeMin(){
		return (parseInt(this.data[0][0][this.parent.label]/this.parent.interval)*this.parent.interval);
	}

	rangeMax(){
		return (this.rangeMin()+(this.parent.interval*this.size()))
	}

	rangePos(i){
		return (parseInt(this.data[i][0][this.parent.label]/this.parent.interval)*this.parent.interval);
	}

}