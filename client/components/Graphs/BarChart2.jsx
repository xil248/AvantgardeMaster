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

class BarChart2 extends React.Component {
  static get propTypes() {
    return {
      data: PropTypes.array.isRequired,
      // label: PropTypes.string.isRequired,
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
    // const faux = this.props.connectFauxDOM('div', 'chart');
    const {
      data,
    } = this.props;
    this.createChart(data);
  }

  // get x position of each bar
  getRectX() {
    const arr = [];

    // let start = this.rectInterval;
    this.length = this.width / this.bins.length / 2;
    let start = -this.length;
    console.log(this.bins.length);

    for (let i = 0; i < this.bins.length; i += 1) {
      start += this.length * 2;
      arr.push(start);
    }

    console.log(arr);
    return arr;
  }

  getBarTransform(d, i) {
    return `translate( ${this.rectX[i]} , ${this.height} )`;
  }
  // getX(d) {
  //   return -(((this.rectWidth / 2) * d.size()) / this.bins.interval);
  // }

  // return transform of tags
  getTagTransform() {
    return `translate(0,${this.tagPadding}), rotate(45)`;
  }

  // return y of rect
  getY(d, i, e) {
    const prej = parseInt(e[0].parentNode.props.className, 10);
    let sum = 0;
    for (let k = 0; k <= i; k += 1) {
      sum -= this.getHeight(this.bins[prej][k]);
    }
    return sum;
  }
  // return width of rect
  getWidth(d) {
    return (d.size() * this.rectWidth) / this.bins.interval;
  }

  // get the text of rect
  getTagText(d, i, e) {
    const prej = parseInt(e[0].parentNode.props.className, 10);
    if (this.bins[prej].length > 1) {
      return `${d.x} & ...`;
    }
    return `${d.x}`;
  }
  // return height of rect
  getHeight(d) {
    return this.height - this.y(d.y);
  }

  moveTip(dx) {
    // console.log(dx);
    // this.rangeTip.attr('dx', `${(dx / 2)}px`);
    this.valueTip.attr('dx', `${(dx)}px`);
    this.rangeTip.attr('dx', `${(dx)}px`);
  }

  createTip(d, i) {
    const x = this.rectX[i];

    let y = 100;
    let sum = 0;
    let text = '';
    for (let k = 0; k < this.bins[i].length; k += 1) {
      y -= this.getHeight(this.bins[i][k]);
      sum += this.bins[i][k].y;
      text += `${this.bins[i][k].x}`;
      if (k !== this.bins[i].length - 1) {
        text += ' & ';
      }
    }

    this.valueTip = this.chart.append('text')
      .attr('class', 'tip')
      .attr('x', x)
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .text(`${sum}`);
    this.rangeTip = this.chart.append('text')
      .attr('class', 'tip')
      .attr('x', x)
      .attr('dy', '1em')
      .attr('y', y)
      .attr('text-anchor', 'middle')
      .text(text);
  }

  createChart(data) {
    // this.root = this.props.connectFauxDOM('div', 'chart');
    this.root = createElement('div');
    // bins config
    if (this.bins == null) {
      this.bins = [];
      data.forEach((e) => {
        this.bins.push([e]);
      });

      this.where = [];
      this.which = [];
      for (let i = 0; i < data.length; i += 1) {
        this.which.push(i);
        this.where.push([i]);
      }
    }

    // svg config
    this.margin = { top: 30, right: 30, bottom: 50, left: 50 };
    this.width = 350 - this.margin.left - this.margin.right;
    this.height = 200 - this.margin.top - this.margin.bottom;


    // bar config
    this.rectX = this.getRectX();
    this.rectY = [];

    // tag config
    this.tagPadding = 10;

    this.maxY = 0;
    this.bins.forEach((e) => {
      let sum = 0;
      e.forEach((e1) => {
        sum += e1.y;
      });
      if (sum > this.maxY) {
        this.maxY = sum;
      }
    });

    // axis config
    this.x = d3.scaleLinear()
              .range([0, this.width])
              .domain([0, this.bins.length]);
    this.y = d3.scaleLinear()
              .range([this.height, 0])
              .domain([0, this.maxY]);

    // // selection config
    // // this.i = -1;


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
    .data(this.bins)
      .enter().append('g')
        .attr('class', (d, i) => { return `${i} bar`; })
        .attr('transform', this.getBarTransform.bind(this))
        .style('cursor', 'move')
        .on('mouseover', this.BarMouseOver.bind(this))
        .on('mouseout', this.BarMouseOut.bind(this));

    // rects
    this.rect = this.bar.selectAll('g')
      .data((d) => { return d; })
      .enter()
      .append('rect')
      .attr('class', (d, i) => { return `rect${i}`; })
      .attr('x', -this.length / 2)
      .attr('y', this.getY.bind(this))
      .attr('width', this.length)
      .attr('height', this.getHeight.bind(this))
      .style('fill', '#3690c0')
      .style('stroke', 'black')
      // .on('click', this.RectClick.bind(this))
      // .on('mouseout', this.RectMouseOut);
      .call(d3.drag()
        .on('start', this.RectClick.bind(this))
        .on('drag', this.RectDrag.bind(this))
        .on('end', this.RectDrop.bind(this))
      );

    // // x Axis
    this.xAxis = this.chart.append('g')
      .attr('transform', `translate(0,${this.height})`)
      .call(d3.axisBottom(this.x));

    this.xAxis.selectAll('.tick').remove();

    // // y Axis
    this.yAxis = this.chart.append('g')
      .call(d3.axisLeft(this.y));
      // .append('text')
      //   .attr('transform', 'rotate(-90) translate(-30,0)')
      //   .attr('y', 6)
      //   .attr('dy', '.71em')
      //   .style('text-anchor', 'end')
      //   .style('fill', 'black')
      //   .text('# of people');

    // tag
    this.tag = this.bar.selectAll('g')
      .data((d) => { return d; })
      .enter()
      .append('text')
      .text(this.getTagText.bind(this))
      .attr('transform', this.getTagTransform.bind(this))
      .style('text-anchor', 'left')
      .style('fill', 'black')
      .style('font', '8px sans-serif')
      .style('display', (d, i) => { return i > 0 ? 'none' : 'block'; })
      .call(d3.drag()
        .on('start', this.RectClick.bind(this))
        .on('drag', this.RectDrag.bind(this))
        .on('end', this.RectDrop.bind(this))
      );
      // .on('click', this.RectClick.bind(this));
    // this.svgOn();
  }

  updatehart() {
    // find max
    this.maxY = 0;
    this.where.forEach((a) => {
      let sum = 0;
      a.forEach((e) => {
        sum += this.bins[e].y;
      });
      if (sum > this.maxY) {
        this.maxY = sum;
      }

      if (sum > this.maxY) {
        this.maxY = sum;
      }
    });

    // y axis
    this.y = d3.scaleLinear()
    .range([this.height, 0])
    .domain([0, this.maxY]);

    this.yAxis.call(d3.axisLeft(this.y));

    // bars
    this.bar.attr('transform', this.getBarTransform.bind(this));

    // rects
    this.where.forEach((k) => {
      this.drawColumn(k);
    });

    // tag
    this.tag.attr('transform', (d) => {
      return `translate(0 ,${(this.height - this.y(d.y)) + this.tagPadding}), rotate(45)`;
    });
  }

  BarMouseOver(d, i) {
    this.chart.select(`.${i}`).selectAll('rect')
      .style('fill', '#95745b');
    this.createTip(d, i);
    this.forceUpdate();
  }

  BarMouseOut(d, i) {
    this.chart.select(`.${i}`).selectAll('rect')
      .style('fill', '#3690c0');
    this.valueTip.remove();
    this.rangeTip.remove();

    this.forceUpdate();
  }
  // RL
  RectClick(d, i, e) {
    // d3.event.sourceEvent.preventDefault();
    this.currentX = d3.event.sourceEvent.x;
    this.currentY = d3.event.sourceEvent.y;
    if (e[i].nodeName === 'text') {
      this.dragRect = d3.select(e[i].parentNode).select(`.rect${i}`);
    } else {
      this.dragRect = d3.select(e[i]);
    }
    console.log(e);
    this.rectx = parseFloat(this.dragRect.attr('x'));
    this.recty = isNaN(this.dragRect.attr('y')) ? 0 : parseFloat(this.dragRect.attr('y'));
  }
  // LL
  RectDrag() {
    // calculate mouse move
    const dx = d3.event.sourceEvent.x - this.currentX;
    // const dy = d3.event.sourceEvent.y - this.currentY;
    // change selection

    this.dragRect.attr('x', this.rectx + dx);
    this.moveTip(dx);
      // .attr('y', this.recty + dy);
    this.forceUpdate();
  }

  RectDrop(d) {
    const prej = parseInt(this.dragRect.node().parentNode.props.className, 10);
    const x = (parseFloat(this.dragRect.attr('x')) + this.rectX[prej]);
    // // let update = false;

    this.dragRect.attr('x', this.rectx);
    this.dragRect.attr('y', this.recty);
    for (let j = 0; j < this.rectX.length; j += 1) {
      if (x > this.rectX[j] - (1.5 * this.length) && x < this.rectX[j] + (0.5 * this.length)) {
        const arr = this.bins[prej];
        const stack = [];
    //     // console.log(this.where, this.which);

        // delete d
        const arrLength = arr.length;
        for (let k = 0; k < arrLength; k += 1) {
          const e = arr.pop();
          stack.push(e);

          // pop from stack and add to arr
          if (e === d) {
            stack.pop();

            const stackLength = stack.length;
            for (let l = 0; l < stackLength; l += 1) {
              const e1 = stack.pop();
              arr.push(e1);
            }
            break;
          }
        }

        // console.log(j, prej);

        // add d
        this.bins[j].push(d);
        console.log(this.bins);
        // update graph
        this.createChart();

        // // move tag
        // const tag = d3.select(this.dragRect.node().parentNode).select('text');
        // this.dragRect.attr('x', this.rectX[j] - (this.length / 2) - this.rectX[i]);
        // tag.remove();
      }
    // }


      // y
    }

    // if (!update) {
    //   this.dragRect.attr('height', this.recty);
    // }
    this.forceUpdate();
  }

  drawColumn(e) {
    let height = 0;
    for (let j = 0; j < e.length; j += 1) {
      const curHeight = this.getHeight(this.bins[e[j]], e[j]);
      this.chart.select(`.rect${e[j]}`)
        .attr('y', height)
        .attr('height', curHeight);
      console.log(curHeight);
      height -= curHeight;
    }
  }

  render() {
    const uid = this.uid;
    const className = `bar-chart-${uid}`;

    const html = this.root.toReact();
    return (
      <div className={className}>
        {html}
      </div>
    );
  }

}

export default BarChart2;
