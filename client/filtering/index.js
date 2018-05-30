/**
 * The filters module. This module will handle the data filtering
 * and return an updated state object (which will be returned by
 * the caller)
 */
import DataUtils from '../utils/dataUtils';
import {
  FILTER_CATEGORICAL,
  FILTER_CONTINUOUS,
  FILTER_BUCKETED,
  FILTER_DATE,
} from './filterTypes';

class Filters {
  constructor() {
    this.filters = [];
  }

  /**
   * Function that returns true if a filter has been applied for
   * a specific feature and false if not
   * // TODO: there might be minor bugs here regarding default
   * filters
   */
  isFilterApplied(feature) {
    const tmp = this.filters.filter((elem) => {
      return elem.name === feature;
    });

    // Nothing found by the name
    if (tmp.length === 0) return false;

    const thisFilter = tmp[0];

    // Return true if the filter is NOT applied
    return !this.isDefaultFilter(thisFilter);
  }

  /**
   * Function that checks if a filter doesn't actually do anything
   * (that is, it contains default values since we use soft deletion)
   */
  isDefaultFilter(filter) { // eslint-disable-line
    switch (filter.type) {
      case FILTER_CATEGORICAL: {
        return filter.value.length === 0;
      }
      case FILTER_CONTINUOUS:
      case FILTER_BUCKETED: {
        return (filter.minVal >= DataUtils.getMin(filter.name) &&
                filter.maxVal <= DataUtils.getMax(filter.name));
      }
      default: {
        return true;
      }
    }
  }

  /**
   * Function that takes care of removing empty filters and
   * updating the local filter utils state
   *
   * @param   filters: the props filters from Sidebar
   * @param   feature: the feature that filter is being added
   * @param   type:    the type (categorical or continuous)
   * @param   options: filter-type-specific options
   */
  handleUpdateFilters(filters, feature, type, options) {
    let updatedFilters = filters;

    switch (type) {
      case FILTER_CATEGORICAL: {
        // Make sure to only apply a val if it isn't default (which is no filter)
        const val = (options.attr !== 'default') ? options.attr : '';

        // If we are adding it
        if (!options.checked) {
          // If the filter has been applied already and we have a new one

          // Somehow this tmp is needed
          const tmp = filters.filter((elem) => { return elem.name === feature; });
          if (tmp.length) {
            filters.map((elem) => {
              if (elem.name === feature) elem.value.push(val);
              return elem;
            });
          } else {
            // If filter hasn't been applied before
            updatedFilters.push({
              name: feature,
              type: FILTER_CATEGORICAL,
              value: [val],
            });
          }
        } else {
          // Removal
          updatedFilters = filters.map((elem) => {
            // Remove entire element has only this element
            const res = elem;
            if (res.name === feature && res.value.includes(val)) {
              res.value.splice(res.value.indexOf(val), 1);
            }
            return res;
          });
        }
        break;
      }
      case FILTER_CONTINUOUS: {
        // Check for existing filter
        const tmp = filters.filter((elem) => { return elem.name === feature; });
        if (tmp.length) {
          for (let i = 0; i < filters.length; i += 1) {
            if (filters[i].name === feature) {
              updatedFilters[i] = {
                ...filters[i],
                type: FILTER_CONTINUOUS,
                minVal: options.minVal,
                maxVal: options.maxVal,
              };
            }
          }
        } else {
          // If filter hasn't been applied before
          updatedFilters.push({
            name: feature,
            type: FILTER_CONTINUOUS,
            minVal: options.minVal,
            maxVal: options.maxVal,
          });
        }

        // No removal case needed - minVal and maxVal will just reflect the
        // default max and min values when no input is provided
        break;
      }
      case FILTER_BUCKETED: {
        // This is currently done similarly to FILTER_CONTINUOUS as bucketed filters
        // are syntactically similar. The logic for bucketing is done in GraphContainer
        const tmp = filters.filter((elem) => { return elem.name === feature; });
        if (tmp.length) {
          for (let i = 0; i < filters.length; i += 1) {
            if (filters[i].name === feature) {
              updatedFilters[i] = {
                ...filters[i],
                type: FILTER_BUCKETED,
                minVal: options.minVal,
                maxVal: options.maxVal,
                numBuckets: options.numBuckets,
              };
            }
          }
        } else {
          // If filter hasn't been applied before
          updatedFilters.push({
            name: feature,
            type: FILTER_BUCKETED,
            minVal: options.minVal,
            maxVal: options.maxVal,
            numBuckets: options.numBuckets,
          });
        }
        break;
      }
      case FILTER_DATE: {
        const tmp = filters.filter(elem => elem.name === feature);
        if (tmp.length) {
          for (let i = 0; i < filters.length; i += 1) {
            if (filters[i].name === feature) {
              updatedFilters[i] = {
                ...filters[i],
                type: FILTER_DATE,
                startYear: options.startYear,
                endYear: options.endYear,
              };
            }
          }
        } else {
          // If filter hasn't been applied before
          updatedFilters.push({
            name: feature,
            type: FILTER_DATE,
            startYear: options.startYear,
            endYear: options.endYear,
          });
        }
        break;
      }
      default: {
        break;
      }
    }

    this.filters = updatedFilters;

    return updatedFilters;
  }

