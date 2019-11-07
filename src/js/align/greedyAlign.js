// let straightenLine=[['VADER',1,1111]];
let straightenLine = [];
let bendLine = [];
const straighten_FACTOR = 10000;
const bend_FACTOR = -10000;

const RELATIVE_FACTOR_ALPHA = 0.1;
// record the best path direction
const LEFT = "LEFT",
  LEFT_UP = "LEFT_UP",
  UP = "UP";

function _hasChildren(_) {
  return !(!Array.isArray(_.children) || _.children.length === 0);
}

function _create2DArray(row, column, defaultValue) {
  return defaultValue === undefined
    ? [...Array(row).keys()].map(() => Array(column))
    : [...Array(row).keys()].map(() => Array(column).fill(defaultValue));
}

function _longestCommonSubstring(sessionA, sessionB) {
  // session: [sessionId, [EntityInfo]]
  // make its index starts from 1 for DP
  // copy array for re-entrance
  let reference = sessionA[1].slice();
  reference.unshift(undefined);
  let target = sessionB[1].slice();
  target.unshift(undefined);

  let m = sessionA[1].length;
  let n = sessionB[1].length;
  let z = 0;
  let result = [];

  let table = _create2DArray(m + 1, n + 1);

  for (let i = 0; i <= m; i++) {
    table[i][0] = 0;
  }
  for (let i = 0; i <= n; i++) {
    table[0][i] = 0;
  }

  for (let i = 1; i <= m; i++)
    for (let j = 1; j <= n; j++) {
      if (reference[i].entity === target[j].entity) {
        table[i][j] = table[i - 1][j - 1] + 1;
        if (table[i][j] > z) {
          z = table[i][j];
          result = reference.slice(i - z + 1, i + 1).map(v => v.entity);
        } else if (table[i][j] === z) {
          result.concat(reference.slice(i - z + 1, i + 1).map(v => v.entity));
        }
      } else {
        table[i][j] = 0;
      }
    }

  return result;
}

function _alignSequence(sequence) {
  let result = [];
  result.push([0, undefined]);
  // initial position has no aligned pairs
  for (let i = 0; i + 1 < sequence.length; i++) {
    let [_, previousOrder] = sequence[i];
    let [__, nextOrder] = sequence[i + 1];
    // it contains aligned session pairs
    // between j and j - 1 timeframe
    // previousOrder.unshift(undefined);
    // nextOrder.unshift(undefined);
    result.push([
      sequence[i + 1][0],
      _alignSingleGap(previousOrder, nextOrder, sequence[i + 1][0])
    ]);
    // previousOrder.shift();
    // nextOrder.shift();
  }

  return result;
}

// function _getSessionOrder(root) {
//   let result = [];
//   _alignSingleGap(root);
//   // the output array should use index that starts from 1 for dynammic programming
//   result.unshift(undefined);
//   return result;

//   function _alignSingleGap(rtree) {
//     if (_hasChildren(rtree)) {
//       for (let child of rtree.children) {
//         _alignSingleGap(child);
//       }
//     }
//     for (let entry of rtree.sessions) {
//       result.push(entry);
//     }
//     delete rtree.order;
//   }
// }

// previousOrder: [[sessionId, [EntityInfo: {entity: String, start:Int, end:Int}]]
// dynamic programming
// the input array should use index that starts from 1
function _alignSingleGap(previousOrder, nextOrder, time) {
  // use undefined to indicate that the orders are identical
  if (_isIdenticalOrder(previousOrder, nextOrder)) {
    return undefined;
  }

  // the input array should use index that starts from 1
  // length include the dummy undefined
  let m = previousOrder.length - 1,
    n = nextOrder.length - 1;
  // zero index included
  let dynamicTable = _create2DArray(m + 1, n + 1);
  let pathTable = _create2DArray(m + 1, n + 1);

  // match(i,j) = max (match(i-1, j-1) + sim(li, rj), match(i-1, j), match(i, j-1)) : if i > 0 and j > 0
  //            = 0 : if i = 0 or j = 0

  for (let i = 0; i <= m; i++) {
    dynamicTable[i][0] = 0;
  }

  for (let i = 0; i <= n; i++) {
    dynamicTable[0][i] = 0;
  }

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      let left = dynamicTable[i - 1][j],
        leftUp =
          dynamicTable[i - 1][j - 1] +
          _similarity(
            previousOrder[i],
            nextOrder[j],
            previousOrder,
            nextOrder,
            time
          ),
        up = dynamicTable[i][j - 1],
        max = Math.max(left, leftUp, up),
        pathDirection;
      dynamicTable[i][j] = max;
      switch (max) {
        case leftUp:
          pathDirection = LEFT_UP;
          break;
        case left:
          pathDirection = LEFT;
          break;
        case up:
          pathDirection = UP;
          break;
        default:
          break;
      }

      pathTable[i][j] = pathDirection;
    }
  }

  return _getAlignedSessionPairs(pathTable);
}

