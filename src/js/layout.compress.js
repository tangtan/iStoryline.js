let compressTime = [];
let d1 = 0; //out
let d2 = 1000; //in

import { modifyLayout } from "./layout.render.js";

let sequence;
let data;
let graph;
let timeframe = [];
let slot = [];
let alignedSession;
let record = [];
let mergeInfo;

//change sequence into timeframe
function getTimeframe(time) {
  let delsessionID = [];
  let inflag = 1;
  let timeframe = sequence[time];
  const Sessions = [];
  let order = timeframe[1].sessionOrder;
  for (let i = 1; i < order.length; i++) {
    let session = {};
    session.begin = timeframe[0];
    session.end = sequence[time + 1][0] - 1;
    session.content = order[i][1];
    let flag = 0;
    for (let cha in session.content)
      if (cha.end !== sequence[time][0]) flag = 1;
    if (flag === 0) continue;
    for (let i = session.content.length - 1; i >= 0; i--) {
      if (session.content[i].end === sequence[time][0])
        session.content.splice(i, 1);
    }

    Sessions.push(session);
    if (session.content.length == 0) delsessionID.push(i);
  }
  delsessionID.forEach(sessionID => {
    order.splice(sessionID, 1);
  });
  return Sessions;
}

//find the order of a name in a slot
function name2num(time, name) {
  let ans = -1;
  let flag = 1;
  timeframe.forEach(tt => {
    tt.forEach(x => {
      if (time >= x.begin && time < x.end) {
        x.content.forEach(y => {
          if (y.entity !== name) {
            ans += flag;
          } else {
            ans += flag;
            flag = 0;
          }
        });
      }
    });
  });
  if (flag === 1) return -1;
  return ans;
}

