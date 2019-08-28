// import iStoryline from "../../src/js";
import iStoryline from "../../src/js/istoryline"
import * as d3 from "d3";
import Snap from "snapsvg";
import { join } from "path";
function testHit(graph){
  console.log(graph);
  console.log(graph.hitTest);
  console.log("testX");
  console.log(graph.hitTest.getStoryNodeX(11,0,0));
  console.log("testY");
  console.log(graph.hitTest.getStoryNodeY(2,0,0));
  console.log("testNodeID");
  console.log(graph.hitTest.getStorylineID(76500,63999));
  console.log(graph.hitTest.getStorySegmentID(76500,63999));
  console.log(graph.hitTest.getStoryNodeID(76500,63999));
  console.log("testSegment");
  console.log(graph.hitTest.getStorySegment(1150.4,51000));
  console.log("testStoryline");
  console.log(graph.hitTest.getStoryline(96634,11000));
  console.log("testStorylineName sec");
  console.log(graph.hitTest.getStorylineName(81104,56000));
  console.log("testLocationName fir");
  console.log(graph.hitTest.getStorylineName(102582,36000));
  let index = graph.hitTest.getStorylineIndex(102582,36000,0);
  console.log(index);
  console.log(graph.hitTest.changeFour2Three(index));
  console.log(graph.hitTest.changeThree2Four(index));
  console.log(graph.hitTest.getSessionID(102582,36000));
  console.log(graph.hitTest.getLocationID(102582,36000));
  console.log(graph.hitTest.getLocationName(102582,36000));
  console.log(graph.hitTest.getCharacterX("HAN",12));
  console.log(graph.hitTest.getCharacterY("HAN",12));
}
function main(url) {
  d3.xml(url, (error, data) => {
    if (error) throw error;
    // let storyGenerator = new iStoryline();
    let testInstance=new iStoryline();
    // storyGenerator.readFile(data);                                                                                                                                                                                                                                                             
    testInstance.readXMLFile(data);
    console.log(JSON.stringify(testInstance.data));
    testInstance.layout();
    // testInstance.addCharacter("even",1,100);
    // testInstance.addCharacter();
    testInstance.addCharacter([["111",2,10]]);
    testInstance.addCharacter([["111",2,10],["tq",2,200]]);
    // testInstance.order([['VADER','LEIA']]);
    // storyGenerator.changeSession(['VADER','R2-D2'],0,12);
    // storyGenerator.removeSession('VADER',10,15);
    // storyGenerator.addCharacter("tt-111",1,100); 
    // testInstance.order(["111","tq"]);
    // testInstance.order(["even","111"]);
    // testInstance.order(["even","tq",55,300]);
    // testInstance.order(["tq","even",50,52]);
    // testInstance.bend("even",60);
    // testInstance.order(["even","tq"]);

    // testInstance.changeSession(["even","tq",3,5]);
    // testInstance.straighten(["even",1,100]);
    // testInstance.straighten(["tq",2,200]);
    // testInstance.changeSession(["even","tq"],88,95);
    // testInstance.merge([0,2],2,3);
    // testInstance.removeSession("even",4,10);
    // testInstance.straighten(["even",1,100])

    // testInstance.straighten(["tq",1,100])
    // testInstance.straighten(['tt-111',1,100]);
    // storyGenerator.merge([2,1],0,1);
    // storyGenerator.split(1,0);
    // let graph =storyGenerator.layout([],[],[]);
    // storyGenerator.addCharacter('Li',0,100);
    let graph = testInstance.layout();
    let testdivide = new Array();
    testdivide[0] = new Array();
    testdivide[0][0] = 'LUKE';
    testdivide[0][1] = 10;
    testdivide[0][2] = 60;
    testdivide[0][3] = 'SinWave';
    testdivide[1] = new Array();
    testdivide[1][0] = 'OBI-WAN';
    testdivide[1][1] = 0;
    testdivide[1][2] = 1;
    testdivide[1][3] = 'ZigZag';
    
    let groupdivide = new Array();
    groupdivide[0] = new Array();
    groupdivide[0][0] = new Array();
    groupdivide[0][0][0] = 'LUKE';
    groupdivide[0][0][1] = 'JABBA';
    groupdivide[0][1] = 81;
    groupdivide[0][2] = 105;
    groupdivide[0][3] = 'Collide';
    console.log(graph);
    // groupdivide[1] = new Array();
    // groupdivide[1][0] = new Array();
    // groupdivide[1][0][0] = 'BOBA FETT';
    // groupdivide[1][0][1] = 'YODA';
    // groupdivide[1][1] = 87;
    // groupdivide[1][2] = 89;
    // groupdivide[1][3] = 'Knot';

    // groupdivide[2] = new Array();
    // groupdivide[2][0] = new Array();
    // groupdivide[2][0][0] = 'OBI-WAN';
    // groupdivide[2][0][1] = 'R2-D2';
    // groupdivide[2][1] = 19;
    // groupdivide[2][2] = 33;
    // groupdivide[2][3] = 'Twine';
    console.log(groupdivide);
    const newGraph = testInstance.collide(groupdivide);
    console.log(graph);
    graph = newGraph;
    // storyGenerator.replacePartLine([[0,1],[1,1],[2,1],[100,5],[4,1],[5,2],[106,10]],0,0,14);
    testInstance.extent(100, 300, 1250);
    // storyGenerator.extent(100,300,1250);
    //testHit(graph);
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
  });
}

function normalize(nodes, x0=0, y0=0, deltaX=1000) {
  const minX = Math.min(...nodes.map(line => Math.min(...line.map(node => node[0]))));
  const maxX = Math.max(...nodes.map(line => Math.max(...line.map(node => node[0]))));
  const minY = Math.min(...nodes.map(line => Math.min(...line.map(node => node[1]))));
  const maxY = Math.max(...nodes.map(line => Math.max(...line.map(node => node[1]))));
  const ratio = (maxY - minY) / (maxX - minX);
  const xScale = d3.scaleLinear().domain([minX, maxX]).range([x0, x0 + deltaX]);
  const yScale = d3.scaleLinear().domain([minY, maxY]).range([y0, y0 + deltaX * ratio]);
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

main("../data/StarWars.xml");
