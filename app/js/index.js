import Snap from "snapsvg";
import iStoryline from "../../src/js/index";
import { storyRender } from "../../src/js/render";
import { convertDataToConstraints } from "../../src/js/utils";

function main(url) {
  post(url);
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
  let ans = new iStoryline();
  let protoc = {};
  protoc.stylishInfo = [];
  protoc.relateInfo = [];
  protoc.stylishInfo.push({ names: [10], timespan: [23, 24], style: "Bump" });
  // protoc.stylishInfo.push({'names':[3],'timespan':[6,9],'style':'Wave'});
  // protoc.stylishInfo.push({'names':[8],'timespan':[10,12],'style':'Bump'});
  // protoc.relateInfo.push({'names':[0,2],'timespan':[0,3],'style':'Collide'});
  // protoc.relateInfo.push({'names':[7,10],'timespan':[28,30],'style':'Knot'});
  // protoc.relateInfo.push({'names':[11,14],'timespan':[34,36],'style':'Twine'});
  let graph = ans._layout(rawData, protoc);
  //const graph = ("SmoothRender", rawData);
  const nodes = graph.paths;
  for (let i = 0; i < nodes.length; i++) {
    let tmpNodes = nodes[i];
    // draw text labels
    drawLabel(tmpNodes, graph.names[i]);
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
main(path + "StarWars.xml");
// main(path + "Redcap.xml");
// main(path + "ChasingDragon.xml");
// main(path + "Coco.xml");
// main(path + "Frozen.xml");
// main(path + "Guowuguan.xml");
// main(path + "inceptionTune.xml");
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
