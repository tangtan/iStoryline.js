import { STYLE_LABELS } from "../utils/CONSTANTS";
/**
 * @types
 * Story Space
 *  - StoryNode: [x, y]
 *  - StoryNodeID: string
 *  - StorySegment: Node[]
 *  - StorySegmentID: string
 *  - Storyline: Segment[]
 *  - StorylineName: string
 *  - StorylineID: string
 *  - Time: number
 *  - TimeSpan: [t1, t2]
 *  - TimeRange: TimeSpan[]
 *  - LocationID: number
 *  - LocationName: string
 *  - LocationColor: string
 *  - Session:
 *    - SessionID: number
 *    - LocationName: string
 *    - Characters: StorylineID[]
 *    - SessionMap: Map
 *      - StorylineID => TimeSpan
 * Visual Space
 *  - Graph:
 *    - nodes: StorySegment[]
 *    - nodes: Storyline[]
 *    - smoothNodes: Storyline[]
 *    - sketchNodes: Storyline[]
 */
export class Graph {
  constructor(story) {
    this._story = story
    this._style = []
    this._nodes = []
    this._storylinePaths = []
    this._session = this.getTable('session')
    this._keyTimeframe = this._story._timeStamps
    this._keyTimeframe2X = this._story._timeStamps2X
    const characterTable = this.getTable('character')
    const positionTable = this.getTable('position')
    const pathTable = this.getTable('path')
    const styleTable = this.getTable('style')
    const rows = this.getTableRows()
    const cols = this.getTableCols()
    for (let row = 0; row < rows; row++) {
      let segments = []
      let segmentPaths = []
      for (let col = 0; col < cols; col++) {
        let characterStatus = characterTable.value(row, col)
        if (characterStatus > 0) {
          // storyline nodes
          let positionId = positionTable.value(row, col)
          let segment = this._story._positions[positionId]
          segments.push(segment)
          // storyline paths
          let pathId = pathTable.value(row, col)
          let path = this._story._paths[pathId]
          segmentPaths.push(path)
          // storyline style
          let styleId = styleTable.value(row, col)
          let styleLabel = STYLE_LABELS[styleId]
          if (styleLabel !== 'Normal') {
            this._style.push({
              name: story.characters[row],
              segmentID: segments.length - 1,
              type: styleLabel
            })
          }
        }
      }
      if (segments.length > 0) {
        this._nodes.push(segments)
      }
      if (segmentPaths.length > 0) {
        this._storylinePaths.push(segmentPaths)
      }
    }
  }

  get characters() {
    return this._story.characters
  }

  get storylines() {
    return this._nodes
  }

  get paths() {
    return this._storylinePaths
  }

  get style() {
    return this._style
  }

  get timeline() {
    return this._keyTimeframe
  }

  get locations() {
    return this._story.locations
  }

  getTable(tableName) {
    return this._story.getTable(tableName)
  }

  getTableRows() {
    return this._story.getTableRows()
  }

  getTableCols() {
    return this._story.getTableCols()
  }

  /**
   * Get the x pos of the specified render node.
   *
   * @param {Number} storyNodeID
   * @param {Number} storySegmentID
   * @param {Number} storylineID
   *
   * @return X
   */
  getStoryNodeX(storyNodeID, storySegmentID, storylineID) {
    return this._nodes[Number(storylineID)][Number(storySegmentID)][
      Number(storyNodeID)
    ][0]
  }

  /**
   * Get the y pos of the specified render node.
   *
   * @param {Number} storyNodeID
   * @param {Number} storySegmentID
   * @param {Number} storylineID
   *
   * @return Y
   */
  getStoryNodeY(storyNodeID, storySegmentID, storylineID) {
    return this._nodes[Number(storylineID)][Number(storySegmentID)][
      Number(storyNodeID)
    ][1]
  }

