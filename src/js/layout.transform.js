function bezierMapping(node,controlnodes){
    let num=controlnodes[2].length-1;
    let ansx=0;
    let ansy=0;
    let t;
    // console.log("bug_node",node)
    for (let i=0;i<controlnodes[2].length;i++){
        t=node[0];
        // ansx+=combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[0][i][0];
        // ansx+=combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[1][i][0];
        ansx+=(node[1])*combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[3][i][0];
        ansx+=(1-node[1])*combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[2][i][0];
        t=node[0];
        ansy+=50*(1-node[1])*combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[2][i][1];//左
        ansy+=50*(node[1])*combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[3][i][1];//右
        // ansy+=combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[2][i][1];
        // ansy+=combination(i,num)*power(t,i)*power(1-t,num-i)*controlnodes[3][i][1];
        // console.log("bug_xy",ansx,ansy);
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

function distortion(nodes,controlNodes){
    let maxx=0;
    let maxy=0;

    nodes.forEach(x=>{x.forEach(y=>{if (y[0]>maxx) maxx=y[0];if (y[1]>maxy) maxy=y[1]})});
    // console.log("bug",maxx);

    nodes.forEach(x=>{x.forEach(node=>{node[0]/=maxx;node[1]/=maxy;})});
    let hhh=true;
    let changedcontrolnodes;
let baseline=10;
const basey=maxy*2;
    // if (hhh===false)
    //     changedcontrolnodes=[[[0,0],[0,maxy/2],[0,maxy]],[[0,0],[maxx/2,0],[maxx,0]]];
    // else
    //     changedcontrolnodes=[
    //         // [[0,0],[0,maxy],[0,maxy*2]], //左
    //         // [[0,0+basey],[0,maxy+basey],[0,maxy*2+basey]],//右
    //         [],[],
    //         [[maxx*0.6,0],    [maxx*0.05,maxx*0.2+0.5*maxy],        [maxx*0.1,maxx*0.5+0.5*maxy],       [0.45*maxx,maxy*2+maxx/3],[maxx*0.5,maxx-0.2*maxy],   [0,maxx*1.2]],//上
    //         [[maxx*0.6,maxy], [maxx*(0.1+0.05),maxx*0.2+1.2*maxy], [maxx*0.15,maxx*0.5-0.2*maxy],      [0.5*maxx,maxy+maxx/3], [maxx*0.6,maxx+maxy*0.9],    [0,maxy+maxx*1.2]]//下
    //     ];
    changedcontrolnodes=controlNodes;

    // console.log("bug_node",JSON.stringify(nodes))
    //nodes.forEach(x=>{x.forEach(node=>{node=beziermapping(node,changedcontrolnodes)})});
    for (let i=0;i<nodes.length;i++){
        for (let j=0;j<nodes[i].length;j++)
            nodes[i][j]=bezierMapping(nodes[i][j],changedcontrolnodes);
    }
    // console.log("bug_bezier",JSON.stringify(nodes),changedcontrolnodes)
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


export {distortion}