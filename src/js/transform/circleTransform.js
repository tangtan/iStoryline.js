/**
 * change the coordinates from polar into rectangular coordinates.
 *
 * @param
 *   node
 *     int[2]
 *
 * @return
 *   coordinates
 *      int[2]
 */
function polar(x){
  return [x[1]*Math.sin(x[0]),x[1]*Math.cos(x[0])];
}


/**
 * show the Storyline in a Sector layout
 *
 * @param
 *   node
 *     int[][][]
 *   R,r
 *     the larger radius, the smaller radius
 *   range
 *     the Sector angle(in radian like 0.6Π)
 *
 * @return
 *   node
 *     int[][][]
 */
function circleTransform(node,R,r,range){
  let biggestX=0,biggestY=0,smallestX=Number.MAX_VALUE,smallestY=Number.MAX_VALUE;
  for (let line of node){
    biggestX=Math.max(...(line.map(x=>x[0])));
    smallestX=Math.min(...(line.map(x=>x[0])));
    biggestY=Math.max(...(line.map(x=>x[1])));
    smallestY=Math.min(...(line.map(x=>x[1])));
  }
  let initNode=[];
  biggestX-=smallestX;
  biggestY-=smallestY;
  for (let line of node){
    initNode.push(line.map(x=>[(x[0]-smallestX-biggestX/2)*range/biggestX,(x[1]-smallestY)/(biggestY)*(R-r)+r]));
  }
  let ansNode=[];
  initNode.forEach(line=>{
    let ansLine=[];
    for (let node of line)
      ansLine.push(polar(node));
    ansNode.push(ansLine);
  });
  return ansNode;
}

export {circleTransform}