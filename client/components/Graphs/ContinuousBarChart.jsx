/* eslint-disable */
import React from 'react';
import * as d3 from 'd3';
import PropTypes from 'prop-types';
import { createElement } from 'react-faux-dom';
import {
  createUniqueID,
} from '../../utils/graphUtils';
import {
  FILTER_CONTINUOUS,
} from '../../filtering/filterTypes';
import {ContinuousBinUtil} from '../../utils/binUtils';

const BAR_COLOR = '#3690c0';
const BRUSH_COLOR  = 'red';
const SELECTION_COLOR = '#ff7f00';


export default class ContinuousBarChart extends React.Component {

  static get propTypes() {
    return {
      label: PropTypes.string.isRequired,
      data: PropTypes.array.isRequired,
    };
  }

  static get defaultProps() {
    return {
      data: [],
      brushedData: [],
      width: 400,
      height: 200,
    };
  }

  constructor(props) {
    super(props);
    this.uid = createUniqueID(props);
  }

  /***************            Create Function Part          *************/

  createChart(bins) {
    const {
      width,
      height,
      label,
      brush,
      getData,
      brushedData,
    } = this.props;

    const {
      arrange,
      data,
    } = bins;

    this.brush = false;
    this.canDrag = true;

    // svg config
    const margin = { top: 30, right: 10, bottom: 50, left: 50 };
    const svgWidth = width - margin.left - margin.right;
    const svgHeight = height - margin.top - margin.bottom;

    // bar config
    const RECT_INTERVAL = 20;

    // selection config
    const minRectHeight = 100;

    // tag config
    const tagPadding = 10;

    // axis config
    const x = d3.scaleLinear()
              .range([0, svgWidth])
              .domain([0, arrange[arrange.length - 1].max]);
    const y = d3.scaleLinear()
              .range([svgHeight, 0])
              .domain([0, bins.maxBinSize()]);

    // triangle config
    const triLength = 5;
    const triPadding = 40;

    // prepare
    bins.formBars(svgWidth, RECT_INTERVAL);

    // graphics

    // create svg
    const svg = d3.select(this.root)
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height)
        .call(d3.drag()
          .on('start', this.ChartClick.bind(this))
          .on('drag', this.ChartDrag.bind(this))
          .on('end', this.ChartDrop.bind(this))
        )
    ;

    // create chart
    const chart = svg.append('g')
        .attr('class', 'chart')
        .attr('transform',
              `translate( ${margin.left} , ${margin.top} )`)
    ;

    // create bars
    const bar = chart.selectAll('g')
      .data(arrange)
      .enter().append('g')
        .attr('class', 'bar')
        .attr('transform', e => `translate(${e.x},${y(ContinuousBinUtil.size(e))})`)
        .style('cursor', 'pointer');

    // create brush rectangles
    const brushRect = bar.append('rect')
      .attr('x', e => -(e.width / 2))
      .attr('width', e => e.width)
      // .attr('height', (d, i) => (this.state.height - this.state.y(brushValues[i]) - this.state.y(d.value())))
      .style('fill', BAR_COLOR)
      .attr('stroke', 'black')
    ;

    // drag select area
    const allSelection = chart.append('rect')
      .attr('x', 0)
      .attr('y', 0)
      .attr('width', 0)
      .attr('height', 0)
      .attr('fill', SELECTION_COLOR)
      .style('cursor', 'pointer')
      .style('opacity', 0.5)
    ;
    const dragSelect = chart.append('g')
      .style('display', 'none');
    const DSSelection = dragSelect.append('rect')
      .attr('x', RECT_INTERVAL / 2)
      .attr('y', -1)
      .attr('height', svgHeight + 1)
      .attr('fill', SELECTION_COLOR)
      .style('cursor', 'pointer')
      .style('opacity', 0.5)
      .on('click', this.DSSelectionClick.bind(this))
    ;

