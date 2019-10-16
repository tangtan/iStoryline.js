import { CharacterStore } from "./istoryline.character";
import { HitTest } from "./istoryline.hitTest";
import { storyOrder } from "./layout.order";
import { storyAlign } from "./layout.align";
import { storyCompress } from "./layout.compress";
import { distortion } from "./layout.distortion";
import { modifyLayout } from "./layout.render";
import { scaleLinear } from "d3-scale";
/**
 * dealing with the Character operations, e.g., add/change/remove
 *
 * @properties
 *   - data
 *     - locationTree
 *     - sessionTable
 *
 * @methods
 *   - so on
 */
export default class iStoryline extends CharacterStore {

  static build(fileSrc){
    return readXMLFile(fileSrc).then(
      function(data){
        return new iStoryline(storyData);
      }
    );
  }

  constructor(storyData) {
    super(); // inherit data
    this.adjustInfo=[];
    this.addCharacterInfo=[];
    this.expandInfo=[];
    this.changeSessionInfo=[];
    this.compressInfo_new=[];
    this.mergeInfo = [];
    this.orderInfo = [];
    this.straigtenInfo = [];
    this.bendInfo = [];
    this.compressInfo = [];
    this.groupMarks=[];
    this.divideMarks=[];
    this.initdata=null;
    this.din = 1000;
    this.dout = 0;
    this.xml=null;
    this.data=storyData;
    // TODO: add other properties
  }
  /**
   *
   * @param {Number} din
   * @param {Number} dout
   */
  space(din, dout) {
    this.din = din * 1000;
    this.dout = dout * 1000;
    const graph = this.layout();
    return graph;
  }

  // compress(compressInfo){
  //   this.compressInfo=compressInfo;
  //   const graph=this.layout();
  //   return graph;
  // }

compress(compressInfo){
  for (let compressData of compressInfo){
    compressData[0].shift();
    compressData[0].forEach(name=>{this.cutSession(name,compressData[1]);this.cutSession(name,compressData[2])});
  }
  this.compressInfo=compressInfo;
  const graph=this.layout();
  return graph;
}

expand(expandInfo){
  for (let expandPair of expandInfo){
    expandPair[0].shift();
    expandPair[0].forEach(name=>{
      this.cutSession(name,expandPair[1]);
      this.cutSession(name,expandPair[2]);
    })
  }
  this.expandInfo=expandInfo;
  const graph=this.layout();
  return graph;
}


  /**
   * add a new Character between startTime and endTime
   *
   * @param
   *   characterName
   *     a string like 'Mother'
   *   startTime,endTime
   *     time not coordinate
   *
   * @return
   *   null.
   */
  addCharacter(CharacterInfo) {
    if (CharacterInfo.length===0) return;
    this.changeSessionInfo=CharacterInfo;
    if (this.xml!==null) {
      this.data=this.init();
      this.graph=null;
      this.sequence=null;
      this.readXMLFile(this.xml);
    }
    for (let [characterName,startTime,endTime] of CharacterInfo)
      super.addCharacter(characterName, startTime, endTime);
    const graph = this.layout();
    return graph;
  }

  addKeytimeframe(time) {
    super.addKeytimeframe(time);
    const graph = this.layout();
    return graph;
  }


  addSession(Session, LocationName) {
    super.addSession(Session, LocationName);
  }

  changeSession(changeInfo) {
    if (this.xml!==null) {
      this.data=this.init();
      this.graph=null;
      this.sequence=null;
      this.readXMLFile(this.xml);
    }
    this.addCharacter(this.addCharacterInfo);
    for (let [chaArr, startTime, endTime] of changeInfo)
    {
    chaArr.forEach(cha => this.cutSession(cha, startTime));
    chaArr.forEach(cha => this.cutSession(cha, endTime));
    super.changeSession(chaArr, startTime, endTime);
    }
    const graph = this.layout();
    return graph;
  }

  removeSession(characterName, startTime, endTime) {
    super.removeSession(characterName, startTime, endTime);
    const graph = this.layout();
    return graph;
  }

  async readXMLFile(xml) {
    this.xml=xml.cloneNode(true);
    return await super.readXMLFile(xml);
  }

  init() {
    let locationTree = { children: [], name: "All", sessions: [] };
    let sessionTable = new Map();
    return {
      locationTree: locationTree,
      sessionTable: sessionTable
    };
  }

  clean() {
    this.data = {};
    this.data.locationTree = {};
    this.data.sessionTable = new Map();
  }

  /**
   * private func which generate storyline layout.
   * @process
   *   - order
   *   - align
   *   - compress
   *   - render
   *   - distort
   *
   * @return
   *   - graph
   */

