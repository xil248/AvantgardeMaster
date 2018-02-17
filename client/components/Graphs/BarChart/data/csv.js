import * as d3 from "d3"
import { bins } from "../model/bin"
import { gradBins } from "../model/gradBins"

export function readCSV(file,label,after,mode){
	
	d3.csv(file, function(error, data) {
		if (error) throw error;

		data.forEach(function(d) {
			d[label] = +d[label];
		})

		var bins0;
		switch(mode){
			case "normal":
				bins0 = new bins(data,label,interval)
				break;
			case "gradual":
				bins0 = new gradBins(data,label)
				console.log(bins0)
				break;
			default:
				bins0 = new bins(data,label,interval)
				break;
		}
	

    	after(bins0)
	})

}
