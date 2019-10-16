function bezierMapping(node,controlnodes){
  let num=controlnodes[2].length-1;
  let ansx=0;
  let ansy=0;
  let t;
  for (let i=0;i<controlnodes[2].length;i++){
    t=node[0];
    ansx+=(node[1])*combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[3][i][0];
    ansx+=(1-node[1])*combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[2][i][0];
    t=node[0];
    ansy+=50*(1-node[1])*combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[2][i][1];//左
    ansy+=50*(node[1])*combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[3][i][1];//右
  }
  node=[ansx,ansy];
  return node;
}

function combination (a,n){
  let ans=1;
  for (let i=1;i<=a;i++){
    ans=ans*(n-i+1);
    ans=ans/i;
  }
  return ans;
}

function power(a,n){
  let ans=1;
  for (let i=1;i<=n;i++)
    ans*=a;
  return ans;
}

function freeTransform(nodes,controlNodes){
  let maxx=0;
  let maxy=0;
  nodes.forEach(x=>{x.forEach(y=>{if (y[0]>maxx) maxx=y[0];if (y[1]>maxy) maxy=y[1]})});
  nodes.forEach(x=>{x.forEach(node=>{node[0]/=maxx;node[1]/=maxy;})});
  let hhh=true;
  let changedcontrolnodes;
  let baseline=10;
  const basey=maxy*2;
  changedcontrolnodes=controlNodes;
  for (let i=0;i<nodes.length;i++){
    for (let j=0;j<nodes[i].length;j++)
      nodes[i][j]=bezierMapping(nodes[i][j],changedcontrolnodes);
  }
  let minx=0;
  let miny=0;
  nodes.forEach(x=>{x.forEach(y=>{if (y[0]<minx) minx=y[0];if (y[1]<miny) miny=y[1]})});
  for (let i=0;i<nodes.length;i++){
    for (let j=0;j<nodes[i].length;j++)
    {
      nodes[i][j][0]+=minx;
      nodes[i][j][1]+=miny;
    }
  }
}


export {freeTransform}