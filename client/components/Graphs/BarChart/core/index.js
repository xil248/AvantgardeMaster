import * as d3 from "d3";
import { chart } from "../graphics/chart"
import { bar } from "../graphics/bar"
import { rectangle } from "../graphics/rectangle"
import { axis } from "../graphics/axis"
import { tag } from "../graphics/tag"
import { toolTip } from "../graphics/toolTip"
import { readCSV } from "../data/csv"
import { dragselect } from "../graphics/drag-select"

// const label = "Age",
//       file = "../public/data.csv"


var root;
var props;

export function setRoot(e){
  root = e;
}

export function setProps(e){
  props = e;
}

export function main(bins,rectWidth){

  // console.log(element)
  var chart0 = new chart(bins,rectWidth,root);
  chart0.draw()

  var bar0 = new bar(chart0,chart0)
  bar0.draw()

  var rect0 = new rectangle(bar0,chart0)
  rect0.draw()

  var axis0 = new axis(chart0,chart0)
  axis0.draw()

  var tag0 = new tag(bar0,chart0)
  tag0.draw()

  // var toolTip0 = chart0.tip;
  // toolTip0.draw()

  // var dragselect0 = new dragselect(chart0)


  return chart0

}





