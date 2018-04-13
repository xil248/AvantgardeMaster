/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
// import { event as currentEvent } from 'd3';
// import { withFauxDOM, createElement } from 'react-faux-dom';
// import { ReactDOM } from 'react-dom';
import { createElement } from 'react-faux-dom';
import {
  FILTER_CATEGORICAL,
} from '../../filtering/filterTypes';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {
  createUniqueID,
} from '../../utils/graphUtils';

class BarChart2 extends React.Component {
  static get propTypes() {
    return {
      metadata: PropTypes.array.isRequired,
      data: PropTypes.array.isRequired,
      label: PropTypes.string.isRequired,
      // rectWidth: PropTypes.number,
      // change: PropTypes.bool,
      // chart: PropTypes.node,
      // connectFauxDOM: PropTypes.func.isRequired,
      brushedData: PropTypes.array,
      brush: PropTypes.bool,
      applyBrush: PropTypes.func,
      removeBrush: PropTypes.func,

    };
  }

  static get defaultProps() {
    return {
      width: 400,
      height: 200,
      brushedData: [],
      brush: false,
      applyBrush() {},
      removeBrush() {},
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
    const { data } = this.props;
    this.createChart(data);
  }

  // get x position of each bar
  getRectX() {
    const arr = [];

    // let start = this.rectInterval;
    if (this.length === undefined) {
      this.length = this.width / this.bins.length / 2;
    }
    let start = -this.length;

    for (let i = 0; i < this.bins.length; i += 1) {
      start += this.length * 2;
      arr.push(start);
    }

    // console.log(arr);
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

  createTip(d, i, bold) {
    const x = this.rectX[i];

    let y = 100;
    let sum = 0;
    // let text = '';
    for (let k = 0; k < this.bins[i].length; k += 1) {
      y -= this.getHeight(this.bins[i][k]);
      sum += this.bins[i][k].y;
    }

    y = y < 0 ? y : 0;
    // console.log(`y: ${y}`);
    this.valueTip
      .attr('x', x)
      .attr('y', y)
      .attr('dx', 0)
      .attr('dy', 0)
      .style('display', 'block')
      .attr('text-anchor', 'middle')
      .text(`${sum}`);
    this.rangeTip
      .attr('x', x)
      .attr('dx', 0)
      .attr('dy', 0)
      .style('display', 'block')
      .attr('dy', '1em')
      .attr('y', y)
      .attr('text-anchor', 'middle');

    this.rangeTip.selectAll('tspan').remove();
    this.rangeTip.selectAll('tspan')
      .data(this.bins[i])
      .enter()
      .append('tspan')
      .text((d1, i1) => {
        return `${d1.x + (i1 !== this.bins[i].length - 1 ? ' & ' : '')}`;
      })
      .style('font-weight', (d1, i1) => (i1 === bold ? 'bold' : 'normal'))
      .exit();
  }
  removeTIp() {
    this.rangeTip.style('display', 'none');
    this.valueTip.style('display', 'none');
  }
  insertPriority(arr) {
    if (this.bins.length === 0) {
      this.bins.push(arr);
      return;
    }
    for (let i = 0; i < this.bins.length; i += 1) {
      if (arr[0].x < this.bins[i][0].x) {
        this.bins.splice(i, 0, arr);
        return;
      }
    }
    this.bins.push(arr);
  }
  createChart(data) {
    // this.root = this.props.connectFauxDOM('div', 'chart');
    this.root = createElement('div');
    this.canbrush = true;
    // bins config
    if (this.bins == null) {
      this.bins = [];
      data.forEach((e) => {
        this.insertPriority([e]);
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
    if (this.length !== undefined) {
      this.width = this.length * this.bins.length * 2;
    }

    // bar config
    this.rectX = this.getRectX();
    this.rectY = [];

    // tag config
    this.tagPadding = 10;

    // tip config
    this.tip = true;

    // v
    this.forbidV = true;

    // adaptor height
    this.adaptHeight = 100;

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
        .style('cursor', 'pointer');

    // rects
    let id = -1;
    this.brushRect = this.bar
      .append('rect')
      .attr('class', () => { id += 1; return `brushRect${id}`; })
      .style('fill', '#3690c0');
      // .style('stroke', 'black');

    id = -1;
    this.rect = this.bar.selectAll('g')
      .data((d) => { return d; })
      .enter()
      .append('rect')
      .attr('class', () => { id += 1; return `rect${id}`; })
      .attr('x', -this.length / 2)
      .attr('y', this.getY.bind(this))
      .attr('width', this.length)
      .attr('height', this.getHeight.bind(this))
      .style('fill', '#3690c0')
      .style('opacity', 0.8)
      .style('stroke', 'black')
      // .on('click', this.RectClick.bind(this))
      .on('mouseover', this.RectMouseOver.bind(this))
      .on('mouseout', this.RectMouseOut.bind(this))
      .on('click', this.RectSolidClick.bind(this));
      // .call(d3.drag()
      //   .on('start', this.RectClick.bind(this))
      //   .on('drag', this.RectDrag.bind(this))
      //   .on('end', this.RectDrop.bind(this))
      // );

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
      // .on('click', this.TagSolidClick.bind(this))
      .on('mouseover', this.TagMouseOver.bind(this))
      .on('mouseout', this.TagMouseOut.bind(this));
      // .call(d3.drag()
      //   .on('start', this.TagClick.bind(this))
      //   .on('drag', this.RectDrag.bind(this))
      //   .on('end', this.RectDrop.bind(this))
      // );
      // .on('click', this.RectClick.bind(this));
    this.valueTip = this.chart.append('text')
      .attr('class', 'tip')
      .style('display', 'none');
    this.rangeTip = this.chart.append('text')
      .attr('class', 'tip')
      .style('display', 'none');
  }

  createAdaptRect(e) {
    // console.log(parseInt(e.props.className, 10));
    this.adaptRect = d3.select(e.parentNode).insert('g', ':first-child')
      .attr('class', `${e.props.className.match(/\d+/)[0]}adapt`)
      .style('cursor', this.forbidV ? 'ew-resize' : 'move')
      .call(d3.drag()
        .on('start', this.AdaptRectClick.bind(this))
        .on('drag', this.RectDrag.bind(this))
        .on('end', this.RectDrop.bind(this))
      );
    this.adaptRect.append('rect')
      .attr('x', -this.length / 2)
      .attr('y', -this.adaptHeight)
      .attr('class', 'adaptRect')
      .attr('height', this.adaptHeight)
      .attr('width', this.length)
      .style('opacity', 0.5)
      .style('fill', '#ff7f00');
    this.adaptRect.append('path')
      .attr('class', 'l')
      .attr('d', `m ${-this.length / 2} 0 l 0 ${-this.adaptHeight}`)
      .attr('stroke', 'red')
      .attr('stroke-dasharray', '5,5');
    this.adaptRect.append('path')
      .attr('class', 'r')
      .attr('d', `M ${(this.length / 2)} 0 l 0 ${-this.adaptHeight}`)
      .attr('stroke', 'red')
      .attr('stroke-dasharray', '5,5');
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

  AdaptRectClick(d, i, e) {
    // console.log(e[i].props.className);
    this.className = `rect${parseInt(e[i].props.className, 10)}`;
    const dragRect = this.chart.select(this.className);
    // mouse x, y position
    this.currentX = d3.event.sourceEvent.x;
    this.currentY = d3.event.sourceEvent.y;

    // if (this.adaptRect !== undefined && this.adaptRect !== null) {
    //   this.adaptRect.remove();
    //   this.adaptRect = null;
    // }
    // const height = parseInt(dragRect.attr('height'), 10);
    // if (height < this.adaptHeight) {
    //   this.createAdaptRect(e[i]);
    // }
    // if (this.adaptRect !== undefined && this.adaptRect !== null) {
    //   this.adaptX = parseFloat(this.adaptRect.attr('x'));
    //   this.adaptY = parseFloat(this.adaptRect.attr('y'));
    // }

    // determine whether h or v
    this.deter = true;
    dragRect.on('mouseout', null);

    this.forceUpdate();
  }
  RectSolidClick(d, i, e) {
    this.forbidV = e.length === 1 && this.forbidV;

    // console.log(e);
    const dragRect = d3.select(e[i]);
    this.className = dragRect.attr('class');
    // if click last time not clean dragrects
    // if drag last time clean dragrects

    dragRect.call(d3.drag()
      .on('start', this.RectClick.bind(this))
      .on('drag', this.RectDrag.bind(this))
      .on('end', this.RectDrop.bind(this))
    );

    if (this.update || this.update === undefined) {
      this.dragRects = [];
      this.dragRectsValue = {};
      this.dragRectsD = [];
    }

    if (this.adaptRect !== undefined && this.adaptRect !== null) {
      this.adaptRect.remove();
      this.adaptRect = null;
    }

    // check whether contains before
    if (!this.dragRects.includes(this.className)) {
      const height = parseInt(dragRect.attr('height'), 10);
      if (height < this.adaptHeight) {
        this.createAdaptRect(e[i]);
      }
      dragRect.style('fill', '#95745b')
        .style('opacity', '1')
        .style('cursor', this.forbidV ? 'ew-resize' : 'move');

      this.dragRects.push(this.className);
      this.dragRectsValue[this.className] = {
        x: parseFloat(dragRect.attr('x')),
        y: isNaN(dragRect.attr('y')) ? 0 : parseFloat(dragRect.attr('y'))
      };
      this.dragRectsD.push(d);
    } else {
      this.dragRects = this.dragRects.filter(a => a !== this.className);
      delete this.dragRectsValue[this.className];
      this.dragRectsD = this.dragRectsD.filter(a => a !== d);
      this.chart.select(`.${this.className}`).style('fill', '#3690c0')
        .style('opacity', '0.8')
        .style('cursor', 'pointer');
    }

    // determine whether click(false) or drag(true)
    this.update = false;
    this.forceUpdate();
  }
  RectMouseOver(d, i, e) {
    const j = parseInt(d3.select(e[i]).node().parentNode.props.className, 10);
    // console.log(j);
    this.createTip(d, j, i);
    let attrib = [];
    for( let j = 0; j < e.length; j += 1) {
      attrib.push(e[j].__data__.x);
    }
    const filteredData = this.props.metadata.filter(e => {
      for (let j = 0; j < attrib.length; j += 1) {
        if (e[this.props.label] === attrib[j]) {
          return true;
        }
      }
      return false;
    })
    console.log(attrib, this.props.label, filteredData);
    if (!this.props.brush) {
      this.props.applyBrush(filteredData, null, true);
    }
    this.forceUpdate();
  }

  RectMouseOut(d, i, e) {
    this.removeTIp();
    // this.valueTip.style('display', 'none');
    // this.rangeTip.style('display', 'none');
    // this.valueTip = null;
    // this.rangeTip = null;
    // console.log(this.valueTip);
    if (this.props.brush) {
      this.props.removeBrush();
    }
    d3.select(e[i])
      .style('opacity', '0.8');
    this.forceUpdate();
  }

  TagSolidClick(d, i, e) {
    const e1 = d3.select(e[i].parentNode).selectAll('rect').nodes();
    this.RectSolidClick(d, i, e1);
  }
  TagMouseOver(d, i, e) {
    const e1 = d3.select(e[i].parentNode).selectAll('rect').nodes();
    this.RectMouseOver(d, i, e1);
  }
  TagMouseOut(d, i, e) {
    const e1 = d3.select(e[i].parentNode).selectAll('rect').nodes();
    this.RectMouseOut(d, i, e1);
  }
  TagClick(d, i, e) {
    const e1 = d3.select(e[i].parentNode).selectAll('rect').nodes();
    this.RectClick(d, i, e1);
  }
  // RL
  RectClick(d, i, e) {
    this.canbrush = false;
    const dragRect = d3.select(e[i]);
    this.className = dragRect.attr('class');
    // mouse x, y position
    this.currentX = d3.event.sourceEvent.x;
    this.currentY = d3.event.sourceEvent.y;

    if (this.adaptRect !== undefined && this.adaptRect !== null) {
      this.adaptRect.remove();
      this.adaptRect = null;
    }
    const height = parseInt(dragRect.attr('height'), 10);
    if (height < this.adaptHeight) {
      this.createAdaptRect(e[i]);
    }
    // if (this.adaptRect !== undefined && this.adaptRect !== null) {
    //   this.adaptX = parseFloat(this.adaptRect.attr('x'));
    //   this.adaptY = parseFloat(this.adaptRect.attr('y'));
    // }

    // determine whether h or v
    this.deter = true;
    dragRect.on('mouseout', null);

    this.forceUpdate();
  }
  // LL
  RectDrag() {
    // calculate mouse move
    const dx = d3.event.sourceEvent.x - this.currentX;
    const dy = d3.event.sourceEvent.y - this.currentY;

    this.tip = false;

    // change selection
    if (dx === 0 && dy === 0) {
      return;
    }
    this.update = true;
    if (this.deter) {
      if (Math.abs(dy) > 0.1 * Math.abs(dx)) {
        this.mode = 'v';
      } else {
        this.mode = 'h';
      }
      if (dy !== 0 || dx !== 0) {
        this.deter = false;
      }
    }

    if (this.mode === 'v' && !this.forbidV) {
      this.dragRects.forEach((a) => {
        this.chart.select(`.${a}`).attr('y', this.dragRectsValue[a].y + dy);
      });
      if (this.adaptRect !== undefined && this.adaptRect !== null) {
        this.adaptRect.attr('transform', `translate( 0, ${dy} )`);
      }
      // console.log(this.chart.select(`.${a}`));
    } else if (this.mode === 'h') {
      this.dragRects.forEach((a) => {
        this.chart.select(`.${a}`).attr('x', this.dragRectsValue[a].x + dx);
      });
      if (this.adaptRect !== undefined && this.adaptRect !== null) {
        this.adaptRect.attr('transform', `translate( ${dx} , 0 )`);
      }
      this.moveTip(dx);
    }

      // .attr('y', this.recty + dy);
    this.forceUpdate();
  }

  RectDrop() {
    if (!this.update) {
      if (this.adaptRect !== undefined && this.adaptRect !== null) {
        this.adaptRect.attr('transform', 'translate( 0 , 0 )');
      }
      return;
    }

    this.chart.select(`.${this.className}`).on('mouseout', this.RectMouseOut.bind(this));
    const prej = parseInt(this.chart.select(`.${this.className}`).node().parentNode.props.className, 10);
    const x = (parseFloat(this.chart.select(`.${this.className}`).attr('x')) + this.rectX[prej]);
    if (this.adaptRect !== undefined && this.adaptRect !== null) {
      this.adaptRect.attr('transform', 'translate( 0 , 0 )');
    }
    // console.log(this.chart.select(`.${this.className}`));
    // // let update = false;

    // this.dragRect.attr('x', this.rectx);
    // this.dragRect.attr('y', this.recty);
    this.dragRects.forEach((e) => {
      this.chart.select(`.${e}`).attr('x', this.dragRectsValue[e].x)
        .attr('y', this.dragRectsValue[e].y);
    });
    this.tip = true;


    if (this.mode === 'h') {
      for (let j = 0; j < this.rectX.length; j += 1) {
        if (x > this.rectX[j] - (1.5 * this.length) && x < this.rectX[j] + (0.5 * this.length)) {
          if (j === prej) {
            this.chart.select(`.${this.className}`).attr('x', this.dragRectsValue[this.className].x);
            this.chart.select(`.${this.className}`).attr('y', this.dragRectsValue[this.className].y);

            break;
          }

          // delete d
          for (let i = 0; i < this.bins.length; i += 1) {
            this.bins[i] = this.bins[i].filter((a) => {
              return !this.dragRectsD.includes(a);
            });
          }

          // console.log(j);
          // add d
          this.dragRectsD.forEach((e) => {
            this.bins[j].push(e);
          });


          // filter nonexist arr
          this.bins = this.bins.filter((e) => {
            return e.length > 0;
          });

          // sort
          const newBin = this.bins;
          this.bins = [];
          newBin.forEach((e) => {
            // console.log(this.bins, e);
            this.insertPriority(e);
          });

          // // update graph
          this.createChart();
          break;
        }
      // }
      }

      // y
    } else {
      // delete d
      for (let i = 0; i < this.bins.length; i += 1) {
        this.bins[i] = this.bins[i].filter((a) => {
          return !this.dragRectsD.includes(a);
        });
      }

      // add d
      this.dragRectsD.forEach((e) => {
        // console.log(e, this.bins);
        this.bins.push([e]);
      });

      // filter nonexist arr
      this.bins = this.bins.filter((e) => {
        return e.length > 0;
      });

      // sort
      const newBin = this.bins;
      this.bins = [];
      newBin.forEach((e) => {
        // console.log(this.bins, e);
        this.insertPriority(e);
      });

      // update graph
      this.createChart();
    }
    this.forceUpdate();
  }

  drawColumn(e) {
    let height = 0;
    for (let j = 0; j < e.length; j += 1) {
      const curHeight = this.getHeight(this.bins[e[j]], e[j]);
      this.chart.select(`.rect${e[j]}`)
        .attr('y', height)
        .attr('height', curHeight);
      // console.log(curHeight);
      height -= curHeight;
    }
  }

  render() {
    const { brush, brushedData, label } = this.props;
    // console.log('brush', brushedData, this.bins, label);


    for (let i = 0; i < this.bins.length; i += 1) {
      for (let j = 0; j < this.bins[i].length; j += 1) {
        this.bins[i][j].y2 = 0;
      }
    }


    if (brush) {
      brushedData.forEach((element) => {
        for (let i = 0; i < this.bins.length; i += 1) {
          for (let j = 0; j < this.bins[i].length; j += 1) {
            if (element[label] === this.bins[i][j].x) {
              this.bins[i][j].y2 += 1;
            }
          }
        }
      });
    }

    if (this.canbrush) {
      this.brushRect
        .attr('class', (d, i) => `brushrect${i}`)
        .attr('x', -this.length / 2)
        .attr('y', (d, i) => {
          let sum = 0;
          for (let j = 0; j < this.bins[i].length; j += 1) {
            // console.log(this.bins[i][j]);
            if (this.bins[i][j].y2 !== undefined) {
              sum += this.bins[i][j].y2;
            }
          }
          console.log(this.y(sum));
          return this.y(sum) - 120;
        })
        .attr('width', this.length)
        .attr('height', (d, i) => {
          let sum = 0;
          for (let j = 0; j < this.bins[i].length; j += 1) {
            // console.log(this.bins[i][j]);
            if (this.bins[i][j].y2 !== undefined) {
              sum += this.bins[i][j].y2;
            }
          }
          console.log(this.y(sum));
          return 120 - this.y(sum);
        }
          // d => this.height - this.y(d.y2)
        );
    } else {
      this.brushRect.attr('width', 0);
    }

    // console.log('brush', this.bins);
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
function mapStateToProps(state) {
  return {
    metadata: state.filters.data,
  };
}
export default connect(mapStateToProps, actions)(BarChart2);
