let compressTime = [];
let d1 = 0; //out
let d2 = 1000; //in
let graph = {};
let sequence;
let data;
let timeframe = [];
let slot = [];
let alignedSession;
let record = [];
let mergeInfo;

//change sequence into timeframe
function _getTimeframe(time) {
  let delsessionID = [];
  let inflag = 1;
  let timeframe = sequence[time];
  const Sessions = [];
  let order = timeframe[1];
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
function _name2num(time, name) {
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
export function greedySlotCompact(
  alignAns,
  compressInfo,
  extendInfo,
  mergeInfo,
  splitInfo,
  din,
  dout
) {
  // mergeInfo = merge;//merge lines
  d2 = din;
  d1 = dout;
  let compressFlag = true;
  timeframe = [];
  record = [];
  slot = [];
  compressInfo = [...compressInfo, ...mergeInfo, ...extendInfo];
  data = alignAns;
  sequence = alignAns.sequence;
  alignedSession = alignAns.alignedSessions;
  for (let [_,order] of sequence)
  {
    order.unshift(undefined);
  }
  let flag = 1;
  for (let i = 0; i < sequence.length - 1; i++) {
    slot.push(_getTimeframe(i)); //change sequence into slot
  }
  for (let i = 0; i < sequence.length; i++) record[i] = new Map();
  if (slot.length !== 0)
    for (let i = 0; i < slot[0].length; i++) {
      let data = [slot[0][i]];
      timeframe.push(data);
      record[0].set(i, timeframe[timeframe.length - 1]);
    }
  for (let i = 1; i < slot.length; i++) {
    _timeframeinsert_new(i);
  }
  timeframe.forEach(x => {
    x.forEach(session => {
      let begin = session.begin;
      let content = session.content;
      if (begin !== 1)
        content.sort(function(a, b) {
          let aa = _name2num(begin - 1, a.entity);
          let bb = _name2num(begin - 1, b.entity);
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

  let Ycoor = new Map();

  for (let j = 0; j < timeframe.length; j++) {
    let max = 0;
    for (let key of Ycoor) max = Math.max(max, key[1]);
    for (let key of Ycoor) Ycoor.set(key[0], max + dout);
    let t = timeframe[j];
    t.forEach(x => {
      let content = x.content;

      for (let ii = 0; ii < content.length; ii++) {
        let num = 0;
        let s = 0;
        // let notEmptyslot = findEmptyslot(t, x.begin, x.end); //之前的非空slot
        //
        data.entities.forEach(x => {
          if (x === content[ii].entity) {
            num = s;
          }
          s++;
        });
        content[ii].lineOrder = num;
        if (content[ii].entity !== "") {
          let name = content[ii].entity;
          // if (name=="Wolf") debugger;
          let compressPair = compressInfo.find(
            pair =>
              pair[0].includes(name) && pair[1] <= x.begin && pair[2] >= x.end
          );
          let range = 1;
          if (compressPair !== undefined) range = compressPair[3];
          if (Ycoor.get(x.begin) === undefined) {
            Ycoor.set(x.begin, max + range * din);
            node[num].push([x.begin * 50, Ycoor.get(x.begin)]);
            node[num].push([x.end * 50 + 25, Ycoor.get(x.begin)]);
          } else {
            Ycoor.set(x.begin, Ycoor.get(x.begin) + range * din);
            node[num].push([x.begin * 50, Ycoor.get(x.begin)]);
            node[num].push([x.end * 50 + 25, Ycoor.get(x.begin)]);
          }
        } else {
          let range = 1;
          if (Ycoor.get(x.begin) === undefined) {
            Ycoor.set(x.begin, max + range * din);
          } else {
            Ycoor.set(x.begin, Ycoor.get(x.begin) + range * din);
          }
        }
      }
    });
  }
  graph = data;
  node.forEach(x => x.sort((a, b) => a[0] - b[0]));
  graph.initialNodes = node;
  // graph.initNodes=JSON.parse(JSON.stringify(node));
  // let initialGraph = {};
  // initialGraph.nodes = node;
  // initialGraph.names = graph.names;
  for (let [_,order] of sequence)
  {
    order.shift();
  }
  return graph;
}

function frame2num(frame) {
  for (let i = 0; i < timeframe.length; i++) {
    if (frame === timeframe[i]) return i;
  }
  return -1;
}

function _timeframeinsert_new(i) {
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
