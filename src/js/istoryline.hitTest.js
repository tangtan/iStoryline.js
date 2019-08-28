import { timingSafeEqual } from "crypto";

//x的放缩和render模块有关
//当前没有设置鼠标触发阈值，找最近点
//目前istoryline结构中locationid不明，以locationTree中下标代替
/**
 * @file 
 * Provides hitTest class.
 * Basic Types:
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
 *    - renderNodes: Storyline[]
 *    - smoothNodes: Storyline[]
 *    - sketchNodes: Storyline[]
 */
export class HitTest {
  // receive iStoryline graph
  constructor(graph, data) {
    this.nodes = graph.nodes;
    this.names = graph.names;
    this.renderNodes = graph.renderNodes;
    this.smoothNodes = graph.smoothNodes;
    // this.sketchNodes = graph.sketchNodes;
    this.session = data.sessionTable;
    this.locationTree = data.locationTree;
    this.maxTimeframeTable = data.maxTimeframeTable;
  }

  /**
   * @param
   * storyNodeID, storySegmentID, storylineID
   * @returns
   * X
   */
  getStoryNodeX(storyNodeID, storySegmentID, storylineID) {
    return this.renderNodes[Number(storylineID)][Number(storySegmentID)][Number(storyNodeID)][0];
  }

  /**
   * @param
   * storyNodeID, storySegmentID, storylineID
   * @returns
   * Y
   */
  getStoryNodeY(storyNodeID, storySegmentID, storylineID) {
    return this.renderNodes[Number(storylineID)][Number(storySegmentID)][Number(storyNodeID)][1];
  }

  getPosID(storylineID , storySegmentID, time) {
    let L = 0;
    let R = this.renderNodes[Number(storylineID)][Number(storySegmentID)].length - 1;
    let mid = 0;
    let x = 0;
    let y = 0;
    let ret = -1;
    while(L <= R){
      mid = (L + R) >> 1;
      x = this.getStoryNodeX(String(mid),storySegmentID,storylineID);
      y = this.getStoryNodeY(String(mid),storySegmentID,storylineID);
      let t = this.getStoryTimeSpan(x,y);
      if(t[0] <= time){
        if(t[1] >= time){
           ret = mid;
        }
        L = mid + 1;
      }
      else{
        R = mid - 1;
      }
    }
    return String(ret);
  }
  getCharacterX(storylineName, time) {
    let storylineID = this.getStorylineIDBaseOnName(storylineName);
    let retX = -1;
    for(let i = 0;i < this.renderNodes[Number(storylineID)].length;i ++){
      let k = this.getPosID(storylineID,String(i),time);
      if(Number(k) === -1) continue;
      if(Number(k) & 1) k --;
      let staX = this.getStoryNodeX(k,String(i),storylineID);
      let endX = this.getStoryNodeX(String(Number(k) + 1),String(i),storylineID);
      retX = (staX + endX) * 0.5;
      break;
    }
    return retX;
  }
  getCharacterY(storylineName, time) {
    let storylineID = this.getStorylineIDBaseOnName(storylineName);
    let retY = -1;
    for(let i = 0;i < this.renderNodes[Number(storylineID)].length;i ++){
      let k = this.getPosID(storylineID,String(i),time);
      if(Number(k) === -1) continue;
      if(Number(k) & 1) k --;
      let staY = this.getStoryNodeY(k,String(i),storylineID);
      let endY = this.getStoryNodeY(String(Number(k) + 1),String(i),storylineID);
      retY = (staY + endY) * 0.5;
      break;
    }
    return retY;
  }
  getStorylineIDBaseOnName(storylineName){
    let ret = -1;
    for(let i = 0;i < this.names.length;i ++){
      if(this.names[i] === storylineName){
        ret = i;
        break;
      }
    }
    return String(ret);
  }
  /**
   * @param
   * x
   * StorylineID,StoryNodeID
   * @returns
   * Y
   */
  /* *
   * getTime(storylineID, storyNodeID){
   *  if(typeof storylineID === 'string') {
   *  }
   *  else {
   *  }
   *  return;
   * }
   */

