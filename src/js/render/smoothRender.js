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
  let originNodes = calculateOriginNodes(
    initialGraph.initialNodes,
    initialGraph.timeframeTable,
    initialGraph.entities,
    initialGraph.keyTimeframe
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
  const { smoothNodes, styleConfig } = calculateSmoothNodes(
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
  let extentPaths = extent(originNodes, deepCopy(smoothNodes));
  extentPaths = simplifyPaths(extentPaths, 5);
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
  relate,
  stylish
) {
  let tmpNodes = removeAngularNodes(renderNodes, group);
  let ret = calculateSplitNodes(tmpNodes, splitMarks, originNodes);
  let tmpSmoothNodes = ret[0];
  let smoothNodes = new Array();
  let cntNodes = 0;
  let recLast = 0;
  for (let i = 0; i < tmpSmoothNodes.length; i++) {
    smoothNodes[i] = new Array();
    recLast = 0;
    for (let j = 0; j < tmpSmoothNodes[i].length - 1; j++) {
      cntNodes = 0;
      smoothNodes[i][j] = new Array();
      for (let k = 0; k < tmpSmoothNodes[i][j].length; k++) {
        smoothNodes[i][j][cntNodes++] = deepCopy(tmpSmoothNodes[i][j][k]);
        if (recLast) {
          smoothNodes[i][j][cntNodes - 1][0] =
            (tmpSmoothNodes[i][j][1][0] + tmpSmoothNodes[i][j][0][0]) / 2;
        }
      }
      if (tmpSmoothNodes[i][j][1][1] === tmpSmoothNodes[i][j + 1][0][1]) {
        smoothNodes[i][j][cntNodes++] = deepCopy(tmpSmoothNodes[i][j + 1][0]);
        recLast = 0;
      } else {
        if (cntNodes >= 1)
          smoothNodes[i][j][cntNodes - 1][0] =
            (tmpSmoothNodes[i][j][1][0] + tmpSmoothNodes[i][j][0][0]) / 2;
        let SAMPLERATE = Math.floor(
          _getLength(tmpSmoothNodes[i][j][1], tmpSmoothNodes[i][j + 1][0]) / 10
        );
        if (!(SAMPLERATE & 1)) SAMPLERATE += 1;
        let aimNodes = linkNodes(
          [
            [
              (tmpSmoothNodes[i][j][1][0] + tmpSmoothNodes[i][j][0][0]) / 2,
              tmpSmoothNodes[i][j][1][1]
            ],
            [
              (tmpSmoothNodes[i][j + 1][0][0] +
                tmpSmoothNodes[i][j + 1][1][0]) /
                2,
              tmpSmoothNodes[i][j + 1][0][1]
            ]
          ],
          0,
          SAMPLERATE
        );
        recLast = 1;
        for (let z = 0; z < aimNodes.length; z++) {
          smoothNodes[i][j][cntNodes++] = deepCopy(aimNodes[z]);
        }
      }
    }
    smoothNodes[i][tmpSmoothNodes[i].length - 1] = deepCopy(
      tmpSmoothNodes[i][tmpSmoothNodes[i].length - 1]
    );
    if (recLast) {
      smoothNodes[i][tmpSmoothNodes[i].length - 1][0][0] =
        (tmpSmoothNodes[i][tmpSmoothNodes[i].length - 1][0][0] +
          tmpSmoothNodes[i][tmpSmoothNodes[i].length - 1][1][0]) /
        2;
    }
    recLast = 0;
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
