/* eslint-disable */
import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { createElement } from 'react-faux-dom';
import {
  FILTER_CATEGORICAL,
} from '../../filtering/filterTypes';
import { connect } from 'react-redux';
import * as actions from '../../actions';
import {
  createUniqueID,
} from '../../utils/graphUtils';
import {
    DiscreteBinUtil
} from '../../utils/binUtils';

const BAR_COLOR = '#3690c0';
const BRUSH_COLOR  = 'red';
const SELECTION_COLOR = '#a88062';

class DiscreteBarChart extends React.Component {
    static get propTypes() {
      return {
        // data: PropTypes.array.isRequired,
        label: PropTypes.string.isRequired,
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
      };
    }

    constructor(props) {
      super(props);
      this.uid = createUniqueID(props);
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

    createChart(bins) {
        const {
            width,
            height,
            label,
            brush,
            brushedData,
        } = this.props;

        const {
            mappingTable,
            arrange,
        } = bins;

        this.brush = false;

        // svg config
        const margin = { top: 30, right: 10, bottom: 50, left: 50 };
        const svgWidth = width - margin.left - margin.right;
        const svgHeight = height - margin.top - margin.bottom;

        // bar config
        const rate = 0.6;
        const RECT_INTERVAL = 20;

        // selection config
        const minRectHeight = 100;

        // tag config
        const tagPadding = 10;

        // axis config
        const x = d3.scaleLinear()
                .range([0, svgWidth])
                .domain([0, 10]);
        const y = d3.scaleLinear()
                .range([svgHeight, 0])
                .domain([0, bins.maxBinSize()]);

        bins.formBars(svgWidth, svgHeight, rate);

        // graphics

        // create svg
        const svg = d3.select(this.root)
            .append('svg')
            .attr('xmlns', 'http://www.w3.org/2000/svg')
            .attr('width', width)
            .attr('height', height)
        ;

        // create chart
        const chart = svg.append('g')
            .attr('class', 'chart')
            .attr('transform',
                `translate( ${margin.left} , ${margin.top} )`)
        ;

        // bars

        const bar = chart.selectAll('g')
            .data(arrange)
            .enter().append('g')
            .attr('transform', (d, i) => `translate(${d[0].x},${y(bins.columnSize(i))})`)
            .style('cursor', 'pointer');

        // tag
        const tag = bar
            .append('text')
            .text((d, i) => `${d.type} ${d.length > 1? '& ...' : ''}`)
            .attr('transform', (d, i) => `translate(0,${svgHeight - y(bins.columnSize(i)) + tagPadding}), rotate(45)`)
            .style('text-anchor', 'center')
        //   .attr('textLength', d => (d[0].type.length / bins.maxTypeLength) * (margin.bottom - tagPadding))
            .text(d => `${d[0].type} ${d.length > 1 ? '& ...' : ''}`)
            .attr('lengthAdjust', 'spacingAndGlyphs')
            .attr('width', 20)
            .style('fill', 'black')
            .style('overflow', 'hidden')
            .style('font', '8px sans-serif')
            .on('click', this.TagClick.bind(this))
            .on('mouseenter', this.TagMouseEnter.bind(this))
            .on('mouseleave', this.TagMouseLeave.bind(this))
            .call(d3.drag()
                .on('start', this.TagClick_Drag.bind(this))
                .on('drag', this.SelectionDrag.bind(this))
                .on('end', this.TagDrop.bind(this))
            )
        ;

        // create brush rectangles
        const brushRect = bar.append('rect')
            .attr('x', e => -bins.unitWidth / 2)
            .attr('width', e => bins.unitWidth)
            .style('fill', BAR_COLOR)
            .attr('stroke', 'black')
        ;

        const rect = bar.selectAll('g')
            .data((d) => { return d; })
            .enter()
            .append('rect')
            .attr('class', 'rect')
            .attr('x', -bins.unitWidth / 2)
            .attr('y', (d, i) => {
                const value = arrange[mappingTable[d.type].x].reduce((acc, cur) => (mappingTable[cur.type].y > i ? acc + cur.value : acc), 0);
                return svgHeight - y(value);
            })
            .attr('width', bins.unitWidth)
            .attr('height', d => svgHeight - y(d.value))
            .style('fill', BAR_COLOR)
            .style('opacity', 0.8)
            .style('stroke', 'black')
            .on('click', this.RectClick.bind(this))
            .on('mouseenter', this.RectMouseEnter.bind(this))
            .on('mouseleave', this.RectMouseLeave.bind(this))
    //   .on('click', this.RectSolidClick.bind(this));
            .call(d3.drag()
                .on('start', this.SelectionClick.bind(this))
                .on('drag', this.SelectionDrag.bind(this))
                .on('end', this.SelectionDrop.bind(this))
            );
        ;

        // x Axis
        const xAxis = chart.append('g')
            .attr('transform', `translate(0,${svgHeight})`)
            .call(d3.axisBottom(x));
        xAxis.selectAll('.tick').remove();

        // y Axis
        const yAxis = chart.append('g')
            .call(d3.axisLeft(y))
            .append('text')
                .attr('transform', 'rotate(-90) translate(-30,0)')
                .attr('y', 6)
                .attr('dy', '.71em')
                .style('text-anchor', 'end')
                .style('fill', 'black')
                .text('# of people');

        // Tip
        const tipValue = chart.append('text')
            .style('display', 'none')
            .attr('text-anchor', 'middle')
            .style('font-size', '9px')
        ;

        const tipRange = chart.append('text')
            .style('display', 'none')
            .style('font-size', '9px')
        ;

        // set class-scope configuration
        this.config = {
            svgWidth,
            svgHeight,
            y,
            margin,
        };

        // set class-scope variable
        this.svg = svg;
        this.rect = rect;
        this.brushRect = brushRect;
        this.tag = tag;
        this.tip = [tipValue, tipRange];
    }

    createArrange(data, label, types) {
        if(data.length === 0 || types.length === 0) {
            return false;
        }
        const tree = DiscreteBinUtil.defaultBinning(types);
        if(!DiscreteBinUtil.assignData(data, label, tree)) {
            return false;
        }

        this.bins = new DiscreteBinUtil(tree);
        return true;
    }

    translate(element, query) {
        return d3.select(element.parentNode).selectAll(query).nodes();
    }

    canBrush() {
        return this.bins.selected.size <= 0;
    }

    updateTip(show, value, types) {
        const tipValue = this.tip[0];
        const tipRange = this.tip[1];
        const { svgWidth, svgHeight, margin} = this.config;
        const maxNumOfChars = 40;
        const fontSize = 9;
        const textPadding = -margin.top + 11;

        if(show) {
            tipValue
                .style('display', 'block')
                .attr('x', svgWidth / 2)
                .attr('y', textPadding)
                .text(`Value: ${value}`)
            ;

            const info = stringifyTypes(types);
            tipRange.selectAll('tspan').remove();
            tipRange
                .style('display', 'block')
                .attr('y', textPadding + fontSize)
            ;
            for(let i = 0; i < info.length; i += 1) {
                tipRange.append('tspan')
                    .attr('text-anchor', 'middle')
                    .text(info[i])
                    .attr('y', textPadding + (fontSize * (i + 1)))
                    .attr('x', svgWidth / 2);
                ;
            }

        } else {
            // tip should not be displayed in the page
            tipValue.style('display', 'none');
            tipRange.style('display', 'none');
        }

        function stringifyTypes(types) {
            const arr = [];
            let a = 'Types: ';
            for(let x = 0; x < types.length; x += 1) {
                if (types[x].length + 3 + a.length > maxNumOfChars && x !== types.length - 1) {
                    arr.push(a);
                    a = '';
                } else {
                    a += types[x] + (x === types.length - 1 ? '' : ' & ');
                }
            }
            arr.push(a);
            return arr;
        }
      }


    updateBrush() {
        const {
          svgHeight,
          y
        } = this.config;

        const {
            arrange,
            mappingTable,
        } = this.bins;
        // update brush rectangles
        this.brushRect
          .attr('height', e => svgHeight - y(e.reduce((acc, cur) => acc + cur.brush, 0)))
          .attr('y', (e, i) => -y(this.bins.columnSize(i)) + y(e.reduce((acc, cur) => acc + cur.brush, 0)));
    }

    updateSelection(x, displacement) {
        const {
            rect,
            bins,
        } = this;

        const {
            arrange,
            mappingTable,
        } = bins;

        rect
            .style('fill', d => bins.isSelected(d) ? SELECTION_COLOR : BAR_COLOR)
            .style('cursor', d => !bins.isSelected(d) ? 'pointer' : (
                this.bins.canDivide ? 'move' : 'ew-resize'
                // 'ew-resize'
            ))
        ;

        if(x) {
            rect.style('transform', d => `translate(${bins.isSelected(d) ? displacement : 0}px,0px)`);
        } else {
            rect.style('transform', d => `translate(0px,${bins.isSelected(d) ? (arrange[mappingTable[d.type].x].length > 1 ? displacement : 0) : 0}px)`);
        }
    }

    updateTag() {
        const {
            tag,
        } = this;

        const {
            arrange,
            mappingTable,
        } = this.bins;

        tag.style('cursor', (d, i) => {
            if (!this.bins.isColumSelected(d)) {
                return 'pointer';
            } else if (this.bins.canDivide) {
                return 'move';
            } else {
                return 'ew-resize';
            }
        });
    }

    TagClick(d, i, e) {
        const {
            brush,
            removeBrush,
        } = this.props;

        if(brush) {
            removeBrush();
        }

        if (!this.bins.isColumSelected(d)) {
            this.bins.selectColumn(i);
        } else {
            this.bins.unSelectColumn(i);
        }

        // render
        this.updateSelection(true, 0);
        this.updateTag();
        if (this.bins.selected.size > 0) {
            this.updateTip(true, this.bins.selectedSize(), this.bins.selectedTypes());
        } else {
            this.updateTip(false, null, null);
        }
    }

    SelectionClick(d, i) {
        this.currentX = d3.event.x;
        this.currentY = d3.event.y;
        this.direction = null;
        if (!this.bins.isSelected(d)) {
            this.canDrag = false;
        } else {
            this.canDrag = true;
        }
    }

    SelectionDrag() {
        // calculate mouse move
        const dx = d3.event.x - this.currentX;
        let dy = d3.event.y - this.currentY;

        if (!this.canDrag) {
            return;
        } else if (dx === 0 && dy === 0) {
            // remain when no move
            return;
        } else if(this.direction === 'y' && !this.bins.canDivide) {
            // no launch move when the selection is unqualified to do that
            return;
        } else if(dy > 0) {
            // no move when dragging down
            dy = 0;
        }

        switch(this.direction) {
            case 'x':
                this.updateSelection(true, dx);
                break;
            case 'y':
                this.updateSelection(false, dy);
                break;
            default:
                // determine moving direction
                if (Math.abs(dy) > 0.1 * Math.abs(dx)) {
                    this.direction = 'y';
                } else {
                    this.direction = 'x';
                }
        }
    }

    SelectionDrop(e) {
        const {
            arrange,
            mappingTable,
        } = this.bins;

        if (!this.canDrag) {
            // dragging non-selected elements
        } else if (this.direction === null){
            // direction has not be determined yet
        } else if (this.direction === 'y' && !this.bins.canDivide) {
            // dragging elements which cannot be divided
        } else {

            let update = false;
            // rearrange bins
            switch(this.direction) {
                case 'x':
                    const x = d3.event.x - this.currentX + arrange[mappingTable[e.type].x][0].x;
                    for(let i = 0; i < arrange.length; i += 1) {
                        if(x > arrange[i][0].x - (this.bins.unitWidth / 2) && x < arrange[i][0].x + (this.bins.unitWidth / 2) && i !== mappingTable[e.type].x) {
                            this.bins.move(i, arrange[i].length);
                            update = true;
                            break;
                        }
                    }
                    break;
                case 'y':
                    this.bins.move(arrange.length);
                    update = true;
                    break;
                default:

            }

            if(update) {
                // reset bins
                this.bins.reset();

                // recreate chart
                this.clear();
                this.createChart(this.bins);
            } else {
                this.updateSelection(true, 0);
            }

        }
    }

    TagClick_Drag(d, i, e) {
        this.currentX = d3.event.x;
        this.currentY = d3.event.y;
        this.direction = null;
        if (!this.bins.isColumSelected(d)) {
            this.canDrag = false;
        } else {
            this.canDrag = true;
        }
    }
    TagDrop(e) {
        this.SelectionDrop(e[0]);
    }

    TagMouseEnter(d, i, e) {
        const rects = this.translate(e[i], '.rect');
        // trigger another event
        this.RectMouseEnter(d[0], 0, rects);
    }

    TagMouseLeave(d, i, e) {
        const rects = this.translate(e[i], '.rect');
        // trigger another event
        this.RectMouseLeave(d[0], 0, rects);
    }

    RectMouseEnter(d, i, e) {
        if(this.canBrush()) {
            const bins = this.bins;
            const {
                arrange,
                mappingTable,
             } = bins;


            const { label, getData } = this.props;
            const data = getData();

            // render bar
            for(let y = 0; y < e.length; y += 1) {
                d3.select(e[y]).style('fill', BRUSH_COLOR);
            }

            // render tip
            this.updateTip(true, this.bins.columnSize(mappingTable[d.type].x), this.bins.columnTypes(mappingTable[d.type].x));

            // self brush start
            this.brush = true;

            // get brush types
            const column = mappingTable[d.type].x;
            const filteredTypes = Object.keys(mappingTable).filter(ele => mappingTable[ele].x !== column);
            filteredTypes.push(null);
            filteredTypes.push('');

            // filter
            // render brush area in other parts
            this.props.applyBrush(data, [{
                name: label,
                type: FILTER_CATEGORICAL,
                value: filteredTypes, // Take OUT types
            }]);
        }
    }

    RectMouseLeave(d, i, e) {
        if(this.canBrush()) {
            // render bar
            for(let y = 0; y < e.length; y += 1) {
                d3.select(e[y]).style('fill', BAR_COLOR);
            }

            // render tip
            this.updateTip(false);
            // if(!this.canDragSelect()) {
            //   this.updateDSTip(true, 0, this.bins.arrange.length);
            // }

            // self brush finished
            this.brush = false;

            // render brush area in other parts
            this.props.removeBrush();
        }
    }

    RectClick(d) {
        const {
            arrange,
            mappingTable,
        } = this.bins;

        const {
            brush,
            removeBrush,
        } = this.props;

        const {
            x,
            y,
        } = mappingTable[d.type];

        if(brush) {
            removeBrush();
        }
        // select if not selected, unselect if selected
        if(this.bins.selected.has(arrange[x][y])) {
            this.bins.unselect(x, y);
        } else {
            this.bins.select(x, y);
        }

        // render
        this.updateSelection(true, 0);
        this.updateTag();
        if (this.bins.selected.size > 0) {
            this.updateTip(true, this.bins.selectedSize(), this.bins.selectedTypes());
        } else {
            this.updateTip(false, null, null);
        }
    }

    clear() {
        this.svg.remove();
    }

    componentWillUnmount() {
        this.clear();
    }
    componentWillReceiveProps(nextProps) {
        const { label, getData, dataChanged, types, brush, brushedData } = nextProps;
        const data = getData();
        // create a new graph when data and filter changed
        if (dataChanged) {

            // clear old graph
            this.clear();

            // create new graph
            if (this.createArrange(data, label, types)) {
                this.createChart(this.bins);
            } else {
                this.createNoData();
            }
            return;

        }

        // brush data when brush update by others
        if(!this.brush) {
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
    componentWillMount() {
        const { label, getData, types } = this.props;
        const data = getData();
        this.nodata = !this.createArrange(data, label, types);
    }
    componentDidMount() {
        const {label} = this.props;
        if(this.nodata) {
            this.createNoData();
        } else {
            this.createChart(this.bins);
        }
        console.log(`graph ${label} finish preparing`, performance.now());
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

export default DiscreteBarChart;