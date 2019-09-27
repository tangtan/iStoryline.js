import { CharacterStore } from "./istoryline.character";
import { storyOrder } from "./layout.order";
import { storyAlign } from "./layout.align";
import { storyCompact } from "./layout.compress";
import { storyRender } from "./layout.render";
import { storyTransform } from "./layout.transform";
import { HitTest } from "./istoryline.hitTest";

import { logNameError, logTimeError } from "./utils";
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
      this.graph = null;
    });
  }

  /**
   * Generate storyline visualizations
   *
   * @return graph
   */
  _layout(inSep=10, outSep=10, upperPath=[], lowerPath=[]) {
    let sequence = storyOrder(this.orderModule);
    let alignedSession = storyAlign(this.alignModule);
    let initialGraph = storyCompact(this.compactModule);
    let renderGraph = storyRender(this.renderModule);
    let storyGraph = storyTransform(this.transformModule);
    return storyGraph;
  }

  _removeConflicts() {}

  /**
   * Rearrange the order of lines
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['upperName', 'lowerName'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Sort',
   *   "param": {}
   * }
   *
   * @return graph
   */
  sort(names, span, ctrs=[]) {
    // check params
    if (ctrs.length > 0) {
      this.sortInfo = ctrs;
    } else if (logNameError('Sort', names, 2) && logTimeError('Sort', span)) {
      this.sortInfo.push({
        'names': names,
        'timeSpan': span,
        'style': 'Sort',
        'param': {}
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.sortInfo);
    return this._layout();
  }

  /**
   * Bend a line
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Bend',
   *   "param": {}
   * }
   *
   * @return graph
   */
  bend(names, span, ctrs=[]) {
    // check params
    if (ctrs.length > 0) {
      this.bendInfo = ctrs;
    } else if (logNameError('Bend', names, 1) && logTimeError('Bend', span)) {
      this.bendInfo.push({
        'names': names,
        'timeSpan': span,
        'style': 'Bend',
        'param': {}
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.bendInfo);
    return this._layout();
  }

  /**
   * Straighten a line
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {Array} constraints
   * 
   * @example
   * - constraint: { 
   *   "names": ['name'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Straighten',
   *   "param": {}
   * }
   *
   * @return graph
   */
  straighten(straightenInfo) {
    // check params
    if (ctrs.length > 0) {
      this.straightenInfo = ctrs;
    } else if (logNameError('Straighten', names, 1) && logTimeError('Straighten', span)) {
      this.straightenInfo.push({
        'names': names,
        'timeSpan': span,
        'style': 'Straighten',
        'param': {}
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.straightenInfo);
    return this._layout();
  }

  /**
   * Remove white space
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {Number} scale
   * @param {Array} constraints
   * 
   * @example
   * - scale: 0<<1
   * - constraint: {
   *   "names": ['name1', 'name2', ...],
   *   "timeSpan": [t1, t2],
   *   "style": 'Compact',
   *   "param": { 'scale': 0.5 }
   * }
   *
   * @return graph
   */
  compact(names, span, scale=0.5, ctrs=[]) {
    // check params
    if (ctrs.length > 0) {
      this.compactInfo = ctrs;
    } else if (logNameError('Compact', names) && logTimeError('Compact', span)) {
      this.compactInfo.push({
        'names': names,
        'timeSpan': span,
        'style': 'Compact',
        'param': { 'scale': 0.5 }
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.compactInfo);
    return this._layout();
  }

  /**
   * Expand white space
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {Number} scale
   * @param {Array} constraints
   * 
   * @example
   * - scale: >1
   * - constraint: {
   *   "names": ['name1', 'name2', ...],
   *   "timeSpan": [t1, t2],
   *   "style": 'Expand',
   *   "param": {}
   * }
   *
   * @return graph
   */
  expand(names, span, scale=2, ctrs=[]) {
    // check params
    if (ctrs.length > 0) {
      this.extendInfo = ctrs;
    } else if (logNameError('Extend', names) && logTimeError('Extend', span)) {
      this.extendInfo.push({
        'names': names,
        'timeSpan': span,
        'style': 'Expand',
        'param': { 'scale': 2 }
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.extendInfo);
    return this._layout();
  }

  /**
   * Control white space
   *
   * @param {Number} intraSep
   * @param {Number} interSep
   *
   * @return graph
   */
  space(intraSep, interSep) {
    return this._layout(inSep=intraSep, outSep=interSep);
  }

  /**
   * Merge lines
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2', ...],
   *   "timeSpan": [t1, t2],
   *   "style": 'Merge',
   *   "param": {}
   * }
   *
   * @return graph
   */
  merge(names, span, ctrs=[]) {
    // check params
    if (ctrs.length > 0) {
      this.mergeInfo = ctrs;
    } else if (logNameError('Merge', names) && logTimeError('Merge', span)) {
      this.mergeInfo.push({
        'names': names,
        'timeSpan': span,
        'style': 'Merge',
        'param': {}
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.mergeInfo);
    return this._layout();
  }

  /**
   * Split merged lines
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2', ...],
   *   "timeSpan": [t1, t2],
   *   "style": 'Split',
   *   "param": {}
   * }
   *
   * @return graph
   */
  split(names, span, ctrs=[]) {
    // check params
    if (ctrs.length > 0) {
      this.splitInfo = ctrs;
    } else if (logNameError('Split', names) && logTimeError('Split', span)) {
      this.splitInfo.push({
        'names': names,
        'timeSpan': span,
        'style': 'Split',
        'param': {}
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.splitInfo);
    return this._layout();
  }

  /**
   * Change line paths
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {Point[]} path
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Adjust',
   *   "param": {'path': [[x1, y1], [x2, y2], ...]}
   * }
   * - point: [x, y]
   *
   * @return graph
   */
  adjust(names, span, path, ctrs) {
      // check params
    if (ctrs.length > 0) {
      this.adjustInfo = ctrs;
    } else if (logNameError('Split', names) && logTimeError('Split', span)) {
      this.adjustInfo.push({
        'names': names,
        'timeSpan': span,
        'style': 'Adjust',
        'param': { 'path': path }
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.adjustInfo);
    return this._layout();
  }

  /**
   * Relate lines acccording to the semantic connections
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {String} style
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Twine' | 'Knot' | 'Collide',
   *   "param": {}
   * }
   *
   * @return graph
   */
  relate(names, span, style, ctrs) {
    // check params
    if (ctrs.length > 0) {
      this.relateInfo = ctrs;
    } else if (logNameError('Relate', names, 2) && logTimeError('Relate', span)) {
      this.relateInfo.push({
        'names': names,
        'timeSpan': span,
        'style': style,
        'param': {}
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.relateInfo);
    return this._layout();
  }

  /**
   * Set the style of lines
   *
   * @param {String[]} names
   * @param {Number[]} span
   * @param {String} style
   * @param {Array} constraints
   * 
   * @example
   * - constraint: {
   *   "names": ['name'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Color' | 'Width' | 'Dash' | 'Zigzag' | 'Wave' | 'Bump',
   *   "param": {}
   * }
   *
   * @return graph
   */
  stylish(names, span, style, ctrs=[]) {
    // check params
    if (ctrs.length > 0) {
      this.stylishInfo = ctrs;
    } else if (logNameError('Stylish', names, 2) && logTimeError('Stylish', span)) {
      this.stylishInfo.push({
        'names': names,
        'timeSpan': span,
        'style': style,
        'param': {}
      });
    }
    // remove conflicted timeSpans
    this._removeConflicts(this.stylishInfo);
    return this._layout();
  }

  /**
   * Reshape the layout of storyline visualization
   *
   * @param {Point[]} upperPath
   * @param {Point[]} lowerPath
   * 
   * @example
   * - points: [[x1, y1], [x2, y2], ...]
   *
   * @return graph
   */
  reshape(upperPath, lowerPath) {
    return this._layout(upperPath=upperPath, lowerPath=lowerPath);
  }

  /**
   * Change the size of storyline visualization
   *
   * @param {Number} width
   * @param {Number} height
   * @param {Boolean} reserveRatio
   *
   * @return graph
   */
  scale(width, height, reserveRatio=false) {
    return this._layout(width, height, reserveRatio);
  }
}