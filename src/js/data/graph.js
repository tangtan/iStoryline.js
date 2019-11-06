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
    this.__maxTimeframeTable = data._maxTimeframeTable;
    this._nodes = data.nodes;
    this.names = data.entities;
    this.paths = data.paths;
    this.timeline = data.timeline;
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
    return this._nodes[Number(storylineID)][Number(storySegmentID)][Number(storyNodeID)][0];
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
    return this._nodes[Number(storylineID)][Number(storySegmentID)][Number(storyNodeID)][1];
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
    let R =
      this._nodes[Number(storylineID)][Number(storySegmentID)].length - 1;
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
    return this._nodes[retI][retJ][retK];
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
    return this._nodes[retI][retJ];
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
   * Get the smooth storyline according to the given position.
   * 
   * @param {Number} x
   * @param {Number} y
   *
   * @return storyline
   */
  getStorylineSmooth(x, y) {
    let retI = 0;
    let minDis = 1e9;
    for (let i = 0; i < this.smoothNodes.length; i++) {
      for (let j = 0; j < this.smoothNodes[i].length; j++) {
        for (let k = 0; k < this.smoothNodes[i][j].length; k++) {
          let graphX = this.smoothNodes[i][j][k][0];
          let graphY = this.smoothNodes[i][j][k][1];
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retI = i;
          }
        }
      }
    }
    return this.smoothNodes[retI];
  }

  /**
   * Get the sketch storyline according to the given position.
   * 
   * @param {Number} x
   * @param {Number} y
   *
   * @return storyline
   */
  getStorylineSketch(x, y) {
    let retI = 0;
    let minDis = 1e9;
    for (let i = 0; i < this.sketchNodes.length; i++) {
      for (let j = 0; j < this.sketchNodes[i].length; j++) {
        for (let k = 0; k < this.sketchNodes[i][j].length; k++) {
          let graphX = this.sketchNodes[i][j][k][0];
          let graphY = this.sketchNodes[i][j][k][1];
          if (
            (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) <
            minDis
          ) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retI = i;
          }
        }
      }
    }
    return this.sketchNodes[retI];
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

  changeFour2Three(tot) {
    let cnt = 0;
    let tmpI = 0;
    let tmpJ = 0;
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        cnt++;
        if (cnt === tot) {
          tmpI = i;
          tmpJ = j;
        }
      }
    }
    return { tmpI, tmpJ };
  }

  changeThree2Four(tot) {
    let cnt = 0;
    let tmpI = 0;
    let tmpJ = 0;
    let tmpK = 0;
    for (let i = 0; i < this._nodes.length; i++) {
      for (let j = 0; j < this._nodes[i].length; j++) {
        for (let k = 0; k < this._nodes[i][j].length; k++) {
          cnt++;
          if (cnt === tot) {
            tmpI = i;
            tmpJ = j;
            tmpK = k;
          }
        }
      }
    }
    return { tmpI, tmpJ, tmpK };
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
    let min = 1e9;
    let time;
    for(let item of this.timeline.keys()){
      if(Math.abs(x - this.timeline.get(item)) < min){
        min = Math.abs(x - this.timeline.get(item));
        time = item;
      }
    }
    return time;
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
    let tmpI = this.getStorylineID(x,y);
    let tmpJ = this.getStorySegmentID(x,y);
    let tmpK = this.getStoryNodeID(x,y);
    let ret = Array();
    if(tmpK & 1){
      ret[0] = this.getStoryTime(this.nodes[tmpI][tmpJ][tmpK-1][0],this.nodes[tmpI][tmpJ][tmpK-1][1]);
      ret[1] = this.getStoryTime(this.nodes[tmpI][tmpJ][tmpK][0],this.nodes[tmpI][tmpJ][tmpK][1]);
    }
    else{
      ret[0] = this.getStoryTime(this.nodes[tmpI][tmpJ][tmpK][0],this.nodes[tmpI][tmpJ][tmpK][1]);
      ret[1] = this.getStoryTime(this.nodes[tmpI][tmpJ][tmpK+1][0],this.nodes[tmpI][tmpJ][tmpK+1][1]);
    }
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
    let index = this.getStorylineIndex(x, y);
    let name = this.getStorylineName(x, y);
    const { tmpI, tmpJ } = this.changeFour2Three(index);
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

  /**
   * Get the characters in a _session according to the given position.
   * 
   * @param {Number} x
   * @param {Number} y
   *
   * @return characters
   */
  getCharacters(x, y) {
    let tmpSessionID = 0;
    tmpSessionID = Number(this.getSessionID(x, y));
    return this._session[tmpSessionID].characters;
  }
}
