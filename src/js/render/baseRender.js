function _checkAngle(
  storyline,
  storylineID,
  segmentID,
  storyNodeID,
  nxtTime,
  STDANGLE = 0.271975
) {
  let firX = storyline[storylineID][segmentID][storyNodeID][0];
  let firY = storyline[storylineID][segmentID][storyNodeID][1];
  let secX = storyline[storylineID][segmentID][nxtTime][0];
  let secY = storyline[storylineID][segmentID][nxtTime][1];
  let angle = Math.atan(Math.abs(firY - secY) / Math.abs(firX - secX));
  return angle > STDANGLE;
}
function _checkDivideUpdate(tmpDivideMarks, storylineID, nxt, now) {
  if (
    tmpDivideMarks[storylineID][nxt][0] < tmpDivideMarks[storylineID][now][0]
  ) {
    return true;
  }
  if (
    tmpDivideMarks[storylineID][nxt][0] === tmpDivideMarks[storylineID][now][0]
  ) {
    let stylishNxt = new String();
    for (let i = 0; i < tmpDivideMarks[storylineID][nxt][1].length; i++) {
      if (tmpDivideMarks[storylineID][nxt][1][i] !== "_") {
        stylishNxt += tmpDivideMarks[storylineID][nxt][1][i];
      } else {
        break;
      }
    }
    let stylishNow = new String();
    for (let i = 0; i < tmpDivideMarks[storylineID][now][1].length; i++) {
      if (tmpDivideMarks[storylineID][now][1][i] !== "_") {
        stylishNow += tmpDivideMarks[storylineID][now][1][i];
      } else {
        break;
      }
    }
    if (_checkStyleRank(stylishNxt, stylishNow)) {
      return true;
    }
  }
  return false;
}
function _checkInSameSegment(bound, x) {
  return x <= bound[1] && x >= bound[0];
}
function _checkMoveRules(storyline, storylineID, segmentID, storyNodeID) {
  let nowSeg = storyline[storylineID][segmentID];
  let nowID = storyNodeID;
  if (nowID + 1 >= nowSeg.length) return false;
  if (nowSeg[nowID][1] === nowSeg[nowID + 1][1]) return false;
  if (_checkAngle(storyline, storylineID, segmentID, nowID, nowID + 1))
    return true;
  return false;
}
function _checkNames(relate, i, j) {
  for (let k = 0; k < relate[i][0].length; k++) {
    for (let g = 0; g < relate[j][0].length; g++) {
      if (relate[i][0][k] === relate[j][0][g]) {
        return true;
      }
    }
  }
  return false;
}
function _checkSplit(
  splitMarks,
  ptOfSplit,
  storyline,
  storylineID,
  segmentID,
  storyNodeID
) {
  let ret = 0;
  if (ptOfSplit >= splitMarks[storylineID].length) {
    ret = 0;
  } else {
    let stdTime = splitMarks[storylineID][ptOfSplit][0];
    let tmpTime = _getTime(storyline, storylineID, segmentID, storyNodeID);
    if (tmpTime < stdTime) {
      ret = 0;
    } else if (tmpTime === stdTime) {
      ret = 1;
    } else {
      ret = 2;
    }
  }
  return ret;
}
function _checkStyleNormal(sketchStyles, i, j) {
  let ret = 0;
  switch (sketchStyles[i][j]) {
    case "Color":
      ret = 1;
      break;
    case "Width":
      ret = 1;
      break;
    case "Normal":
      ret = 1;
      break;
    default:
      ret = 0;
      break;
  }
  return ret;
}
function _checkStyleRank(stylishNxt, stylishNow) {
  let nxtRank = _getStyleType(stylishNxt);
  let nowRank = _getStyleType(stylishNow);
  return nxtRank < nowRank;
}
function _getAimPos(storyline, storylineID, segmentID, x) {
  let left = 0;
  let right = storyline[storylineID][segmentID].length - 1;
  let mid = 0;
  let aim = 0;
  while (left <= right) {
    mid = (left + right) >> 1;
    if (storyline[storylineID][segmentID][mid][0] <= x) {
      aim = mid;
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  return aim;
}
function _getNxtK(tmpSketchNodes, k) {
  let nxtK = k + 1;
  while (
    nxtK < tmpSketchNodes.length &&
    tmpSketchNodes[k][1] === tmpSketchNodes[nxtK][1]
  )
    nxtK++;
  nxtK--;
  return nxtK;
}
function _getNxtPos(group, i, j, storyline, SPACELENGTH = 20) {
  let slt = j + 1;
  let tot = group[i][1].length;
  let storylineID = group[i][1][j][0];
  let segmentID = group[i][1][j][1];
  let storyNodeID = group[i][1][j][2];
  let state = 0;
  if (group[i][0][1] & 1) state = -1;
  else state = 1;
  let ret = 0;
  if (tot & 1) {
    if (slt * 2 - 1 < tot) {
      ret =
        storyline[storylineID][segmentID][storyNodeID][0] +
        state * (Math.floor(tot / 2) - slt + 1) * SPACELENGTH;
    } else if (slt * 2 - 1 === tot) {
      ret = storyline[storylineID][segmentID][storyNodeID][0];
    } else {
      ret =
        storyline[storylineID][segmentID][storyNodeID][0] -
        state * (slt - Math.floor(tot / 2) - 1) * SPACELENGTH;
    }
  } else {
    if (slt * 2 > tot) {
      ret =
        storyline[storylineID][segmentID][storyNodeID][0] -
        state * (slt - tot / 2 - 1 + 0.5) * SPACELENGTH;
    } else {
      ret =
        storyline[storylineID][segmentID][storyNodeID][0] +
        state * (tot / 2 - slt + 0.5) * SPACELENGTH;
    }
  }
  return ret;
}
function _getOptLen(storyline, storylineID, segmentID, storyNodeID) {
  let nowSeg = storyline[storylineID][segmentID];
  let nowID = storyNodeID;
  let nxtID = storyNodeID + 1;
  let Y = Math.abs(nowSeg[nxtID][1] - nowSeg[nowID][1]);
  let X = Math.abs(nowSeg[nxtID][0] - nowSeg[nowID][0]);
  let aimX = Math.round(Y / 1500) * 25 - X;
  return aimX;
}
function _getStorylineID(characterName, name) {
  let ret = 0;
  for (let i = 0; i < characterName.length; i++) {
    if (characterName[i] === name) {
      ret = i;
    }
  }
  return ret;
}
function _getStoryNodeY(storyline, storylineID, time) {
  let x = time * 50;
  for (let i = 0; i < storyline[storylineID].length; i++) {
    let L = 0,
      R = storyline[storylineID][i].length - 1,
      mid = 0;
    let ret = -1;
    while (L <= R) {
      mid = (L + R) >> 1;
      if (storyline[storylineID][i][mid][0] <= x) {
        ret = mid;
        L = mid + 1;
      } else {
        R = mid - 1;
      }
    }
    if (ret !== -1) {
      return storyline[storylineID][i][ret][1];
    }
  }
  return ret;
}
function _getStyleType(stylish) {
  let ret = -1;
  switch (stylish) {
    case "Collide":
      ret = 0;
      break;
    case "Knot":
      ret = 0;
      break;
    case "Twine":
      ret = 0;
      break;
    case "Dash":
      ret = 1;
      break;
    case "Zigzag":
      ret = 1;
      break;
    case "Wave":
      ret = 1;
      break;
    case "Bump":
      ret = 1;
      break;
    case "Color":
      ret = 2;
      break;
    case "Width":
      ret = 2;
      break;
    case "Normal":
      ret = 3;
      break;
    default:
      ret = 4;
      break;
  }
  return ret;
}
function _getTime(storyline, storylineID, segmentID, storyNodeID) {
  return Math.floor(
    (storyline[storylineID][segmentID][storyNodeID][0] + 25) / 50
  );
}
function _getTurningType(list, k, storyline) {
  let storylineID = list[k][0];
  let segmentID = list[k][1];
  let storyNodeID = list[k][2];
  let lasTime = storyNodeID - 1;
  let nxtTime = storyNodeID + 1;
  let ret = 0; //normal;
  if (
    nxtTime < storyline[storylineID][segmentID].length &&
    storyline[storylineID][segmentID][storyNodeID][1] >
      storyline[storylineID][segmentID][nxtTime][1]
  )
    ret = 1; //leftdown to rightup low
  if (
    nxtTime < storyline[storylineID][segmentID].length &&
    storyline[storylineID][segmentID][storyNodeID][1] <
      storyline[storylineID][segmentID][nxtTime][1]
  )
    ret = 2; //leftup to rightdown high
  if (
    lasTime >= 0 &&
    storyline[storylineID][segmentID][storyNodeID][1] <
      storyline[storylineID][segmentID][lasTime][1]
  )
    ret = 3; //leftdown to rightup high
  if (
    lasTime >= 0 &&
    storyline[storylineID][segmentID][storyNodeID][1] >
      storyline[storylineID][segmentID][lasTime][1]
  )
    ret = 4; //leftup to rightdown low
  return ret;
}
function _sortByY(list, storyline) {
  for (let i = 0; i < list.length; i++) {
    for (let j = i + 1; j < list.length; j++) {
      if (
        storyline[list[j][0]][list[j][1]][list[j][2]][1] <
        storyline[list[i][0]][list[i][1]][list[i][2]][1]
      ) {
        let tmpI = list[i][0];
        let tmpJ = list[i][1];
        let tmpK = list[i][2];
        list[i][0] = list[j][0];
        list[i][1] = list[j][1];
        list[i][2] = list[j][2];
        list[j][0] = tmpI;
        list[j][1] = tmpJ;
        list[j][2] = tmpK;
      }
    }
  }
  return list;
}
function _sortNumber(a, b) {
  return a - b;
}
function _cutString(originString, groupPosition) {
  let i = 0,
    j = 0;
  let styleOption = new String();
  let tmpA = new Array();
  let tmpB = new Array();
  let len = originString.length;
  for (i = 0; i < len; i++) {
    if (originString[i] !== "_") {
      styleOption += originString[i];
    } else {
      i++;
      break;
    }
  }
  for (; originString[i] === "_"; i++);
  tmpA[0] = originString[i];
  for (; originString[i] === "_"; i++);
  tmpB[0] = originString[i];
  let posY = new Number();
  posY = parseFloat(tmpA);
  let cntNum = new Number();
  cntNum = parseFloat(tmpB);
  let stdY = new Number();
  stdY = groupPosition[posY];
  return { styleOption, stdY, cntNum };
}
function _calculateMarks(storyline, characterName, relate, stylish) {
  let divideMarks = new Array();
  let tmpDivideMarks = new Array();
  let divideCnts = new Array();
  let groupPosition = new Array();
  for (let i = 0; i < storyline.length; i++) {
    divideMarks[i] = new Array();
    tmpDivideMarks[i] = new Array();
    divideCnts[i] = 0;
  }
  if (stylish !== undefined || relate !== undefined) {
    if (stylish !== undefined) {
      for (let i = 0; i < stylish.length; i++) {
        let storylineID = _getStorylineID(characterName, stylish[i][0]);
        tmpDivideMarks[storylineID][divideCnts[storylineID]] = new Array();
        tmpDivideMarks[storylineID][divideCnts[storylineID]] = [
          stylish[i][1],
          stylish[i][3]
        ];
        divideCnts[storylineID]++;
        tmpDivideMarks[storylineID][divideCnts[storylineID]] = new Array();
        tmpDivideMarks[storylineID][divideCnts[storylineID]] = [
          stylish[i][2],
          "Normal"
        ];
        divideCnts[storylineID]++;
      }
    }
    if (relate != undefined) {
      for (let i = 0; i < relate.length; i++) {
        let allY = new Array();
        let cntY = 0;
        let maxY = 0;
        let minY = 1e9;
        for (let j = 0; j < relate[i][0].length; j++) {
          let storylineID = _getStorylineID(characterName, relate[i][0][j]);
          let storynodeY = _getStoryNodeY(storyline, storylineID, relate[i][1]);
          allY[cntY++] = storynodeY;
          maxY = Math.max(maxY, storynodeY);
          minY = Math.min(minY, storynodeY);
        }
        groupPosition[i] = (maxY + minY) * 0.5;
        for (let j = 0; j < relate[i][0].length; j++) {
          let storylineID = _getStorylineID(characterName, relate[i][0][j]);
          let storynodeY = _getStoryNodeY(storyline, storylineID, relate[i][1]);
          let num = 0;
          for (let k = 0; k < cntY; k++) {
            if (allY[k] <= storynodeY) {
              num++;
            }
          }
          tmpDivideMarks[storylineID][divideCnts[storylineID]] = new Array();
          tmpDivideMarks[storylineID][divideCnts[storylineID]] = [
            relate[i][1],
            relate[i][3] + "_" + String(i) + "_" + String(num)
          ];
          divideCnts[storylineID]++;
          tmpDivideMarks[storylineID][divideCnts[storylineID]] = new Array();
          tmpDivideMarks[storylineID][divideCnts[storylineID]][0] = [
            relate[i][2],
            "Normal"
          ];
          divideCnts[storylineID]++;
        }
      }
    }
    for (let i = 0; i < tmpDivideMarks.length; i++) {
      for (let j = 0; j < tmpDivideMarks[i].length; j++) {
        let rec = j;
        for (let k = j + 1; k < tmpDivideMarks[i].length; k++) {
          if (_checkDivideUpdate(tmpDivideMarks, i, k, rec)) {
            rec = k;
          }
        }
        let recA = tmpDivideMarks[i][j][0];
        let recB = tmpDivideMarks[i][j][1];
        tmpDivideMarks[i][j][0] = tmpDivideMarks[i][rec][0];
        tmpDivideMarks[i][j][1] = tmpDivideMarks[i][rec][1];
        tmpDivideMarks[i][rec][0] = recA;
        tmpDivideMarks[i][rec][1] = recB;
      }
      if (tmpDivideMarks[i][0] === undefined) continue;
      let cnt = 0;
      divideMarks[i][cnt] = new Array();
      divideMarks[i][cnt][0] = tmpDivideMarks[i][0][0];
      divideMarks[i][cnt][1] = tmpDivideMarks[i][0][1];
      for (let j = 1; j < tmpDivideMarks[i].length; j++) {
        if (tmpDivideMarks[i][j][0] !== divideMarks[i][cnt][0]) {
          cnt++;
          divideMarks[i][cnt] = new Array();
          divideMarks[i][cnt][0] = tmpDivideMarks[i][j][0];
          divideMarks[i][cnt][1] = tmpDivideMarks[i][j][1];
        }
      }
    }
  }
  return { divideMarks, groupPosition };
}
export function extent(
  storyline,
  retStoryline,
  SCALE = 20,
  SCALELENGTH = 200000,
  STEPLENGTH = 20
) {
  let maxLength = 0;
  for (let i = 0; i < storyline.length; i++) {
    for (let j = 0; j < storyline[i].length; j++) {
      maxLength = Math.max(
        maxLength,
        storyline[i][j][storyline[i][j].length - 1][0]
      );
    }
  }
  for (let i = 0; i < retStoryline.length; i++) {
    for (let j = 0; j < retStoryline[i].length; j++) {
      for (let k = 0; k < retStoryline[i][j].length; k++) {
        retStoryline[i][j][k][0] =
          retStoryline[i][j][k][0] * ((maxLength + SCALELENGTH) / maxLength);
      }
    }
  }
  SCALE = SCALE * ((maxLength + SCALELENGTH) / maxLength);
  STEPLENGTH = STEPLENGTH * ((maxLength + SCALELENGTH) / maxLength);
  return retStoryline;
}
export function deepCopy(tmp) {
  if (tmp instanceof Array) {
    let ret = new Array();
    for (let i = 0; i < tmp.length; i++) {
      ret[i] = deepCopy(tmp[i]);
    }
    return ret;
  } else if (tmp instanceof Object) {
    let ret = new Object();
    for (let i in tmp) {
      ret[i] = deepCopy(tmp[i]);
    }
    return ret;
  } else {
    return tmp;
  }
}
export function initializeGroup(storyline, LINESPACE = 4000) {
  let group = new Array();
  let tot = 0;
  let storylineID = storyline.length;
  let segmentID = 0;
  let maxNodeID = 0;
  for (let i = 0; i < storylineID; i++) {
    segmentID = storyline[i].length;
    for (let j = 0; j < segmentID; j++) {
      if (storyline[i][j].length > maxNodeID) {
        maxNodeID = storyline[i][j].length;
      }
    }
  }
  let deal = new Array();
  for (let i = 0; i < storylineID; i++) {
    deal[i] = new Array();
    segmentID = storyline[i].length;
    for (let j = 0; j < segmentID; j++) {
      deal[i][j] = new Array();
      for (let k = 0; k < maxNodeID; k++) {
        deal[i][j][k] = 0;
      }
    }
  }
  for (let j = 0; j < maxNodeID; j++) {
    for (let i = 0; i < storylineID; i++) {
      segmentID = storyline[i].length;
      for (let z = 0; z < segmentID; z++) {
        if (deal[i][z][j] || storyline[i][z].length <= j) continue;
        deal[i][z][j] = 1;
        let flag = 0;
        let firX = storyline[i][z][j][0];
        let list = new Array();
        let cnt = 0;
        list[cnt] = new Array();
        list[cnt][0] = i;
        list[cnt][1] = z;
        list[cnt][2] = j;
        cnt++;
        for (let k = 0; k < storylineID; k++) {
          for (let h = 0; h < storyline[k].length; h++) {
            if (k === i && h === z) continue;
            let pos = _getAimPos(storyline, k, h, firX);
            if (Math.abs(storyline[k][h][pos][0] - firX) > 0) continue;
            list[cnt] = new Array();
            list[cnt][0] = k;
            list[cnt][1] = h;
            list[cnt][2] = pos;
            cnt++;
          }
        }
        list = _sortByY(list, storyline);
        let head = 0,
          tail = 0;
        while (tail < cnt) {
          while (
            tail < cnt &&
            storyline[list[tail][0]][list[tail][1]][list[tail][2]][0] === firX
          ) {
            tail++;
          } //side by side
          let turningType = new Array();
          for (let k = head; k < tail; k++) {
            //the same turning direction
            turningType[k - head] = _getTurningType(list, k, storyline);
          }
          let finK = 0;
          for (let k = head; k < tail; k = finK) {
            finK = k + 1;
            if (turningType[k - head] === 0) {
              deal[list[k][0]][list[k][1]][list[k][2]] = 1;
              continue;
            }
            while (
              finK < tail &&
              turningType[finK - head] === turningType[k - head] &&
              Math.abs(
                storyline[list[finK][0]][list[finK][1]][list[finK][2]][1] -
                  storyline[list[finK - 1][0]][list[finK - 1][1]][
                    list[finK - 1][2]
                  ][1]
              ) <= LINESPACE
            )
              finK++;
            group[tot] = new Array();
            group[tot][0] = new Array();
            group[tot][0][0] = firX;
            group[tot][0][1] = turningType[k - head];
            group[tot][1] = new Array();
            flag = 1;
            let contentNum = 0;
            while (k < finK) {
              group[tot][1][contentNum] = new Array();
              group[tot][1][contentNum] = [list[k][0], list[k][1], list[k][2]];
              deal[list[k][0]][list[k][1]][list[k][2]] = 1;
              contentNum++;
              k++;
            }
            tot++;
          }
          head = tail;
        }
        if (flag !== 0) {
          group[tot] = new Array();
          group[tot][0] = new Array();
          group[tot][0][0] = firX;
          group[tot][0][1] = _getTurningType(list, 0, storyline);
          group[tot][1] = new Array();
          group[tot][1][0] = new Array();
          group[tot][1][0] = [list[0][0], list[0][1], list[0][2]];
        }
      }
    }
  }
  return group;
}
export function calculateOriginNodes(
  initialNodes,
  timeframeTable,
  entities,
  TIMEFRAMESPAN = 50
) {
  let originNodes = new Array();
  let cnt = 0;
  let tot = 0;
  for (let i = 0; i < entities.length; i++) {
    let _characterName = entities[i];
    let _storySegment = timeframeTable.get(_characterName);
    originNodes[i] = new Array();
    cnt = 0;
    for (let j = 0; j < _storySegment.length; j++) {
      tot = 0;
      originNodes[i][j] = new Array();
      while (
        cnt < initialNodes[i].length &&
        _checkInSameSegment(
          _storySegment[j],
          Math.floor(initialNodes[i][cnt][0] / TIMEFRAMESPAN)
        )
      ) {
        originNodes[i][j][tot] = new Array();
        originNodes[i][j][tot] = [
          initialNodes[i][cnt][0],
          initialNodes[i][cnt][1]
        ];
        cnt++;
        tot++;
      }
    }
  }
  return originNodes;
}
export function calculateRenderNodes(tmpStoryline, group) {
  let renderNodes = deepCopy(tmpStoryline);
  let offset = 0;
  let timeStamps = new Array();
  let tot = 0;
  let cnt = 0;
  let p = new Array();
  for (let i = 0; i < renderNodes.length; i++) {
    p[i] = new Array();
    for (let j = 0; j < renderNodes[i].length; j++) {
      p[i][j] = 0;
      for (let k = 0; k < renderNodes[i][j].length; k++) {
        timeStamps[tot++] = renderNodes[i][j][k][0];
      }
    }
  }
  timeStamps.sort(_sortNumber);
  for (let i = 1; i < tot; i++) {
    if (timeStamps[i] !== timeStamps[cnt]) {
      timeStamps[++cnt] = timeStamps[i];
    }
  }
  cnt++;
  for (let k = 0; k < cnt; k++) {
    let tmpOffset = 0;
    for (let i = 0; i < renderNodes.length; i++) {
      for (let j = 0; j < renderNodes[i].length; j++) {
        let tmpK = p[i][j];
        if (tmpK >= renderNodes[i][j].length) continue;
        if (renderNodes[i][j][tmpK][0] > timeStamps[k]) continue;
        if (renderNodes[i][j][tmpK][0] === timeStamps[k]) {
          if (_checkMoveRules(renderNodes, i, j, tmpK)) {
            tmpOffset = Math.max(
              tmpOffset,
              _getOptLen(renderNodes, i, j, tmpK)
            );
          }
        }
      }
    }
    for (let i = 0; i < renderNodes.length; i++) {
      for (let j = 0; j < renderNodes[i].length; j++) {
        let tmpK = p[i][j];
        if (tmpK >= renderNodes[i][j].length) continue;
        if (renderNodes[i][j][tmpK][0] === timeStamps[k]) {
          renderNodes[i][j][tmpK][0] += offset;
          p[i][j]++;
        }
      }
    }
    offset += tmpOffset;
  }
  for (let i = 0; i < group.length; i++) {
    for (let j = 0; j < group[i][1].length; j++) {
      let nxtPos = _getNxtPos(group, i, j, renderNodes);
      let storylineID = group[i][1][j][0];
      let segmentID = group[i][1][j][1];
      let storyNodeID = group[i][1][j][2];
      renderNodes[storylineID][segmentID][storyNodeID][0] = nxtPos;
      let lasJ = storyNodeID;
      let nxtJ = storyNodeID;
      while (
        lasJ > 1 &&
        renderNodes[storylineID][segmentID][lasJ - 1][0] > nxtPos
      )
        lasJ--;
      while (
        nxtJ < renderNodes[storylineID][segmentID].length &&
        nxtPos >= renderNodes[storylineID][segmentID][nxtJ][0]
      )
        nxtJ++;
      for (let k = lasJ; k < nxtJ; k++) {
        renderNodes[storylineID][segmentID][k][0] = nxtPos;
      }
    }
  }
  return renderNodes;
}
export function calculateSplitNodes(tmpSmoothNodes, splitMarks, originNodes) {
  let splitNodes = new Array();
  let cntNodes = 0;
  let cntSegments = 0;
  let ptOfSplit = 0;
  let sketchStyles = new Array();
  let segmentTime = new Array();
  for (let i = 0; i < tmpSmoothNodes.length; i++) {
    splitNodes[i] = new Array();
    sketchStyles[i] = new Array();
    segmentTime[i] = new Array();
    cntSegments = -1;
    ptOfSplit = 0;
    for (let j = 0; j < tmpSmoothNodes[i].length; j++) {
      ++cntSegments;
      splitNodes[i][cntSegments] = new Array();
      cntNodes = 0;
      for (let k = 0; k < tmpSmoothNodes[i][j].length; k++) {
        let flagSplit = _checkSplit(
          splitMarks,
          ptOfSplit,
          originNodes,
          i,
          j,
          k
        );
        while (flagSplit === 1 || flagSplit === 2) {
          if (flagSplit === 1) {
            if (cntNodes !== 0) {
              splitNodes[i][cntSegments][cntNodes] = deepCopy(
                tmpSmoothNodes[i][j][k]
              );
              ++cntSegments;
              cntNodes = 0;
              if (k < tmpSmoothNodes[i][j].length - 1)
                splitNodes[i][cntSegments] = new Array();
            }
            sketchStyles[i][cntSegments] = splitMarks[i][ptOfSplit][1];
            segmentTime[i][cntSegments] = splitMarks[i][ptOfSplit][0];
            ptOfSplit++;
            break;
          } else {
            const { tmpX, tmpY } = _getSmoothPos(
              tmpSmoothNodes[i][j][k],
              originNodes[i][j][k],
              splitMarks[i][ptOfSplit][0]
            );
            splitNodes[i][cntSegments][cntNodes] = new Array();
            splitNodes[i][cntSegments][cntNodes] = [tmpX, tmpY];
            ++cntSegments;
            splitNodes[i][cntSegments] = new Array();
            cntNodes = 0;
            sketchStyles[i][cntSegments] = splitMarks[i][ptOfSplit][1];
            segmentTime[i][cntSegments] = splitMarks[i][ptOfSplit][0];
            ptOfSplit++;
            splitNodes[i][cntSegments][cntNodes] = new Array();
            splitNodes[i][cntSegments][cntNodes] = [tmpX, tmpY];
            cntNodes++;
            flagSplit = _checkSplit(
              splitMarks,
              ptOfSplit,
              originNodes,
              i,
              j,
              k
            );
          }
        }
        if (flagSplit === 1 && k === tmpSmoothNodes[i][j].length - 1) continue;
        splitNodes[i][cntSegments][cntNodes] = deepCopy(
          tmpSmoothNodes[i][j][k]
        );
        cntNodes++;
      }
    }
  }
  let ret = new Array();
  ret[0] = splitNodes;
  ret[1] = sketchStyles;
  ret[2] = segmentTime;
  return ret;
}
export function calculateStyledNodes(smoothNodes, sketchStyles, groupPosition) {
  let tmpSketchNodes = smoothNodes;
  let aimNodes = [];
  let styledNodes = new Array();
  for (let i = 0; i < tmpSketchNodes.length; i++) {
    styledNodes[i] = new Array();
    for (let j = 0; j < tmpSketchNodes[i].length; j++) {
      styledNodes[i][j] = new Array();
      if (_checkStyleNormal(sketchStyles, i, j)) {
        styledNodes[i][j] = deepCopy(tmpSketchNodes[i][j]);
      } else {
        if (sketchStyles[i][j] === "Wave") {
          aimNodes = _styleWave(tmpSketchNodes);
        } else if (sketchStyles[i][j] === "Zigzag") {
          aimNodes = _styleZigzag(tmpSketchNodes);
        } else if (sketchStyles[i][j] === "Bump") {
          aimNodes = _styleBump(tmpSketchNodes);
        } else if (sketchStyles[i][j] === "Dash") {
          aimNodes = _styleDash(tmpSketchNodes);
        } else {
          const { styleOption, stdY, cntNum } = _cutString(
            sketchStyles[i][j],
            groupPosition
          );
          if (styleOption === "Collide") {
            aimNodes = _relateCollide(tmpSketchNodes, stdY, cntNum);
          } else if (styleOption === "Knot") {
            aimNodes = _relateKnot(tmpSketchNodes);
          } else if (styleOption === "Twine") {
            aimNodes = _relateTwine(tmpSketchNodes);
          }
        }
        styledNodes[i][j] = deepCopy(aimNodes);
      }
    }
  }
  return styledNodes;
}
export function removeAngularNodes(renderNodes, group) {
  let tmpSmoothNodes = deepCopy(renderNodes);
  let flagChange = new Array();
  for (let i = 0; i < renderNodes.length; i++) {
    flagChange[i] = new Array();
    for (let j = 0; j < renderNodes[i].length; j++) {
      flagChange[i][j] = new Array();
      for (let k = 0; k < renderNodes[i][j].length; k++) {
        flagChange[i][j][k] = 0;
      }
    }
  }
  for (let i = 0; i < group.length; i++) {
    let minLength = 1e9;
    let maxAngle = 0;
    let turnType = group[i][0][1];
    for (let j = 0; j < group[i][1].length; j++) {
      let tmpI = group[i][1][j][0];
      let tmpJ = group[i][1][j][1];
      let R = group[i][1][j][2];
      let L = R;
      let nowSeg = tmpSmoothNodes[tmpI][tmpJ];
      if (turnType <= 2) {
        while (L - 1 >= 0 && nowSeg[L - 1][1] === nowSeg[R][1]) L--;
        if (nowSeg[R][0] - nowSeg[L][0] < minLength) {
          minLength = nowSeg[R][0] - nowSeg[L][0];
        }
        maxAngle = Math.max(
          maxAngle,
          Math.atan(
            Math.abs(nowSeg[R + 1][1] - nowSeg[R][1]) -
              Math.abs(nowSeg[R + 1][0] - nowSeg[R][0])
          )
        );
      } else {
        while (R + 1 < nowSeg.length && nowSeg[R + 1][1] === nowSeg[L][1]) R++;
        if (nowSeg[R][0] - nowSeg[L][0] < minLength) {
          minLength = nowSeg[R][0] - nowSeg[L][0];
        }
        maxAngle = Math.max(
          maxAngle,
          Math.atan(
            Math.abs(nowSeg[L - 1][1] - nowSeg[L][1]) -
              Math.abs(nowSeg[L - 1][0] - nowSeg[L][0])
          )
        );
      }
    }
    for (let j = 0; j < group[i][1].length; j++) {
      let tmpI = group[i][1][j][0];
      let tmpJ = group[i][1][j][1];
      let tmpK = group[i][1][j][2];
      flagChange[tmpI][tmpJ][tmpK] = 1;
      if (turnType <= 2) {
        while (
          tmpK > 0 &&
          tmpSmoothNodes[tmpI][tmpJ][tmpK - 1][1] ===
            tmpSmoothNodes[tmpI][tmpJ][tmpK][1] &&
          tmpSmoothNodes[tmpI][tmpJ][tmpK - 1][0] >
            tmpSmoothNodes[tmpI][tmpJ][tmpK][0]
        ) {
          tmpSmoothNodes[tmpI][tmpJ][tmpK - 1][0] =
            tmpSmoothNodes[tmpI][tmpJ][tmpK][0];
          tmpK--;
        }
      } else {
        while (
          tmpK + 1 < tmpSmoothNodes[tmpI][tmpJ].length &&
          tmpSmoothNodes[tmpI][tmpJ][tmpK + 1][1] ===
            tmpSmoothNodes[tmpI][tmpJ][tmpK][1] &&
          tmpSmoothNodes[tmpI][tmpJ][tmpK + 1][0] <
            tmpSmoothNodes[tmpI][tmpJ][tmpK][0]
        ) {
          tmpSmoothNodes[tmpI][tmpJ][tmpK + 1][0] =
            tmpSmoothNodes[tmpI][tmpJ][tmpK][0];
          tmpK++;
        }
      }
    }
  }
  return tmpSmoothNodes;
}
export function calculateTimeline(originNodes, renderNodes) {
  let timeline = new Map();
  let cnt = 0;
  for (let i = 0; i < originNodes.length; i++) {
    for (let j = 0; j < originNodes[i].length; j++) {
      for (let k = 0; k < originNodes[i][j].length; k++) {
        cnt++;
        let time = _getTime(originNodes, i, j, k);
        if (timeline.has(time)) {
        } else {
          timeline.set(time, { x: renderNodes[i][j][k][0], index: cnt });
        }
      }
    }
  }
  return timeline;
}
export function calBezier(p, t, d) {
  let ret = p[0][d] * (1 - t) * (1 - t) * (1 - t);
  ret += 3 * p[1][d] * t * (1 - t) * (1 - t);
  ret += 3 * p[2][d] * t * t * (1 - t);
  ret += p[3][d] * t * t * t;
  return ret;
}
export function judgeStylishAndRelate(relateInfo, stylishInfo) {
  let stylish = new Array();
  let relate = new Array();
  let tmp = new Array();
  let cnt = 0;
  for (let i = 0; i < relateInfo.length; i++) {
    tmp[i] = 1;
  }
  for (let i = 0; i < relateInfo.length; i++) {
    if (tmp[i] === 0) continue;
    for (let j = i + 1; j < relateInfo.length; j++) {
      if (_checkNames(relateInfo, i, j)) {
        if (
          relateInfo[i][2] < relateInfo[j][1] ||
          relateInfo[i][1] > relateInfo[j][2]
        ) {
          continue;
        } else {
          tmp[i] = 0;
          tmp[j] = 0;
        }
      }
    }
  }
  for (let i = 0; i < relateInfo.length; i++) {
    if (tmp[i] === 1) {
      relate[cnt] = new Array();
      relate[cnt] = deepCopy(relateInfo[i]);
      cnt++;
    }
  }
  cnt = 0;
  //#TODO: solve the conflicts between stylish color1 and color2
  for (let i = 0; i < stylishInfo.length; i++) {
    let flag = 1;
    for (let j = 0; j < relateInfo.length && flag; j++) {
      for (let k = 0; k < relateInfo[j][0].length && flag; k++) {
        if (relateInfo[j][0][k] === stylishInfo[i][0]) {
          if (
            relateInfo[j][2] < stylishInfo[i][1] ||
            relateInfo[j][1] > stylishInfo[i][2] ||
            _getStyleType(stylishInfo[i][3] >= 2)
          ) {
            continue;
          } else {
            flag = 0;
          }
        }
      }
    }
    for (let j = 0; j < stylishInfo.length; j++) {
      if (i !== j && stylishInfo[i][0] === stylishInfo[j][0]) {
        if (
          stylishInfo[i][2] < stylishInfo[j][1] ||
          stylishInfo[i][1] > stylishInfo[j][2] ||
          _getStyleType(stylishInfo[i][3] >= 2)
        ) {
          continue;
        } else {
          flag = 0;
        }
      }
    }
    if (flag === 1) {
      stylish[cnt] = new Array();
      stylish[cnt] = deepCopy(stylishInfo[i]);
      cnt++;
    }
  }
  return { relate, stylish };
}
export function initializeSplitMarks(
  storyline,
  characterName,
  relateInfo,
  stylishInfo
) {
  const { divideMarks, groupPosition } = _calculateMarks(
    storyline,
    characterName,
    relateInfo,
    stylishInfo
  );
  let splitMarks = new Array();
  for (let i = 0; i < storyline.length; i++) {
    splitMarks[i] = new Array();
    let cnt = 0;
    let insTime = new Array();
    let insCnt = 0;
    for (let j = 0; j < storyline[i].length; j++) {
      insTime[insCnt++] = _getTime(storyline, i, j, 0, 0);
    }

    let k = 0;
    for (let j = 0; j < insCnt; j++) {
      while (k < divideMarks[i].length && divideMarks[i][k][0] < insTime[j]) {
        splitMarks[i][cnt] = new Array();
        splitMarks[i][cnt] = [divideMarks[i][k][0], divideMarks[i][k][1]];
        cnt++;
        k++;
      }
      if (k < divideMarks[i].length && divideMarks[i][k][0] === insTime[j]) {
        splitMarks[i][cnt] = new Array();
        splitMarks[i][cnt] = [divideMarks[i][k][0], divideMarks[i][k][1]];
        cnt++;
        k++;
        continue;
      }
      if (k >= divideMarks[i].length || divideMarks[i][k][0] > insTime[j]) {
        splitMarks[i][cnt] = new Array();
        splitMarks[i][cnt] = [insTime[j], "Normal"];
        cnt++;
      }
      if (k < divideMarks[i].length) {
        splitMarks[i][cnt] = new Array();
        splitMarks[i][cnt] = [divideMarks[i][k][0], divideMarks[i][k][1]];
        cnt++;
        k++;
      }
    }
  }
  return { splitMarks, groupPosition };
}
export function calculateStyles(segmentTime, characterName, relate, stylish) {
  let styleConfig = new Array();
  let cnt = 0;
  for (let i = 0; i < segmentTime.length; i++) {
    for (let j = 0; j < segmentTime[i].length; j++) {
      let styleCnt = 0;
      for (let k = 0; k < relate.length; k++) {
        for (let g = 0; g < relate[k].length; g++) {
          if (
            relate[k][0][g] === characterName[i] &&
            segmentTime[i][j] >= relate[k][1] &&
            segmentTime[i][j] <= relate[k][2]
          ) {
            if (styleCnt === 0) {
              styleConfig[cnt] = new Array();
              styleConfig[cnt][0] = characterName[i];
              styleConfig[cnt][1] = j;
              styleConfig[cnt][2] = new Array();
              cnt++;
            }
            styleConfig[cnt - 1][2][styleCnt] = relate[k][3];
            styleCnt++;
          }
        }
      }
      for (let k = 0; k < stylish.length; k++) {
        if (
          stylish[k][0] === characterName[i] &&
          segmentTime[i][j] >= stylish[k][1] &&
          segmentTime[i][j] <= stylish[k][2]
        ) {
          if (styleCnt === 0) {
            styleConfig[cnt] = new Array();
            styleConfig[cnt][0] = characterName[i];
            styleConfig[cnt][1] = j;
            styleConfig[cnt][2] = new Array();
            cnt++;
          }
          styleConfig[cnt - 1][2][styleCnt] = stylish[k][3];
          styleCnt++;
        }
      }
    }
  }
  return styleConfig;
}
export function linkNodes(nodes, type = 0, SAMPLERATE = 20, style = 0) {
  let aimNodes = new Array();
  if (style === 0) {
    let p = new Array();
    for (let i = 0; i < 4; i++) {
      p[i] = new Array();
      p[i][0] = p[i][1] = 0;
    }
    if (type == 0) {
      //拐角中线平滑
      p[0][0] = nodes[0][0];
      p[0][1] = nodes[0][1];
      p[1][0] = (nodes[0][0] + nodes[1][0]) * 0.5;
      p[1][1] = nodes[0][1];
      p[2][0] = (nodes[0][0] + nodes[1][0]) * 0.5;
      p[2][1] = nodes[1][1];
      p[3][0] = nodes[1][0];
      p[3][1] = nodes[1][1];
    } else {
      for (let i = 0; i < 4; i++) {
        p[i][0] = nodes[i][0];
        p[i][1] = nodes[i][1];
      }
    }
    for (let i = 0; i <= SAMPLERATE; i++) {
      aimNodes[i] = new Array();
      aimNodes[i][0] = calBezier(p, i / SAMPLERATE, 0);
      aimNodes[i][1] = calBezier(p, i / SAMPLERATE, 1);
    }
  }
  return aimNodes;
}
function _styleWave(tmpSketchNodes, WAVEHEIGHT = 600, PI = 3.14) {
  let styledNodes = new Array();
  let cnt = 0;
  for (let k = 0; k < tmpSketchNodes.length - 1; k++) {
    if (tmpSketchNodes[k][1] !== tmpSketchNodes[k + 1][1]) {
      styledNodes[cnt++] = deepCopy(tmpSketchNodes[k]);
    } else {
      let nxtK = _getNxtK(tmpSketchNodes, k);
      let tmpLength = tmpSketchNodes[nxtK][0] - tmpSketchNodes[k][0];
      let WAVERATE = Math.ceil(tmpLength / 80);
      let SAMPLERATE = Math.ceil(tmpLength / 5);
      for (let z = 0; z <= SAMPLERATE; z++) {
        styledNodes[cnt] = new Array();
        styledNodes[cnt][0] =
          tmpSketchNodes[k][0] + (tmpLength * z) / SAMPLERATE;
        styledNodes[cnt][1] =
          Math.sin((z * WAVERATE * PI) / SAMPLERATE) * WAVEHEIGHT +
          tmpSketchNodes[k][1];
        cnt++;
      }
      k = nxtK;
    }
  }
}
function _styleZigzag(tmpSketchNodes, ZIGHEIGHT = 500) {
  let styledNodes = [];
  let cnt = 0;
  for (let k = 0; k < tmpSketchNodes.length - 1; k++) {
    if (tmpSketchNodes[k][1] !== tmpSketchNodes[k + 1][1]) {
      styledNodes[cnt++] = deepCopy(tmpSketchNodes[k]);
    } else {
      let nxtK = _getNxtK(tmpSketchNodes, k);
      let tmpLength = tmpSketchNodes[nxtK][0] - tmpSketchNodes[k][0];
      let tmpHeight = ZIGHEIGHT;
      let SAMPLERATE = Math.ceil(tmpLength / 50);
      styledNodes[cnt++] = deepCopy(tmpSketchNodes[k]);
      for (let z = 0; z < SAMPLERATE; z++) {
        styledNodes[cnt] = new Array();
        styledNodes[cnt][0] =
          tmpSketchNodes[k][0] + (tmpLength * (z + 0.5)) / SAMPLERATE;
        styledNodes[cnt++][1] = tmpSketchNodes[k][1] + tmpHeight;
        tmpHeight = 0 - tmpHeight;
      }
      styledNodes[cnt++] = deepCopy(tmpSketchNodes[nxtK]);
      k = nxtK;
    }
  }
}
function _styleBump(tmpSketchNodes, BUMPHEIGHT = 500) {
  let styledNodes = [];
  let cnt = 0;
  for (let k = 0; k < tmpSketchNodes.length - 1; k++) {
    if (tmpSketchNodes[k][1] !== tmpSketchNodes[k + 1][1]) {
      styledNodes[cnt++] = deepCopy(tmpSketchNodes[k]);
    } else {
      let nxtK = _getNxtK(tmpSketchNodes, k);
      let tmpLength = tmpSketchNodes[nxtK][0] - tmpSketchNodes[k][0];
      let tmpHeight = BUMPHEIGHT;
      let SAMPLERATE = Math.ceil(tmpLength / 50);
      styledNodes[cnt++] = deepCopy(tmpSketchNodes[k]);
      styledNodes[cnt] = deepCopy(tmpSketchNodes[k]);
      styledNodes[cnt++][1] += tmpHeight;
      for (let z = 1; z < SAMPLERATE; z++) {
        styledNodes[cnt] = new Array();
        styledNodes[cnt][0] =
          tmpSketchNodes[k][0] + (tmpLength * z) / SAMPLERATE;
        styledNodes[cnt][1] = tmpSketchNodes[k][1] + tmpHeight;
        tmpHeight = 0 - tmpHeight;
        cnt++;
        styledNodes[cnt] = new Array();
        styledNodes[cnt][0] =
          tmpSketchNodes[k][0] + (tmpLength * z) / SAMPLERATE;
        styledNodes[cnt][1] = tmpSketchNodes[k][1] + tmpHeight;
        cnt++;
      }
      styledNodes[cnt] = new Array();
      styledNodes[cnt][0] = tmpSketchNodes[k][0] + tmpLength;
      styledNodes[cnt][1] = tmpSketchNodes[k][1] + tmpHeight;
      tmpHeight = 0 - tmpHeight;
      cnt++;
      styledNodes[cnt] = new Array();
      styledNodes[cnt][0] = tmpSketchNodes[k][0] + tmpLength;
      styledNodes[cnt][1] = tmpSketchNodes[k][1];
      cnt++;
      k = nxtK;
    }
  }
}
function _styleDash(tmpSketchNodes) {
  let styledNodes = [];
  let cnt = 0;
  for (let k = 0; k < tmpSketchNodes.length - 1; k++) {
    if (tmpSketchNodes[k][1] !== tmpSketchNodes[k + 1][1]) {
      styledNodes[cnt++] = deepCopy(tmpSketchNodes[k]);
    } else {
      let nxtK = _getNxtK(tmpSketchNodes, k);
      let tmpLength = tmpSketchNodes[nxtK][0] - tmpSketchNodes[k][0];
      let SAMPLERATE = Math.ceil(tmpLength / 50);
      for (let z = 0; z <= SAMPLERATE; z++) {
        styledNodes[cnt] = new Array();
        styledNodes[cnt][0] =
          tmpSketchNodes[k][0] + (tmpLength * z) / SAMPLERATE;
        styledNodes[cnt][1] = tmpSketchNodes[k][1];
        cnt++;
      }
      k = nxtK;
    }
  }
}
function _relateCollide(tmpSketchNodes, stdY, cntNum, COLLIDEHEIGHT = 250) {
  const { aNodes, bNodes } = _forRelateTurn(
    tmpSketchNodes,
    0.2,
    stdY,
    (cntNum & 1 ? -1 : 1) * COLLIDEHEIGHT
  );
  let aimNodes = new Array();
  let cnt = 0;
  for (let z = 0; z < aNodes.length; z++) {
    aimNodes[cnt++] = deepCopy(aNodes);
  }
  for (let z = 0; z < bNodes.length; z++) {
    aimNodes[cnt++] = deepCopy(bNodes);
  }
  return aimNodes;
}
function _relateKnot(tmpSketchNodes, stdY, KNOTHEIGHT = 2000) {
  const { aNodes, bNodes } = _forRelateTurn(tmpSketchNodes, 0.4, stdY, 0);
  let SAMPLERATE = Math.ceil(midLength / 40);
  let aimNodes = new Array();
  let midLength =
    0.2 * (tmpSketchNodes[tmpSketchNodes.length - 1][0] - tmpSketchNodes[0][0]);
  let cnt = 0;
  for (let i = 0; i < aNodes.length; i++) {
    aimNodes[cnt++] = deepCopy(aNodes[i]);
  }
  for (let i = 0; i <= SAMPLERATE; i++) {
    aimNodes[cnt] = new Array();
    aimNodes[cnt][0] = Math.random() * midLength + staX;
    aimNodes[cnt][1] =
      Math.random() * KNOTHEIGHT * (Math.random > 0.5 ? 1 : -1) + stdY;
    cnt++;
  }
  for (let i = 0; i < bNodes.length; i++) {
    aimNodes[cnt++] = deepCopy(bNodes[i]);
  }
  return aimNodes;
}
function _relateTwine(tmpSketchNodes, TWINEHEIGHT = 500, PI = 3.14) {
  const { aNodes, bNodes } = _forRelateTurn(tmpSketchNodes, 0.2, stdY, 0);
  let aimNodes = new Array();
  let cnt = 0;
  for (let i = 0; i < aNodes.length; i++) {
    aimNodes[cnt++] = deepCopy(aNodes[i]);
  }
  let midLength =
    (tmpSketchNodes[tmpSketchNodes.length - 1][0] - tmpSketchNodes[0][0]) * 0.6;
  let WAVERATE = Math.ceil(midLength / 100);
  let SAMPLERATE = Math.ceil(midLength / 8);
  if (!(SAMPLERATE & 1)) SAMPLERATE += 1;
  for (let i = 0; i <= SAMPLERATE; i++) {
    aimNodes[cnt] = new Array();
    aimNodes[cnt][0] = staX + (midLength * i) / SAMPLERATE;
    aimNodes[cnt][1] =
      (cntNum & 1 ? -1 : 1) *
        Math.sin((i * WAVERATE * PI) / SAMPLERATE) *
        TWINEHEIGHT +
      stdY;
    cnt++;
  }
  for (let i = 0; i < bNodes.length; i++) {
    aimNodes[cnt++] = deepCopy(bNodes[i]);
  }
  return aimNodes;
}
function _forRelateTurn(tmpSketchNodes, rate, stdY, HEIGHT) {
  let tail = tmpSketchNodes.length - 1;
  let tmpLength = tmpSketchNodes[tail][0] - tmpSketchNodes[0][0];
  let staX = rate * tmpLength + tmpSketchNodes[0][0];
  let endX = (1 - rate) * tmpLength + tmpSketchNodes[0][0];
  let SAMPLERATE = Math.ceil((0.2 * tmpLength) / 8);
  if (!(SAMPLERATE & 1)) SAMPLERATE += 1;
  let aNodes = linkNodes(
    [tmpSketchNodes[0], [[staX, stdY + HEIGHT]]],
    0,
    SAMPLERATE
  );
  let bNodes = linkNodes(
    [[endX, stdY + HEIGHT], tmpSketchNodes[tail]],
    0,
    SAMPLERATE
  );
  return { aNodes, bNodes };
}