    const DSTriangle1 = dragSelect.append('polygon')
      .attr('class', 'draggable rl')
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .style('cursor', 'e-resize')
      .call(d3.drag()
        .on('start', this.TriangleClick.bind(this))
        .on('drag', () => { this.update_draggingDSTri(false); })
        .on('end', this.DSTriangleDrop.bind(this))
      );
    const DSTriangle2 = dragSelect.append('polygon')
      .attr('class', 'draggable rl')
      .attr('fill', 'white')
      .attr('stroke', 'black')
      .style('cursor', 'w-resize')
      .call(d3.drag()
        .on('start', this.TriangleClick.bind(this))
        .on('drag', () => { this.update_draggingDSTri(true); })
        .on('end', this.DSTriangleDrop.bind(this))
      );


    // create rectangles
    const rect = bar.append('rect')
      .attr('class', 'rect')
      .attr('x', e => -(e.width / 2))
      .attr('width', e => e.width)
      .attr('height', e => svgHeight - y(ContinuousBinUtil.size(e)))
      .style('fill', BAR_COLOR)
      .style('stroke', 'black')
      .style('opacity', '0.8')
      .on('click', this.RectClick.bind(this))
      .on('mouseenter', this.RectMouseEnter.bind(this))
      .on('mouseleave', this.RectMouseLeave.bind(this))
    ;

    // create x Axis
    const xAxis = chart.append('g')
      .attr('transform', `translate(0,${svgHeight})`)
      .call(d3.axisBottom(x));
    xAxis.selectAll('.tick').remove();

    // create y Axis
    const yAxis = chart.append('g')
      .call(d3.axisLeft(y))
      .append('text')
        .attr('transform', 'rotate(-90) translate(-30,0)')
        .attr('y', 6)
        .attr('dy', '.71em')
        .style('text-anchor', 'end')
        .style('fill', 'black')
        .text('# of people');

    // create tags
    const tag = bar.append('text')
      .text(e => `${e.min}  - ${e.max}`)
      .attr('transform', e => `translate(0,${(svgHeight - y(ContinuousBinUtil.size(e))) + tagPadding}), rotate(45)`)
      .attr('textLength', margin.bottom - tagPadding)
      .style('text-anchor', 'left')
      .style('fill', 'black')
      .style('font', '9px sans-serif')
      .on('mouseenter', this.TagMouseEnter.bind(this))
      .on('mouseleave', this.TagMouseLeave.bind(this))
      .on('click', this.TagClick.bind(this))
    ;

    // create tips
    const tipValue = chart.append('text')
      .style('display', 'none')
      .style('font-size', '9px')
      .attr('text-anchor', 'middle')
    ;
    const tipRange = chart.append('text')
      .style('display', 'none')
      .style('font-size', '9px')
      .attr('text-anchor', 'middle')
    ;

    // create selections
    const selection = chart.append('g')
      .attr('id', 'selection')
      .style('display', 'none')
      .style('cursor', 'pointer')
    ;
    const selectionRect = selection.append('rect')
      .attr('class', 'rect')
      .style('fill', SELECTION_COLOR)
      .attr('stroke', 'black')
      .style('opacity', '0.5')
      .on('click', this.SelectionRectClick.bind(this))
    ;

    // create left-left triangle
    const tri0 = selection.append('polygon')
    .attr('class', 'draggable ll')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .style('cursor', 'w-resize');

    // create right-right triangle
    const tri1 = selection.append('polygon')
    .attr('class', 'draggable rr')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .style('cursor', 'e-resize');

    // create left-right triangle
    const tri2 = selection.append('polygon')
    .attr('class', 'draggable lr')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .style('cursor', 'e-resize');

    // create right-left triangle
    const tri3 = selection.append('polygon')
    .attr('class', 'draggable rl')
    .attr('fill', 'white')
    .attr('stroke', 'black')
    .style('cursor', 'w-resize');

