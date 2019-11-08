import {
  calculateOriginNodes,
  extent,
  linkNodes,
  normalize,
  simplifyPaths
} from "./baseRender";
import { initializeGroup } from "./baseRender";
import { judgeStylishAndRelate } from "./baseRender";
import { initializeSplitMarks } from "./baseRender";
import { calculateRenderNodes } from "./baseRender";
import { calculateSplitNodes } from "./baseRender";
import { calculateStyledNodes } from "./baseRender";
import { calculateTimeline } from "./baseRender";
import { removeAngularNodes } from "./baseRender";
import { calculateStyles } from "./baseRender";
import { deepCopy } from "./baseRender";

function sketchRender(
  initialGraph,
  adjustInfo,
  relateInfo,
  stylishInfo,
  scaleInfo
) {
  let originNodes = calculateOriginNodes(
    initialGraph.initialNodes,
    initialGraph.timeframeTable,
    initialGraph.entities
  );
  let group = initializeGroup(originNodes);
  const { relate, stylish } = judgeStylishAndRelate(relateInfo, stylishInfo);
  const { splitMarks, groupPosition } = initializeSplitMarks(
    originNodes,
    initialGraph.entities,
    relate,
    stylish
  );
  let renderNodes = calculateRenderNodes(originNodes, group);
  const { sketchNodes, styleConfig } = calculateSketchNodes(
    renderNodes,
    originNodes,
    group,
    splitMarks,
    groupPosition,
    initialGraph,
    relate,
    stylish
  );
  let extentNodes = extent(originNodes, deepCopy(renderNodes));
  let extentPaths = extent(originNodes, deepCopy(sketchNodes));
  extentPaths = simplifyPaths(extentPaths, 50);
  let renderedGraph = initialGraph;
  const x0 = scaleInfo.length > 0 ? scaleInfo[0].param.x0 || 0 : 0;
  const y0 = scaleInfo.length > 0 ? scaleInfo[0].param.y0 || 0 : 0;
  const width = scaleInfo.length > 0 ? scaleInfo[0].param.width || 1000 : 1000;
  const height = scaleInfo.length > 0 ? scaleInfo[0].param.height || 372 : 372;
  const reserveRatio =
    scaleInfo.length > 0 ? scaleInfo[0].param.reserveRatio || false : false;
  renderedGraph.nodes = normalize(
    extentNodes,
    x0,
    y0,
    width,
    height,
    reserveRatio
  );
  renderedGraph.paths = normalize(
    extentPaths,
    x0,
    y0,
    width,
    height,
    reserveRatio
  );
  renderedGraph.styleConfig = deepCopy(styleConfig);
  // TODO: inconsistent timeline
  renderedGraph.timeline = calculateTimeline(originNodes, renderNodes);
  return renderedGraph;
}
function calculateSketchNodes(
  renderNodes,
  originNodes,
  group,
  splitMarks,
  groupPosition,
  initialGraph,
  relate,
  stylish
) {
  let tmpNodes = removeAngularNodes(renderNodes, group);
  let ret = calculateSplitNodes(tmpNodes, splitMarks, originNodes);
  let tmpSketchNodes = ret[0];
  let sketchNodes = new Array();
  let cnt = 0;
  let ctrl = new Array();
  for (let i = 0; i < 2; i++) {
    ctrl[i] = new Array();
    ctrl[i][0] = ctrl[i][1] = 0;
  }
  for (let i = 0; i < tmpSketchNodes.length; i++) {
    sketchNodes[i] = new Array();
    for (let j = 0; j < tmpSketchNodes[i].length; j++) {
      sketchNodes[i][j] = new Array();
      cnt = 0;
      for (let z = 0; z < 2; z++) {
        ctrl[z][0] = ctrl[z][1] = 0;
      }
      for (let k = 0; k < tmpSketchNodes[i][j].length - 1; k++) {
        if (tmpSketchNodes[i][j][k][0] === tmpSketchNodes[i][j][k + 1][0]) {
          sketchNodes[i][j][cnt++] = deepCopy(tmpSketchNodes[i][j][k]);
        } else {
          let tmpAimNodes = [];
          if (tmpSketchNodes[i][j][k][1] !== tmpSketchNodes[i][j][k + 1][1]) {
            ctrl[0][1] = 0;
            let SAMPLERATE = Math.floor(
              _getLength(tmpSketchNodes[i][j][k], tmpSketchNodes[i][j][k + 1]) /
                1000
            );
            if (!(SAMPLERATE & 1)) SAMPLERATE += 1;
            tmpAimNodes = linkNodes(
              [tmpSketchNodes[i][j][k], tmpSketchNodes[i][j][k + 1]],
              0,
              SAMPLERATE
            );
          } else {
            ctrl[0][1] = 0;
            tmpAimNodes = [
              deepCopy(tmpSketchNodes[i][j][k]),
              deepCopy(tmpSketchNodes[i][j][k + 1])
            ];
          }
          for (let z = 0; z < tmpAimNodes.length - 1; z++) {
            let SAMPLERATE = Math.floor(
              _getLength(tmpAimNodes[z], tmpAimNodes[z + 1]) / 1000
            );
            if (SAMPLERATE < 20) SAMPLERATE = 20;
            if (!(SAMPLERATE & 1)) SAMPLERATE += 1;
            if (ctrl[0][1] === 0) {
              shake(ctrl[0], tmpAimNodes[z], tmpAimNodes[z + 1], 0);
              shake(ctrl[1], tmpAimNodes[z], tmpAimNodes[z + 1], 1);
            } else {
              ctrl[0][1] = 2 * tmpAimNodes[z][1] - ctrl[1][1];
              ctrl[0][0] = 2 * tmpAimNodes[z][0] - ctrl[1][0];
              shake(ctrl[1], tmpAimNodes[z], tmpAimNodes[z + 1], 1);
            }
            let aimNodes = linkNodes(
              [tmpAimNodes[z], ctrl[0], ctrl[1], tmpAimNodes[z + 1]],
              1,
              SAMPLERATE
            );
            for (let g = 0; g < aimNodes.length - 1; g++) {
              sketchNodes[i][j][cnt++] = deepCopy(aimNodes[g]);
            }
          }
        }
      }
      sketchNodes[i][j][cnt++] = deepCopy(
        tmpSketchNodes[i][j][tmpSketchNodes[i][j].length - 1]
      );
    }
  }
  sketchNodes = calculateStyledNodes(sketchNodes, ret[1], groupPosition);
  let styleConfig = calculateStyles(
    ret[2],
    initialGraph.names,
    relate,
    stylish
  );
  return { sketchNodes, styleConfig };
}
function shake(
  p,
  a,
  b,
  type = 1,
  distanceRate = 0.25,
  SHAKEY = 300,
  SHAKEX = 0.5
) {
  if (a[1] === b[1]) {
    let length = b[0] - a[0];
    p[0] = a[0] + (type * 0.5 + distanceRate) * length;
    p[1] = a[1] + (Math.random() > 0.5 ? -1 : 1) * Math.random() * SHAKEY;
  } else {
    let lengthX = b[0] - a[0];
    let lengthY = b[1] - a[1];
    p[0] = a[0] + (type * 0.5 + distanceRate) * lengthX;
    p[1] = a[1] + (type * 0.5 + distanceRate) * lengthY;
    p[0] += lengthX * (Math.random() > 0.5 ? -1 : 1) * Math.random() * SHAKEX;
  }
}
function _getLength(a, b) {
  return Math.sqrt(
    (a[1] - b[1]) * (a[1] - b[1]) + (a[0] - b[0]) * (a[0] - b[0])
  );
}
export { sketchRender };
