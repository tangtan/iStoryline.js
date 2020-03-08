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
function smoothRender(
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
  //同group之间互相错开 时间相连但x不相连 一个Segment里面只有两个点
  const { smoothNodes, styleConfig } = calculateSmoothNodes(
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
  let extentPaths = extent(originNodes, deepCopy(smoothNodes));
  //extentPaths = simplifyPaths(extentPaths);
  let renderedGraph = initialGraph;
  const width = scaleInfo.length > 0 ? scaleInfo[0].param.width || 1000 : 1000;
  const height = scaleInfo.length > 0 ? scaleInfo[0].param.height || 372 : 372;
  const reserveRatio =
    scaleInfo.length > 0 ? scaleInfo[0].param.reserveRatio || false : false;
  let stdX = (1900 - width) / 2;
  let stdY = (1000 - height) / 2;
  const x0 = scaleInfo.length > 0 ? scaleInfo[0].param.x0 || stdX : stdX;
  const y0 = scaleInfo.length > 0 ? scaleInfo[0].param.y0 || stdY : stdY;

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
function calculateSmoothNodes(
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
  let tmpSmoothNodes = ret[0];
  let smoothNodes = new Array();
  for (let i = 0; i < tmpSmoothNodes.length; i++) {
    smoothNodes[i] = new Array();
    for (let j = 0; j < tmpSmoothNodes[i].length - 1; j++) {
      if (smoothNodes[i][j] === undefined) smoothNodes[i][j] = [];
      for (let k = 0; k < tmpSmoothNodes[i][j].length; k++) {
        smoothNodes[i][j].push(deepCopy(tmpSmoothNodes[i][j][k]));
      }
      if (linkMark[i][j] !== linkMark[i][j + 1]) continue;
      if (tmpSmoothNodes[i][j][1][1] === tmpSmoothNodes[i][j + 1][0][1]) {
        smoothNodes[i][j].push([
          (tmpSmoothNodes[i][j + 1][0][0] + tmpSmoothNodes[i][j][1][0]) / 2,
          (tmpSmoothNodes[i][j + 1][0][1] + tmpSmoothNodes[i][j][1][1]) / 2
        ]);
        if (smoothNodes[i][j + 1] === undefined) smoothNodes[i][j + 1] = [];
        smoothNodes[i][j + 1].push([
          (tmpSmoothNodes[i][j + 1][0][0] + tmpSmoothNodes[i][j][1][0]) / 2,
          (tmpSmoothNodes[i][j + 1][0][1] + tmpSmoothNodes[i][j][1][1]) / 2
        ]);
      } else {
        let SAMPLERATE = Math.floor(
          _getLength(tmpSmoothNodes[i][j][1], tmpSmoothNodes[i][j + 1][0]) / 20
        );
        if (!(SAMPLERATE & 1)) SAMPLERATE += 1;
        if (SAMPLERATE > 11) SAMPLERATE = 11;
        let aimNodes = linkNodes(
          [
            [tmpSmoothNodes[i][j][1][0], tmpSmoothNodes[i][j][1][1]],
            [tmpSmoothNodes[i][j + 1][0][0], tmpSmoothNodes[i][j + 1][0][1]]
          ],
          0,
          SAMPLERATE
        );
        let len = aimNodes.length;
        let midL = Math.floor(len / 2);
        let midR = Math.ceil(len / 2);
        if (midL === midR) {
          for (let z = 0; z < midL; z++) {
            smoothNodes[i][j].push(deepCopy(aimNodes[z]));
          }
          smoothNodes[i][j].push([
            (aimNodes[midL][0] + aimNodes[midL - 1][0]) / 2,
            (aimNodes[midL][1] + aimNodes[midL - 1][1]) / 2
          ]);
          if (smoothNodes[i][j + 1] === undefined) smoothNodes[i][j + 1] = [];
          smoothNodes[i][j + 1].push([
            (aimNodes[midL][0] + aimNodes[midL - 1][0]) / 2,
            (aimNodes[midL][1] + aimNodes[midL - 1][1]) / 2
          ]);
          for (let z = midR; z < aimNodes.length; z++) {
            smoothNodes[i][j + 1].push(deepCopy(aimNodes[z]));
          }
        } else {
          for (let z = 0; z <= midL; z++) {
            smoothNodes[i][j].push(deepCopy(aimNodes[z]));
          }
          if (smoothNodes[i][j + 1] === undefined) smoothNodes[i][j + 1] = [];
          for (let z = midL; z < aimNodes.length; z++) {
            smoothNodes[i][j + 1].push(deepCopy(aimNodes[z]));
          }
        }
      }
    }
    if (smoothNodes[i][tmpSmoothNodes[i].length - 1] === undefined)
      smoothNodes[i][tmpSmoothNodes[i].length - 1] = [];
    for (
      let k = 0;
      k < tmpSmoothNodes[i][tmpSmoothNodes[i].length - 1].length;
      k++
    ) {
      smoothNodes[i][tmpSmoothNodes[i].length - 1].push(
        deepCopy(tmpSmoothNodes[i][tmpSmoothNodes[i].length - 1][k])
      );
    }
  }
  smoothNodes = calculateStyledNodes(smoothNodes, ret[1], groupPosition);
  let styleConfig = calculateStyles(
    ret[2],
    initialGraph.entities,
    relate,
    stylish
  );
  return { smoothNodes, styleConfig };
}
function _getLength(a, b) {
  return Math.sqrt(
    (a[1] - b[1]) * (a[1] - b[1]) + (a[0] - b[0]) * (a[0] - b[0])
  );
}
export { smoothRender };
