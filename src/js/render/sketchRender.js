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
import { calculateScaleRate } from "./baseRender";
function sketchRender(
  initialGraph,
  adjustInfo,
  relateInfo,
  stylishInfo,
  scaleInfo
) {
  let tmp = calculateOriginNodes(
    initialGraph.initialNodes,
    initialGraph.timeframeTable,
    initialGraph.entities,
    initialGraph.keyTimeframe
  ); //不同segment之间时间相连但x不相连
  let originNodes = tmp[0];
  let linkMark = tmp[1];
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
    linkMark,
    relate,
    stylish
  );
  let extentNodes = extent(originNodes, deepCopy(renderNodes));
  let extentPaths = extent(originNodes, deepCopy(sketchNodes));
  extentPaths = simplifyPaths(extentPaths, 5);
  let renderedGraph = initialGraph;
  const width = scaleInfo.length > 0 ? scaleInfo[0].param.width || 1000 : 1000;
  const height = scaleInfo.length > 0 ? scaleInfo[0].param.height || 372 : 372;
  let stdX = (1900 - width) / 2;
  let stdY = (1000 - height) / 2;
  const x0 = scaleInfo.length > 0 ? scaleInfo[0].param.x0 || stdX : stdX;
  const y0 = scaleInfo.length > 0 ? scaleInfo[0].param.y0 || stdY : stdY;
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
  renderedGraph.timeline = calculateTimeline(originNodes);
  renderedGraph.scaleRate =
    calculateScaleRate(originNodes, renderedGraph.nodes) / 5;
  return renderedGraph;
}
function calculateSketchNodes(
  renderNodes,
  originNodes,
  group,
  splitMarks,
  groupPosition,
  initialGraph,
  linkMark,
  relate,
  stylish
) {
  let tmpNodes = removeAngularNodes(renderNodes, group);
  let ret = calculateSplitNodes(tmpNodes, splitMarks, originNodes);
  let tmpSketchNodes = ret[0];
  let sketchNodes = new Array();
  let ctrl = new Array();
  for (let i = 0; i < 2; i++) {
    ctrl[i] = new Array();
    ctrl[i][0] = ctrl[i][1] = 0;
  }
  for (let i = 0; i < tmpSketchNodes.length; i++) {
    sketchNodes[i] = new Array();
    for (let j = 0; j < tmpSketchNodes[i].length; j++) {
      for (let z = 0; z < 2; z++) {
        ctrl[z][0] = ctrl[z][1] = 0;
      }
      let tmpAimNodes = [];
      for (let k = 0; k < tmpSketchNodes[i][j].length - 1; k++) {
        tmpAimNodes = [
          deepCopy(tmpSketchNodes[i][j][k]),
          deepCopy(tmpSketchNodes[i][j][k + 1])
        ];
        for (let z = 0; z < tmpAimNodes.length - 1; z++) {
          let SAMPLERATE = Math.floor(
            _getLength(tmpAimNodes[z], tmpAimNodes[z + 1]) / 50
          );
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
          if (sketchNodes[i][j] === undefined) sketchNodes[i][j] = [];
          for (let g = 0; g < aimNodes.length - 1; g++) {
            sketchNodes[i][j].push(deepCopy(aimNodes[g]));
          }
        }
      }
      if (j < tmpSketchNodes[i].length - 1) {
        if (linkMark[i][j] !== linkMark[i][j + 1]) continue;
        if (tmpSketchNodes[i][j][1][1] !== tmpSketchNodes[i][j + 1][0][1]) {
          let SAMPLERATE = Math.floor(
            _getLength(tmpSketchNodes[i][j][1], tmpSketchNodes[i][j + 1][0]) /
              20
          );
          if (!(SAMPLERATE & 1)) SAMPLERATE += 1;
          tmpAimNodes = linkNodes(
            [tmpSketchNodes[i][j][1], tmpSketchNodes[i][j + 1][0]],
            0,
            SAMPLERATE
          );
        } else {
          tmpAimNodes = [
            deepCopy(tmpSketchNodes[i][j][1]),
            deepCopy(tmpSketchNodes[i][j + 1][0])
          ];
        }
        let len = tmpAimNodes.length;
        let mid = Math.floor(len / 2);
        for (let z = 0; z < len - 1; z++) {
          let SAMPLERATE = Math.floor(
            _getLength(tmpAimNodes[z], tmpAimNodes[z + 1]) / 50
          );
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
          if (z < mid) {
            for (let g = 0; g < aimNodes.length; g++) {
              sketchNodes[i][j].push(deepCopy(aimNodes[g]));
            }
          } else {
            if (sketchNodes[i][j + 1] === undefined) sketchNodes[i][j + 1] = [];
            for (let g = 0; g < aimNodes.length; g++) {
              sketchNodes[i][j + 1].push(deepCopy(aimNodes[g]));
            }
          }
        }
      }
    }
  }
  sketchNodes = calculateStyledNodes(sketchNodes, ret[1], groupPosition);
  let styleConfig = calculateStyles(
    ret[2],
    initialGraph.entities,
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
  distanceRate = 0.2,
  SHAKEY = 40,
  SHAKEX = 0.6
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
