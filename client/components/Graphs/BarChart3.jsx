/* eslint-disable */
import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { createElement } from 'react-faux-dom';
import {
  createUniqueID,
} from '../../utils/graphUtils';
import DataUtils from '../../utils/dataUtils';
import {
  gradBins as GradBins,
} from './BarChart/model/gradBins';

export default class BarChart3 extends React.Component {

  static get propTypes() {
    return {
      label: PropTypes.string.isRequired,
    };
  }

  static get defaultProps() {
    return {
      width: 400,
      height: 200,
    };
  }

  constructor(props) {
    super(props);
    this.uid = createUniqueID(props);
  }

  componentWillMount() {
    const {
      label,
    } = this.props;
    this.bins = new GradBins(DataUtils.data, label);

    // calculation
    // svg
    const marginInit = { top: 30, right: 30, bottom: 50, left: 50 };
    const widthInit = 350 - marginInit.left - marginInit.right;
    const heightInit = 200 - marginInit.top - marginInit.bottom;

    // rect
    const rectIntervalInit = 20;
    const rectStandardWidthInit = (widthInit - (2 * rectIntervalInit)) / this.bins.container.length;
    const rectWidthInit = [];
    for (let i = 0; i < this.bins.container.length; i += 1) {
      rectWidthInit[i] = rectStandardWidthInit;
    }

    // bar
    const barXInit = [];
    let start = rectIntervalInit;
    let length = 0;
    for (let i = 0; i < this.bins.container.length; i += 1) {
      length = this.bins.container[i].size() / this.bins.interval;
      start += (rectStandardWidthInit * length);
      barXInit.push(start - ((rectStandardWidthInit * length) / 2));
    }

    // axis
    const xInit = d3.scaleLinear()
              .range([0, widthInit])
              .domain([0, this.bins.maxX]);
    const yInit = d3.scaleLinear()
              .range([heightInit, 0])
              .domain([0, this.bins.maxY]);

    // // selection config
    // this.i = -1;
    const config = {
      // svg
      margin: marginInit,
      width: widthInit,
      height: heightInit,

      // rect
      rectInterval: rectIntervalInit,
      rectStandardWidth: rectStandardWidthInit,
      rectWidth: rectWidthInit,

      // bar
      barX: barXInit,

      // axis
      x: xInit,
      y: yInit,

      // adapat rect
      adaptHeight: 100,
      showAdapt: false,

      // triangle
      triLength: 5,
      triPadding: 40,

      // tag
      tagPadding: 20,

      // tip
      showTip: false,
      tipI: 0,
    };
    this.setState(config);
  }