    // Left move negatively
    tri0.call(d3.drag()
      .on('start', this.TriangleClick.bind(this))
      .on('drag', () => { this.update_draggingTri(true, false); })
      .on('end', this.TriangleDrop.bind(this))
    );
    // Right move positively
    tri1.call(d3.drag()
      .on('start', this.TriangleClick.bind(this))
      .on('drag', () => { this.update_draggingTri(false, true); })
      .on('end', this.TriangleDrop.bind(this))
    );
    // Left move positively
    tri2.call(d3.drag()
      .on('start', this.TriangleClick.bind(this))
      .on('drag', () => { this.update_draggingTri(true, true); })
      .on('end', this.TriangleDrop.bind(this))
    );
    // Right move negatively
    tri3.call(d3.drag()
      .on('start', this.TriangleClick.bind(this))
      .on('drag', () => { this.update_draggingTri(false, false); })
      .on('end', this.TriangleDrop.bind(this))
    );

    // create height-adapted dotted lines
    const path0 = selection.append('path')
      .attr('class', 'l')
      .attr('stroke-dasharray', '5,5');

    const path1 = selection.append('path')
      .attr('class', 'r')
      .attr('stroke-dasharray', '5,5');

    // set class-scope configuration
    this.config = {
      margin,
      svgWidth,
      svgHeight,
      triLength,
      triPadding,
      y,
      RECT_INTERVAL,
      minRectHeight,
    };

