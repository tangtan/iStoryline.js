import { Table } from '../data/table'
import { number } from 'mathjs'

const DistanceOut = 10
const DistanceIn = 10

export function greedySlotCompact(story, constraints) {
  const param = getParam(story, constraints)
  const layoutTable = runAlgorithms(param)
  story.setTable('layout', layoutTable)
}

function getParam(story, constraints) {
  let alignTable = story.getTable('align')
  //console.log(alignTable)
  let sessionTable = story.getTable('session')
  //console.log(sessionTable);
  let sortTable = story.getTable('sort')
  //console.log(sortTable)
  // let [height, width] = sortTable.mat.size()
  let height = sessionTable.rows
  let width = sessionTable.cols
  let characterIdInOrder = []
  ////console.log(sessionTable)

  let sessionInOrder = []
  let sessionAlignMaps = []
  for (let time = 0; time < width; time++) {
    let num = []
    for (let id = 0; id < height; id++) {
      if (sortTable.value(id, time) !== 0) num.push(id)
    }
    num.sort((a, b) => {
      sortTable.value(a, time) - sortTable.value(b, time)
    })
    characterIdInOrder.push(num)
    let sessionInOrderSet = new Set()
    for (let cha of num) sessionInOrderSet.add(sessionTable.value(cha, time))
    sessionInOrder.push(Array.from(sessionInOrderSet))
    if (time == width - 1) continue // next, we deal with align
    let sessionAlignMap = new Map()
    let beAlignedSession = new Map() //sessionId 2 size, however don't use size now
    for (let characterId of num) {
      //num:characterIdInOrderInThisTime
      const sessionId = sessionTable.value(characterId, time)
      const alignCharacterId = alignTable.value(characterId, time)
      let alignSessionId = -1
      if (alignCharacterId !== -1)
        alignSessionId = sessionTable.value(alignCharacterId, time + 1)
      if (alignSessionId === 0) alignSessionId = -1
      //bug

      if (
        !sessionAlignMap.has(sessionId) ||
        sessionAlignMap.get(sessionId) === -1
      ) {
        if (beAlignedSession.has(alignSessionId)) alignSessionId = -1
        sessionAlignMap.set(sessionId, alignSessionId)
        beAlignedSession.set(alignSessionId, true)
      }
    }
    sessionAlignMaps.push(sessionAlignMap)
  }

  return {
    alignTable,
    sessionTable,
    sortTable,
    height,
    width,
    characterIdInOrder,
    sessionAlignMaps,
    sessionInOrder,
  }
}
/**
 *
 * @param {Number[][]} characterIdInOrder
 * @param {Table} sessionTable
 * @param {Number} time
 * @param {Number} sessionId
 * @returns {Number[]}
 */
function sessionId2CharactersInOrder(
  characterIdInOrder,
  sessionTable,
  time,
  sessionId
) {
  let characterIdInOrderInThisTime = characterIdInOrder[time]
  let ans = []
  for (let characterId of characterIdInOrderInThisTime) {
    if (sessionTable.value(characterId, time) === sessionId)
      ans.push(characterId)
  }
  return ans
}

function calculateSlotHeight(slots, slotId, characterIdInOrder, sessionTable) {
  let sum = 0
  for (let i = 0; i < slotId; i++) {
    let slot = slots[i]
    let maxCharacterNum = 0
    for (let time = 0; time < slot.length; time++) {
      let characters = sessionId2CharactersInOrder(
        characterIdInOrder,
        sessionTable,
        time,
        slot[time]
      )
      maxCharacterNum = Math.max(maxCharacterNum, characters.length)
    }
    sum += (maxCharacterNum - 1) * DistanceIn + DistanceOut
  }
  return sum
}

function insert2Array(pos, array, element) {
  array.splice(number, 0, element)
}

function sessionIdTime2SlotId(slots, sessionId, time) {
  for (let i = 0; i < slots.length; i++) {
    if (slots[i][time] === sessionId) return i
  }
  return -1
}

