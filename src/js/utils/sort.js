export function topoSort(mapSetArr, inDegree, listWeight) {
  debugger;
  let order = [];
  for (let i = 0; i < inDegree.length; i++) {
    let minWeight = Number.MAX_SAFE_INTEGER;
    let pos = -1;
    for (let j = 0; j < inDegree.length; j++) {
      if (inDegree[j] == 0 && listWeight[j] < minWeight) {
        pos = j;
        minWeight = listWeight[j];
      }
    }
    order.push(pos);
    inDegree[pos] = -1;
    //has been added to the order array
    for (let i = 0; i < mapSetArr[pos].length; i++) {
      if (mapSetArr[pos][i] !== undefined) {
        inDegree[i] -= 1;
      }
    }
  }
  return order;
}

export function dealSetConstraints(list, constraints, listWeight) {
  let mapSetArr = [];
  //transform constraint to edges in a graph
  let inDegree = [];
  let setArr = [];
  //binding sets
  list.forEach(x => {
    mapSetArr.push([]);
    inDegree.push(0);
    setArr.push([setArr.length]);
  });
  for (let constraint of constraints) {
    let [first, second] = constraint;
    let firstSetId = getSetId(first, list);
    let secondSetId = getSetId(second, list);

    setArr[firstSetId] = [...setArr[firstSetId], ...setArr[secondSetId]];
    setArr[secondSetId] = [-1];
    let sumWeight = 0;
    setArr[firstSetId].forEach(id => (sumWeight += listWeight[id]));
    for (let i = 0; i < setArr[firstSetId].length; i++) {
      setArr[firstSetId][i] = sumWeight / setArr[firstSetId].length;
    }
    if (firstSetId !== secondSetId) {
      mapSetArr[firstSetId][secondSetId] = 1;
      inDegree[secondSetId] += 1;
    }
  }
  return [mapSetArr, inDegree];
}

export function getWeight(id, list2) {
  return list2.indexOf(id);
}

export function getSetId(element, setArr) {
  for (let set of setArr) {
    if (set.indexOf(element) !== -1) {
      return setArr.indexOf(set);
    }
  }
  console.error("Can't find this element in any set!");
  return -1;
}
