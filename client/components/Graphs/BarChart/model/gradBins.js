import * as d3 from "d3"

export class gradBins {

	constructor(data,label){


		this.container = [];
		this.label = label;


		// Sort
		data.sort(function(a,b){
			return a[label] - b[label]
		})

		// Find valid points and add to data
		var index = 0;
		for(var i=0;i<data.length;i++){
			if(data[i][label] != null && data[i][label] >= 0){
				index = i;
				break;
			}
		}
		this.data = data.slice(index)

		// console.log(this.data);
		// arrange into parts
		this.createArrange();

	}

	createArrange(n){

		// generate arrange with evenly interval
		var arrange = [];
		var min = this.getMinX();

		var max = this.getMaxX();

		if(n==null){
			// Freedman Binning
			var quartile1 = parseInt(this.data.length/4);
			var quartile2 = parseInt(this.data.length/4*3);
			var range = this.data[quartile2][this.label] - this.data[quartile1][this.label]
			var interval = parseInt(2 * range / Math.pow(this.data.length, 1/3))
			this.interval = interval;
			if (max - min < 20) {
				this.createArrange(max-min);
			}
			// console.log(min,max,this.interval,Math.ceil((max - min) / this.interval ) + 1)
			if (Math.ceil((max - min) / this.interval ) + 1 > 20) {
				this.createArrange(20);
				return ;
			}
			for(var i=min;i<=max;i+=this.interval){
				arrange.push(i);
			}
			if(arrange[arrange.length-1]!=max){
				arrange.push(max);
			}
			console.log(arrange);


		}else{
			if((max - min)/n < 1){
				// console.log(max - min/n);
				n = max - min;
			}
			var range = this.data[this.data.length-1][this.label] - this.data[0][this.label];
			var remain = range % n
			var interval =  parseInt(range/n);
			this.interval = interval;
			// console.log(interval)
			var num = min
			for(var i=0;i<=n;i++){
				arrange.push(num);
				num += interval;
			}

			for(var i=remain;i>0;i--){
				arrange[n]+=i;
				n--;

			}
			// this.interval = remain != 0 ? this.interval+1:this.interval
			// console.log(arrange)
		}



		// generate container
		this.container = [];

		var maxX = arrange[arrange.length-1];
		var maxY = 0;

		var a = 0;
		var pre = null;

		for(var i=0;i<arrange.length-1;i++){

			// get bin.i
			while(this.data[a][this.label] < arrange[i]){
				a++;
				if(a >= this.data.length){
					a = this.data.length;
					break
				}
			}
			// push bin to container
			var min = arrange[i]
			var max = arrange[i+1]
			var bin0 = new bin(this,a,min,max,pre,null);
			this.container.push(bin0);

			// if not the first element
			if(pre){
				pre.next = bin0;
				var y = bin0.i - pre.i;
				maxY = y > maxY ? y : maxY;
			}
			// normal incrementing
			pre = bin0;

		}

		// first element
		maxY = this.container[0].value() > maxY ? this.container[0].value() : maxY
		// update maxX, maxY
		this.maxX = maxX;
		this.maxY = maxY;
		// console.log(this.container)

	}

	addSub(d){
		var n = new bin(d.data,d.i,d.min,d.max,d.pre,d.next);
		return n;
	}


	// LL
	combineLeft(d,num){
		d.min= num;

		for(var i=0;i<this.data.length;i++){
			if(this.data[i][this.label] >= num){
				d.i = i;
				break;
			}
		}

		// console.log(d.i)
		for(var i=0;i<this.container.length;i++){
			if(this.container[i].min >= d.min){
				d.pre = this.container[i].pre;
				break;
			}
		}

	}

	updateLL(d){

		// next
		if(d.next != null){
			d.next.pre = d;
		}
		// pre
		if(d.pre != null){
			d.pre.next = d
			d.pre.max = d.min
		}

		this.resetContainer(d)

	}


	// RR

	combineRight(d,num){

		d.min = num
		for(var i=this.data.length-1;i>=0;i--){
			if(this.data[i][this.label] < num){
				d.i = i+1;
				break;
			}
		}

		for(var i=this.container.length-1;i>=0;i--){
			if(this.container[i].min <= d.min){
				d.next = this.container[i].next
				d.max = d.next == null ? this.container[i].max : d.next.min
				break;
			}
		}

		// console.log(d.i,d.next)

	}

	updateRR(d){

		// console.log(d.min)
		//  inserted node should not exist: no insertion needed
		if(d.min == d.max || d.pre.min == d.min){
			d.pre.next = d.next;
			d.pre.max = d.max;
			this.resetContainer(d)
			return;
		}
		// next
		if(d.next != null){
			d.next.pre = d
		}

		// pre
		if(d.pre != null){
			d.pre.max = d.min;
			d.pre.next = d;
		}

		this.resetContainer(d)


	}


	// LR
	splitLeft(d,num){
		var min = d.pre.i
		var max = d.next == null ? this.data.length : d.next.i
		d.i = max
		for(var i=min;i<=max;i++){
			if(this.data[i] == null || this.data[i][this.label] > num){
				d.i = i;
				break;
			}
		}
		// console.log(d.i)
		d.min = num;

	}

	updateLR(d){
		//  inserted node should not exist: no move left
		var first =  d.min == this.container[0].min;
		if(d.pre.min == d.min){
			return
		}

		// inserted node should not exist: no move right
		var last =  d.min == this.container[this.container.length-1].max;
		if(last){
			return;
		}else{
			if(d.min == d.max){
				return;
			}
		}

		// pre
		d.pre.max = d.min;
		d.pre.next = d;


		// nxt
		if(d.next != null){
			d.next.pre = d;
		}

		// console.log(this.container)
		this.resetContainer(d)
	}


	// RL
	splitRight(d,num){
		var min = d.pre.i
		var max = d.next == null ? this.data.length : d.next.i
		d.i = max
		for(var i=min;i<=max;i++){
			if(this.data[i] == null || this.data[i][this.label] >= num){
				d.i = i;
				break;
			}
		}
		// console.log(d.i)
		d.min = num;
	}
	updateRL(d){
		this.updateLR(d);
	}

	find(x){
		for(var i=d.i;i>=0;i--){
			if(this.data[i][this.label] < num){
				d.i = i;
				break;
			}
		}
	}

	resetContainer(d){
		var start = this.container[0]
		if(d.pre == null){
			start = d;
		}
		var high = 0;
		var container = [];
		while(start!=null){
			container.push(start);
			var value = start.value()
			if( value > high){
				high = value
			}
			start = start.next;
			// console.log(start)

		}
		this.maxY = high
		this.container = container
	}
	getMinX(){
		return parseInt(this.data[0][this.label])/*/this.interval)*this.interval*/;
	}
	getMaxX(){
		return parseInt(this.data[this.data.length-1][this.label])/*/this.interval)*this.interval+this.interval*/;
	}

	size(){
		return this.data.length;
	}
}

class bin{


	constructor(data,i,min,max,pre,next){
		this.data = data;
		this.i = i;
		this.pre = pre;
		this.min = min;
		this.max = max;
		this.next = next
	}

	value(){
		var next = this.next
		if(next == null){
			next = this.data.data.length;
		}else{
			next = next.i
		}

		return next - this.i;

	}

	size(){
		return this.max - this.min;
	}

	rangeMin(){
		return this.min;
	}

	rangeMax(){
		return this.max;
	}


}