function runAlgorithms(param) {
  let {
    sessionTable,
    sortTable,
    alignTable,
    height,
    width,
    characterIdInOrder,
    sessionInOrder,
    sessionAlignMaps,
  } = param
  let ans = new Table()
  ans.resize(height, width, -1)
  let slots = []
  sessionInOrder[0].forEach(sessionId => {
    slots.push([sessionId])
  })
  //init slots
  //insert session to slot
  for (let time = 1; time < width; time++) {
    let sessionIdHasDealedMap = new Map()
    for (let slotId = 0; slotId < slots.length; slotId++) {
      let slot = slots[slotId]
      const lastTimeSessionId = slot[time - 1]
      if (!sessionAlignMaps[time - 1].has(lastTimeSessionId)) {
        slot.push(-1)
        continue
      }
      const thisTimeSessionId = sessionAlignMaps[time - 1].get(
        lastTimeSessionId
      )
      // if (thisTimeSessionId===0) debugger
      slot.push(thisTimeSessionId)
      sessionIdHasDealedMap.set(thisTimeSessionId, slotId)
    }
    //deal with new session
    let sessionIds = sessionInOrder[time]
    //is the first session aligned?
    if (!sessionIdHasDealedMap.has(sessionIds[0])) {
      let slot = new Array(time).fill(-1) //0-time-1
      slot.push(sessionIds[0])
      insert2Array(0, slots, slot)
      sessionIdHasDealedMap.set(sessionIds[0], 0)
    }
    for (
      let sessionIdNum = 1;
      sessionIdNum < sessionIds.length;
      sessionIdNum++
    ) {
      const sessionId = sessionIds[sessionIdNum]
      if (sessionIdHasDealedMap.has(sessionId)) continue
      //get last slot ID
      const lastSessionId = sessionIds[sessionIdNum - 1]
      const lastSlotId = sessionIdTime2SlotId(slots, lastSessionId, time)
      let slot = new Array(time).fill(-1) //0-time-1
      slot.push(sessionId)
      insert2Array(lastSlotId + 1, slots, slot)
    }
  }
  let slotsOfCharacter = new Array(slots.length)
  for (let i = 0; i < slotsOfCharacter.length; i++) slotsOfCharacter[i] = []
  for (let slotsId = 0; slotsId < slots.length; slotsId++)
    for (let time = 0; time < width; time++) {
      if (slots[slotsId][time] === -1) continue
      slotsOfCharacter[slotsId][time] = sessionId2CharactersInOrder(
        characterIdInOrder,
        sessionTable,
        time,
        slots[slotsId][time]
      )
    }
  //TODO align character
  let baseHeightArray = new Array(slots.length)
  for (
    let slotsOfCharacterId = 0;
    slotsOfCharacterId < slotsOfCharacter.length;
    slotsOfCharacterId++
  )
    for (let time = 0; time < width; time++) {
      if (!baseHeightArray[slotsOfCharacterId])
        baseHeightArray[slotsOfCharacterId] = calculateSlotHeight(
          slots,
          slotsOfCharacterId,
          characterIdInOrder,
          sessionTable
        )
      let baseHeight = baseHeightArray[slotsOfCharacterId]
      let charactersInThisSlot = slotsOfCharacter[slotsOfCharacterId][time]
      if (!charactersInThisSlot) continue
      for (
        let characterI = 0;
        characterI < charactersInThisSlot.length;
        characterI++
      ) {
        const characterId = charactersInThisSlot[characterI]
        const Height = baseHeight + characterI * DistanceIn
        ans.replace(characterId, time, Height)
      }
    }
  // debugger

  // for (let time = 0; time < width; time++) {
  //   for (let id = 0; id < height; id++) {
  //     if (sortTable.value(id, time) !== 0)
  //       ans.replace(id, time, sortTable.value(id, time) * DistanceOut)
  //   }
  // }
  //console.log(ans)
  return ans
}

// let compressTime = [];
// let d1 = 0; //out
// let d2 = 1000; //in
// let graph = {};
// let sequence;
// let data;
// let timeframe = [];
// let slot = [];
// let alignedSession;
// let record = [];
// let mergeInfo = [];

// //change sequence into timeframe
// function _getTimeframe(time) {
//   let delsessionID = [];
//   let inflag = 1;
//   let timeframe = sequence[time];
//   const Sessions = [];
//   let order = timeframe[1];
//   for (let i = 1; i < order.length; i++) {
//     let session = {};
//     session.begin = timeframe[0];
//     session.end = sequence[time + 1][0] - 1;
//     session.content = order[i][1];
//     let flag = 0;
//     for (let cha in session.content)
//       if (cha.end !== sequence[time][0]) flag = 1;
//     if (flag === 0) continue;
//     for (let i = session.content.length - 1; i >= 0; i--) {
//       if (session.content[i].end === sequence[time][0])
//         session.content.splice(i, 1);
//     }