  layout() {
    if (this.data === undefined) this.data = this.init();
    let data = this.data;
    let sequence = storyOrder(data, this.orderInfo);
    this.sequence = sequence;
    let alignedSessions = storyAlign(
      sequence,
      this.straigtenInfo,
      this.bendInfo
    );
    let mergeInfo = this.mergeInfo;
    let graph = storyCompress(
      data,
      sequence,
      alignedSessions,
      [...this.compressInfo,...this.expandInfo],
      this.mergeInfo,
      this.din,
      this.dout,
    );
    this.graph = graph;
    let hitTest = new HitTest(graph, data);
    this.graph.hitTest = hitTest;
    graph=this.adjust(this.adjustInfo);
    return graph;
  }
  /**
   * merge some StoryLines
   *
   * @param
   *   storyLineArr
   *     a array of storyline in order
   *   startTime,endTime
   *     time not coordinate
   *
   * @return
   *   null.
   */
  merge(mergeInfo) {
    let temp=mergeInfo.map(x=>[...x,0]);
    temp.forEach(x=>x[0].shift());
    temp.forEach(x=>{
      this.cutSession(x[0][0],x[1],x[2]);
    })
    this.mergeInfo = temp;
    const graph = this.layout();
    return graph;
  }

  /**
   * split merged lines
   *
   * @param
   *   storyLineID
   *
   *   time
   *
   *
   * @return
   *   null.
   */

  split(splitPair) {
    for(let [storyLineID,time] of splitPair){
    for (let i = this.mergeInfo.length - 1; i >= 0; i--) {
      let pair = this.mergeInfo[i];
      if (
        pair[0].indexOf(storyLineID) !== -1 &&
        time <= pair[2] &&
        time >= pair[1]
      )
        this.mergeInfo.splice(i, 1);
    }
  }
    const graph = this.layout();
    return graph;
  }

  twine(groupMarks) {
    let divideMarks=this.divideMarks;
    this.groupMarks=groupMarks;
    let newGraph = this.graph;
    const {
      sketchNodes,
      renderNodes,
      smoothNodes,
      originNodes,
      styleSegments
    } = modifyLayout(newGraph.nodes, newGraph.names, divideMarks, groupMarks);
    newGraph.renderNodes = renderNodes;
    newGraph.smoothNodes = smoothNodes;
    newGraph.originNodes = originNodes;
    newGraph.sketchNodes = sketchNodes;
    this.graph = newGraph;
    return newGraph;
  }

  knot(groupMarks) {
    let divideMarks=this.divideMarks;
    this.groupMarks=groupMarks;
    let newGraph = this.graph;
    let renderGraph = render(newGraph, groupMarks, divideMarks);
    this.graph = renderGraph;
    return renderGraph;
  }

  collide(groupMarks) {
    let divideMarks=this.divideMarks;
    this.groupMarks=groupMarks;
    let newGraph = this.graph;
    let renderGraph = render(newGraph, groupMarks, divideMarks);
    this.graph = renderGraph;
    return renderGraph;
  }
  /**
   * use a line to replace a part of a StoryLine
   * since the smoothnodes has not been finished , the function is based on nodes
   *
   * @param
   *   line:point[]
   *     the line you use to replace, such as [[1,0],[10,20],[50,21]]
   *     it must be given from the left side to the right side
   *   storyLineID:string
   *     the ID of the StoryLine
   *   startStoryNodeId,endStoryNodeID:string
   *    the start and end of the substitued part
   *
   * @return
   *   null.
   */
  adjust(adjustInfo) {
    this.adjustInfo=adjustInfo;
    adjustInfo.forEach(x=>{
    let [name,t1,t2,line]=x;
    let storyLineID=this.graph.names.indexOf(name);
    let [initX,_]=this.graph.nodes[storyLineID][0];
    let startStoryNodeID=0, endStoryNodeID=0;
    for (let [x,y] of this.graph.nodes[storyLineID]){
      if (initX<=t1*50&&t1*50<=x) break;
      startStoryNodeID+=1;
      initX
    }
    for (let [x,y] of this.graph.nodes[storyLineID]){
      if (initX<=2*50&&t2*50<=x) break;
      endStoryNodeID+=1;
    }
    
    let startNode = this.graph.nodes[storyLineID][startStoryNodeID];
    let endNode = this.graph.nodes[storyLineID][endStoryNodeID];
    let smoothLine = line.filter(node => line.indexOf(node) % 3 === 0);
    const deltainSmoothline =
      smoothLine[0][1] - smoothLine[smoothLine.length - 1][1];
    const deltainLine = startNode[1] - endNode[1];
    const timeY = deltainLine / deltainSmoothline;
    const timeX =
      (endNode[0] - startNode[0]) /
      (smoothLine[smoothLine.length - 1][0] - smoothLine[0][0]);
    smoothLine.forEach(node => {
      node[1] *= timeY;
      node[0] *= timeX;
    });
    let minxinSmoothline = Math.min(...smoothLine.map(node => node[0]));
    let minyinSmoothline = Math.min(...smoothLine.map(node => node[1]));
    smoothLine.forEach(node => {
      node[0] = node[0] - minxinSmoothline + startNode[0];
      node[1] = startNode[1] + node[1] - minyinSmoothline;
    });
    this.graph.nodes[storyLineID].splice(
      startStoryNodeID,
      endStoryNodeID - startStoryNodeID + 1,
      ...smoothLine
    );
    })
    const { sketchNodes, renderNodes, smoothNodes, originNodes } = modifyLayout(
      this.graph.nodes,
      this.graph.names,
    );
    
    this.graph.renderNodes = renderNodes;
    this.graph.smoothNodes = smoothNodes;
    this.graph.originNodes = originNodes;
    this.graph.sketchNodes = sketchNodes;
    return this.graph;
  }

