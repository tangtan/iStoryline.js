export function logNameError(type, names = [], limits = 0) {
  switch (type) {
    case "Compact":
      if (names.length >= 2) return true;
      break;
    case "Expand":
      if (names.length >= 2) return true;
      break;
    case "Merge":
      if (names.length >= 2) return true;
      break;
    case "Split":
      if (names.length >= 2) return true;
      break;
  }
  if (names.length === limits) return true;
  console.error(`Invalid names in ${type}`);
  return false;
}

export function logTimeError(type, span = []) {
  switch (type) {
    case "Bend":
      if (span.length === 1) return true;
      break;
    case "Sort":
      if (span[1] >= span[0]) return true;
      break;
    case "Straighten":
      if (span[1] >= span[0]) return true;
      break;
    case "Compact":
      if (span[1] >= span[0]) return true;
      break;
    case "Merge":
      if (span[1] >= span[0]) return true;
      break;
    case "Split":
      if (span[1] >= span[0]) return true;
      break;
    case "Expand":
      if (span[1] >= span[0]) return true;
      break;
  }
  console.error(`Invalid time span in ${type}`);
  return false;
}

export function orderModelError(type) {
  console.error(`Invalid order type in ${type}`);
}

export function compactModelError(type) {
  console.error(`Invalid compact type in ${type}`);
}

export function alignModelError(type) {
  console.error(`Invalid align type in ${type}`);
}

export function renderModelError(type) {
  console.error(`Invalid render type in ${type}`);
}

export function transformModelError(type) {
  console.error(`Invalid transform type in ${type}`);
}

