import Snap from "snapsvg";
import iStoryline from "../../src/js/index";
import { storyRender } from "../../src/js/render";

function main(url) {
  post(url);
}
function translateGraph(rawData, timeShift = 50) {
  let initialGraph = {};
  const array = rawData.data.array;
  const perm = rawData.data.perm;
  const sessionTable = rawData.data.sessionTable;

  let ptCnt = 0;
  let segCnt = 0;
  let flag = 0;
  let nodes = new Array();
  let names = new Array();
  let times = new Array();
  for (let i = 0; i < array.length; i++) {
    nodes[i] = new Array();
    names[i] = array[i].name;
    times[i] = new Array();
    ptCnt = 0;
    segCnt = -1;
    for (let j = 0; j < array[i].points.length; j++) {
      if (perm[i][j] == -1) {
        continue;
      }
      if (j == 0 || perm[i][j - 1] == -1) {
        segCnt++;
        times[i][segCnt] = new Array();
        times[i][segCnt][0] = translateXtoTime(array[i].points[j].item1, j);
      }
      if (j + 1 >= array[i].points.length || perm[i][j + 1] == -1) {
        times[i][segCnt][1] = translateXtoTime(array[i].points[j].item2, j);
      }
      nodes[i][ptCnt] = new Array();
      nodes[i][ptCnt][0] =
        translateXtoTime(array[i].points[j].item1, j) * timeShift;
      nodes[i][ptCnt][1] = array[i].points[j].item3 * 100;
      ptCnt++;
      nodes[i][ptCnt] = new Array();
      nodes[i][ptCnt][0] =
        translateXtoTime(array[i].points[j].item2, j) * timeShift -
        timeShift / 2;
      nodes[i][ptCnt][1] = array[i].points[j].item3 * 100;
      ptCnt++;
    }
  }
  initialGraph.initialNodes = nodes;
  initialGraph.timeframeTable = new Map();
  for (let i = 0; i < array.length; i++) {
    initialGraph.timeframeTable.set(names[i], times[i]);
  }
  initialGraph.entities = names;
  return initialGraph;
}
function translateXtoTime(x, j, timeRange = 10, xShift = 7) {
  return x / timeRange - j * xShift;
}
function translateConstrains(rawData) {
  let constrains = null;
  return constrains;
}
function post(url) {
  let tmpAjax = null;
  let tmpString = "";
  let config = {
    id: url,
    sessionInnerGap: 18,
    sessionOuterGap: 54,
    sessionInnerGaps: [],
    sessionOuterGaps: [],
    majorCharacters: [],
    orders: [],
    groupIds: [],
    selectedSessions: [],
    orderTable: [],
    sessionBreaks: []
  };
  config = (function(data) {
    for (let key in data) {
      tmpString += key + "=" + data[key] + "&";
    }
    return tmpString;
  })(config);
  try {
    tmpAjax = new XMLHttpRequest();
  } catch (error) {
    tmpAjax = new ActiveXObject("Microsoft.XMLHTTP");
  }
  tmpAjax.open("post", "http://localhost:5050/api/update", true);
  tmpAjax.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
  tmpAjax.send(config);
  tmpAjax.onreadystatechange = function() {
    if (tmpAjax.readyState == 4) {
      try {
        let rawData = JSON.parse(tmpAjax.responseText);
        drawGraph(rawData);
      } catch (error) {
        alert("Error!");
      }
    }
  };
}
function drawGraph(rawData) {
  let initialGraph = translateGraph(rawData);
  let constrains = [];
  const graph = storyRender("SmoothRender", initialGraph, constrains);
  const nodes = graph.paths;
  for (let i = 0; i < nodes.length; i++) {
    let tmpNodes = nodes[i];
    // draw text labels
    drawLabel(tmpNodes, graph.entities[i]);
    // draw graph with animations
    let storylines = drawInitial(tmpNodes);
    let completePathStrs = tmpNodes.map(line => genSimplePathStr(line));
    storylines.forEach((storyline, i) => {
      storyline.animate(
        {
          d: completePathStrs[i]
        },
        1000
      );
    });
  }
}
function drawUpdateNodes(rawData) {
  let graph = JSON.parse(rawData);
  let nodes = new Array();
  const array = graph.data.array;
  let cnt = 0;
  for (let i = 0; i < array.length; i++) {
    nodes[i] = new Array();
    nodes[i][0] = new Array();
    cnt = 0;
    for (let j = 0; j < array[i].points.length; j++) {
      if (graph.data.perm[i][j] == -1) continue;
      nodes[i][0][cnt] = new Array();
      nodes[i][0][cnt][0] = array[i].points[j].item1 + 1000;
      nodes[i][0][cnt][1] = array[i].points[j].item3 + 1000;
      cnt++;
      nodes[i][0][cnt] = new Array();
      nodes[i][0][cnt][0] = array[i].points[j].item2 + 1000;
      nodes[i][0][cnt][1] = array[i].points[j].item3 + 1000;
      cnt++;
    }
  }
  for (let i = 0; i < nodes.length; i++) {
    let tmpNodes = nodes[i];
    // draw text labels
    drawLabel(tmpNodes, graph.data.array[i].name);
    // draw graph with animations
    let storylines = drawInitial(tmpNodes);
    let completePathStrs = tmpNodes.map(line => genSimplePathStr(line));
    storylines.forEach((storyline, i) => {
      storyline.animate(
        {
          d: completePathStrs[i]
        },
        1000
      );
    });
  }
}
function drawLabel(nodes, name) {
  const svg = Snap("#mySvg");
  let labelX = nodes[0][0][0] + 20;
  let labelY = nodes[0][0][1] + 4;
  const label = svg.text(labelX, labelY, name);
  label.attr({
    "text-anchor": "end"
  });
  return label;
}