  /**
   * Function that handles filtering logic
   *
   * @param   data: all the data to be filtered
   * @param   filters: the global redux state of filters
   */
  filtering(data, filters) { // eslint-disable-line
    /**
     * Inputs:
     *   data: List of JSON objects to filter
     *     example: data = [
     *                {
     *                  name: 'Joe',
     *                  ...
     *                },
     *                ...
     *              ]
     *   filters: The filters to apply.
     *     example: filters = [
     *       {
     *         name: 'SexualOrient',
     *         type: FILTER_CATEGORICAL,
     *         value: ['Bi', 'Het'], // Take OUT 'Bi', 'Het'
     *       },
     *       {
     *         name: 'Alcohol',
     *         type: FILTER_CONTINUOUS,
     *         minVal: 1,
     *         maxVal: 24,
     *       },
     *       {
     *         name: 'Age',
     *         type: FILTER_BUCKETED,
     *         buckets: [
     *          { minVal: null, maxVal: 20 },
     *          { minVal: 20, maxVal: 30 },
     *          { minVal: 30, maxVal: null },
     *        ]
     *      },
     *      {
     *         name: 'date',
     *         type: FILTER_DATE,
     *         startYear: 2000,
     *         endYear: 2012,
     *      },
     *    ]
     */
    // Filter each data item
    return data.filter((elem) => {
      let show = true;

      filters.forEach((eachFilter) => {
        switch (eachFilter.type) {
          case FILTER_CATEGORICAL: {
            show = show && eachFilter.value.indexOf(elem[eachFilter.name]) === -1;
            break;
          }
          case FILTER_CONTINUOUS: {
            show = (show && elem[eachFilter.name] >= eachFilter.minVal &&
                   elem[eachFilter.name] < eachFilter.maxVal);
            break;
          }
          case FILTER_BUCKETED: {
            show = (show && elem[eachFilter.name] >= eachFilter.minVal &&
                   elem[eachFilter.name] < eachFilter.maxVal);
            break;
          }
          case FILTER_DATE: {
            const date = new Date(elem[eachFilter.name]);

            // Make sure it is a valid date
            show = !isNaN(date.valueOf());

            show = (show && date.getFullYear() >= eachFilter.startYear && date.getFullYear() < eachFilter.endYear);
            break;
          }
          default:
        }
      });
      return show;
    });
  }

  /**
   * Function that create arrange for data
   *
   * @param   data: all the data to be arranged
   * @param   arrange: the arrange returned
   */

   /*
    arrange: [
      {min: 20, max: 30}
      {min: 30, max: 40}
      {min: 50, max: 70}
    ]
   */
  // arrange(data, arrange, num) {

  // }


}

export default new Filters();
