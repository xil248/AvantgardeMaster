import * as d3 from "d3";
import { selection } from "../graphics/selection"
import { rectangle } from "../graphics/rectangle"

export function bindTag(tag){
	
	tag.element.on('click', selectTag);

}

function selectTag(d,i){

	var selection = d3.select("#selection")
	var rect = d3.select(this.parentNode).select('rect');

	var e = document.createEvent('UIEvents');
	e.initUIEvent('click');
	rect.node().dispatchEvent(e);



}
