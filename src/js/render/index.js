import { renderModelError } from "../utils";
import { smoothRender } from "./smoothRender";
import { sketchRender } from "./sketchRender";

export function storyRender(renderModule, rawData) {
  let initialGraph = translateGraph(rawData);
  let constraints = [];
  const adjustInfo = constraints.filter(ctr => ctr.style === "Adjust");
  const relateInfo = constraints.filter(
    ctr =>
      ctr.style === "Twine" || ctr.style === "Knot" || ctr.style === "Collide"
  );
  const stylishInfo = constraints.filter(
    ctr =>
      ctr.style === "Width" ||
      ctr.style === "Color" ||
      ctr.style === "Dash" ||
      ctr.style === "Zigzag" ||
      ctr.style === "Wave" ||
      ctr.style === "Bump"
  );
  const scaleInfo = constraints.filter(ctr => ctr.style === "Scale");
  let renderFunc = smoothRender;
  switch (renderModule) {
    case "SmoothRender":
      renderFunc = smoothRender;
      break;
    case "SketchRender":
      renderFunc = sketchRender;
      break;
    default:
      renderModelError(renderModule);
  }
  return renderFunc(
    initialGraph,
    adjustInfo,
    relateInfo,
    stylishInfo,
    scaleInfo
  );
}

function translateXtoTime(x, j, timeRange = 10, xShift = 7) {
  return x / timeRange - j * xShift;
}
function translateConstrains(rawData) {
  let constrains = null;
  return constrains;
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