  /**
   * Get the x pos of the specified character at a given time.
   *
   * @param {String} storylineName
   * @param {Number} time
   *
   * @return X
   */
  getCharacterX(storylineName, time) {
    let storylineID = this.getStorylineIDByName(storylineName)
    let retX = -1
    for (let i = 0; i < this._nodes[Number(storylineID)].length; i++) {
      let k = this.getPosID(storylineID, String(i), time)
      if (Number(k) === -1) continue
      if (Number(k) & 1) k--
      let staX = this.getStoryNodeX(k, String(i), storylineID)
      let endX = this.getStoryNodeX(
        String(Number(k) + 1),
        String(i),
        storylineID
      )
      retX = (staX + endX) * 0.5
      break
    }
    return retX
  }

  /**
   * Get the y pos of the specified character at a given time.
   *
   * @param {String} storylineName
   * @param {Number} time
   *
   * @return Y
   */
  getCharacterY(storylineName, time) {
    let storylineID = this.getStorylineIDByName(storylineName)
    let retY = -1
    for (let i = 0; i < this._nodes[Number(storylineID)].length; i++) {
      let k = this.getPosID(storylineID, String(i), time)
      if (Number(k) === -1) continue
      if (Number(k) & 1) k--
      let staY = this.getStoryNodeY(k, String(i), storylineID)
      let endY = this.getStoryNodeY(
        String(Number(k) + 1),
        String(i),
        storylineID
      )
      retY = (staY + endY) * 0.5
      break
    }
    return retY
  }

  getPosID(storylineID, storySegmentID, time) {
    let x = this.getStoryNodeX(String(0), storySegmentID, storylineID)
    let y = this.getStoryNodeY(String(0), storySegmentID, storylineID)
    let timeSpan = this.getStoryTimeSpan(x, y)
    let ret = -1
    if (time >= timeSpan[0] && time <= timeSpan[1]) ret = 0
    return String(ret)
  }

  getStorylineIDByName(storylineName) {
    let ret = -1
    for (let i = 0; i < this.characters.length; i++) {
      if (this.characters[i] === storylineName) {
        ret = i
        break
      }
    }
    return String(ret)
  }

