//x的放缩和render模块有关
//当前没有设置鼠标触发阈值，找最近点
//目前istoryline结构中locationid不明，以locationTree中下标代替
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
  constructor(data) {
    this._session = data.sessionTable;
    this._locationTree = data._locationTree;
    this._maxTimeframeTable = data._maxTimeframeTable;
    this._nodes = data.nodes;
    this._keyTimeframe = data.keyTimeframe;
    this.names = data.entities;
    this.paths = data.paths;
    this.timeline = data.timeline;
  }
  // get names() {
  //   return this.names;
  // }
  // get paths() {
  //   return this.paths;
  // }
  // get timeline() {
  //   return this.timeline;
  // }
  // set names() {
  //   this.names;
  // }
  // set paths() {
  //   this.paths;
  // }
  // set timeline() {
  //   this.timeline;
  // }
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
    ][0];
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
    ][1];
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
    let storylineID = this.getStorylineIDByName(storylineName);
    let retX = -1;
    for (let i = 0; i < this._nodes[Number(storylineID)].length; i++) {
      let k = this.getPosID(storylineID, String(i), time);
      if (Number(k) === -1) continue;
      if (Number(k) & 1) k--;
      let staX = this.getStoryNodeX(k, String(i), storylineID);
      let endX = this.getStoryNodeX(
        String(Number(k) + 1),
        String(i),
        storylineID
      );
      retX = (staX + endX) * 0.5;
      break;
    }
    return retX;
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
    let storylineID = this.getStorylineIDByName(storylineName);
    let retY = -1;
    for (let i = 0; i < this._nodes[Number(storylineID)].length; i++) {
      let k = this.getPosID(storylineID, String(i), time);
      if (Number(k) === -1) continue;
      if (Number(k) & 1) k--;
      let staY = this.getStoryNodeY(k, String(i), storylineID);
      let endY = this.getStoryNodeY(
        String(Number(k) + 1),
        String(i),
        storylineID
      );
      retY = (staY + endY) * 0.5;
      break;
    }
    return retY;
  }

  getPosID(storylineID, storySegmentID, time) {
    let L = 0;
    let R = this._nodes[Number(storylineID)][Number(storySegmentID)].length - 1;
    let mid = 0;
    let x = 0;
    let y = 0;
    let ret = -1;
    while (L <= R) {
      mid = (L + R) >> 1;
      x = this.getStoryNodeX(String(mid), storySegmentID, storylineID);
      y = this.getStoryNodeY(String(mid), storySegmentID, storylineID);
      let t = this.getStoryTimeSpan(x, y);
      if (t[0] <= time) {
        if (t[1] >= time) {
          ret = mid;
        }
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }
    return String(ret);
  }

  getStorylineIDByName(storylineName) {
    let ret = -1;
    for (let i = 0; i < this.names.length; i++) {
      if (this.names[i] === storylineName) {
        ret = i;
        break;
      }
    }
    return String(ret);
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
    let minDis = 1e9;
    let retID = 0;
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i));
          let graphY = this.getStoryNodeY(String(k), String(j), String(i));
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retID = k;
          }
        }
      }
    }
    return String(retID);
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
    let minDis = 1e9;
    let retID = 0;
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i));
          let graphY = this.getStoryNodeY(String(k), String(j), String(i));
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retID = j;
          }
        }
      }
    }
    return String(retID);
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
    let minDis = 1e9;
    let retID = 0;
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i));
          let graphY = this.getStoryNodeY(String(k), String(j), String(i));
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retID = i;
          }
        }
      }
    }
    return String(retID);
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
    let retI = this.getStorylineID(x, y);
    let retJ = this.getStorySegmentID(x, y);
    let retK = this.getStoryNodeID(x, y);
    return this._nodes[Number(retI)][Number(retJ)][Number(retK)];
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
    let retI = this.getStorylineID(x, y);
    let retJ = this.getStorySegmentID(x, y);
    return this._nodes[Number(retI)][Number(retJ)];
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
    if (typeof x === "string") {
      return this._nodes[Number(x)];
    } else {
      let tmpStorylineID = this.getStorylineID(x, y);
      return this._nodes[Number(tmpStorylineID)];
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
    let tmpStorylineID = this.getStorylineID(x, y);
    return this.names[Number(tmpStorylineID)];
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
    let cnt = 0;
    let ret = 0;
    let minDis = 1e9;
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          cnt++;
          let graphX = this.getStoryNodeX(String(k), String(j), String(i));
          let graphY = this.getStoryNodeY(String(k), String(j), String(i));
          if (state === 1 && graphX > x + 1e-6) continue;
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            ret = cnt;
          }
        }
      }
    }
    return ret;
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
    let tmpI = this.getStorylineID(x, y);
    let tmpJ = this.getStorySegmentID(x, y);
    let tmpK = this.getStoryNodeID(x, y);
    return this.timeline[Number(tmpI)][Number(tmpJ)][Number(tmpK)];
  }

  /**
   * Get the timeSpan according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return timeSpan
   */
  getStoryTimeSpan(x, y) {
    let tmpI = Number(this.getStorylineID(x, y));
    let tmpJ = Number(this.getStorySegmentID(x, y));
    let tmpK = Number(this.getStoryNodeID(x, y));
    let ret = Array();
    if (tmpK & 1) {
      ret[0] = this.getStoryTime(
        this._nodes[tmpI][tmpJ][tmpK - 1][0],
        this._nodes[tmpI][tmpJ][tmpK - 1][1]
      );
      ret[1] = this.getStoryTime(
        this._nodes[tmpI][tmpJ][tmpK][0],
        this._nodes[tmpI][tmpJ][tmpK][1]
      );
    } else {
      ret[0] = this.getStoryTime(
        this._nodes[tmpI][tmpJ][tmpK][0],
        this._nodes[tmpI][tmpJ][tmpK][1]
      );
      ret[1] = this.getStoryTime(
        this._nodes[tmpI][tmpJ][tmpK + 1][0],
        this._nodes[tmpI][tmpJ][tmpK + 1][1]
      );
    }
    return ret;
  }
  getStoryTimeSpanID(startTime, endTime) {
    let ret = [-1, -1];
    for (let i = 0; i < this._keyTimeframe.length - 1; i++) {
      if (
        startTime >= this._keyTimeframe[i] &&
        startTime < this._keyTimeframe[i + 1]
      ) {
        ret[0] = i;
        break;
      }
    }
    for (let i = 0; i < this._keyTimeframe.length - 1; i++) {
      if (
        endTime > this._keyTimeframe[i] &&
        endTime <= this._keyTimeframe[i + 1]
      ) {
        ret[1] = i;
        break;
      }
    }
    return ret;
  }
  getStoryTimeID(time) {
    let ret = -1;
    for (let i = 0; i < this._keyTimeframe.length - 1; i++) {
      if (time > this._keyTimeframe[i] && time <= this._keyTimeframe[i + 1]) {
        ret = i;
        break;
      }
    }
    if (ret === -1 && time === 0) ret = 0;
    return ret;
  }
  /**
   * Get the location color according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return color
   */
  getLocationColor(x, y) {
    let ret = 0;
    let tmpLocationID = this.getLocationID(x, y);
    if (tmpLocationID === 0) {
      ret = this._locationTree.color;
    } else {
      ret = this._locationTree.children[tmpLocationID - 1].color;
    }
    return ret;
  }

  /**
   * Get the location id according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return locationID
   */
  getLocationID(x, y) {
    let tmpSessionID = this.getSessionID(x, y);
    for (let i = 0; i < this._locationTree.children.length; i++) {
      for (let j = 0; j < this._locationTree.children[i].sessions.length; j++) {
        if (
          this._locationTree.children[i].sessions[j] === Number(tmpSessionID)
        ) {
          return String(i + 1);
        }
      }
    }
    for (let j = 0; j < this._locationTree.sessions.length; j++) {
      if (this._locationTree.sessions[j] === Number(tmpSessionID)) {
        return String(0);
      }
    }
  }
  /**
   * Get the location name according to the given position.
   *
   * @param {Number} x
   * @param {Number} y
   *
   * @return locationName
   */
  getLocationName(x, y) {
    let ret = 0;
    let tmpLocationID = this.getLocationID(x, y);
    if (tmpLocationID === 0) {
      ret = this._locationTree.name;
    } else {
      ret = this._locationTree.children[tmpLocationID - 1].name;
    }
    return ret;
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
    let tmp = this._session;
    let name = this.getStorylineName(x, y);
    let timeSpan = this.getStoryTimeSpan(x, y);
    for (let [key, value] of tmp) {
      for (let i = 0; i < value.length; i++) {
        if (
          value[i].start <= timeSpan[0] &&
          timeSpan[1] <= value[i].end &&
          value[i].entity === name
        ) {
          return String(key);
        }
      }
    }
  }
  getSessions(x0, y0, x1, y1) {
    //半包括
    let tmp = this._session;
    let sTime = this.getStoryTime(x0, y0);
    let eTime = this.getStoryTime(x1, y1);
    let ret = [];
    let flag = 1;
    for (let [key, value] of tmp) {
      flag = 1;
      for (let i = 0; i < value.length && flag; i++) {
        if (value[i].start <= sTime && eTime <= value[i].end) {
          let tmpI = this.getStorylineIDByName(value[i].entity);
          for (let k = 0; k < this._nodes[tmpI].length; k++) {
            let tmpK = this.getPosID(String(tmpI), String(k), sTime);
            if (
              this._nodes[tmpI][k][tmpK][1] >= y0 &&
              this._nodes[tmpI][k][tmpK][1] <= y1
            ) {
              tmpK = this.getPosID(String(tmpI), String(k), eTime);
              if (
                this._nodes[tmpI][k][tmpK][1] >= y0 &&
                this._nodes[tmpI][k][tmpK][1] <= y1
              ) {
                ret.push(String(key));
                flag = 0;
                break;
              }
            }
          }
        }
      }
    }
    return ret;
  }
  getPrevSessionID(id) {
    let oriSession = this._session.get(Number(id));
    let recNum = -1;
    let sSessionID = -1;
    let recTim = 0;
    for (let [key, value] of this._session) {
      if (value[0].end === oriSession[0].start) {
        let tmp = 0;
        for (let i = 0; i < value.length; i++) {
          for (let j = 0; j < oriSession.length; j++) {
            if (value[i].entity === oriSession[j].entity) {
              tmp++;
              break;
            }
          }
        }
        if (tmp > recNum) {
          recNum = tmp;
          sSessionID = key;
          recTim = value[0].end;
        }
      }
    }
    let lTime = this.getStoryTimeID(recTim);
    return { lTime, sSessionID };
  }
  getNextSessionID(id) {
    let oriSession = this._session.get(Number(id));
    let recNum = -1;
    let eSessionID = -1;
    let recTim = 0;
    for (let [key, value] of this._session) {
      if (value[0].start === oriSession[0].end) {
        let tmp = 0;
        for (let i = 0; i < value.length; i++) {
          for (let j = 0; j < oriSession.length; j++) {
            if (value[i].entity === oriSession[j].entity) {
              tmp++;
              break;
            }
          }
        }
        if (tmp > recNum) {
          recNum = tmp;
          eSessionID = key;
          recTim = value[0].start;
        }
      }
    }
    let rTime = this.getStoryTimeID(recTim);
    return { rTime, eSessionID };
  }
  getBesideSessions(x, y, name) {
    let tmpI = this.getStorylineIDByName(name);
    let time = -1;
    let flag = 1;
    for (let j = 0; j < this._nodes[tmpI].length && flag; j++) {
      for (let k = 1; k < this._nodes[tmpI][j].length; k++) {
        if (
          x >= this._nodes[tmpI][j][k - 1][0] &&
          x <= this._nodes[tmpI][j][k][0]
        ) {
          time = this.timeline[tmpI][j][k];
          flag = 0;
          break;
        }
      }
    }
    let sSessionID = -1;
    let eSessionID = -1;
    for (let [key, value] of this._session) {
      if (value[0].end <= time) {
        for (let i = 0; i < value.length; i++) {
          if (value[i].entity === name) {
            sSessionID = key;
            break;
          }
        }
      }
      if (value[0].start >= time) {
        for (let i = 0; i < value.length; i++) {
          if (value[i].entity === name) {
            eSessionID = key;
            break;
          }
        }
      }
    }
    return { time, sSessionID, eSessionID };
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
    let tmpSessionID = 0;
    tmpSessionID = Number(this.getSessionID(x, y));
    return this._session[tmpSessionID].characters;
  }
}
