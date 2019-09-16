export default class iStoryline {
  /**
   * Construct iStoryline generator
   *
   * @param {String} fileSrc
   * - "./data/JurassicPark.xml"
   * @param {Array} pipeline
   * - ['GreedyOrder', 'GreedyAlign', 'GreedyCompact', 'Render', 'Transform']
   */
  constructor(fileSrc, pipeline=[]) {
    this.fileSrc = fileSrc
    this.pipeline = pipeline
  }

  /**
   * Generate storyline visualizations
   *
   * @return graph
   */
  _layout() {}

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
  sort() {}

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
  bend() {}

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
  straighten() {}

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
  compress() {}

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
  expand() {}

  /**
   * Control white space
   *
   * @param {Number} intraSep
   * @param {Number} interSep
   *
   * @return graph
   */
  space() {}

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
  merge() {}

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
  split() {}

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
  adjust() {}

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