//     Sessions.push(session);
//     if (session.content.length == 0) delsessionID.push(i);
//   }
//   delsessionID.forEach(sessionID => {
//     order.splice(sessionID, 1);
//   });
//   return Sessions;
// }

// //find the order of a name in a slot
// function _name2num(time, name) {
//   let ans = -1;
//   let flag = 1;
//   timeframe.forEach(tt => {
//     tt.forEach(x => {
//       if (time >= x.begin && time < x.end) {
//         x.content.forEach(y => {
//           if (y.entity !== name) {
//             ans += flag;
//           } else {
//             ans += flag;
//             flag = 0;
//           }
//         });
//       }
//     });
//   });
//   if (flag === 1) return -1;
//   return ans;
// }

// //default function
// //graph is the output
// //data is the names and orders
// //sequence contains keytimes and sessions
// export function greedySlotCompact(
//   alignAns,
//   compressInfo,
//   extendInfo,
//   merge,
//   split,
//   din,
//   dout
// ) {
//   // mergeInfo = merge;//merge lines
//   let compactInfo = [];
//   d2 = din;
//   d1 = dout;
//   timeframe = [];
//   record = [];
//   slot = [];
//   compressInfo.forEach(pair => {
//     pair.names.shift();
//     compactInfo.push([pair.names, ...pair.timeSpan, pair.param.scale]);
//   });
//   extendInfo.forEach(pair => {
//     pair.names.shift();
//     compactInfo.push([pair.names, ...pair.timeSpan, pair.param.scale]);
//   });
//   compressInfo = compactInfo;
//   mergeInfo = [];
//   merge.forEach(pair => {
//     mergeInfo.push([pair.names, ...pair.timeSpan]);
//   });
//   data = alignAns;
//   sequence = alignAns.sequence;
//   alignedSession = alignAns.alignedSessions;
//   for (let [_, order] of sequence) {
//     order.unshift(undefined);
//   }
//   let flag = 1;
//   for (let i = 0; i < sequence.length - 1; i++) {
//     slot.push(_getTimeframe(i)); //change sequence into slot
//   }
//   for (let i = 0; i < sequence.length; i++) record[i] = new Map();
//   if (slot.length !== 0)
//     for (let i = 0; i < slot[0].length; i++) {
//       let data = [slot[0][i]];
//       timeframe.push(data);
//       record[0].set(i, timeframe[timeframe.length - 1]);
//     }
//   for (let i = 1; i < slot.length; i++) {
//     _timeframeinsert_new(i);
//   }
//   timeframe.forEach(x => {
//     x.forEach(session => {
//       let begin = session.begin;
//       let content = session.content;
//       if (begin !== 1)
//         content.sort(function(a, b) {
//           let aa = _name2num(begin - 1, a.entity);
//           let bb = _name2num(begin - 1, b.entity);
//           if (aa === -1) aa = Number.MAX_VALUE;
//           if (bb === -1) bb = Number.MAX_VALUE;
//           return aa - bb;
//         });
//     });
//   });
//   let node = [];
//   for (let j = 0; j < data.entities.length; j++) {
//     node[j] = [];
//   }
//   let dis = [];
//   for (let i = 0; i < timeframe.length; i++) {
//     let max = 0;
//     for (let j = 0; j < timeframe[i].length; j++) {
//       max =
//         timeframe[i][j].content.length > max
//           ? timeframe[i][j].content.length
//           : max;
//     }
//     dis[i] = max;
//   }

//   let Ycoor = new Map();

//   for (let j = 0; j < timeframe.length; j++) {
//     let max = 0;
//     for (let key of Ycoor) max = Math.max(max, key[1]);
//     for (let key of Ycoor) Ycoor.set(key[0], max + dout);
//     let t = timeframe[j];
//     t.forEach(x => {
//       let content = x.content;

