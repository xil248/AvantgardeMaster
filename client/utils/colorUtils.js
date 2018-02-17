const DEFAULT_COLORS = [
  '#33a02c',
  '#a65628',
  '#a6cee3',
  '#b2df8a',
  '#fb9a99',
  '#e31a1c',
  '#984ea3',
  '#1f78b4',
];

/**
 * Utility class for colors. Currently used for stacks and singleton
 *
 * For stacks, colors should only be processed at the action
 * or reducer level, where other stacking logic is handled
 */
class ColorUtils {
  /**
   * Static comparator for sorting by number of times a color has been
   * used. The curry is used to accept object-specific data
   *
   * @param colorsCount: the hashmap of colors and their numbers
   * of times applied
   */
  static appliedTimesComparator(colorsCount) {
    return (a, b) => {
      return (colorsCount[a].applied <
              colorsCount[b].applied) ? -1 : 1;
    };
  }

  constructor() {
    this.colorsList = DEFAULT_COLORS;

    // Hashmap to store number of times color is used
    this.colorsCount = {};
    this.colorsList.forEach((color) => {
      this.colorsCount[color] = { applied: 0 };
    });

    this.getColor = this.getColor.bind(this);
    this.freeColor = this.freeColor.bind(this);
  }

  /**
   * Returns the next free color. Will recycle an old color after
   * going through all existing colors
   */
  getColor() {
    // Using colorsList to first list as properties are not guaranteed ordering
    const res =
      [...this.colorsList].sort(this.constructor.appliedTimesComparator(this.colorsCount))[0];

    this.colorsCount[res].applied = this.colorsCount[res].applied + 1;
    return res;
  }

  /**
   * Reduces the number of times applied of a certain color
   *
   * @param: The color to remove
   */
  freeColor(color) {
    if (!this.colorsCount[color]) {
      throw new Error('This color is not a color of ColorUtils');
    }
    if (this.colorsCount[color].applied === 0) {
      throw new Error('Attempting to free a color used 0 times');
    }

    this.colorsCount[color].applied =
      this.colorsCount[color].applied - 1;
  }
}

export default ColorUtils;
