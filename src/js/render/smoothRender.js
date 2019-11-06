import {calculateOriginNodes, extent, linkNodes} from "./baseRender"
import {initializeGroup} from "./baseRender"
import {judgeStylishAndRelate} from "./baseRender"
import {initializeSplitMarks} from "./baseRender"
import {calculateRenderNodes} from "./baseRender"
import {calculateSplitNodes} from "./baseRender"
import {calculateStyledNodes} from "./baseRender"
import {calculateTimeline} from "./baseRender"
import {removeAngularNodes} from "./baseRender"
import {calculateStyles} from "./baseRender"
import {deepCopy} from "./baseRender"
import {extent} from "./baseRender"
function smoothRender(initialGraph, adjustInfo, relateInfo, stylishInfo)
{
    let originNodes = calculateOriginNodes(initialGraph.initialNodes, initialGraph.timeframeTable, initialGraph.entities);
    let group = initializeGroup(originNodes);
    const { relate, stylish } = judgeStylishAndRelate(relateInfo, stylishInfo);
    const { splitMarks, groupPosition } = initializeSplitMarks(originNodes, initialGraph.entities, relate, stylish);
    let renderNodes = calculateRenderNodes(originNodes, group);
    const {smoothNodes, styleConfig} = calculateSmoothNodes(renderNodes, originNodes, group, splitMarks, groupPosition, initialGraph, relate, stylish);
    let timeline = calculateTimeline(originNodes, renderNodes);
    let renderedGraph = initialGraph;
    renderedGraph.nodes = extent(originNodes, deepCopy(renderNodes));
    renderedGraph.paths = extent(originNodes, deepCopy(smoothNodes));
    renderedGraph.styleConfig = deepCopy(styleConfig);
    renderedGraph.timeline = timeline;
    return renderedGraph;
}
function calculateSmoothNodes(renderNodes, originNodes, group, splitMarks, groupPosition,initialGraph ,relate, stylish) {
    let tmpNodes = removeAngularNodes(renderNodes, group);
    let ret = calculateSplitNodes(tmpNodes, splitMarks, originNodes);
    let tmpSmoothNodes = ret[0];
    let smoothNodes = new Array();
    let cntNodes = 0;
    for (let i = 0; i < tmpSmoothNodes.length; i++) {
        smoothNodes[i] = new Array();
        for (let j = 0; j < tmpSmoothNodes[i].length; j++) {
            cntNodes = 0;
            smoothNodes[i][j] = new Array();
            for (let k = 0; k < tmpSmoothNodes[i][j].length; k++) {
                if (k + 1 === tmpSmoothNodes[i][j].length || tmpSmoothNodes[i][j][k][1] === tmpSmoothNodes[i][j][k + 1][1]) {
                    smoothNodes[i][j][cntNodes ++] = deepCopy(tmpSmoothNodes[i][j][k]);
                }
                else {
                    let SAMPLERATE = Math.floor(_getLength(tmpSmoothNodes[i][j][k],tmpSmoothNodes[i][j][k+1]) / 1000);
                    if (!(SAMPLERATE & 1)) SAMPLERATE += 1;
                    let aimNodes = linkNodes([tmpSmoothNodes[i][j][k],tmpSmoothNodes[i][j][k + 1]],0,SAMPLERATE);
                    for (let z = 0; z < aimNodes.length; z++) {
                        smoothNodes[i][j][cntNodes ++] = deepCopy(aimNodes[z]);
                    }
                }
            }
        }
    }
    smoothNodes = calculateStyledNodes(smoothNodes, ret[1], groupPosition);
    let styleConfig = calculateStyles(ret[2], initialGraph.names, relate, stylish);
    return {smoothNodes , styleConfig};
}
function _getLength(a,b)
{
    return Math.sqrt((a[1] - b[1]) * (a[1] - b[1]) + (a[0] - b[0]) * (a[0] - b[0]));
}
export {smoothRender};
