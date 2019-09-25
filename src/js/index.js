import iStoryline_test from "../../src/js/istoryline";
import { CharacterStore } from "./istoryline.character";
import { HitTest } from "./istoryline.hitTest";
import { storyOrder } from "./layout.order";
import { storyAlign } from "./layout.align";
import { storyCompress } from "./layout.compress";
import { distortion } from "./layout.distortion";
import { modifyLayout } from "./layout.render";

import { scaleLinear } from "d3-scale";
import { xml } from "d3-fetch";

export default class iStoryline extends CharacterStore {
  /**
   * Construct the iStoryline generator for a story.
   * Once the story changed, the generator should be re-constructed.
   *
   * @param {String} fileSrc
   * - "./data/JurassicPark.xml"
   * @param {Array} pipeline
   * - ['GreedyOrder', 'GreedyAlign', 'GreedyCompact', 'Render', 'Transform']
   */
  constructor(fileSrc, pipeline=[]) {
    // Pipeline configuration
    this.orderModule = pipeline[0] | 'GreedyOrder';
    this.alignModule = pipeline[1] | 'GreedyAlign';
    this.compactModule = pipeline[2] | 'GreedyCompact';
    this.renderModule = pipeline[3] | 'Render';
    this.transformModule = pipeline[4] | 'Transform';
    // Constraints for opimization models
    this.sortInfo = [];
    xml(fileSrc, (error, data) => {
      if (error) throw error;
      this.iStoryline.readXMLFile(data)
    });
  }

  /**
   * Generate storyline visualizations
   *
   * @return graph
   */
  _layout() {}

  _removeConflicts() {}

  /**
   * Rearrange the order of lines
   *
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['upperName', 'lowerName'],
   *   "timeSpan": [t1, t2]
   * }
   *
   * @return graph
   */
  sort(names, span, ctrs=[]) {
    if (ctrs.length > 0) {
      this.sortInfo = ctrs;
    } else if (names.length !== 2) {
      console.error('SortInfo should only contain two names.');
    } else if (span.length !== 2 || span[0] > span[1]) {
      console.error('Invalid time span in SortInfo');
    }
    this.sortInfo.push({
      'names': names,
      'timeSpan': span
    });
    this._removeConflicts(this.sortInfo);
    return this._layout();
  }

  /**
   * Bend a line
   *
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name'],
   *   "timeSpan": [t1, t2]
   * }
   *
   * @return graph
   */
  bend(bendInfo) {
    return this.iStoryline.bend(bendInfo);
  }

  /**
   * Straighten a line
   *
   * @param {Array} constraints
   * 
   * @example
   * - constraint: { 
   *   "names": ['name'],
   *   "timeSpan": [t1, t2]
   * }
   *
   * @return graph
   */
  straighten(straightenInfo) {
    return this.iStoryline.straighten(straightenInfo);
  }

  /**
   * Remove white space
   *
   * @param {Array} constraints
   * @param {Number} scale
   * 
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2', ...],
   *   "timeSpan": [t1, t2]
   * }
   * - scale: 0<<1
   *
   * @return graph
   */
  compress(compressInfo) {
    return this.iStoryline.compress(compressInfo);
  }

  /**
   * Expand white space
   *
   * @param {Array} constraints
   * @param {Number} scale
   * 
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2', ...],
   *   "timeSpan": [t1, t2]
   * }
   * - scale: >1
   *
   * @return graph
   */
  expand(expandInfo) {
    return this.iStoryline.expand(expandInfo);
  }

  /**
   * Control white space
   *
   * @param {Number} intraSep
   * @param {Number} interSep
   *
   * @return graph
   */
  space(intraSep,interSep) {
    return this.iStoryline.space(intraSep,interSep);
  }

  /**
   * Merge lines
   *
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2', ...],
   *   "timeSpan": [t1, t2]
   * }
   *
   * @return graph
   */
  merge(mergeInfo) {
    return this.iStoryline.merge(mergeInfo);
  }

  /**
   * Split merged lines
   *
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2', ...],
   *   "timeSpan": [t1, t2]
   * }
   *
   * @return graph
   */
  split(splitInfo) {
    return this.iStoryline.split(splitInfo);
  }

  /**
   * Change line paths
   *
   * @param {Array} constraints
   * @param {Array} points
   * 
   * @example
   * - constraint: {
   *   "names": ['name'],
   *   "timeSpan": [t1, t2]
   * }
   * - point: [x, y]
   *
   * @return graph
   */
  adjust(adjustInfo) {
    return this.iStoryline.adjust(adjustInfo);
  }

  /**
   * Relate lines acccording to the semantic connections
   *
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Twine' | 'Knot' | 'Collide'
   * }
   *
   * @return graph
   */
  relate() {}

  /**
   * Set the style of lines
   *
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Color' | 'Width' | 'Dash' | 'Zigzag' | 'Wave' | 'Bump'
   * }
   *
   * @return graph
   */
  stylish() {}

  /**
   * Reshape the layout of storyline visualization
   *
   * @param {Array} upperPoints
   * @param {Array} lowerPoints
   * 
   * @example
   * - points: [[x1, y1], [x2, y2], ...]
   *
   * @return graph
   */
  reshape() {}

  /**
   * Change the size of storyline visualization
   *
   * @param {Number} width
   * @param {Number} height
   * @param {Boolean} reserveRatio
   *
   * @return graph
   */
  scale() {}
}