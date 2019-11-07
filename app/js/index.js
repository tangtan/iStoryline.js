import Snap from "snapsvg";
import iStoryline from "../../src/js/index";
import { scaleLinear, scaleLog } from "d3-scale";

async function main(url) {
  let ans = new iStoryline();
  let graph = await ans.readFile(url);
  const sketchNodes = normalize(graph.paths);
  // const sketchNodes = normalize(graph.sketchNodes);
  console.log(graph);
  for (let i = 0; i < sketchNodes.length; i++) {
    let nodes = sketchNodes[i];
    // draw text labels
    let label = drawLabel(nodes, graph.names[i]);
    // draw graph with animations
    let storylines = drawInitial(nodes);
    let completePathStrs = nodes.map(line => genSimplePathStr(line));
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

function normalize(nodes, x0 = 100, y0 = 100, width = 1000) {
  const minX = Math.min(
    ...nodes.map(storyline =>
      Math.min(
        ...storyline.map(storysegment =>
          Math.min(...storysegment.map(storynode => storynode[0]))
        )
      )
    )
  );
  const maxX = Math.max(
    ...nodes.map(storyline =>
      Math.min(
        ...storyline.map(storysegment =>
          Math.max(...storysegment.map(storynode => storynode[0]))
        )
      )
    )
  );
  const minY = Math.min(
    ...nodes.map(storyline =>
      Math.min(
        ...storyline.map(storysegment =>
          Math.min(...storysegment.map(storynode => storynode[1]))
        )
      )
    )
  );
  const maxY = Math.max(
    ...nodes.map(storyline =>
      Math.min(
        ...storyline.map(storysegment =>
          Math.max(...storysegment.map(storynode => storynode[1]))
        )
      )
    )
  );
  let ratio = (maxY - minY) / (maxX - minX);
  ratio = ratio < 0.15 ? 0.372 : ratio;
  const xScale = scaleLinear()
    .domain([minX, maxX])
    .range([x0, x0 + width]);
  const yScale = scaleLinear()
    .domain([minY, maxY])
    .range([y0, y0 + width * ratio]);
  nodes.forEach(storyline => {
    storyline.forEach(storysegment => {
      storysegment.forEach(storynode => {
        storynode[0] = xScale(storynode[0]);
        storynode[1] = yScale(storynode[1]);
      });
    });
  });
  return nodes;
}

function drawLabel(nodes, name) {
  const svg = Snap("#mySvg");
  let labelX = nodes[0][0][0] - 4;
  let labelY = nodes[0][0][1] + 4;
  // console.log(name, labelX, labelY);
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
    // console.log(i, rPoint, lPoint, points.length);
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

main("./data/StarWars.xml");
// main("./data/Redcap.xml");
// main("./data/ChasingDragon.xml");
// main("./data/Coco.xml");
// main("./data/Frozen.xml");
// main("./data/Guowuguan.xml");
// main("./data/InceptionTune.xml");
// main("./data/JurassicParkTune.xml");
// main("./data/KingLearTune.xml");
// main("./data/LetBulletFlyTune.xml");
// main("./data/MatrixTune.xml");
// main("./data/MatrixHand.xml");
// main("./data/Moon.xml");
// main("./data/Minions.xml");
// main("./data/NaniaTune.xml");
// main("./data/Naruto.xml");
// main("./data/Suiciders.xml");
// main("./data/TrainToBusan.xml");
