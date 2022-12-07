// Generators
import { storyOrder } from './order/index'
import { storyAlign } from './align/index'
import { storyCompact } from './compact/index'
import { storyRender } from './render/index'
import { storyTransform } from './transform/index'
// Data structure
import { ConstraintStore } from './data/constraint'
import { Graph } from './data/graph'
import { Story } from './data/story'
// Utils
import { logConstraintError } from './utils/logger'

export default class iStoryline {
  /**
   * Construct a iStoryline generator for a story.
   * Once the story changed, the generator should be re-constructed.
   *
   * @param {Array} pipeline
   * - ['GreedyOrder', 'GreedyAlign', 'GreedySlotCompact', 'SmoothRender', 'FreeTransform']
   */
  constructor(
    pipeline = [
      'GreedyOrder',
      'GreedyAlign',
      'GreedySlotCompact',
      'SmoothRender',
      'FreeTransform',
    ]
  ) {
    this._pipeline = pipeline
    this._story = new Story()
    this._constraintStore = new ConstraintStore()
  }

  /**
   * Generate storyline visualizations from the input file.
   *
   * @param {String} fileUrl
   * - "./data/JurassicPark.xml"
   */
  // async loadFile(fileUrl, fileType = 'xml') {
  //   await this._story.loadFile(fileUrl, fileType)
  //   return this._layout()
  // }

  /**
   * Generate storyline visualizations from the input json.
   *
   * @param {Object} storyJson
   * - https://github.com/tangtan/iStoryline.js/wiki/Story-Script
   */
  load(storyJson) {
    this._story.loadJson(storyJson)
    return this._layout()
  }

  _layout() {
    const { _story, _constraintStore, _pipeline } = this
    const _constraints = _constraintStore.constraints
    // Order
    this.orderGenerator = _pipeline[0] || null
    if (this.orderGenerator) {
      storyOrder(this.orderGenerator, _story, _constraints)
    }
    // Align
    this.alignGenerator = _pipeline[1] || null
    if (this.alignGenerator) {
      storyAlign(this.alignGenerator, _story, _constraints)
    }
    // Compact
    this.compactGenerator = _pipeline[2] || null
    if (this.compactGenerator) {
      storyCompact(this.compactGenerator, _story, _constraints)
    }
    // Render
    this.renderGenerator = _pipeline[3] || null
    if (this.renderGenerator) {
      storyRender(this.renderGenerator, _story, _constraints)
    }
    // Transform
    this.transformGenerator = _pipeline[4] || null
    if (this.transformGenerator) {
      storyTransform(this.transformGenerator, _story, _constraints)
    }
    return new Graph(_story)
  }

  // Only enable download json file.
  dump(fileName) {
    this._story.dump(fileName, 'json')
  }

  addCharacter(character, timeRange) {
    this._story.addCharacter(character, timeRange)
    return this._layout()
  }

  changeCharacter(character, timeRange) {
    this._story.changeCharacter(character, timeRange)
    return this._layout()
  }

  deleteCharacter(character) {
    this._story.deleteCharacter(character)
    return this._layout()
  }

  addSession(characters, timeSpan) {
    const newSessionID = this._story.getNewSessionID()
    this._story.changeSession(newSessionID, characters, timeSpan)
    return this._layout()
  }

  removeSession(sessionID) {
    this._story.deleteSession(sessionID)
    return this._layout()
  }

  addLocation(location, characters, timeRange) {
    this._story.changeLocation(location, characters, timeRange)
    return this._layout()
  }

  removeLocation(location) {
    this._story.changeLocation(location)
    return this._layout()
  }

