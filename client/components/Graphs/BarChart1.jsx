import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
// import { event as currentEvent } from 'd3';
// import { withFauxDOM, createElement } from 'react-faux-dom';
// import { ReactDOM } from 'react-dom';
import { createElement } from 'react-faux-dom';
import {
  createUniqueID,
} from '../../utils/graphUtils';
import {
  gradBins as GradBins,
} from './BarChart/model/gradBins';
import DataUtils from '../../utils/dataUtils';


// const DragSelect = require('dragselect');

function generatePoints(points, dx) {
  return `${points[0] + dx},${points[1]} ${points[2] + dx},${points[3]} ${points[4] + dx},${points[5]}`;
}

class BarChart1 extends React.Component {

  static get propTypes() {
    return {
      // data: PropTypes.array.isRequired,
      label: PropTypes.string.isRequired,
      // rectWidth: PropTypes.number,
      // change: PropTypes.bool,
      // chart: PropTypes.node,
      // connectFauxDOM: PropTypes.func.isRequired,

    };
  }

  static get defaultProps() {
    return {
      width: 400,
      height: 200,
      // rectWidth: null,
      // chart: 'loading',
      // change: false,
    };
  }
  constructor(props) {
    super(props);
    this.uid = createUniqueID(props);
  }

  componentWillMount() {
    console.log(`start render ${performance.now()}`);
    const {
      label,
    } = this.props;
    console.log(DataUtils.data);
    const bins = new GradBins(DataUtils.data, label);
    this.createChart(bins);
  }

  componentDidMount() {
    console.log(`end render ${performance.now()}`);
    this.forceUpdate();
  }

  componentWillUnmount() {
    this.svg.remove();
  }

  onClickOutHandler() {
    this.forceUpdate();
  }

  onDragHandler(e) {
    console.log(e);
    this.forceUpdate();
  }

  onDragStartHandler(e) {
    console.log(e);
    this.forceUpdate();
  }

  // get x position of each bar
  getRectX() {
    const arr = [];

    const bins = this.bins;
    let start = this.rectInterval;
    let length = 0;
    // console.log(this.bins);

    for (let i = 0; i < bins.container.length; i += 1) {
      length = bins.container[i].size() / bins.interval;
      start += (this.rectWidth * length);
      arr.push(start - ((this.rectWidth * length) / 2));
    }

    // console.log(arr);
    return arr;
  }

  // return transform of bars
  getBarTransform(d, i) {
    return `translate( ${this.rectX[i]} , ${this.y(d.value())} )`;
  }

  // return x of rect relative to bar
  getX(d) {
    return -(((this.rectWidth / 2) * d.size()) / this.bins.interval);
  }

  // return width of rect
  getWidth(d) {
    return (d.size() * this.rectWidth) / this.bins.interval;
  }

  // return height of rect
  getHeight(d) {
    return this.height - this.y(d.value());
  }

  // return transform of tags
  getTagTransform(d) {
    return `translate(0,${(this.height - this.y(d.value())) + this.tagPadding}), rotate(45)`;
  }

  // return the positions of triangles
  getTriPos() {
    const rect = this.selection.select('rect');

    const triangles = [];
    const triLength = this.triLength;
    let triHeight = this.triPadding;
    if (rect.attr('y')) {
      triHeight += parseInt(rect.attr('y'), 10);
    }

    const leftX = parseInt(rect.attr('x'), 10);
    const rightX = leftX + parseInt(rect.attr('width'), 10);

    const rectHeight = parseInt(rect.attr('height'), 10);

    if (triHeight > rectHeight) {
      triHeight = rectHeight;
    }

    triangles.push([]);
    triangles[0] = [leftX, triHeight, leftX, (triHeight - (2 * triLength)), (leftX - (1.73 * triLength)), (triHeight - triLength)];
    triangles.push([]);
    triangles[1] = [rightX, triHeight, rightX, (triHeight - (2 * triLength)), (rightX + (1.73 * triLength)), (triHeight - triLength)];
    triangles.push([]);
    triangles[2] = [leftX + 1, triHeight, leftX + 1, (triHeight - (2 * triLength)), (leftX + (1.73 * triLength) + 1), (triHeight - triLength)];
    triangles.push([]);
    triangles[3] = [rightX - 1, triHeight, rightX - 1, (triHeight - (2 * triLength)), (rightX - 1 - (1.73 * triLength)), (triHeight - triLength)];

    return triangles;
  }