export function convertDataToStory(data, timeShift = 50) {
  let initialGraph = {};
  const array = data.data.array;
  const perm = data.data.perm;
  const sessionTable = data.data.sessionTable;

  let ptCnt = 0;
  let segCnt = 0;
  let timCnt = 0;
  let flag = 0;
  let nodes = new Array();
  let names = new Array();
  let times = new Array();
  let timeframeTable = new Array();
  let keyTimeframe = new Array();
  for (let i = 0; i < array.length; i++) {
    nodes[i] = new Array();
    names[i] = array[i].name;
    timeframeTable[i] = new Array();
    times[i] = new Array();
    ptCnt = 0;
    segCnt = -1;
    for (let j = 0; j < array[i].points.length; j++) {
      times[i][j] = new Array();
      if (perm[i][j] == -1) {
        times[i][j][0] = times[i][j][1] = -1;
        continue;
      }
      if (j == 0 || perm[i][j - 1] == -1) {
        segCnt++;
        timeframeTable[i][segCnt] = new Array();
        timeframeTable[i][segCnt][0] = translateXtoTime(
          array[i].points[j].item1,
          j
        );
      }
      if (j + 1 >= array[i].points.length || perm[i][j + 1] == -1) {
        timeframeTable[i][segCnt][1] = translateXtoTime(
          array[i].points[j].item2,
          j
        );
      }

      nodes[i][ptCnt] = new Array();
      times[i][j][0] = translateXtoTime(array[i].points[j].item1, j);
      keyTimeframe[timCnt] = times[i][j][0];
      nodes[i][ptCnt][0] = keyTimeframe[timCnt] * timeShift;
      nodes[i][ptCnt][1] = array[i].points[j].item3 * 100;
      ptCnt++;
      timCnt++;

      nodes[i][ptCnt] = new Array();
      times[i][j][1] = translateXtoTime(array[i].points[j].item2, j);
      keyTimeframe[timCnt] = times[i][j][1];
      nodes[i][ptCnt][0] = keyTimeframe[timCnt] * timeShift - timeShift / 2;
      nodes[i][ptCnt][1] = array[i].points[j].item3 * 100;
      ptCnt++;
      timCnt++;
    }
  }
  initialGraph.locationTree = getLocationTree(names);
  initialGraph.initialNodes = nodes;
  initialGraph.keyTimeframe = getKeyTimeframe(keyTimeframe);
  initialGraph.timeframeTable = getTimeframeTable(
    names,
    timeframeTable,
    array.length
  );
  initialGraph.entities = names;
  initialGraph.sessionTable = getSessionTable(sessionTable, times, names);
  initialGraph.sequence = getSequence(
    initialGraph.sessionTable,
    initialGraph.keyTimeframe
  );
  return initialGraph;
}
export function convertDataToConstraints(data, protocol, story) {
  let constraints = [];
  let stylishInfo = protocol.stylishInfo;
  let relateInfo = protocol.relateInfo;
  let array = data.data.array;
  if (stylishInfo) {
    for (let i = 0; i < stylishInfo.length; i++) {
      let tmp = {};
      tmp.names = [];
      for (let j = 0; j < stylishInfo[i].names.length; j++) {
        tmp.names.push(array[Number(stylishInfo[i].names[j])].name);
      }
      tmp.timespan = [
        translateXtoTime(
          array[Number(stylishInfo[i].names[0])].points[
            Number(stylishInfo[i].timespan[0])
          ].item1,
          Number(stylishInfo[i].timespan[0])
        ),
        translateXtoTime(
          array[Number(stylishInfo[i].names[0])].points[
            Number(stylishInfo[i].timespan[1])
          ].item2,
          Number(stylishInfo[i].timespan[1])
        )
      ];
      let lifespans = story.timeframeTable.get(tmp.names[0]);
      let startTime = lifespans[0][0];
      let endTime = lifespans[lifespans.length - 1][1];
      tmp.timespan[0] = Math.max(tmp.timespan[0], startTime);
      tmp.timespan[1] = Math.min(tmp.timespan[1], endTime);
      tmp.style = stylishInfo[i].style;
      constraints.push(tmp);
    }
  }
  if (relateInfo) {
    for (let i = 0; i < relateInfo.length; i++) {
      let tmp = {};
      tmp.names = [];
      let startTime = 0,
        endTime = 1e9;
      for (let j = 0; j < relateInfo[i].names.length; j++) {
        tmp.names.push(array[Number(relateInfo[i].names[j])].name);
        let lifespans = story.timeframeTable.get(tmp.names[j]);
        startTime = Math.max(startTime, lifespans[0][0]);
        endTime = Math.min(endTime, lifespans[lifespans.length - 1][1]);
      }
      tmp.timespan = [
        translateXtoTime(
          array[Number(relateInfo[i].names[0])].points[
            Number(relateInfo[i].timespan[0])
          ].item1,
          Number(relateInfo[i].timespan[0])
        ),
        translateXtoTime(
          array[Number(relateInfo[i].names[0])].points[
            Number(relateInfo[i].timespan[1])
          ].item2,
          Number(relateInfo[i].timespan[1])
        )
      ];
      tmp.timespan[0] = Math.max(tmp.timespan[0], startTime);
      tmp.timespan[1] = Math.min(tmp.timespan[1], endTime);
      tmp.style = relateInfo[i].style;
      constraints.push(tmp);
    }
  }
  // for(let i = 0;i < relateInfo.length;i ++){
  //   let tmp = [];
  // }
  return constraints;
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
function getLocationTree(names) {
  let locationTree = {};
  locationTree.sessions = [];
  locationTree.name = "All";
  locationTree.visible = false;
  locationTree.children = [];
  locationTree.entities = new Set();
  names.forEach(name => locationTree.entities.add(name));
  return locationTree;
}
function translateXtoTime(x, j, timeRange = 10, xShift = 7) {
  return x / timeRange - j * xShift;
}
function getTimeframeTable(names, oriTimeframeTable, length) {
  let timeframeTable = new Map();
  for (let i = 0; i < length; i++) {
    timeframeTable.set(names[i], oriTimeframeTable[i]);
  }
  return timeframeTable;
}
function getKeyTimeframe(timeframe) {
  let keyTimeframe = new Array();
  let cnt = 0;
  timeframe.sort(function(a, b) {
    return a - b;
  });
  keyTimeframe[cnt] = timeframe[cnt];
  for (let i = 1; i < timeframe.length; i++) {
    if (timeframe[i] != keyTimeframe[cnt]) {
      keyTimeframe[++cnt] = timeframe[i];
    }
  }
  return keyTimeframe;
}
function getSessionTable(oriSessionTable, times, names) {
  let sessionTable = new Map();
  for (let i = 0; i < oriSessionTable.length; i++) {
    for (let j = 0; j < oriSessionTable[i].length; j++) {
      if (oriSessionTable[i][j] === -1) {
        continue;
      }
      if (sessionTable.has(oriSessionTable[i][j]) === false) {
        let array = new Array();
        sessionTable.set(oriSessionTable[i][j], array);
      }
      let tmp = sessionTable.get(oriSessionTable[i][j]);
      let flag = 0;
      for (let k = 0; k < tmp.length; k++) {
        if (tmp[k].entity === names[i] && tmp[k].end === times[i][j][0]) {
          tmp[k].end = times[i][j][1];
          flag = 1;
        }
      }
      if (flag === 0) {
        tmp.push({
          start: times[i][j][0],
          end: times[i][j][1],
          entity: names[i]
        });
      }
    }
  }
  return sessionTable;
}
function getSequence(oriSessionTable, keyTimeframe) {
  let sequence = new Array();
  let cnt = 0;
  for (let i = 0; i < keyTimeframe.length; i++) {
    sequence[i] = new Array();
    sequence[i][0] = keyTimeframe[i];
    sequence[i][1] = new Array();
    cnt = 0;
    for (let j = 0; j < oriSessionTable.size; j++) {
      if (j === oriSessionTable.size - 1) j = 9999;
      if (oriSessionTable.has(j)) {
        let tmp = oriSessionTable.get(j);
        if (tmp[0].start <= keyTimeframe[i] && tmp[0].end > keyTimeframe[i]) {
          cnt++;
          sequence[i][1][cnt - 1] = new Array();
          sequence[i][1][cnt - 1][0] = cnt;
          sequence[i][1][cnt - 1][1] = deepCopy(tmp);
        }
      }
    }
  }
  return sequence;
}
