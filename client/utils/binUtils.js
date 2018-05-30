export class ContinuousBinUtil {
  constructor(data, label) {
    this.data = data.filter((a) => {
      return a[label] !== null && a[label] !== undefined;
    });
    this.data = this.data.sort((a, b) => {
      return a[label] - b[label];
    });

    // initialization
    this.reset();
  }

  /**
   * assign width and x-position to arrange
   * @param width(number): the width of the graph
   * @param rectInterval(number): the distance remained before and after bars
   */
  formBars(width, rectInterval) {
    // the width of interval
    const arrange = this.arrange;
    const unitWidth = (width - (2 * rectInterval)) / (arrange[arrange.length - 1].max - arrange[0].min);

    // calculate the position of mid point of bar on x-axis
    let start = rectInterval;
    for (let i = 0; i < arrange.length; i += 1) {
      const length = (arrange[i].max - arrange[i].min) * unitWidth;
      start += length;
      arrange[i].x = start - (length / 2);
      arrange[i].width = length;
    }

    this.unitWidth = unitWidth;
  }


  /**
   * get the size of bin with most elements in it
   */
  maxBinSize() {
    const arrange = this.arrange;
    let max = 0;
    arrange.forEach((e) => {
      const num = ContinuousBinUtil.size(e);
      max = num > max ? num : max;
    });
    return max;
  }

  /**
   * brush values on the bins
   */
  brush(brushedData, label) {
    const arrange = this.arrange;
    arrange.forEach((e) => {
      e.brush = 0;
      if (brushedData !== null) {
        e.brush += brushedData.filter((a) => {
          return a[label] !== null && a[label] >= e.min && a[label] < e.max;
        }).length;
      }
    });
  }

  reset() {
    this.selected = -1;
  }
}

/**
 * Create arrange based on fixed number of bins
 * @param min(int): minimum value of the label in the dataset
 * @param max(int): maximum value of the label in the dataset
 * @param numBins(int): the number of bins wanted to be divided
 * @returns an array of arrange objects
 */
ContinuousBinUtil.fixedNumBinning = (min, max, numBins) => {
  const arrange = [];
  let numOfBins = numBins;

  // edge case 1: max and min cannot be divided into bins
  if ((max - min) / numOfBins < 1) {
    numOfBins = max - min;
  }

  // calculate range and binSize
  const range = max - min;
  const binSize = parseInt(range / numOfBins, 10);

  // calculate where to start to add 1
  const remain = range % numOfBins;
  const hill = numOfBins - remain;

  // get the arrange
  let minNum = min;
  for (let i = 0; i < numOfBins; i += 1) {
    const maxNum = i >= hill ? minNum + binSize + 1 : minNum + binSize;
    arrange.push({ min: minNum, max: maxNum });
    minNum = maxNum;
  }
  return arrange;
};


/**
 *
 * Create arrange using Freedman Binning algorithm
 *
 */
ContinuousBinUtil.freedmanBinning = (min, max, iqr, size) => {
  const arrange = [];

  // calculate numOfBins and binSize
  const binSize = iqr === 0 ? 1 : Math.ceil((2 * iqr) / (size ** (1 / 3)));
  const numOfBins = binSize === 0 ? max - min : Math.ceil((max - min) / binSize);

  // get the arrange
  let minNum = min;
  for (let i = 0; i < numOfBins; i += 1) {
    let maxNum = minNum + binSize;
    maxNum = maxNum > max ? max : maxNum;
    arrange.push({ min: minNum, max: maxNum });
    minNum = maxNum;
  }
  return arrange;
};

/**
 * Get a new Arrange array after a single execution on the model
 * @param {array} oldArrange old arrange array
 * @param {int} index the index of the bin
 * @param {int} min the max of changed bin
 * @param {int} max the min of changed bin
 */
ContinuousBinUtil.customBinning = (oldArrange, min, max) => {
  // edge case when changed bin is empty
  if (min === max) {
    return oldArrange;
  }

  const arrange = [];
  let i = 0;

  // find the index of bin first not fully covered by the changed bin from left
  for (; i < oldArrange.length; i += 1) {
    if (oldArrange[i].min < min) {
      arrange.push({ min: oldArrange[i].min, max: oldArrange[i].max, start: oldArrange[i].start, end: oldArrange[i].end });
    } else {
      break;
    }
  }

  // change the max of element if not the first
  if (i !== 0) {
    arrange[i - 1].max = min;
  }

  // add the changed bin
  arrange.push({ min, max });

  // find the index of bin first not fully covered by the changed bin from right
  for (; i < oldArrange.length; i += 1) {
    if (oldArrange[i].max > max) {
      arrange.push({ min: max, max: oldArrange[i].max });
      i += 1;
      break;
    }
  }


  // go over remained elements
  for (; i < oldArrange.length; i += 1) {
    arrange.push({ min: oldArrange[i].min, max: oldArrange[i].max, start: oldArrange[i].start, end: oldArrange[i].end });
  }

  return arrange;
};