   cutSession(characterName, time) {
    super.cutSession(characterName, time);
  }

  bend(bendInfo) {
    for (let [name, time] of bendInfo) this.cutSession(name, time);
    this.bendInfo = bendInfo;
    const graph = this.layout();
    return graph;
  }
  /**
   *
   * @param {[firstCharactername,lastCharactername,begintime,endtime]} orderpair
   */
  sort(orderInfo) {
    for (let orderpair of orderInfo)
      if (orderpair.length === 4) {
        this.cutSession(orderpair[0], orderpair[2]);
        this.cutSession(orderpair[0], orderpair[3]);
        this.cutSession(orderpair[1], orderpair[2]);
        this.cutSession(orderpair[1], orderpair[3]);
      }
    this.orderInfo = orderInfo;
    const graph = this.layout();
    return graph;
  }

  /**
   *
   * @param {[name,begintime,endtime]} straightenpair
   */
  straighten(straigtenInfo) {
    for (let straightenpair of straigtenInfo) {
      this.cutSession(straightenpair[0],straightenpair[1]);
      this.cutSession(straightenpair[0],straightenpair[2]);
    }
    this.straigtenInfo = straigtenInfo;
    const graph = this.layout();
    return graph;
  }

  distort(controlNodes) {
    distortion(this.graph.nodes, [[], [], ...controlNodes]);
    const graph = this.layout();
    return graph;
  }

  /**
   * Scale nodes according to canvas size.
   *
   * @param
   *   x0, y0
   *     the top-right anchor point of storylines in the canvas.
   *   width
   *     the maximum width of storylines.
   *   type
   *     specify scale function type
   *     - linear (default)
   *     - log
   *     - etc.
   *
   * @return
   *   null.
   */
  extent(x0 = 0, y0 = 0, width = 1000, type = "linear") {
    const { renderNodes, smoothNodes, sketchNodes } = this.graph;
    const minX = Math.min(
      ...renderNodes.map(storyline =>
        Math.min(
          ...storyline.map(storysegment =>
            Math.min(...storysegment.map(storynode => storynode[0]))
          )
        )
      )
    );
    const maxX = Math.max(
      ...renderNodes.map(storyline =>
        Math.min(
          ...storyline.map(storysegment =>
            Math.max(...storysegment.map(storynode => storynode[0]))
          )
        )
      )
    );
    const minY = Math.min(
      ...renderNodes.map(storyline =>
        Math.min(
          ...storyline.map(storysegment =>
            Math.min(...storysegment.map(storynode => storynode[1]))
          )
        )
      )
    );
    const maxY = Math.max(
      ...renderNodes.map(storyline =>
        Math.min(
          ...storyline.map(storysegment =>
            Math.max(...storysegment.map(storynode => storynode[1]))
          )
        )
      )
    );
    const ratio = (maxY - minY) / (maxX - minX);
    let xScaleFunc, yScaleFunc;
    switch (type) {
      case "linear":
        xScaleFunc = scaleLinear;
        yScaleFunc = scaleLinear;
        break;
      default:
        xScaleFunc = scaleLinear;
        yScaleFunc = scaleLinear;
        break;
    }
    const xScale = xScaleFunc()
      .domain([minX, maxX])
      .range([x0, x0 + width]);
    const yScale = yScaleFunc()
      .domain([minY, maxY])
      .range([y0, y0 + width * ratio]);
    renderNodes.forEach(storyline => {
      storyline.forEach(storysegment => {
        storysegment.forEach(storynode => {
          storynode[0] = xScale(storynode[0]);
          storynode[1] = yScale(storynode[1]);
        });
      });
    });
    smoothNodes.forEach(storyline => {
      storyline.forEach(storysegment => {
        storysegment.forEach(storynode => {
          storynode[0] = xScale(storynode[0]);
          storynode[1] = yScale(storynode[1]);
        });
      });
    });
    sketchNodes.forEach(storyline => {
      storyline.forEach(storysegment => {
        storysegment.forEach(storynode => {
          storynode[0] = xScale(storynode[0]);
          storynode[1] = yScale(storynode[1]);
        });
      });
    });
  }
  /**
   *
   * @param {[[Name:string,begintime:number,endtime:number,style]]} divideMarks
   *
   * @returns {graph,styleSegments}
   * graph
   *
   * styleSegments
   *    [[name,segmentID,style]]
   */
  divide(divideMarks) {
    let divideMarks=this.divideMarks;
    this.groupMarks=groupMarks;
    let newGraph = this.graph;
    let renderGraph = render(newGraph, groupMarks, divideMarks);
    this.graph = renderGraph;
    return [ renderGraph, renderGraph.styleConfig ];
  }
}