  createChart(bins) {
    // this.root = this.props.connectFauxDOM('div', 'chart');
    this.root = createElement('div');
    // bins config
    this.bins = bins;

    // svg config
    this.margin = { top: 30, right: 30, bottom: 50, left: 50 };
    this.width = 350 - this.margin.left - this.margin.right;
    this.height = 200 - this.margin.top - this.margin.bottom;

    // rectangle config
    this.rectInterval = 20;
    if (this.rectWidth == null) {
      this.rectWidth = (this.width - (2 * this.rectInterval)) / this.bins.container.length;
    }


    // bar config
    this.rectX = this.getRectX();
    this.minBinHeight = 100;

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

    // selection config
    this.i = -1;


    // graphics

    // svg
    this.svg = d3.select(this.root)
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', this.width + this.margin.left + this.margin.right)
        .attr('height', this.height + this.margin.top + this.margin.bottom);

    // chart
    this.chart = this.svg.append('g')
        .attr('class', 'chart')
        .attr('transform',
              `translate( ${this.margin.left} , ${this.margin.top} )`);

    // bars
    this.bar = this.chart.selectAll('g')
    .data(this.bins.container)
      .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', this.getBarTransform.bind(this))
        .style('cursor', 'pointer');

    // rects
    this.rect = this.bar.append('rect')
      .attr('class', 'rect')
      .attr('x', this.getX.bind(this))
      .attr('width', this.getWidth.bind(this))
      .attr('height', this.getHeight.bind(this))
      .style('fill', '#3690c0')
      .style('stroke', 'black')
      .on('click', this.RectClick.bind(this))
      .on('mouseover', this.RectMouseOver)
      .on('mouseout', this.RectMouseOut);

    // x Axis
    this.xAxis = this.chart.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x));

    this.xAxis.selectAll('.tick').remove();

    // y Axis
    this.yAxis = this.chart.append('g')
      .call(d3.axisLeft(this.y))
      .append('text')
        .attr('transform', 'rotate(-90) translate(-30,0)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .style('fill', 'black')
        .text('# of people');

    // tag
    this.tag = this.bar.append('text')
      .text(d => `${parseInt(d.rangeMin(), 10)}  - ${parseInt(d.rangeMax(), 10)}`)
      .attr('transform', this.getTagTransform.bind(this))
      .style('text-anchor', 'middle')
      .style('fill', 'black')
      .style('font', '9px sans-serif')
      .on('click', this.RectClick.bind(this));
    this.svgOn();
  }

  update(bins) {
    this.bar.remove();
    this.yAxis.remove();
    this.bins = bins;
    if (this.rectWidth == null) {
      this.rectWidth = (this.width - (2 * this.rectInterval)) / this.bins.container.length;
    }

    // bar config
    this.rectX = this.getRectX();

    // y axis config
    this.y = d3.scaleLinear()
              .range([this.height, 0])
              .domain([0, this.bins.maxY]);

    this.bar = this.chart.selectAll('g')
    .data(this.bins.container)
      .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', this.getBarTransform.bind(this))
        .style('cursor', 'pointer');

    // rects
    this.rect = this.bar.append('rect')
      .attr('class', 'rect')
      .attr('x', this.getX.bind(this))
      .attr('width', this.getWidth.bind(this))
      .attr('height', this.getHeight.bind(this))
      .style('fill', '#3690c0')
      .style('stroke', 'black')
      .on('click', this.RectClick.bind(this))
      .on('mouseover', this.RectMouseOver)
      .on('mouseout', this.RectMouseOut);

    // y Axis
    this.yAxis = this.chart.append('g')
    .call(d3.axisLeft(this.y))
    .append('text')
      .attr('transform', 'rotate(-90) translate(-30,0)')
      .attr('y', 6)
      .attr('dy', '.71em')
      .style('text-anchor', 'end')
      .style('fill', 'black')
      .text('# of people');

    // tag
    this.tag = this.bar.append('text')
      .text(d => `${d.rangeMin()}  - ${d.rangeMax()}`)
      .attr('transform', this.getTagTransform.bind(this))
      .style('text-anchor', 'middle')
      .style('fill', 'black')
      .style('font', '9px sans-serif')
      .on('click', this.RectClick.bind(this));
  }
  svgOn() {
    this.svg.call(d3.drag()
      .on('start', this.ChartClick.bind(this))
      .on('drag', this.ChartDrag.bind(this))
      .on('end', this.ChartDrop.bind(this))
    );
  }

  svgDown() {
    this.svg.on('mousedown.drag', null);
  }

  createTip(d, i) {
    const x = this.rectX[i];
    let y = this.y(d.value()) - 20;
    if (this.height - this.y(d.value()) < this.minBinHeight) {
      y = this.height - this.minBinHeight - 20;
    }
    this.valueTip = this.chart.append('text')
      .attr('class', 'tip')
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .text(`${d.value()}`);
    this.rangeTip = this.chart.append('text')
      .attr('class', 'tip')
      .attr('x', x)
      .attr('dy', '1em')
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .text(`${parseInt(d.rangeMin(), 10)}  -  ${parseInt(d.rangeMax(), 10)}`);
  }

  clearTip() {
    this.chart.selectAll('.tip').remove();
  }

  moveTip(dx) {
    // console.log(dx);
    this.rangeTip.attr('dx', `${(dx / 2)}px`);
    this.valueTip.attr('dx', `${(dx / 2)}px`);
  }

  updateTip(dx, x1, x2, pos1, pos2) {
    this.moveTip(dx);

    this.valueTip.text(`${pos2 - pos1}`);
    this.rangeTip.text(`${parseInt(x1, 10)}  -  ${parseInt(x2, 10)}`);
  }

  createSelection(d, i) {
    const x = this.getX(d);
    const width = this.getWidth(d);
    const height = this.getHeight(d);
    const transform = this.getBarTransform(d, i);
    this.i = i;

    this.selection = this.chart.append('g')
      .attr('id', 'selection')
      .attr('transform', transform);

    const rect = this.selection.append('rect')
      .attr('class', 'rect')
      .attr('x', x)
      .attr('width', width)
      .attr('height', height)
      .style('fill', '#ff7f00')
      .attr('stroke', 'black')
      .style('opacity', '0.5')
      .on('click', this.SelectionClick.bind(this));

    if (height < this.minBinHeight) {
      this.selection.append('path')
        .attr('class', 'l')
        .attr('d', `m ${-width / 2} ${height} l 0 -100`)
        .attr('stroke', 'red')
        .attr('stroke-dasharray', '5,5');
      this.selection.append('path')
        .attr('class', 'r')
        .attr('d', `M ${(width / 2)} ${height} l 0 -100`)
        .attr('stroke', 'red')
        .attr('stroke-dasharray', '5,5');
      rect.attr('height', 100)
        .attr('y', -100 + height)
        .style('stroke', 'none')
        .style('opacity', '0.5');

      // tooltip.element.offset([-130+height,0])
    }

    // left-left triangle
    const tri0 = this.selection.append('polygon')
    .attr('class', 'draggable ll')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .style('display', 'true')
    .style('cursor', 'w-resize');


    // right-right triangle
    const tri1 = this.selection.append('polygon')
    .attr('class', 'draggable rr')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .style('display', 'true')
    .style('cursor', 'e-resize');

    // left-right triangle
    const tri2 = this.selection.append('polygon')
    .attr('class', 'draggable lr')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .style('display', 'true')
    .style('cursor', 'e-resize');

    // right-left triangle
    const tri3 = this.selection.append('polygon')
    .attr('class', 'draggable rl')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .style('display', 'true')
    .style('cursor', 'w-resize');

    const triangles = this.getTriPos();

    tri0.attr('points', `${triangles[0][0]},${triangles[0][1]} ${triangles[0][2]},${triangles[0][3]} ${triangles[0][4]},${triangles[0][5]}`);
    tri1.attr('points', `${triangles[1][0]},${triangles[1][1]} ${triangles[1][2]},${triangles[1][3]} ${triangles[1][4]},${triangles[1][5]}`);
    tri2.attr('points', `${triangles[2][0]},${triangles[2][1]} ${triangles[2][2]},${triangles[2][3]} ${triangles[2][4]},${triangles[2][5]}`);
    tri3.attr('points', `${triangles[3][0]},${triangles[3][1]} ${triangles[3][2]},${triangles[3][3]} ${triangles[3][4]},${triangles[3][5]}`);

    this.triangles = triangles;

    if (this.i !== 0) {
      // console.log(tri0);
      tri0.call(d3.drag()
        .on('start', this.TriangleLLClick.bind(this))
        .on('drag', this.TriangleLLDrag.bind(this))
        .on('end', this.TriangleLLDrop.bind(this))
      );
    } else {
      this.chart.select('#selection .ll').remove();
    }

    if (this.i !== this.bins.container.length - 1) {
      tri1.call(d3.drag()
      .on('start', this.TriangleRRClick.bind(this))
      .on('drag', this.TriangleRRDrag.bind(this))
      .on('end', this.TriangleRRDrop.bind(this))
      );
    } else {
      // tri.element[1].style('cursor', 'not-allowed')
      this.chart.select('#selection .rr').remove();
    }

    tri2.call(d3.drag()
      .on('start', this.TriangleLRClick.bind(this))
      .on('drag', this.TriangleLRDrag.bind(this))
      .on('end', this.TriangleLRDrop.bind(this))
    );
    tri3.call(d3.drag()
      .on('start', this.TriangleRLClick.bind(this))
      .on('drag', this.TriangleRLDrag.bind(this))
      .on('end', this.TriangleRLDrop.bind(this))
    );
  }

  SelectionClick() {
    this.clearTip();
    this.selection.remove();
    this.i = -1;
    this.svgOn();
    // this.chart.tip.hide(d)
    this.forceUpdate();
  }

  RectClick(d, i) {
    const selected = this.chart.select('#selection');

    if (selected.empty()) {
      this.createSelection(d, i);
      this.svgDown();
      // show tooltip
      this.createTip(d, i);
    } else if (this.i !== i) {
      this.clearTip();
      selected.remove();
      this.createSelection(d, i);
      // show tooltip
      this.createTip(d, i);
      this.svgDown();
    } else {
      this.clearTip();
      selected.remove();
      this.svgOn();
    }

    this.forceUpdate();
  }


  RectMouseOver() {
    d3.select(this).style('opacity', '0.8');
  }

  RectMouseOut() {
    d3.select(this).style('opacity', '1');
    // pointer.forceUpdate();
    // console.log(pointer);
  }

  ChartClick() {
    // console.log(this.chart.node());
    // if (!d3.event.sourceEvent.defaultPrevented) {
    this.chart.select('#selection').remove();
    this.chart.selectAll('.tip').remove();

    this.currentX = d3.event.sourceEvent.offsetX;
    this.currentY = d3.event.sourceEvent.offsetY;
    this.posX = d3.event.sourceEvent.x;
    this.posY = d3.event.sourceEvent.y;
    this.dragselect = this.svg.append('rect')
      .attr('x', this.currentX)
      .attr('y', this.currentY)
      .style('opacity', 0.5)
      .style('fill', '#ff7f00');
    // }
  }

  ChartDrag() {
    // if (!d3.event.sourceEvent.defaultPrevented) {
    console.log(d3.event.sourceEvent.x, d3.event.sourceEvent.y);
    if (d3.event.sourceEvent.x - this.posX > 0) {
      this.dragselect.attr('width', d3.event.sourceEvent.x - this.posX);
    } else {
      this.dragselect
        .attr('x', this.currentX - (this.posX - d3.event.sourceEvent.x))
        .attr('width', this.posX - d3.event.sourceEvent.x);
    }
    if (d3.event.sourceEvent.y - this.posY > 0) {
      this.dragselect.attr('height', d3.event.sourceEvent.y - this.posY);
    } else {
      this.dragselect
        .attr('y', this.currentY - (this.posY - d3.event.sourceEvent.y))
        .attr('height', this.posY - d3.event.sourceEvent.y);
    }
    this.forceUpdate();
    // }
  }

  ChartDrop() {
    // if (!d3.event.sourceEvent.defaultPrevented) {
    const x1 = parseFloat(this.dragselect.attr('x')) - this.margin.left;
    const x2 = x1 + parseFloat(this.dragselect.attr('width'));
    const minX = this.rectX[0];
    const maxX = this.rectX[this.rectX.length - 1];

    const y1 = parseFloat(this.dragselect.attr('y')) - this.margin.top;
    const y2 = y1 + parseFloat(this.dragselect.attr('height'));
    const maxY = this.height;

    console.log(x1, x2, minX, maxX);
    if (x1 < minX && x2 > maxX && y1 < maxY && y2 > maxY) {
      console.log('hey');

      this.chart.select('#selection').remove();
      this.chart.selectAll('.tip').remove();

      const x = this.rectInterval / 2;
      const width = this.width - this.rectInterval;
      const height = this.height;

      this.selection = this.chart.append('g')
        .attr('id', 'selection');

      this.selection.append('rect')
        .attr('class', 'rect')
        .attr('x', x)
        .attr('y', -10)
        .attr('width', width)
        .attr('height', height + 10)
        .style('fill', '#ff7f00')
        .attr('stroke', 'black')
        .style('opacity', '0.5')
        .on('click', this.SelectionClick.bind(this));

      this.tip = this.selection.append('text')
        .attr('class', 'tip')
        .attr('x', this.width / 2)
        .attr('dy', -15)
        .style('text-anchor', 'middle')
        .style('fill', 'black')
        .text(`# of Bins: ${this.bins.container.length}`)
        .attr('stroke', 'black');

      const tri1 = this.selection.append('polygon')
        .attr('class', 'draggable rr')
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .style('display', 'true')
        .style('cursor', 'e-resize');
      const tri3 = this.selection.append('polygon')
        .attr('class', 'draggable rl')
        .attr('fill', 'white')
        .attr('stroke', 'black')
        .style('display', 'true')
        .style('cursor', 'w-resize');

      const triangles = this.getTriPos();

      tri1.attr('points', `${triangles[1][0]},${triangles[1][1]} ${triangles[1][2]},${triangles[1][3]} ${triangles[1][4]},${triangles[1][5]}`);
      tri3.attr('points', `${triangles[3][0]},${triangles[3][1]} ${triangles[3][2]},${triangles[3][3]} ${triangles[3][4]},${triangles[3][5]}`);

      this.triangles = triangles;

      tri1.call(d3.drag()
        .on('start', this.DSTriangleClick.bind(this))
        .on('drag', this.DSTriangleRRDrag.bind(this))
        .on('end', this.DSTriangleDrop.bind(this))
      );
      tri3.call(d3.drag()
        .on('start', this.DSTriangleClick.bind(this))
        .on('drag', this.DSTriangleRLDrag.bind(this))
        .on('end', this.DSTriangleDrop.bind(this))
      );
      this.svgDown();
    }


    this.dragselect.remove();
    this.forceUpdate();
    // }
  }

  // LL
  TriangleLLClick() {
    console.log(d3.event);
    // d3.event.sourceEvent.preventDefault();
    const d = this.bins.container[this.i];
    this.currentX = d3.event.sourceEvent.x;
    this.oldWidth = this.getWidth(d);
    this.rectx = -(this.oldWidth / 2);
    this.sub = this.bins.addSub(d);
    d3.event.sourceEvent.stopPropagation();
    d3.event.sourceEvent.stopImmediatePropagation();
  }

  // RR
  TriangleRRClick() {
    // d3.event.sourceEvent.preventDefault();
    const d = this.bins.container[this.i];
    this.currentX = d3.event.sourceEvent.x;
    this.oldWidth = this.getWidth(d);
    this.rectx = -(this.oldWidth / 2);
    this.sub = this.bins.addSub(d);
    this.sub.pre = this.sub.next.pre;
  }
  // LR
  TriangleLRClick() {
    // d3.event.sourceEvent.preventDefault();
    const d = this.bins.container[this.i];
    this.currentX = d3.event.sourceEvent.x;
    this.oldWidth = this.getWidth(d);
    this.rectx = -(this.oldWidth / 2);
    this.sub = this.bins.addSub(d);
    this.sub.pre = d;
    this.sub.next = d.next;
  }
  // RL
  TriangleRLClick() {
    // d3.event.sourceEvent.preventDefault();
    const d = this.bins.container[this.i];
    this.currentX = d3.event.sourceEvent.x;
    this.oldWidth = this.getWidth(d);
    this.rectx = -(this.oldWidth / 2);
    this.sub = this.bins.addSub(d);
    this.sub.pre = d;
    this.sub.next = d.next;
  }

  DSTriangleClick() {
    this.currentX = d3.event.sourceEvent.x;
    this.oldWidth = parseFloat(this.selection.select('rect').attr('width'));
    this.rectx = parseFloat(this.selection.select('rect').attr('x'));
    this.num = this.bins.container.length;
  }


  // LL
  TriangleLLDrag() {
    // d3.event.sourceEvent.preventDefault();
    console.log('a');
    // set up
    const rect = this.chart.select('#selection rect');
    const leftTri = this.chart.select('#selection .ll');
    const rightTri = this.chart.select('#selection .lr');
    const line = this.chart.select('#selection .l');

    // calculate mouse move
    let dx = d3.event.sourceEvent.x - this.currentX;
    if (dx > 0) {
      dx = 0;
    }

    const newWidth = this.oldWidth - dx;
    // change selection

    rect.attr('width', newWidth)
      .attr('x', this.rectx + dx);
    leftTri.attr('points',
      generatePoints(this.triangles[0], dx));
    rightTri.attr('points',
      generatePoints(this.triangles[2], dx));
    line.attr('transform', `translate(${dx},0)`);

    // change tooltip
    const x = this.bins.container[this.i];
    const x1 = this.calcLL(rect);
    const x2 = x.rangeMax();
    const pos1 = this.sub.i;
    const pos2 = x.next == null ? this.bins.size() : x.next.i;
    this.updateTip(dx, x1, x2, pos1, pos2);

    this.forceUpdate();
    // d3.event.sourceEvent.preventDefault();
  }

  // RR
  TriangleRRDrag() {
    // d3.event.sourceEvent.preventDefault();
    // set up
    const rect = this.chart.select('#selection rect');
    const leftTri = this.chart.select('#selection .rl');
    const rightTri = this.chart.select('#selection .rr');
    const line = this.chart.select('#selection .r');

    // calculate mouse move
    let dx = d3.event.sourceEvent.x - this.currentX;
    if (dx < 0) {
      dx = 0;
    }
    const newWidth = this.oldWidth + dx;

    // change selection

    rect.attr('x', this.rectx)
      .attr('width', newWidth);
    leftTri.attr('points',
      generatePoints(this.triangles[1], dx));
    rightTri.attr('points',
      generatePoints(this.triangles[3], dx));
    line.attr('transform', `translate(${dx},0)`);

    // change tooltip
    const x = this.bins.container[this.i];
    const x1 = x.rangeMin();
    const x2 = this.calcRR(rect);
    const pos1 = x.i;
    const pos2 = this.sub.i;
    this.updateTip(dx, x1, x2, pos1, pos2);

    this.forceUpdate();
  }

  // LR
  TriangleLRDrag() {
    // d3.event.sourceEvent.preventDefault();
    // set up
    const rect = this.chart.select('#selection rect');
    const leftTri = this.chart.select('#selection .ll');
    const rightTri = this.chart.select('#selection .lr');
    const line = this.chart.select('#selection .l');

    // calculate mouse move
    let dx = d3.event.sourceEvent.x - this.currentX;
    if (dx < 0) {
      dx = 0;
    }
    if (dx > this.oldWidth - 1) {
      dx = this.oldWidth - 1;
    }
    const newWidth = this.oldWidth - dx;

    // change selection
    rect.attr('width', newWidth)
      .attr('x', this.rectx + dx);

    leftTri.attr('points',
      generatePoints(this.triangles[0], dx));
    rightTri.attr('points',
      generatePoints(this.triangles[2], dx));
    line.attr('transform', `translate(${dx},0)`);

    // change tooltip
    const x = this.bins.container[this.i];
    const x1 = this.calcLR(rect);
    const x2 = x.rangeMax();
    const pos1 = this.sub.i;
    const pos2 = x.next == null ? this.bins.data.length : x.next.i;
    this.updateTip(dx, x1, x2, pos1, pos2);

    this.forceUpdate();
  }

  // RL
  TriangleRLDrag() {
    // d3.event.sourceEvent.preventDefault();
    // set up
    const rect = this.chart.select('#selection rect');
    const leftTri = this.chart.select('#selection .rl');
    const rightTri = this.chart.select('#selection .rr');
    const line = this.chart.select('#selection .r');

    // calculate mouse move
    let dx = d3.event.sourceEvent.x - this.currentX;
    if (dx > 0) {
      dx = 0;
    }
    if (dx < -this.oldWidth + 1) {
      dx = -this.oldWidth + 1;
    }

    // change selection
    const newWidth = this.oldWidth + dx;
    rect.attr('x', this.rectx)
      .attr('width', newWidth);

    leftTri.attr('points',
      generatePoints(this.triangles[3], dx));

    rightTri.attr('points',
      generatePoints(this.triangles[1], dx));
    line.attr('transform', `translate(${dx},0)`);

    // change tooltip
    const x = this.bins.container[this.i];
    const x1 = x.rangeMin();
    const x2 = this.calcRL(rect);
    const pos1 = x.i;
    const pos2 = this.sub.i;
    this.updateTip(dx, x1, x2, pos1, pos2);

    this.forceUpdate();
  }

  DSTriangleRRDrag() {
    // set up
    const rect = this.chart.select('#selection rect');
    const leftTri = this.chart.select('#selection .rl');
    const rightTri = this.chart.select('#selection .rr');
    // var tip = d3.select('#selection .tip')

    // calculate mouse move
    let dx = d3.event.sourceEvent.x - this.currentX;
    if (dx < 0) {
      dx = 0;
    }
    const newWidth = this.oldWidth + dx;
    console.log(this.rectx);
    // change selection

    rect.attr('x', this.rectx)
      .attr('width', newWidth);
    leftTri.attr('points',
      generatePoints(this.triangles[1], dx));
    rightTri.attr('points',
      generatePoints(this.triangles[3], dx));

    this.num = this.bins.container.length;
    const add = parseInt((dx / this.rectWidth) * 2, 10);
    this.num = add >= 10 ? this.num + 10 : this.num + add;
    // if (add >= 1) {
    //   this.DSTriangleDrop();
    // } else {
    this.tip.text(`# of Bins: ${this.num}`);
    this.forceUpdate();
    // }
  }

  DSTriangleRLDrag() {
    const rect = this.chart.select('#selection rect');
    const leftTri = this.chart.select('#selection .rl');
    const rightTri = this.chart.select('#selection .rr');

    let dx = d3.event.sourceEvent.x - this.currentX;
    if (dx > 0) {
      dx = 0;
    }
    if (dx < -this.oldWidth + 1) {
      dx = -this.oldWidth + 1;
    }
    const newWidth = this.oldWidth + dx;
    rect.attr('x', this.rectx)
      .attr('width', newWidth);

    leftTri.attr('points',
      generatePoints(this.triangles[1], dx));

    rightTri.attr('points',
      generatePoints(this.triangles[3], dx));

    this.num = this.bins.container.length;
    const add = parseInt((dx / this.rectWidth) * 2, 10);
    this.num = this.num + add > 0 ? this.num + add : 1;
    // if (add <= -1) {
    //   this.DSTriangleDrop();
    // } else {
    this.tip.text(`# of Bins: ${this.num}`);
    this.forceUpdate();
    // }
  }


  // LL
  calcLL(rect) {
    let d = this.bins.container[this.i];
    let dx = this.rectx - parseFloat(rect.attr('x'));


    // calculate number
    let x = d.rangeMin();
    while (d.pre != null) {
      d = d.pre;

      // in rectangle
      const width = (d.size() / this.bins.interval) * this.rectWidth;
      const ratio = dx / width;
      dx -= width;
      if (ratio < 1) {
        x = ((1 - ratio) * d.size()) + d.rangeMin();
        break;
      }
      x = d.rangeMin();
    }

    x = parseInt(x, 10);
    // record change
    this.bins.combineLeft(this.sub, x);

    return x;
  }

  // RR
  calcRR(rect) {
    let d = this.bins.container[this.i];
    let dx = parseFloat(rect.attr('width')) - this.oldWidth;

    // console.log(dx)
    // calculate number
    let x = d.rangeMax();
    while (d.next != null) {
      d = d.next;

      // in rectangle
      const width = (d.size() / this.bins.interval) * this.rectWidth;
      // console.log(width)
      const ratio = dx / width;
      dx -= width;
      if (ratio < 1) {
        x = (ratio * d.size()) + d.rangeMin();
        break;
      }
      x = d.rangeMax();
    }

    x = parseInt(x, 10);

    // record change
    this.bins.combineRight(this.sub, x);
    return x;
  }

  // LR
  calcLR(rect) {
    const d = this.bins.container[this.i];

    const dx = (parseInt(rect.attr('x'), 10) - this.rectx) + 1;
    const pos = parseInt(((dx / this.oldWidth) * this.bins.container[this.i].size()), 10) + d.rangeMin();

    this.bins.splitLeft(this.sub, pos);
    return pos;
  }

  // RL
  calcRL(rect) {
    const d = this.bins.container[this.i];

    const dx = (this.oldWidth - parseFloat(rect.attr('width'))) + 1;
    const pos = d.rangeMax() - parseInt((dx / this.oldWidth) * this.bins.container[this.i].size(), 10);
    // console.log(pos)

    this.bins.splitRight(this.sub, pos);
    return pos;
  }

  // LL
  TriangleLLDrop() {
    // d3.event.sourceEvent.preventDefault();
    this.bins.updateLL(this.sub);
    this.componentWillUnmount();
    this.createChart(this.bins);
    this.forceUpdate();
  }
  // RR
  TriangleRRDrop() {
    // d3.event.sourceEvent.preventDefault();
    this.bins.updateRR(this.sub);
    this.componentWillUnmount();
    this.createChart(this.bins);
    this.forceUpdate();
  }
  // LR
  TriangleLRDrop() {
    // d3.event.sourceEvent.preventDefault();
    this.bins.updateLR(this.sub);
    this.componentWillUnmount();
    this.createChart(this.bins);
    this.forceUpdate();
  }
  // RL
  TriangleRLDrop() {
    // d3.event.sourceEvent.preventDefault();
    this.bins.updateRL(this.sub);
    this.componentWillUnmount();
    this.createChart(this.bins);
    this.forceUpdate();
  }

  DSTriangleDrop() {
    this.bins.createArrange(this.num);
    this.componentWillUnmount();
    const range = this.bins.getMaxX() - this.bins.getMinX();
    this.rectWidth = (this.width - (2 * this.rectInterval)) / parseInt(range / this.bins.interval, 10);
    // main(this.chart.bins,rectWidth)
    this.createChart(this.bins);
    this.forceUpdate();
  }

  mouseOverHandler() {
    this.forceUpdate();
  }

  mouseOutHandler() {
    this.forceUpdate();
  }
  mouseMoveHandler() {
    this.forceUpdate();
  }

  render() {
    // console.log(ReactFauxDOM.mixins.core.connectFauxDOM);
    const uid = this.uid;
    const className = `bar-chart-${uid}`;

    const html = this.root.toReact();

    return (
      <div
        // onMouseMove={this.mouseMoveHandler.bind(this)}
        onMouseOver={this.mouseOverHandler.bind(this)}
        onMouseLeave={this.mouseOutHandler.bind(this)}
        // onDrag={this.onDragHandler.bind(this)}
        // onDragStart={this.onDragStartHandler.bind(this)}
        className={className}
        // onClick={this.onClickHandler.bind(this)}
        // role='button'
      >
        {/* {this.props.chart} */}
        {html}
      </div>
    );
  }
}

export default BarChart1;
