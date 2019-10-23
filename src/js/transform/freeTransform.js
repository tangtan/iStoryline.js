import { notDeepStrictEqual } from "assert";

function bezierMapping(node, controlnodes) {
  let num = controlnodes[0].length - 1;
  let ansx = 0;
  let ansy = 0;
  let t;
  for (let i = 0; i < controlnodes[0].length; i++) {
    t = node[0];
    ansx +=
      node[1] *
      combination(i, num) *
      power(t, i) *
      power(1 - t, num - i) *
      controlnodes[1][i][0];
    ansx +=
      (1 - node[1]) *
      combination(i, num) *
      power(t, i) *
      power(1 - t, num - i) *
      controlnodes[0][i][0];
    t = node[0];
    ansy +=
      50 *
      (1 - node[1]) *
      combination(i, num) *
      power(t, i) *
      power(1 - t, num - i) *
      controlnodes[0][i][1]; //左
    ansy +=
      50 *
      node[1] *
      combination(i, num) *
      power(t, i) *
      power(1 - t, num - i) *
      controlnodes[1][i][1]; //右
  }
  node = [ansx, ansy];
  return node;
}

function combination(a, n) {
  let ans = 1;
  for (let i = 1; i <= a; i++) {
    ans = ans * (n - i + 1);
    ans = ans / i;
  }
  return ans;
}

function power(a, n) {
  let ans = 1;
  for (let i = 1; i <= n; i++) ans *= a;
  return ans;
}

function transform(controlNodes, nodes) {
  let maxx = 0;
  let maxy = 0;
  nodes.forEach(x => {
    x.forEach(y => {
      // if (y[0] > maxx) maxx = y[0];
      // if (y[1] > maxy) maxy = y[1];
     let yx=y.map(_=>_[0]);
     maxx=Math.max(maxx,...yx);
     let yy=y.map(_=>_[1]);
     maxy=Math.max(maxy,...yy);
    });
  });
  nodes.forEach(x => {
    x.forEach(node => {
      node.forEach(point=>{point[0]/=maxx;point[1]/=maxy;});
      // node[0] /= maxx;
      // node[1] /= maxy;
    });
  });
  let changedcontrolnodes;
  changedcontrolnodes = controlNodes;
  for (let i = 0; i < nodes.length; i++) {
    for (let j = 0; j < nodes[i][0].length; j++)
      nodes[i][0][j] = bezierMapping(nodes[i][0][j], changedcontrolnodes);
  }
  // let minx = 0;
  // let miny = 0;
  // nodes.forEach(x => {
  //   x.forEach(y => {
  //     if (y[0] < minx) minx = y[0];
  //     if (y[1] < miny) miny = y[1];
  //   });
  // });
  // for (let i = 0; i < nodes.length; i++) {
  //   for (let j = 0; j < nodes[i].length; j++) {
  //     nodes[i][j][0] += minx;
  //     nodes[i][j][1] += miny;
  //   }
  // }
  return nodes;
}

function freeTransform(renderedGraph, upperPath, lowerPath) {
  let nodes = renderedGraph.renderNodes;
  if (upperPath.length < 2 && lowerPath.length < 2) return renderedGraph;
  let controlNodes = [upperPath, lowerPath];
  // transform(controlNodes,renderedGraph.nodes);
  transform(controlNodes, renderedGraph.renderNodes);
  transform(controlNodes, renderedGraph.sketchNodes);
  transform(controlNodes, renderedGraph.smoothNodes);
  return renderedGraph;
}

export { freeTransform };