  renderChart() {
    this.root = createElement('div');

    // svg
    this.svg = d3.select(this.root)
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', this.state.width + this.state.margin.left + this.state.margin.right)
        .attr('height', this.state.height + this.state.margin.top + this.state.margin.bottom);

    // chart
    this.chart = this.svg.append('g')
        .attr('class', 'chart')
        .attr('transform',
              `translate( ${this.state.margin.left} , ${this.state.margin.top} )`);

    // bars
    this.bar = this.chart.selectAll('g')
    .data(this.bins.container)
      .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', (d, i) => `translate( ${this.state.barX[i]} , ${this.state.y(d.value())} )`)
        .style('cursor', 'pointer');

    // rects
    this.rect = this.bar.append('rect')
      .attr('class', 'rect')
      .attr('x', (d, i) => -(((this.state.rectWidth[i] / 2) * d.size()) / this.bins.interval))
      .attr('width', (d, i) => (d.size() * this.state.rectWidth[i]) / this.bins.interval)
      .attr('height', d => (this.state.height - this.state.y(d.value())))
      .style('fill', '#3690c0')
      .style('stroke', 'black');
      // .on('click', this.RectClick.bind(this))
      // .on('mouseover', this.RectMouseOver)
      // .on('mouseout', this.RectMouseOut);

    // x Axis
    this.xAxis = this.chart.append('g')
      .attr('transform', `translate(0,${this.state.height})`)
      .call(d3.axisBottom(this.state.x));

    this.xAxis.selectAll('.tick').remove();

    // y Axis
    this.yAxis = this.chart.append('g')
      .call(d3.axisLeft(this.state.y))
      .append('text')
        .attr('transform', 'rotate(-90) translate(-30,0)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .style('fill', 'black');

    // tag
    this.tag = this.bar.append('text')
      .text(d => `${parseInt(d.rangeMin(), 10)}  - ${parseInt(d.rangeMax(), 10)}`)
      .attr('transform', d => `translate(0,${(this.state.height - this.state.y(d.value())) + this.state.tagPadding}), rotate(45)`)
      .style('text-anchor', 'middle')
      .style('fill', 'black')
      .style('font', '9px sans-serif');
      // .on('click', this.RectClick.bind(this));


  // createTip(d, i) {
  //   const x = this.rectX[i];
  //   let y = this.y(d.value()) - 20;
  //   if (this.height - this.y(d.value()) < this.minBinHeight) {
  //     y = this.height - this.minBinHeight - 20;
  //   }
    const tipD = this.bins.container[this.state.tipI];
    const tipX = this.state.barX[this.state.tipI];
    const tipY = this.state.showAdapt ? this.state.height - this.state.adaptHeight - 20 : this.state.y(tipD.value()) - 20;
    this.valueTip = this.chart.append('text')
      .attr('class', 'tip')
      .style('display', this.state.showTip ? 'block' : 'none')
      .attr('x', tipX)
      .attr('y', tipY)
      .attr('text-anchor', 'middle')
      .text(`${tipD.value()}`);
    this.rangeTip = this.chart.append('text')
      .attr('class', 'tip')
      .style('display', this.state.showTip ? 'block' : 'none')
      .attr('x', tipX)
      .attr('dy', '1em')
      .attr('y', tipY)
      .attr('text-anchor', 'middle')
      .text(`${parseInt(tipD.rangeMin(), 10)}  -  ${parseInt(tipD.rangeMax(), 10)}`);
  // }

  // clearTip() {
  //   this.chart.selectAll('.tip').remove();
  // }

  // moveTip(dx) {
  //   // console.log(dx);
  //   this.rangeTip.attr('dx', `${(dx / 2)}px`);
  //   this.valueTip.attr('dx', `${(dx / 2)}px`);
  // }

  // updateTip(dx, x1, x2, pos1, pos2) {
  //   this.moveTip(dx);

  //   this.valueTip.text(`${pos2 - pos1}`);
  //   this.rangeTip.text(`${parseInt(x1, 10)}  -  ${parseInt(x2, 10)}`);
  // }

  // createSelection(d, i) {
  //   const x = this.getX(d);
  //   const width = this.getWidth(d);
  //   const height = this.getHeight(d);
  //   const transform = this.getBarTransform(d, i);
  //   this.i = i;

  //   this.selection = this.chart.append('g')
  //     .attr('id', 'selection')
  //     .attr('transform', transform);

  //   const rect = this.selection.append('rect')
  //     .attr('class', 'rect')
  //     .attr('x', x)
  //     .attr('width', width)
  //     .attr('height', height)
  //     .style('fill', '#ff7f00')
  //     .attr('stroke', 'black')
  //     .style('opacity', '0.5')
  //     .on('click', this.SelectionClick.bind(this));

  //   if (height < this.minBinHeight) {
  //     this.selection.append('path')
  //       .attr('class', 'l')
  //       .attr('d', `m ${-width / 2} ${height} l 0 -100`)
  //       .attr('stroke', 'red')
  //       .attr('stroke-dasharray', '5,5');
  //     this.selection.append('path')
  //       .attr('class', 'r')
  //       .attr('d', `M ${(width / 2)} ${height} l 0 -100`)
  //       .attr('stroke', 'red')
  //       .attr('stroke-dasharray', '5,5');
  //     rect.attr('height', 100)
  //       .attr('y', -100 + height)
  //       .style('stroke', 'none')
  //       .style('opacity', '0.5');

  //     // tooltip.element.offset([-130+height,0])
  //   }

  //   // left-left triangle
  //   const tri0 = this.selection.append('polygon')
  //   .attr('class', 'draggable ll')
  //   .attr('fill', 'white')
  //   .attr('stroke', 'black')
  //   .style('display', 'true')
  //   .style('cursor', 'w-resize');

    return (
      <div>{this.root.toReact()}</div>
    );
  }

  render() {
    const uid = this.uid;
    const className = `bar-chart-${uid}`;

    return (
      <div className={className}>
        {this.renderChart()}
      </div>
    );
  }
}