function drawInitial(nodes) {
  const svg = Snap("#mySvg");
  const storylines = nodes.map(line => {
    const pathStr = genInitialPathStr(line);
    const pathSvg = svg.path(pathStr);
    pathSvg.hover(
      () => {
        pathSvg.attr({
          stroke: "blue",
          "stroke-width": 4
        });
      },
      () => {
        pathSvg.attr({
          stroke: "black",
          "stroke-width": 1
        });
      }
    );
    pathSvg.attr({
      fill: "none",
      stroke: "black",
      "stroke-width": 1
    });
    return pathSvg;
  });
  return storylines;
}

function genInitialPathStr(points) {
  return `M ${points[0][0]} ${points[0][1]} `;
}

function genSmoothPathStr(points) {
  let pathStr = `M ${points[0][0]} ${points[0][1]} `;
  let i, len;
  for (i = 1, len = points.length; i < len - 1; i += 2) {
    const rPoint = points[i];
    const lPoint = points[i + 1];
    const middleX = (rPoint[0] + lPoint[0]) / 2;
    pathStr += `L ${rPoint[0]} ${rPoint[1]} `;
    if (rPoint[1] !== lPoint[1]) {
      pathStr += `C ${middleX} ${rPoint[1]} ${middleX} ${lPoint[1]} ${
        lPoint[0]
      } ${lPoint[1]} `;
    } else {
      pathStr += `L ${lPoint[0]} ${lPoint[1]} `;
    }
  }
  if (i < len) pathStr += `L ${points[i][0]} ${points[i][1]}`;
  else pathStr += `L ${points[i - 1][0]} ${points[i - 1][1]}`;
  return pathStr;
}

function draw(nodes) {
  const svg = Snap("#mySvg");
  const storylines = nodes.map(line => {
    const pathStr = genSmoothPathStr(line);
    const pathSvg = svg.path(pathStr);
    pathSvg.attr({
      fill: "none",
      stroke: "black",
      "stroke-width": 1
    });
    return pathSvg;
  });
  return storylines;
}

function genSimplePathStr(points) {
  let pathStr = `M ${points[0][0]} ${points[0][1]} `;
  let i, len;
  for (i = 1, len = points.length; i < len; i += 1) {
    const rPoint = points[i];
    pathStr += `L ${rPoint[0]} ${rPoint[1]} `;
  }
  return pathStr;
}
let path =
  "C:\\E\\study\\research\\20200131\\StoryFlowServer\\deploy\\uploadFiles\\";
// main(path + "StarWars.xml");
// main(path + "Redcap.xml");
// main(path + "ChasingDragon.xml");
// main(path + "Coco.xml");
// main(path + "Frozen.xml");
// main(path + "Guowuguan.xml");
main(path + "inceptionTune.xml");
// main(path + "JurassicParkTune.xml");
// main(path + "KingLearTune.xml");
// main(path + "LetBulletFlyTune.xml");
// main(path + "MatrixTune.xml");
// main(path + "Moon.xml");
// main(path + "Minions.xml");
// main(path + "NaniaTune.xml");
// main(path + "Naruto.xml");
// main(path + "Suiciders.xml");
// main(path + "TrainToBusan.xml");
