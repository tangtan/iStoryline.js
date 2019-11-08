import Snap from "snapsvg";
import iStoryline from "../../src/js/index";

async function main(url) {
  let ans = new iStoryline();
  let graph = await ans.readFile(url);
  graph = ans.scale(100, 100, 800, 500, true);
  const sketchNodes = graph.paths;
  console.log(graph);
  for (let i = 0; i < sketchNodes.length; i++) {
    let nodes = sketchNodes[i];
    // draw text labels
    drawLabel(nodes, graph.names[i]);
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

// main("./data/StarWars.xml");
// main("./data/Redcap.xml");
// main("./data/ChasingDragon.xml");
// main("./data/Coco.xml");
// main("./data/Frozen.xml");
// main("./data/Guowuguan.xml");
main("./data/InceptionTune.xml");
// main("./data/JurassicParkTune.xml");
// main("./data/KingLearTune.xml");
// main("./data/LetBulletFlyTune.xml");
// main("./data/MatrixTune.xml");
// main("./data/Moon.xml");
// main("./data/Minions.xml");
// main("./data/NaniaTune.xml");
// main("./data/Naruto.xml");
// main("./data/Suiciders.xml");
// main("./data/TrainToBusan.xml");