function _isIdenticalOrder(previousOrder, nextOrder) {
  if (previousOrder.length !== nextOrder.length) {
    return false;
  }
  for (let i = 1; i < previousOrder.length; i++) {
    let [_, previousEntitiesInfoArray] = previousOrder[i];
    let [__, nextEntitiesInfoArray] = nextOrder[i];
    if (previousEntitiesInfoArray.length !== nextEntitiesInfoArray.length) {
      return false;
    }
    for (let j = 0; j < previousEntitiesInfoArray.length; j++) {
      let entityInfo = previousEntitiesInfoArray[j];
      let nextEntityInfo = nextEntitiesInfoArray[j];
      if (entityInfo.entity !== nextEntityInfo.entity) {
        return false;
      }
    }
  }
  return true;
}

function _similarity(sessionA, sessionB, previousOrder, nextOrder, t) {
  let straightenCha = straightenLine
    .filter(pair => pair[1] <= t && pair[2] >= t)
    .map(pair => pair[0]);
  let bendCha = bendLine.filter(pair => pair[1] === t).map(pair => pair[0]);
  if (
    straightenCha.some(straightchaName =>
      sessionA[1].some(cha => cha.entity === straightchaName)
    ) &&
    straightenCha.some(straightchaName =>
      sessionB[1].some(cha => cha.entity === straightchaName)
    )
  ) {
    return (
      _longestCommonSubstring(sessionA, sessionB).length +
      RELATIVE_FACTOR_ALPHA *
        _relative_similarity(
          previousOrder.indexOf(sessionA),
          nextOrder.indexOf(sessionB),
          previousOrder.length,
          nextOrder.length
        ) +
      straighten_FACTOR
    );
  }

  if (
    bendCha.some(Name => sessionA[1].some(cha => cha.entity === Name)) &&
    bendCha.some(Name => sessionB[1].some(cha => cha.entity === Name))
  ) {
    return (
      _longestCommonSubstring(sessionA, sessionB).length +
      RELATIVE_FACTOR_ALPHA *
        _relative_similarity(
          previousOrder.indexOf(sessionA),
          nextOrder.indexOf(sessionB),
          previousOrder.length,
          nextOrder.length
        ) +
      bend_FACTOR
    );
  }

  return (
    _longestCommonSubstring(sessionA, sessionB).length +
    RELATIVE_FACTOR_ALPHA *
      _relative_similarity(
        previousOrder.indexOf(sessionA),
        nextOrder.indexOf(sessionB),
        previousOrder.length,
        nextOrder.length
      )
  );
}

// i,j is session index, m,n is session squence length
function _relative_similarity(i, j, m, n) {
  return 1 - Math.abs(i / m - j / n);
}

function _getAlignedSessionPairs(pathTable) {
  let result = new Map();

  let m = pathTable.length - 1;
  let n = pathTable[m].length - 1;

  for (let target = pathTable[m][n]; target; target = pathTable[m][n]) {
    if (m === 0 || n === 0) {
      break;
    }

    switch (target) {
      case LEFT_UP:
        // one session can align up to one session
        // so use map, use session in t+1 as key for convenience in QP
        result.set(n, m);
        m -= 1;
        n -= 1;
        break;
      case LEFT:
        m -= 1;
        break;
      case UP:
        n -= 1;
        break;
      default:
        break;
    }
  }

  return result;
}