//       for (let ii = 0; ii < content.length; ii++) {
//         let num = 0;
//         let s = 0;
//         // let notEmptyslot = findEmptyslot(t, x.begin, x.end); //之前的非空slot
//         //
//         data.entities.forEach(x => {
//           if (x === content[ii].entity) {
//             num = s;
//           }
//           s++;
//         });
//         content[ii].lineOrder = num;
//         if (content[ii].entity !== "") {
//           let name = content[ii].entity;
//           // if (name=="Wolf") debugger;
//           let compressPair = compressInfo.find(
//             pair =>
//               pair[0].includes(name) && pair[1] <= x.begin && pair[2] >= x.end
//           );
//           let range = 1;
//           let mergePair = mergeInfo.find(
//             pair =>
//               pair[0].includes(name) && pair[1] <= x.begin && pair[2] >= x.end
//           );
//           if (compressPair !== undefined) range = compressPair[3]; //compact调整
//           if (Ycoor.get(x.begin) === undefined) {
//             Ycoor.set(x.begin, max + range * din); //加入一个节点
//             if (mergePair !== undefined) {
//               if (mergePair[0][0] === name) {
//                 mergePair[3] = new Map();
//                 mergePair[3].set(x.begin, max + range * din); //merge的第一个的坐标
//                 node[num].push([x.begin * 50, Ycoor.get(x.begin)]);
//                 node[num].push([x.end * 50 + 25, Ycoor.get(x.begin)]);
//               } else {
//                 //merge后面的
//                 node[num].push([x.begin * 50, mergePair[3].get(x.begin)]);
//                 node[num].push([x.end * 50 + 25, mergePair[3].get(x.begin)]);
//               }
//             } else {
//               //正常的
//               node[num].push([x.begin * 50, Ycoor.get(x.begin)]);
//               node[num].push([x.end * 50 + 25, Ycoor.get(x.begin)]);
//             }
//           } else {
//             //已经有了节点的基础，向上累加
//             Ycoor.set(x.begin, Ycoor.get(x.begin) + range * din);
//             if (mergePair !== undefined)
//               if (mergePair[0][0] === name) {
//                 mergePair[3] = new Map();
//                 mergePair[3].set(x.begin, Ycoor.get(x.begin));
//                 node[num].push([x.begin * 50, Ycoor.get(x.begin)]);
//                 node[num].push([x.end * 50 + 25, Ycoor.get(x.begin)]);
//               } else {
//                 node[num].push([x.begin * 50, mergePair[3].get(x.begin)]);
//                 node[num].push([x.end * 50 + 25, mergePair[3].get(x.begin)]);
//               }
//             else {
//               node[num].push([x.begin * 50, Ycoor.get(x.begin)]);
//               node[num].push([x.end * 50 + 25, Ycoor.get(x.begin)]);
//             }
//           }
//         } else {
//           let range = 1;
//           if (Ycoor.get(x.begin) === undefined) {
//             Ycoor.set(x.begin, max + range * din);
//           } else {
//             Ycoor.set(x.begin, Ycoor.get(x.begin) + range * din);
//           }
//         }
//       }
//     });
//   }
//   graph = data;
//   node.forEach(x => x.sort((a, b) => a[0] - b[0]));
//   graph.initialNodes = node;
//   // graph.initNodes=JSON.parse(JSON.stringify(node));
//   // let initialGraph = {};
//   // initialGraph.nodes = node;
//   // initialGraph.names = graph.names;
//   for (let [_, order] of sequence) {
//     order.shift();
//   }
//   return graph;
// }

// function frame2num(frame) {
//   for (let i = 0; i < timeframe.length; i++) {
//     if (frame === timeframe[i]) return i;
//   }
//   return -1;
// }

// function _timeframeinsert_new(i) {
//   let align = alignedSession[i];
//   let lastrecord = record[i - 1];
//   let thistime = slot[i];
//   let flag = [];
//   thistime.forEach(x => flag.push(0));
//   // debugger
//   if (align[1] === undefined) {
//     for (let j = 0; j < flag.length; j++) {
//       let frame = lastrecord.get(j);
//       frame.push(thistime[j]);
//       record[i].set(j, frame);
//     }
//     return;
//   }
//   align[1].forEach(function(v, k) {
//     let value = v - 1;
//     let key = k - 1;
//     let frame = lastrecord.get(value);
//     record[i].set(key, frame);
//     frame.push(thistime[key]);
//     flag[key] = 1;
//   });
//   if (flag[0] === 0) {
//     timeframe.splice(0, 0, [thistime[0]]);
//     record[i].set(0, timeframe[0]);
//     flag[0] = 1;
//   }
//   for (let j = 1; j < flag.length; j++) {
//     if (flag[j] === 1) continue;
//     let num = frame2num(record[i].get(j - 1));
//     timeframe.splice(num + 1, 0, [thistime[j]]);
//     record[i].set(j, timeframe[num + 1]);
//   }
// }