  /**
   * @param
   * x,y
   * @returns
   * NodeID
   */
  getStoryNodeID(x, y) {
    let minDis = 1e9;
    let retID = 0;
    for (let i = 0; i < this.renderNodes.length; i++) {
      for (let j = 0; j < this.renderNodes[i].length; j++) {
        for (let k = 0; k < this.renderNodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i));
          let graphY = this.getStoryNodeY(String(k), String(j), String(i));
          if ((graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) < minDis) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retID = k;
          }
        }
      }
    }
    return String(retID);
  }

  getStorySegmentID(x, y) {
    let minDis = 1e9;
    let retID = 0;
    for (let i = 0; i < this.renderNodes.length; i++) {
      for (let j = 0; j < this.renderNodes[i].length; j++) {
        for (let k = 0; k < this.renderNodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i));
          let graphY = this.getStoryNodeY(String(k), String(j), String(i));
          if ((graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) < minDis) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retID = j;
          }
        }
      }
    }
    return String(retID);
  }
  /**
   * @param
   * storylineName
   * x, y
   * @returns
   * StoryLineID
   */
  getStorylineID(x, y) {
    let minDis = 1e9;
    let retID = 0;
    for (let i = 0; i < this.renderNodes.length; i++) {
      for (let j = 0; j < this.renderNodes[i].length; j++) {
        for (let k = 0; k < this.renderNodes[i][j].length; k++) {
          let graphX = this.getStoryNodeX(String(k), String(j), String(i));
          let graphY = this.getStoryNodeY(String(k), String(j), String(i));
          if ((graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) < minDis) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retID = i;
          }
        }
      }
    }
    return String(retID);
  }
  getStoryNode(x, y) {
    let retI = this.getStorylineID(x, y);
    let retJ = this.getStorySegmentID(x, y);
    let retK = this.getStoryNodeID(x, y);
    return this.renderNodes[retI][retJ][retK];
  }
  /**
   * @param
   * storylineID, storySegmentID
   * x, y
   * @returns
   * StorySegment
   */
  getStorySegment(x, y) {
    let retI = this.getStorylineID(x, y);
    let retJ = this.getStorySegmentID(x, y);
    return this.renderNodes[retI][retJ];
  }
  /**
   * @param
   * storylineID
   * x, y
   * @returns
   * StoryLine
   */
  getStoryline(x, y) {
    if (typeof x === 'string') {
      return this.renderNodes[Number(x)];
    }
    else {
      let tmpStorylineID = this.getStorylineID(x, y);
      return this.renderNodes[Number(tmpStorylineID)];
    }
  }
  /**
   * @param
   * storylineID
   * x, y
   * @returns
   * StoryLine
   */
  getStorylineSmooth(x, y) {
    let retI = 0;
    let minDis = 1e9;
    for (let i = 0; i < this.smoothNodes.length; i++) {
      for (let j = 0; j < this.smoothNodes[i].length; j++) {
        for (let k = 0; k < this.smoothNodes[i][j].length; k++) {
          let graphX = this.smoothNodes[i][j][k][0];
          let graphY = this.smoothNodes[i][j][k][1];
          if ((graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) < minDis) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retI = i;
          }
        }
      }
    }
    return this.smoothNodes[retI];
  }
  /**
   * @param
   * storylineID
   * x, y
   * @returns
   * StoryLine
   */
  getStorylineSketch(x, y) {
    let retI = 0;
    let minDis = 1e9;
    for (let i = 0; i < this.sketchNodes.length; i++) {
      for (let j = 0; j < this.sketchNodes[i].length; j++) {
        for (let k = 0; k < this.sketchNodes[i][j].length; k++) {
          let graphX = this.sketchNodes[i][j][k][0];
          let graphY = this.sketchNodes[i][j][k][1];
          if ((graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) < minDis) {
            minDis = (graphX - x) * (graphX - x) + (graphY - y) * (graphY - y);
            retI = i;
          }
        }
      }
    }
    return this.sketchNodes[retI];
  }


  /**
   * @param
   * storylineID
   * x, y
   * @returns
   * StoryLineName
   */
  getStorylineName(x, y) {
    let tmpStorylineID = this.getStorylineID(x, y);
    return this.names[Number(tmpStorylineID)];
  }
  getStorylineIndex(x, y, state) {
    let cnt = 0;
    let ret = 0;
    let minDis = 1e9;
    for (let i = 0; i < this.renderNodes.length; i++) {
      for (let j = 0; j < this.renderNodes[i].length; j++) {
        for (let k = 0; k < this.renderNodes[i][j].length; k++) {
          cnt++;
          let graphX = this.getStoryNodeX(String(k), String(j), String(i));
          let graphY = this.getStoryNodeY(String(k), String(j), String(i));
          if (state === 1 && graphX > x + 1e-6) continue;
          if ((graphX - x) * (graphX - x) + (graphY - y) * (graphY - y) < minDis) {
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
    for (let i = 0; i < this.nodes.length; i++) {
      for (let j = 0; j < this.nodes[i].length; j++) {
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
    for (let i = 0; i < this.renderNodes.length; i++) {
      for (let j = 0; j < this.renderNodes[i].length; j++) {
        for (let k = 0; k < this.renderNodes[i][j].length; k++) {
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
  getStoryTime(x, y) {
    let index = getStorylineIndex(x, y, 0);
    const { tmpI, tmpJ } = this.changeFour2Three(index);
    let time = Math.floor(this.nodes[tmpI][tmpJ][0] / 50);
    if (tmpJ & 1) {
      time += 1;
    }
    return time;
  }
  /**
   * @param
   * storylineID, storySegmentID, storyNodeID
   * x, y
   * @returns
   * TimeSpan
   */
  getStoryTimeSpan(x, y) {
    let index = this.getStorylineIndex(x, y, 1);
    const { tmpI, tmpJ } = this.changeFour2Three(index);
    let ret = Array();
    if (tmpJ & 1) {
      ret[1] = Math.floor(this.nodes[tmpI][tmpJ][0] / 50) + 1;
      ret[0] = Math.floor(this.nodes[tmpI][tmpJ - 1][0] / 50);
    }
    else {
      ret[0] = Math.floor(this.nodes[tmpI][tmpJ][0] / 50);
      ret[1] = Math.floor(this.nodes[tmpI][tmpJ + 1][0] / 50) + 1;
    }
    return ret;
  }

  /**
   * @param
   * LoationID
   * x, y
   * @returns
   * LocationColor
   */
  getLocationColor(x, y) {
    let ret = 0;
    let tmpLocationID = this.getLocationID(x, y);
    if (tmpLocationID === 0) {
      ret = this.locationTree.color;
    }
    else {
      ret = this.locationTree.children[tmpLocationID - 1].color;
    }
    return ret;
  }

  /**
   * @param
   * LoationName
   * x, y
   * @returns
   * LocationColor
   */
  getLocationID(x, y) {
    let tmpSessionID = this.getSessionID(x, y);
    for (let i = 0; i < this.locationTree.children.length; i++) {
      for (let j = 0; j < this.locationTree.children[i].sessions.length; j++) {
        if (this.locationTree.children[i].sessions[j] === Number(tmpSessionID)) {
          return String(i + 1);
        }
      }
    }
    for (let j = 0; j < this.locationTree.sessions.length; j++) {
      if (this.locationTree.sessions[j] === Number(tmpSessionID)) {
        return String(0);
      }
    }
  }

  /**
   * @param
   * LoationID
   * x, y
   * @returns
   * LocationName
   */
  getLocationName(x, y) {
    let ret = 0;
    let tmpLocationID = this.getLocationID(x, y);
    if (tmpLocationID === 0) {
      ret = this.locationTree.name;
    }
    else {
      ret = this.locationTree.children[tmpLocationID - 1].name;
    }
    return ret;
  }
  getSessionID(x, y) {
    let tmp = this.session;
    let index = this.getStorylineIndex(x, y);
    let name = this.getStorylineName(x, y);
    const { tmpI, tmpJ } = this.changeFour2Three(index);
    let timeSpan = this.getStoryTimeSpan(x, y);
    for (let [key, value] of tmp) {
      for (let i = 0; i < value.length; i++) {
        if (value[i].start <= timeSpan[0] && timeSpan[1] <= value[i].end && value[i].entity === name) {
          return String(key);
        }
      }
    }
  }
  /**
   * @param
   * SessionID
   * x, y
   * @returns
   * Characters
   */
  getCharacters(x, y) {
    let tmpSessionID = 0;
    tmpSessionID = Number(this.getSessionID(x, y));
    return this.session[tmpSessionID].characters;
  }

}