  /**
   * Rearrange the order of characters
   *
   * @param {String[]} names
   * @param {Number[]} timeSpan
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
  sort(names, timeSpan) {
    if (names.length > 1 && timeSpan.length === 2) {
      this._constraintStore.add(names, timeSpan, 'Sort', {})
    } else {
      logConstraintError('Sort')
    }
    return this._layout()
  }

  /**
   * Bend character lines
   *
   * @param {String[]} names
   * @param {Number[]} timeSpan
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
  bend(names, timeSpan) {
    if (
      names.length === 1 &&
      timeSpan.length === 2 &&
      timeSpan[0] === timeSpan[1]
    ) {
      this._constraintStore.add(names, timeSpan, 'Bend', {})
    } else {
      logConstraintError('Bend')
    }
    return this._layout()
  }

  /**
   * Straighten character lines
   *
   * @param {String[]} names
   * @param {Number[]} timeSpan
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
  straighten(names, timeSpan) {
    if (
      names.length === 1 &&
      timeSpan.length === 2 &&
      timeSpan[0] !== timeSpan[1]
    ) {
      this._constraintStore.add(names, timeSpan, 'Straighten', {})
    } else {
      logConstraintError('Straighten')
    }
    return this._layout()
  }

  /**
   * Remove white space
   *
   * @param {String[]} names
   * @param {Number[]} timepan
   * @param {Number} scale
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
  compress(names, timeSpan, scale = 0.5) {
    if (names.length === 2 && timeSpan.length === 2) {
      this._constraintStore.add(names, timeSpan, 'Compress', { scale: scale })
    } else {
      logConstraintError('Compress')
    }
    return this._layout()
  }

  /**
   * Expand white space
   *
   * @param {String[]} names
   * @param {Number[]} timeSpan
   * @param {Number} scale
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
  expand(names, timeSpan, scale = 2) {
    if (names.length === 2 && timeSpan.length === 2) {
      this._constraintStore.add(names, timeSpan, 'Expand', { scale: scale })
    } else {
      logConstraintError('Expand')
    }
    return this._layout()
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
    this._constraintStore.add([], [], 'Space', {
      intraSep: intraSep,
      interSep: interSep,
    })
    return this._layout()
  }

  /**
   * Change line paths
   *
   * @param {String[]} names
   * @param {Number[]} timeSpan
   * @param {Point[]} path
   * @param {Array} constraints
   *
   * @example
   * - constraint: {
   *   "names": ['name'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Adjust',
   *   "param": {'path': [x1, y1, x2, y2, ...]}
   * }
   *
   * @return graph
   */
  adjust(names, timeSpan, path) {
    if (
      names.length === 1 &&
      timeSpan.length === 2 &&
      timeSpan[1] > timeSpan[0]
    ) {
      this._constraintStore.add(names, timeSpan, 'Adjust', { path: path })
    } else {
      logConstraintError('Adjust')
    }
    return this._layout()
  }

  /**
   * Relate lines acccording to the semantic connections
   *
   * @param {String[]} names
   * @param {Number[]} timeSpan
   * @param {String} style
   * @param {Array} constraints
   *
   * @example
   * - constraint: {
   *   "names": ['name1', 'name2'],
   *   "timeSpan": [t1, t2],
   *   "style": 'Twine' | 'Knot' | 'Collide' | 'Merge' | 'Split',
   *   "param": {}
   * }
   *
   * @return graph
   */
  relate(names, timeSpan, style) {
    if (names.length === 2 && timeSpan.length === 2) {
      this._constraintStore.add(names, timeSpan, style, {})
    } else {
      logConstraintError('Relate')
    }
    return this._layout()
  }

  /**
   * Set the style of lines
   *
   * @param {String[]} names
   * @param {Number[]} timeSpan
   * @param {String} style
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
  stylish(names, timeSpan, style) {
    if (names.length === 1 && timeSpan.length === 2) {
      this._constraintStore.add(names, timeSpan, style, {})
    } else {
      logConstraintError('Stylish')
    }
    return this._layout()
  }

  /**
   * Reshape the layout.
   *
   * @param {Number[]} upperPath
   * @param {Number[]} lowerPath
   *
   * @example
   * - path: [x1, y1, x2, y2, ...]
   *
   * @return graph
   */
  reshape(upperPath = [], lowerPath = []) {
    this._constraintStore.add([], [], 'Reshape', {
      upperPath: upperPath,
      lowerPath: lowerPath,
    })
    return this._layout()
  }

  /**
   * Change the size of storyline visualization
   *
   * @param {Number} x0
   * @param {Number} y0
   * @param {Number} width
   * @param {Number} height
   * @param {Boolean} reserveRatio
   *
   * @return graph
   */
  scale(x0 = 0, y0 = 0, width = 1000, height = 372, reserveRatio = false) {
    this._constraintStore.add([], [], 'Scale', {
      x0: x0,
      y0: y0,
      width: width,
      height: height,
      reserveRatio: reserveRatio,
    })
    return this._layout()
  }
}