/**
 *
 * Assign unordered data into bins based on arrange
 *
 */
ContinuousBinUtil.assignData = (data, label, arrange) => {
  // get num of data based on arrange
  arrange.forEach((e) => {
    e.data = data.filter((a) => {
      if (a[label] >= e.min && a[label] < e.max) {
        return true;
      }
      return false;
    });
  });
  return arrange;
};

/**
 * assign range to arrange obj by setting start and end
 * @param {array} data ordered data set based on label
 * @param {String} label property based on
 * @param {array} arrange to be modified
 */
ContinuousBinUtil.assignOrderedData = (data, label, arrange) => {
  const newArrange = arrange;
  let pointer = 0;
  for (let i = 0; i < arrange.length; i += 1) {
    newArrange[i].start = pointer;

    // loop until pointer >= data's length || value at pointer > ith arrange's max
    while (pointer < data.length && data[pointer][label] < arrange[i].max) {
      pointer += 1;
    }

    newArrange[i].end = pointer - 1;
  }
  return newArrange;
};

/**
 * get the inter quartile range of an ordered dataset
 */
ContinuousBinUtil.iqr = (data, label) => {
  const quartile1 = parseInt(data.length / 4, 10);
  const quartile2 = parseInt((data.length / 4) * 3, 10);
  return data[quartile2][label] - data[quartile1][label];
};

/**
 * calculate the size of a bin
 * @param {object} e arrange object in arrange with props start and end
 */
ContinuousBinUtil.size = (e) => {
  return (e.end + 1) - e.start;
};

/**
 * compare two arrange to see whether they are the same
 */
ContinuousBinUtil.compare = (a, b) => {
  if (a.length !== b.length) {
    return false;
  }
  return true;
};

/**
 * Find the approxiamte int of a number
 * @param {number} num number to be approximated
 * @param {number} percentage float from 0 - 1
 * @param {bool} up determine what should be assigned if not in the approximation range of both
 */
ContinuousBinUtil.approximateInt = (num, percentage, up) => {
  const a = Math.floor(num);
  const b = Math.ceil(num);

  let value = up ? b : a;
  if (num > 0) {
    if (num < a * (1 + percentage) && num > a * (1 - percentage)) {
      value = a;
    }
    if (num < b * (1 + percentage) && num > b * (1 - percentage)) {
      value = b;
    }
  } else {
    if (num > a * (1 + percentage) && num < a * (1 - percentage)) {
      value = a;
    }
    if (num > b * (1 + percentage) && num < b * (1 - percentage)) {
      value = b;
    }
  }

  return value;
};


/** Discrete Bin Util*/
export class DiscreteBinUtil {
  constructor(tree) {
    this.arrange = tree[0];
    this.mappingTable = tree[1];
    this.selected = new Set([]);
    this.canDivide = false;
  }

  maxBinSize() {
    let max = 0;
    for (let i = 0; i < this.arrange.length; i += 1) {
      let value = 0;
      for (let j = 0; j < this.arrange[i].length; j += 1) {
        value += this.arrange[i][j].value;
      }
      max = max > value ? max : value;
    }
    return max;
  }

  mostCharNum() {
    let num = 0;
    Object.keys(this.mappingTable).forEach((e) => {
      num = num > e.length ? num : e.length;
    });
    return num;
  }

  columnTypes(i) {
    const arr = [];
    for (let y = 0; y < this.arrange[i].length; y += 1) {
      arr.push(this.arrange[i][y].type);
    }
    return arr;
  }

  columnSize(i) {
    const column = this.arrange[i];
    let value = 0;
    for (let y = 0; y < column.length; y += 1) {
      value += column[y].value;
    }
    console.log(value);
    return value;
  }

  /**
   * assign width and x-position to arrange
   * @param width(number): the width of the graph
   * @param rectInterval(number): the distance remained before and after bars
   */
  formBars(width, height, rate) {
    // the width of interval
    const arrange = this.arrange;
    const unitWidth = width / (arrange.length + (rate * (arrange.length + 1)));
    const unitHeight = height / this.maxBinSize();
    console.log(unitWidth, unitHeight);
    // calculate the position of mid point of bar on x-axis
    const start = (0.5 + rate) * unitWidth;
    for (let x = 0; x < arrange.length; x += 1) {
      let posY = height;
      for (let y = 0; y < arrange[x].length; y += 1) {
        arrange[x][y].x = start + (x * ((1 + rate) * unitWidth));
        posY -= arrange[x][y].value * unitHeight;
        arrange[x][y].y = posY;
      }
    }
    this.unitWidth = unitWidth;
    this.unitHeight = unitHeight;
    this.maxTypeLength = this.mostCharNum();
  }

