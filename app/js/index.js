import iStoryline from "../../src/js/index";
import { scaleLinear } from "d3-scale";
import Snap from "snapsvg";
import { join } from "path";

async function main(url) {
  let ans=new iStoryline(url);
  await ans.ready();
  let graph=ans._layout();
  // ans.extent(100, 300, 1250);
  // let graph=ans._layout();
  // console.log(graph);
  for(let i = 0;i < graph.sketchNodes.length;i ++){
    let nodes = graph.sketchNodes[i];
    let storylines = drawInitial(nodes);
    let completePathStrs = nodes.map(line => genSmoothPathStr(line));
    storylines.forEach((storyline, i) => {
      storyline.animate({
        d: completePathStrs[i]
      }, 1000);
    });
  }
}

function normalize(nodes, x0=0, y0=0, deltaX=1000) {
  const minX = Math.min(...nodes.map(line => Math.min(...line.map(node => node[0]))));
  const maxX = Math.max(...nodes.map(line => Math.max(...line.map(node => node[0]))));
  const minY = Math.min(...nodes.map(line => Math.min(...line.map(node => node[1]))));
  const maxY = Math.max(...nodes.map(line => Math.max(...line.map(node => node[1]))));
  const ratio = (maxY - minY) / (maxX - minX);
  const xScale = scaleLinear().domain([minX, maxX]).range([x0, x0 + deltaX]);
  const yScale = scaleLinear().domain([minY, maxY]).range([y0, y0 + deltaX * ratio]);
  nodes.forEach(line => {
    line.forEach(node => {
      node[0] = xScale(node[0]);
      node[1] = yScale(node[1]);
    });
  });
}

function draw(nodes) {
  const svg = Snap('#mySvg');
  const storylines = nodes.map(line => {
    const pathStr = genSmoothPathStr(line);
    const pathSvg = svg.path(pathStr);
    pathSvg.attr({
      'fill': 'none',
      'stroke': 'black',
      'stroke-width': 1
    });
    return pathSvg;
  });
  return storylines;
}

function drawInitial(nodes) {
  const svg = Snap("#mySvg");
  const storylines = nodes.map(line => {
    const pathStr = genInitialPathStr(line);
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

function genSmoothPathStr(points) {
  let pathStr = `M ${points[0][0]} ${points[0][1]} `;
  let i, len;
  for (i = 1, len = points.length; i < len - 1; i += 2) {
    const rPoint = points[i];
    const lPoint = points[i + 1];
    // console.log(i, rPoint, lPoint, points.length);
    const middleX = (rPoint[0] + lPoint[0]) / 2;
    pathStr += `L ${rPoint[0]} ${rPoint[1]} `;
    if (rPoint[1] !== lPoint[1]) {
      pathStr += `C ${middleX} ${rPoint[1]} ${middleX} ${lPoint[1]} ${lPoint[0]} ${lPoint[1]} `;
    } else {
      pathStr += `L ${lPoint[0]} ${lPoint[1]} `
    }
  }
  if(i < len) pathStr += `L ${points[i][0]} ${points[i][1]}`;
  else pathStr += `L ${points[i-1][0]} ${points[i-1][1]}`;
  return pathStr;
}
function getSmoothPathStr(points) {
  let pathStr = `M ${points[0][0]} ${points[0][1]} `;
  let i, len;
  for (i = 1, len = points.length; i < len; i += 1) {
    const rPoint = points[i];
    pathStr += `L ${rPoint[0]} ${rPoint[1]} `;
  }
  return pathStr;
}
function genInitialPathStr(points) {
  return `M ${points[0][0]} ${points[0][1]} `;
}

main("./data/StarWars.xml");