export function greedyAlign(sortAns, straightInfo, bendInfo) {
  let data = sortAns;
  let sequence = sortAns.sequence;
  bendLine = [];
  straightenLine = [];
  for (let [_, order] of sequence) {
    order.unshift(undefined);
  }
  if (bendInfo.length >= 1)
    bendInfo.forEach(pair => {
      bendLine.push([...pair.names, ...pair.timeSpan]);
    });
  if (straightInfo.length >= 1)
    straightInfo.forEach(pair => {
      straightenLine.push([...pair.names, ...pair.timeSpan]);
    });
  let alignedSessions = _alignSequence(sequence);
  let chaOrder = sequence.map(timeframe => [...timeframe[1]]);

  for (let i = 0; i < chaOrder.length; i++) {
    chaOrder[i][0] = sequence[i][0];
  }
  for (let timeframe of chaOrder) {
    for (let i = 1; i < timeframe.length; i++) {
      timeframe[i][0] = i;
    }
  }
  for (let timeframe of chaOrder) {
    for (let i = timeframe.length - 1; i > 0; i--) {
      let time = timeframe[0];
      let session = timeframe[i];
      let chaName = session[1].map(cha => cha.entity);
      if (
        !straightenLine.some(
          pair =>
            chaName.indexOf(pair[0]) !== -1 &&
            time <= pair[2] &&
            time >= pair[1]
        )
      )
        timeframe.splice(i, 1);
    }
  }

  for (let timeframe of chaOrder) {
    if (timeframe === chaOrder[0]) continue;
    let time = timeframe[0];
    for (let i = 1; i < timeframe.length; i++) {
      let session = timeframe[i];
      let sessionId = session[0];
      // noinspection JSAnnotator
      function timesessionId2Alignedsession(time, sessionId) {
        let alignedsessionId = -1;
        let thisSession, formerSession;
        for (let alignedInfo of alignedSessions) {
          if (alignedInfo[0] === time && alignedInfo[1] === undefined) {
            alignedsessionId = sessionId;
            break;
          }
          if (alignedInfo[0] === time) {
            alignedsessionId = alignedInfo[1].get(sessionId);
            break;
          }
        }
        for (let timeframe of sequence) {
          if (timeframe[0] !== time) formerSession = timeframe[1];
          else {
            thisSession = timeframe[1][sessionId];
            break;
          }
        }
        formerSession = formerSession[alignedsessionId];
        return [formerSession, thisSession];
      }
      let [formerSession, thisSession] = timesessionId2Alignedsession(
        time,
        sessionId
      );
      if (formerSession === undefined) continue;
      for (let pair of straightenLine) {
        if (time <= pair[2] && time >= pair[1]) {
          let formNum = 0,
            thisNum = 0;
          let formFlag = false,
            thisFlag = false;
          for (let formerCha of formerSession[1]) {
            if (formerCha.entity !== pair[0]) formNum++;
            else {
              formFlag = true;
              break;
            }
          }
          for (let thisCha of thisSession[1]) {
            if (thisCha.entity !== pair[0]) thisNum++;
            else {
              thisFlag = true;
              break;
            }
          }
          if (!formFlag || !thisFlag || formNum === thisNum) continue;
          if (formNum < thisNum) {
            let temp = thisSession[1][thisNum];
            thisSession[1][thisNum] = thisSession[1][formNum];
            thisSession[1][formNum] = temp;
          }
          if (formNum > thisNum) {
            // let temp=formerSession[1][thisNum];
            // formerSession[1][thisNum]=formerSession[1][formNum];
            // formerSession[1][formNum]=temp;
            let count = formNum - thisNum;
            for (let i = 0; i < count; i++)
              thisSession[1].splice(0, 0, { entity: "" });
          }
        } else continue;
      }
    }
  }
  for (let [_, order] of sequence) {
    order.shift();
  }
  //在sequence中找到straightchaName，对应得alignSessions，再调换角色
  //在其前加入假的角色，在其后调换位置
  //拉直结束
  let greedyAlignAns = data;
  greedyAlignAns.alignedSessions = alignedSessions;
  return greedyAlignAns;
}