  /**
   * brush values on the bins
   */
  brush(brushedData, label) {
    const arrange = this.arrange;
    const mappingTable = this.mappingTable;
    Object.keys(mappingTable).forEach((e) => {
      const element = arrange[mappingTable[e].x][mappingTable[e].y];
      element.brush = 0;
      if (brushedData !== null) {
        element.brush += brushedData.reduce((acc, cur) => {
          return cur[label] === element.type ? acc + 1 : acc;
        }, 0);
      }
    });
  }

  select(x, y) {
    this.selected.add(this.arrange[x][y]);
    this.calcCanDivide();
  }

  selectColumn(x) {
    for (let i = 0; i < this.arrange[x].length; i += 1) {
      this.select(x, i);
    }
  }

  unselect(x, y) {
    this.selected.delete(this.arrange[x][y]);
    this.calcCanDivide();
  }

  unSelectColumn(x) {
    for (let i = 0; i < this.arrange[x].length; i += 1) {
      this.unselect(x, i);
    }
  }

  selectedSize() {
    let value = 0;
    this.selected.forEach((e) => {
      value += e.value;
    });
    return value;
  }

  selectedTypes() {
    const value = [];
    this.selected.forEach((e) => {
      value.push(e.type);
    });
    return value;
  }

  calcCanDivide() {
    this.canDivide = true;
    this.selected.forEach((d) => {
      this.canDivide = this.arrange[this.mappingTable[d.type].x].length > 1 ? (this.canDivide && true) : false;
    });
  }

  reset() {
    this.selected.clear();
    this.calcCanDivide();
  }

  isSelected(arrangeObj) {
    return this.selected.has(arrangeObj);
  }

  isColumSelected(columnArray) {
    return columnArray.every(e => this.isSelected(e));
  }

  move(x) {
    const {
      arrange,
      mappingTable,
    } = this;

    if (x < arrange.length) {
      // no new bins
      const col = arrange[x];

      // deletion
      for (let i = arrange.length - 1; i >= 0; i -= 1) {
        for (let j = arrange[i].length - 1; j >= 0; j -= 1) {
          if (this.isSelected(arrange[i][j])) {
            arrange[i].splice(j, 1);
          }
        }
        if (arrange[i].length === 0 && arrange[i] !== col) {
          arrange.splice(i, 1);
        }
      }

      // insertion
      this.selected.forEach((e) => {
        col.splice(col.length, 0, e);
      });

      console.log(JSON.stringify(arrange));
    } else {
      // new bins

      // deletion
      for (let i = arrange.length - 1; i >= 0; i -= 1) {
        for (let j = arrange[i].length - 1; j >= 0; j -= 1) {
          if (this.isSelected(arrange[i][j])) {
            arrange[i].splice(j, 1);
          }
        }
        if (arrange[i].length === 0) {
          arrange.splice(i, 1);
        }
      }

      // insertion
      this.selected.forEach((e) => {
        // find the position to insert
        // let newX = arrange.length;
        // for (let i = 0; i < arrange.length; i += 1) {
        //   if (arrange[i][0] && arrange[i][0].type > e.type) {
        //     newX = i;
        //     break;
        //   }
        // }
        // create new bins and insert
        arrange.splice(arrange.length, 0, [e]);
      });
    }

    arrange.sort((a, b) => a[0].type > b[0].type);

    // update mapping table and max length
    for (let i = 0; i < arrange.length; i += 1) {
      for (let j = 0; j < arrange[i].length; j += 1) {
        mappingTable[arrange[i][j].type].x = i;
        mappingTable[arrange[i][j].type].y = j;
      }
    }
    // console.log(JSON.stringify(arrange));
  }
}

DiscreteBinUtil.defaultBinning = (types) => {
  const arrange = [];
  const mappingTable = {};
  // const types = features.filter(value => (value && value.toString().trim()));
  if (types.length === 0) {
    return false;
  }
  types.sort();
  for (let i = 0; i < types.length; i += 1) {
    arrange.push([{ type: types[i], value: 0 }]);
    mappingTable[types[i]] = { x: i, y: 0 };
  }
  return [arrange, mappingTable];
};

DiscreteBinUtil.assignData = (data, label, tree) => {
  const arrange = tree[0];
  const mappingTable = tree[1];
  let hasData = false;
  data.forEach((elem) => {
    const feature = elem[label];
    if (mappingTable[feature]) {
      hasData = true;
      arrange[mappingTable[feature].x][mappingTable[feature].y].value += 1;
    }
  });

  return hasData;
};