  /**
   * Get the id of a storyNode according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return nodeID
   */
  getStoryNodeID(x, y) {
    let minDis = 1e9
    let retID = 0
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i))
          let graphY = this.getStoryNodeY(String(k), String(j), String(i))
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y)
            retID = k
          }
        }
      }
    }
    return String(retID)
  }

  /**
   * Get the id of a storySegment according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return segmentID
   */
  getStorySegmentID(x, y) {
    let minDis = 1e9
    let retID = 0
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i))
          let graphY = this.getStoryNodeY(String(k), String(j), String(i))
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y)
            retID = j
          }
        }
      }
    }
    return String(retID)
  }

  /**
   * Get the id of a storyline according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storylineID
   */
  getStorylineID(x, y) {
    let minDis = 1e9
    let retID = 0
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i))
          let graphY = this.getStoryNodeY(String(k), String(j), String(i))
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y)
            retID = i
          }
        }
      }
    }
    return String(retID)
  }

  /**
   * Get the storyNode according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storyNode
   */
  getStoryNode(x, y) {
    let retI = this.getStorylineID(x, y)
    let retJ = this.getStorySegmentID(x, y)
    let retK = this.getStoryNodeID(x, y)
    return this._nodes[Number(retI)][Number(retJ)][Number(retK)]
  }

  /**
   * Get the storySegment according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storySegment
   */
  getStorySegment(x, y) {
    let retI = this.getStorylineID(x, y)
    let retJ = this.getStorySegmentID(x, y)
    return this._nodes[Number(retI)][Number(retJ)]
  }

  /**
   * Get the storyline according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storyline
   */
  getStoryline(x, y) {
    if (typeof x === 'string') {
      return this._nodes[Number(x)]
    } else {
      let tmpStorylineID = this.getStorylineID(x, y)
      return this._nodes[Number(tmpStorylineID)]
    }
  }

  /**
   * Get the storyline name according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storyline
   */
  getStorylineName(x, y) {
    let tmpStorylineID = this.getStorylineID(x, y)
    return this.characters[Number(tmpStorylineID)]
  }

  /**
   * Get the storyline index according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return storylineIndex
   */
  getStorylineIndex(x, y, state) {
    let cnt = 0
    let ret = 0
    let minDis = 1e9
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          cnt++
          let graphX = this.getStoryNodeX(String(k), String(j), String(i))
          let graphY = this.getStoryNodeY(String(k), String(j), String(i))
          if (state === 1 && graphX > x + 1e-6) continue
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y)
            ret = cnt
          }
        }
      }
    }
    return ret
  }
  /**
   * Get the time according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return time
   */
  getStoryTime(x, y) {
    let tmpI = this.getStorylineID(x, y)
    let tmpJ = this.getStorySegmentID(x, y)
    let tmpK = this.getStoryNodeID(x, y)
    return this.timeline[Number(tmpI)][Number(tmpJ)][Number(tmpK)]
  }

  /**
   * Get the timeSpan according to the given position.
   *
   * @param {Number} x
   *
   * @return timeSpan
   */
  getStoryTimeSpan(x) {
    let i = 0
    if (x < this._keyTimeframe2X[i]) {
      return [-1, -1]
    }
    for (; i < this._keyTimeframe2X.length - 1; i++) {
      const startX = this._keyTimeframe2X[i]
      const endX = this._keyTimeframe2X[i + 1]
      if (x >= startX && x < endX) {
        return [this._keyTimeframe[i], this._keyTimeframe[i + 1]]
      }
    }
    if (x <= this._keyTimeframe2X[i]) {
      return [this._keyTimeframe[i - 1], this._keyTimeframe[i]]
    }
    return [-1, -1]
  }

  getStoryTimeSpanID(startTime, endTime) {
    let ret = [-1, -1]
    for (let i = 0; i < this._keyTimeframe.length - 1; i++) {
      if (
        startTime >= this._keyTimeframe[i] &&
        startTime < this._keyTimeframe[i + 1]
      ) {
        ret[0] = i
        break
      }
    }
    for (let i = 0; i < this._keyTimeframe.length - 1; i++) {
      if (
        endTime > this._keyTimeframe[i] &&
        endTime <= this._keyTimeframe[i + 1]
      ) {
        ret[1] = i
        break
      }
    }
    return ret
  }

  getStoryTimeID(time) {
    let ret = -1
    for (let i = 0; i < this._keyTimeframe.length - 1; i++) {
      if (time > this._keyTimeframe[i] && time <= this._keyTimeframe[i + 1]) {
        ret = i
        break
      }
    }
    if (ret === -1 && time === 0) ret = 0
    return ret
  }

  /**
   * Get the _session id according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return locationName
   */
  getSessionID(x, y) {
    let tmp = this._session
    let name = this.getStorylineName(x, y)
    let timeSpan = this.getStoryTimeSpan(x, y)
    for (let [key, value] of tmp) {
      for (let i = 0; i < value.length; i++) {
        if (
          value[i].start <= timeSpan[0] &&
          timeSpan[1] <= value[i].end &&
          value[i].entity === name
        ) {
          return String(key)
        }
      }
    }
  }

  getStorySegmentIDByTime(storylineID, timespan) {
    for (let i = 0; i < this._nodes[Number(storylineID)].length; i++) {
      let seg = this._nodes[Number(storylineID)][i]
      let realspan = this.getStoryTimeSpan(seg[0][0], seg[0][1])
      if (timespan[0] <= realspan[0] && realspan[1] <= timespan[1]) {
        return i
      }
    }
    return -1
  }

  getSessions(x0, y0, x1, y1) {
    //半包括
    let tmp = this._session
    let sTime = this.getStoryTime(x0, y0)
    let eTime = this.getStoryTime(x1, y1)
    let ret = []
    let sflag = 1
    let eflag = 1
    for (let [key, value] of tmp) {
      sflag = 1
      eflag = 1
      for (let i = 0; i < value.length && (sflag || eflag); i++) {
        if (
          (value[i].start >= sTime && eTime >= value[i].start) ||
          (value[i].end >= sTime && eTime >= value[i].end)
        ) {
          let tmpI = this.getStorylineIDByName(value[i].entity)
          for (let k = 0; k < this._nodes[tmpI].length; k++) {
            if (
              this._nodes[tmpI][k][0][1] >= y0 &&
              this._nodes[tmpI][k][0][1] <= y1
            ) {
              sflag = 0
            }
            if (
              this._nodes[tmpI][k][1][1] >= y0 &&
              this._nodes[tmpI][k][1][1] <= y1
            ) {
              eflag = 0
            }
          }
        }
      }
      if (sflag || eflag) {
      } else {
        ret.push(String(key))
      }
    }
    return ret
  }
  getPrevSessionID(id) {
    let oriSession = this._session.get(Number(id))
    let recNum = -1
    let sSessionID = -1
    let recTim = 0
    for (let [key, value] of this._session) {
      if (value[0].end === oriSession[0].start) {
        let tmp = 0
        for (let i = 0; i < value.length; i++) {
          for (let j = 0; j < oriSession.length; j++) {
            if (value[i].entity === oriSession[j].entity) {
              tmp++
              break
            }
          }
        }
        if (tmp > recNum) {
          recNum = tmp
          sSessionID = key
          recTim = value[0].end
        }
      }
    }
    let lTime = this.getStoryTimeID(recTim)
    return { lTime, sSessionID }
  }
  getNextSessionID(id) {
    let oriSession = this._session.get(Number(id))
    let recNum = -1
    let eSessionID = -1
    let recTim = 0
    for (let [key, value] of this._session) {
      if (value[0].start === oriSession[0].end) {
        let tmp = 0
        for (let i = 0; i < value.length; i++) {
          for (let j = 0; j < oriSession.length; j++) {
            if (value[i].entity === oriSession[j].entity) {
              tmp++
              break
            }
          }
        }
        if (tmp > recNum) {
          recNum = tmp
          eSessionID = key
          recTim = value[0].start
        }
      }
    }
    let rTime = this.getStoryTimeID(recTim)
    return { rTime, eSessionID }
  }

  getBesideSessions(x, y, name) {
    let tmpI = this.getStorylineIDByName(name)
    let time = -1
    let flag = 1
    for (let j = 0; j < this._nodes[tmpI].length && flag; j++) {
      for (let k = 1; k < this._nodes[tmpI][j].length; k++) {
        if (
          x >= this._nodes[tmpI][j][k - 1][0] &&
          x <= this._nodes[tmpI][j][k][0]
        ) {
          time = this.timeline[tmpI][j][k]
          flag = 0
          break
        }
      }
    }
    let sSessionID = -1
    let eSessionID = -1
    for (let [key, value] of this._session) {
      if (value[0].end <= time) {
        for (let i = 0; i < value.length; i++) {
          if (value[i].entity === name) {
            sSessionID = key
            break
          }
        }
      }
      if (value[0].start >= time) {
        for (let i = 0; i < value.length; i++) {
          if (value[i].entity === name) {
            eSessionID = key
            break
          }
        }
      }
    }
    return { time, sSessionID, eSessionID }
  }
  /**
   * Get the characters in a _session according to the given position.
   *
   * @param {Number} x
   * @param {Number} yf
   *
   * @return characters
   */
  getCharacters(x, y) {
    let tmpSessionID = 0
    tmpSessionID = Number(this.getSessionID(x, y))
    return this._session[tmpSessionID].characters
  }
}