//default function
//graph is the output
//data is the names and orders
//sequence contains keytimes and sessions
function storyCompress(d, s, a, compressInfo, merge, din, dout) {
  mergeInfo = merge;
  d2 = din;
  d1 = dout;
  let compressFlag = true;
  let maxtime = 0;
  timeframe = [];
  record = [];
  slot = [];
  compressTime = compressInfo;
  graph = {};
  data = d;
  sequence = s;
  alignedSession = a;
  let flag = 1;
  for (let i = 0; i < sequence.length - 1; i++) {
    slot.push(getTimeframe(i));
  }
  for (let i = 0; i < sequence.length; i++) record[i] = new Map();
  if (slot.length !== 0)
    for (let i = 0; i < slot[0].length; i++) {
      let data = [slot[0][i]];
      timeframe.push(data);
      record[0].set(i, timeframe[timeframe.length - 1]);
    }
  for (let i = 1; i < slot.length; i++) {
    timeframeinsert_new(i);
  }
  timeframe.forEach(x => {
    x.forEach(session => {
      let begin = session.begin;
      let content = session.content;
      if (begin !== 1)
        content.sort(function(a, b) {
          let aa = name2num(begin - 1, a.entity);
          let bb = name2num(begin - 1, b.entity);
          if (aa === -1) aa = Number.MAX_VALUE;
          if (bb === -1) bb = Number.MAX_VALUE;
          return aa - bb;
        });
    });
  });
  let node = [];
  for (let j = 0; j < data.entities.length; j++) {
    node[j] = [];
  }
  let dis = [];
  for (let i = 0; i < timeframe.length; i++) {
    let max = 0;
    for (let j = 0; j < timeframe[i].length; j++) {
      max =
        timeframe[i][j].content.length > max
          ? timeframe[i][j].content.length
          : max;
    }
    dis[i] = max;
  }
  function beforedis(num) {
    let ans = 0;
    for (let i = 0; i < num; i++) {
      ans += dis[i];
    }
    return ans;
  }
  function beforedisCompress(time, begin, end) {
    let ansArr = [];
    timeframe.forEach(x => ansArr.push(0));
    let ans = 0;
    for (let i = 0; i < time; i++) {
      for (let j = 0; j < timeframe[i].length; j++) {
        if (timeframe[i][j].begin >= begin && timeframe[i][j].end <= end) {
          ansArr[i] = Math.max(timeframe[i][j].content.length, ansArr[i]);
        }
        //         (timeframe[i][j].content.length>max)?timeframe[i][j].content.length:max;
      }
    }
    ansArr.forEach(x => (ans += x));
    return ans;
  }
  function findEmptyslot(thistimeframe, begin, end) {
    let ans = 0;
    for (const t of timeframe) {
      if (t === thistimeframe) return ans;
      t.forEach(x => {
        if (x.begin <= begin && x.end <= end && x.begin >= begin) {
          ans++;
          return;
        }
        if (x.begin <= begin && x.end >= end) {
          ans++;
          return;
        }
        if (x.begin >= begin && x.end >= end && x.begin < end) {
          ans++;
          return;
        }
      });
    }
    return ans;
  }
  for (let j = 0; j < timeframe.length; j++) {
    let t = timeframe[j];
    t.forEach(x => {
      let content = x.content;
      for (let ii = 0; ii < content.length; ii++) {
        let num = 0;
        let s = 0;
        let notEmptyslot = findEmptyslot(t, x.begin, x.end); //之前的非空slot

        data.entities.forEach(x => {
          if (x === content[ii].entity) {
            num = s;
          }
          s++;
        });
        let mergeSpace = -1;
        if (mergeInfo.length !== 0) mergeSpace = mergeInfo[0][0].indexOf(num);
        if (
          mergeSpace == -1 ||
          (mergeInfo[0][1] > x.end || mergeInfo[0][2] <= x.begin)
        )
          mergeSpace = 0;

        content[ii].lineOrder = num;

        if (content[ii].entity !== "") {
          if (
            compressTime.some(pair => x.begin >= pair[0] && x.end <= pair[1])
          ) {
            const compressPair = compressTime.find(
              pair => x.begin >= pair[0] && x.end <= pair[1]
            );
            if (compressPair !== undefined) {
              compressFlag = false;
            }
            let beforeCompress = beforedisCompress(
              j,
              compressPair[0],
              compressPair[1]
            );

            node[num].push([
              x.begin * 50,
              notEmptyslot * d1 +
              (ii-mergeSpace)  * d2 +
                d1 +
                beforeCompress * d2 +
                compressPair[2]
            ]);
            node[num].push([
              x.end * 50 + 25,
              notEmptyslot * d1 +
              (ii-mergeSpace) * d2 +
                d1 +
                beforeCompress * d2 +
                compressPair[2]
            ]);
          } else if (
            compressFlag &&
            compressTime.length !== 0 &&
            compressTime.find(
              pair => !(x.begin > pair[1] || x.end < pair[0])
            ) !== undefined
          ) {
            let compressPair = compressTime.find(
              pair => !(x.begin > pair[1] || x.end < pair[0])
            );
            // debugger
            compressPair[0] = x.begin;
            compressPair[1] = x.end;
            let beforeCompress = beforedisCompress(
              j,
              compressPair[0],
              compressPair[1]
            );

            node[num].push([
              x.begin * 50,
              notEmptyslot * d1 +
              (ii-mergeSpace)  * d2 +
                d1 +
                beforeCompress * d2 +
                compressPair[2]
            ]);
            node[num].push([
              x.end * 50 + 25,
              notEmptyslot * d1 +
              (ii-mergeSpace)  * d2 +
                d1 +
                beforeCompress * d2 +
                compressPair[2]
            ]);
          } else {
            node[num].push([
              x.begin * 50,
              notEmptyslot * d1 + (ii-mergeSpace)  * d2 + d1 + beforedis(j) * d2
            ]);
            node[num].push([
              x.end * 50 + 25,
              notEmptyslot * d1 + (ii-mergeSpace)  * d2 + d1 + beforedis(j) * d2
            ]);
          }
        }
      }
    });
    // debugger;
  }
  graph.names = data.entities;
  node.forEach(x => x.sort((a, b) => a[0] - b[0]));
  // graph.initNodes=JSON.parse(JSON.stringify(node));
  const { sketchNodes, renderNodes, smoothNodes, originNodes } = modifyLayout(
    node,
    graph.names,
  );
  graph.nodes = node;
  graph.renderNodes = renderNodes;
  graph.smoothNodes = smoothNodes;
  graph.originNodes = originNodes;
  graph.sketchNodes = sketchNodes;
  return graph;
}

function frame2num(frame) {
  for (let i = 0; i < timeframe.length; i++) {
    if (frame === timeframe[i]) return i;
  }
  return -1;
}

function timeframeinsert_new(i) {
  let align = alignedSession[i];
  let lastrecord = record[i - 1];
  let thistime = slot[i];
  let flag = [];
  thistime.forEach(x => flag.push(0));
  // debugger
  if (align[1] === undefined) {
    for (let j = 0; j < flag.length; j++) {
      let frame = lastrecord.get(j);
      frame.push(thistime[j]);
      record[i].set(j, frame);
    }
    return;
  }
  align[1].forEach(function(v, k) {
    let value = v - 1;
    let key = k - 1;
    let frame = lastrecord.get(value);
    record[i].set(key, frame);
    frame.push(thistime[key]);
    flag[key] = 1;
  });
  if (flag[0] === 0) {
    timeframe.splice(0, 0, [thistime[0]]);
    record[i].set(0, timeframe[0]);
    flag[0] = 1;
  }
  for (let j = 1; j < flag.length; j++) {
    if (flag[j] === 1) continue;
    let num = frame2num(record[i].get(j - 1));
    timeframe.splice(num + 1, 0, [thistime[j]]);
    record[i].set(j, timeframe[num + 1]);
  }
}

export { storyCompress };