    // set class-scope variable
    this.svg = svg;
    this.dragSelect = dragSelect;
    this.allSelection = allSelection;
    this.DSSelection = DSSelection;
    this.DSTriangles = [DSTriangle1, DSTriangle2];
    this.tip = [tipValue, tipRange];
    this.brushRect = brushRect;
    this.selection = selection;
    this.selectionRect = selectionRect;
    this.selectionTris = [tri0, tri1, tri2, tri3];
    this.selectionDottedLines = [path0, path1];

  }

  createNoData() {
    const {
      width,
      height,
    } = this.props;

    // create svg
    const svg = d3.select(this.root)
        .append('svg')
        .attr('xmlns', 'http://www.w3.org/2000/svg')
        .attr('width', width)
        .attr('height', height)
    ;

    // create text
    const text = svg.append('text')
        .attr('x', width / 2)
        .attr('y', height / 2)
        .style('text-anchor', 'middle')
        .text('no qualified data');

    this.svg = svg;

  }

  /***************            Render Function Part          *************/


  updateBrush() {
    const {
      svgHeight,
      y
    } = this.config;

    // update brush rectangles
    this.brushRect
      .attr('height', e => svgHeight - y(e.brush))
      .attr('y', (e) => (-y(ContinuousBinUtil.size(e)) + y(e.brush)));
  }
  updateDSSelection(show, left, displacement) {
    const {
      DSSelection,
      DSTriangles,
      dragSelect,
    } = this;

    const {
      RECT_INTERVAL,
      svgWidth,
      triPadding,
      triLength,
    } = this.config

    const triX = svgWidth - (RECT_INTERVAL / 2) + displacement;
    const triY = triPadding - 1;

    if(show) {
      dragSelect.style('display', 'block');
      DSSelection
        .attr('width', (svgWidth - RECT_INTERVAL) + displacement);
      DSTriangles[0]
        .attr('points', `
          ${triX},${triY}
          ${triX},${triY + (2 * triLength)}
          ${triX + (1.73 * triLength)},${triY + triLength}`
        );
      DSTriangles[1]
        .attr('points', `
          ${triX},${triY}
          ${triX},${triY + (2 * triLength)}
          ${triX - (1.73 * triLength)},${triY + triLength}`
        );
    } else {
      dragSelect.style('display', 'none');
    }
  }
  /**
   * update and render selection
   * @param {bool} show whether the selection should be displayed
   * @param {int} i which selection
   * @param {bool} left whether displacement is based on left or right border
   * @param {} displacement the displacement over border on x
   */
  updateSelection(show, i, left, displacement) {
    const {
      selection,
      selectionRect,
      selectionDottedLines
    } = this;

    const {
      svgHeight,
      y,
      minRectHeight,
    } = this.config;

    const {
      brush,
    } = this.props;

    const e = this.bins.arrange[i];

    if(!show) {
      // no selection now
      selection.style('display', 'none');
    } else {
      let rectHeight = svgHeight - y(ContinuousBinUtil.size(e));
      let dotted = false;
      let displacementY = y(ContinuousBinUtil.size(e));
      const leftX = left ? -(e.width / 2) + displacement : -(e.width / 2);
      const rightX = left ? e.width / 2 : (e.width / 2) + displacement;

      // remove all brush
      if(brush) {
        this.props.removeBrush();
      }

      // edge case when rect is too short to click and need height adaption
      if(rectHeight < minRectHeight) {
        dotted = true;
        rectHeight = minRectHeight;
        displacementY = svgHeight - minRectHeight;
      }

      // update selection
      selection
        .style('display', 'block')
        .attr('transform', `translate(${e.x},${displacementY})`)
      ;

      // update height-adapted dotted lines
      selectionDottedLines[0]
          .attr('stroke', dotted? 'red' : 'none')
          .attr('d', `m ${leftX} ${rectHeight} l 0 -100`)
        ;
      selectionDottedLines[1]
          .attr('stroke', dotted? 'red' : 'none')
          .attr('d', `M ${(rightX)} ${rectHeight} l 0 -100`)
      ;

      // update selection rectangle
      selectionRect
        .attr('x', leftX)
        .attr('width', left? e.width - displacement : e.width + displacement)
        .attr('height', rectHeight)
        .attr('stroke', dotted? 'none' : 'black')
      ;

      // update selection triangles
      this.updateSelectionTriangles(rectHeight, leftX, rightX, i);
    }
  }

  /**
   * update and render the triangles
   * @param {number} rectHeight height of selection where the triangles is
   * @param {number} leftX the x of left border of the selection
   * @param {number} rightX the x of right border of the selection
   * @param {int} i the id of selected rectangle
   */
  updateSelectionTriangles(rectHeight, leftX, rightX, i) {
    const {
      selectionRect,
      selectionTris,
      bins,
    } = this;

    // triangle config
    const {
      triLength,
      triPadding,
    } = this.config;

    const triangles = [];
    let triHeight = triPadding;

    // edge case when height of triangle exceeds height of rect
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

    selectionTris[0]
      .attr('points', `${triangles[0][0]},${triangles[0][1]} ${triangles[0][2]},${triangles[0][3]} ${triangles[0][4]},${triangles[0][5]}`)
      .style('display', i === 0 ? 'none' : 'block');
    selectionTris[1]
      .attr('points', `${triangles[1][0]},${triangles[1][1]} ${triangles[1][2]},${triangles[1][3]} ${triangles[1][4]},${triangles[1][5]}`)
      .style('display', i === bins.arrange.length - 1 ? 'none' : 'block');
    selectionTris[2].attr('points', `${triangles[2][0]},${triangles[2][1]} ${triangles[2][2]},${triangles[2][3]} ${triangles[2][4]},${triangles[2][5]}`);
    selectionTris[3].attr('points', `${triangles[3][0]},${triangles[3][1]} ${triangles[3][2]},${triangles[3][3]} ${triangles[3][4]},${triangles[3][5]}`);
  }

  updateTip(show, i, displacement, value, range1, range2) {
    const tipValue = this.tip[0];
    const tipRange = this.tip[1];
    const { svgHeight, y, minRectHeight} = this.config;
    const arrange = this.bins.arrange;
    const fontSize = 12;
    const textPadding = 5;

    if(show) {
      // selection
      const tipX = arrange[i].x + displacement;
      let tipY = y(ContinuousBinUtil.size(arrange[i]));
      tipY = tipY > svgHeight - minRectHeight ? svgHeight - minRectHeight: tipY;
      tipY = tipY - textPadding;

      tipValue
        .style('display', 'block')
        .attr('x', tipX)
        .attr('y', tipY - fontSize)
        .text(`Value: ${value}`)
      ;

      tipRange
        .style('display', 'block')
        .attr('x', tipX)
        .attr('y', tipY)
        .text(`Range: ${range1} - ${range2}`)
      ;

    } else {
      // tip should not be displayed in the page
      tipValue.style('display', 'none');
      tipRange.style('display', 'none');
    }
  }

  updateDSTip(show, displacement, value) {
    const tipRange = this.tip[1];

    const {
      svgWidth
    } = this.config;

    if(show) {
      tipRange
        .style('display', 'block')
        .attr('x', (svgWidth / 2) + displacement)
        .attr('y', -2)
        .text(`# of Bins: ${value}`)
    } else {
      tipRange
        .style('display', 'none');
    }
  }

  update_draggingTri(left, positive) {
    const {
      bins,
    } = this;

    const {
      RECT_INTERVAL,
      svgWidth,
    } = this.config;

    const {
      label,
    } = this.props;

    const arrange = bins.arrange;
    const element = arrange[bins.selected];
    const unitWidth = bins.unitWidth;
    const errorRate = 0.0001;

    // determine displacement of the border
    const x = d3.event.x;
    let upperBound, lowerBound;
    if(left && positive){
      upperBound = element.width;
      lowerBound = 0;
    } else if(left && !positive) {
      upperBound = 0;
      lowerBound = (arrange[0].min - element.min) * unitWidth;
    } else if(!left && positive) {
      upperBound = (arrange[arrange.length - 1].max - element.max) * unitWidth;
      lowerBound = 0;
    } else if(!left && !positive) {
      upperBound = 0;
      lowerBound = -element.width;
    }
    let displacement = x - this.currentX;
    displacement = displacement < upperBound ? displacement : upperBound;
    displacement = displacement > lowerBound ? displacement : lowerBound;

    // calculate range
    const min = left ? ContinuousBinUtil.approximateInt(element.min + (displacement / unitWidth), errorRate, true): element.min;
    const max = left ? element.max : ContinuousBinUtil.approximateInt(element.max + (displacement / unitWidth), errorRate, true);
    // calculate value
    let value = 0;
    for(let i = 0; i < bins.data.length; i += 1) {
      if(bins.data[i][label] >= min && bins.data[i][label] < max) {
        value += 1;
      }
    }

    // render selection
    this.updateSelection(true, bins.selected, left, displacement);

    // render tip
    this.updateTip(true, bins.selected, displacement / 2, value, min, max);

    // record the result
    this.currentResult = {min, max};
  }

  update_draggingDSTri(left) {
    const {
      MAX_NUM_OF_BINS,
    } = this.bins;

    const unitBin = 10;

    const x = d3.event.x;
    const lowerBound = left ? -(unitBin * (this.bins.arrange.length - 1)) : 0;
    const upperBound = left ? 0 : unitBin * (MAX_NUM_OF_BINS - this.bins.arrange.length);

    let displacement = x - this.currentX;
    displacement = displacement > upperBound ? upperBound : displacement;
    displacement = displacement < lowerBound ? lowerBound : displacement;

    const num = this.bins.arrange.length + parseInt(displacement / unitBin, 10);

    this.updateDSSelection(true, left, displacement);
    this.updateDSTip(true, displacement / 2, num);

    this.currentResult = num;

  }

  /***************            Interaction Function Part          *************/

  DSSelectionClick() {
    this.clearDragSelect();
  }
  ChartClick() {
    // do nothing when the graph should not be dragged
    if(!this.canDragSelect())
      return ;

    const {
      allSelection,
    } = this;

    this.dragging = false;
    this.currentResult = false;
    this.currentX = d3.event.x;
    this.currentY = d3.event.y;
  }

  ChartDrag() {
    // do nothing when the graph should not be dragged
    if(!this.canDragSelect())
      return ;

    const {
      allSelection,
    } = this;

    const {
      margin,
      svgWidth,
      svgHeight,
      RECT_INTERVAL,
    } = this.config;

    const x = (this.currentX < d3.event.x ? this.currentX : d3.event.x) - margin.left;
    const y = (this.currentY < d3.event.y ? this.currentY : d3.event.y) - margin.top;
    const height = Math.abs(this.currentY - d3.event.y);
    const width = Math.abs(this.currentX - d3.event.x);
    allSelection
      .attr('x', x)
      .attr('y', y)
      .attr('height', height)
      .attr('width', width)
    ;

    this.currentResult = x < RECT_INTERVAL && x + width > svgWidth - RECT_INTERVAL
                    &&  y < svgHeight && y + height > svgHeight;
    this.dragging = true;
  }

  ChartDrop() {
    // do nothing when the graph should not be dragged
    if(!this.canDragSelect())
      return ;

    // if it is triggered by drag not simple click on the graph
    if(this.dragging) {
      const {
        allSelection,
        dragSelect,
      } = this;

      if(this.bins.selected >= 0) {
        this.clearSelection();
      }

      allSelection
        .attr('x', 0)
        .attr('y', 0)
        .attr('height', 0)
        .attr('width', 0)
      ;

      if (this.currentResult) {
        dragSelect.style('display', 'block');
        this.updateDSTip(true, 0, this.bins.arrange.length);
        this.updateDSSelection(true, true, 0);
        this.canDrag = false;
      }

      this.dragging = false;
    }




  }

  RectMouseEnter(d, i, e) {
    if(this.canBrush()) {
      const bins = this.bins;
      const arrange = bins.arrange;
      const { label } = this.props;

      // render bar
      d3.select(e[i]).style('fill', 'red');

      // render tip
      this.updateTip(true, i, 0, ContinuousBinUtil.size(this.bins.arrange[i]), this.bins.arrange[i].min, this.bins.arrange[i].max);

      // self brush start
      this.brush = true;

      // render brush area in other parts
      this.props.applyBrush(bins.data, [{
        name: label,
        type: FILTER_CONTINUOUS,
        minVal: arrange[i].min,
        maxVal: arrange[i].max,
      }]);
    }
  }

  RectMouseLeave(d, i, e) {
    if(this.canBrush()) {
      // render bar
      d3.select(e[i]).style('fill', BAR_COLOR);

      // render tip
      this.updateTip(false);
      if(!this.canDragSelect()) {
        this.updateDSTip(true, 0, this.bins.arrange.length);
      }

      // self brush finished
      this.brush = false;

      // render brush area in other parts
      this.props.removeBrush();
    }
  }

  RectClick(d, i, e) {
    // clear drag
    if(!this.canSelect()){
      this.clearDragSelect();
    }

    d3.select(e[i]).style('fill', BAR_COLOR);
    // change state of select
    this.bins.selected = i;

    // render selection
    this.updateSelection(true, i, true, 0);

    // render tip
    this.updateTip(true, i, 0, ContinuousBinUtil.size(this.bins.arrange[i]), this.bins.arrange[i].min, this.bins.arrange[i].max);
  }

  TagMouseEnter(d, i, e) {
    console.log(this.bins.data);
    const rects = this.translate(e, '.rect');
    // trigger another event
    this.RectMouseEnter(d, i, rects);
  }

  TagMouseLeave(d, i, e) {
    const rects = this.translate(e, '.rect');
    // trigger another event
    this.RectMouseLeave(d, i, rects);
  }

  TagClick(d, i, e) {
    // clear drag
    if(!this.canSelect()){
      this.clearDragSelect();
    }

    const rects = this.translate(e, '.rect');
    // render bar
    d3.select(rects[i]).style('fill', BAR_COLOR);

    if(this.bins.selected === i) {
      this.clearSelection();
    } else {
      // set select
      this.bins.selected = i;

      // render selection and tip
      this.updateSelection(true, i, true, 0);
      this.updateTip(true, i, 0, ContinuousBinUtil.size(this.bins.arrange[i]), this.bins.arrange[i].min, this.bins.arrange[i].max);
    }
  }

  SelectionRectClick() {
    this.clearSelection();
  }

  TriangleClick() {
    this.currentX = d3.event.x;
  }

  TriangleDrop() {
    const {
      label,
    } = this.props;

    // rearrange bins and reassigning data
    const arrange = ContinuousBinUtil.customBinning(this.bins.arrange, this.currentResult.min, this.currentResult.max);
    ContinuousBinUtil.assignOrderedData(this.bins.data, label, arrange);

    // set bins
    this.bins.reset();
    this.bins.arrange = arrange;

    // recreate chart
    this.clear();
    this.createChart(this.bins);

  }
  DSTriangleDrop() {
    const {
      label,
    } = this.props;

    // rearrange bins and reassigning data
    const min = Math.floor(this.bins.data[0][label]);
    const max = Math.ceil(this.bins.data[this.bins.data.length - 1][label]);
    const arrange = ContinuousBinUtil.fixedNumBinning(min, max, this.currentResult);
    ContinuousBinUtil.assignOrderedData(this.bins.data, label, arrange);

    // set bins
    this.bins.reset();
    this.bins.arrange = arrange;

    // recreate chart
    this.clear();
    this.createChart(this.bins);

  }


  /***************            Helper Function Part          *************/


  translate(elements, query) {
    const others = elements.map(e => {
      return d3.select(e.parentNode).select(query).node();
    })
    return others;
  }

  canBrush() {
    return this.bins.selected < 0 && !this.dragging && this.canDrag;
  }
  canSelect() {
    return this.canDrag;
  }
  canDragSelect() {
    return this.canDrag;
  }
  createArrange(data, label, numOfBins) {
    const MAX_NUM_OF_BINS = 20;

    const bins = new ContinuousBinUtil(data, label);
    // no valid data
    if(bins.data.length === 0) {
      return false;
    }

    const max = Math.ceil(bins.data[bins.data.length - 1][label]);
    const min = Math.floor(bins.data[0][label]);
    console.log(max, min);
    let arrange;
    if(Number.isInteger(numOfBins)) {
      arrange = ContinuousBinUtil.fixedNumBinning(min, max, numOfBins);
    } else {
      // generate arrange based on freedman's algorithm
      arrange = ContinuousBinUtil.freedmanBinning(min, max, ContinuousBinUtil.iqr(bins.data, label), data.length);
      // constraint num of bins
      if(arrange.length > MAX_NUM_OF_BINS) {
        arrange = ContinuousBinUtil.fixedNumBinning(min, max, MAX_NUM_OF_BINS);
      }
    }

    // assign data based on arrange
    ContinuousBinUtil.assignOrderedData(bins.data, label, arrange);

    // declare arrange as a property of bins
    bins.arrange = arrange;

    bins.MAX_NUM_OF_BINS = MAX_NUM_OF_BINS;

    this.bins = bins;
    return true;
  }


  /***************            Remove Function Part          *************/

  clear() {
    if(this.svg)
      this.svg.remove();
  }

  clearSelection() {
    // set unselect
    this.bins.selected = -1;

    // render selection and tip
    this.updateSelection(false, null, null, null);
    this.updateTip(false, null, null);
  }

  clearDragSelect() {
    const {
      dragSelect,
    } = this;

    dragSelect.style('display', 'none');
    this.updateTip(false, null, null);
    this.canDrag = true;
  }


  /***************            Lifecycle Function Part          *************/

  componentWillReceiveProps(nextProps) {
    const { label, getData, dataChanged, numOfBins, brush, brushedData } = nextProps;
    const data = getData();
    // create a new graph when data and filter changed
    if (dataChanged || this.props.numOfBins !== numOfBins) {

      // clear old graph
      this.clear();

      // create new graph
      this.nodata = !this.createArrange(data, label, numOfBins);
      if (this.nodata) {
        this.createNoData();
      } else {
        this.createChart(this.bins);
      }
    }

    // brush data when brush update by others
    if(!this.brush && !this.nodata) {
      if (brush) {
        // apply brush
        this.bins.brush(brushedData, label);
      } else {
        // remove brush
        this.bins.brush(null, label);
      }
      // brush data when brush update by others
      this.updateBrush();
    }
  }

  componentWillUnmount() {
    this.clear();
  }
  componentWillMount() {
    const { label, getData, numOfBins, brush, brushedData } = this.props;
    const data = getData();
    // create graph
    this.nodata = !this.createArrange(data, label, numOfBins);
  }

  componentDidMount() {
    if(this.nodata) {
      this.createNoData();
    } else {
      this.createChart(this.bins);
    }

    console.log(`graph finish preparing`, performance.now());
  }

  shouldComponentUpdate() {
    return false;
  }



  render() {
    const uid = this.uid;
    const className = `bar-chart-${uid}`;

    return (
      <div className={className} ref={(e) => {this.root = e}}>
      </div>
    );
  }
}