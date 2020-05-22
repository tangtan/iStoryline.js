import { DisjointSet } from "./disjointset";

export function topoSort(mapSetArr, inDegree, listWeight) {
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
  let setArr = new DisjointSet(list.length);
  //binding sets
  list.forEach(x => {
    mapSetArr.push([]);
    inDegree.push(0);
  });
  for (let constraint of constraints) {
    let [first, second] = constraint;
    let firstSetId = getSetId(first, list);
    let secondSetId = getSetId(second, list);
    if (firstSetId !== secondSetId) {
      setArr.union(firstSetId, secondSetId);
      let sumWeight = 0;
      let allElement = setArr.allElementinSet(firstSetId);
      allElement.forEach(id => (sumWeight += listWeight[id]));
      for (let i = 0; i < allElement.length; i++) {
        listWeight[allElement[i]] = sumWeight / allElement.length;
      }
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

export function dealElementConstraints(list, constraints, listWeight) {
  let listAllElement = [];
  list.forEach(x => {
    listAllElement = [...listAllElement, ...x];
  });
  let mapElementArr = [];
  let inDegree = [];
  let setArr = new DisjointSet(listAllElement.length);

  listAllElement.forEach(x => {
    mapElementArr.push([]);
    inDegree.push(0);
  });
  for (let constraint of constraints) {
    let [first, second] = constraint;
    let firstSetId = getSetId(first, list);
    let secondSetId = getSetId(second, list);
    if (firstSetId === secondSetId) {
      setArr.union(
        listAllElement.indexOf(first),
        listAllElement.indexOf(second)
      );
      let allElement = setArr.allElementinSet(listAllElement.indexOf(first));
      let sumWeight = 0;
      allElement.forEach(id => (sumWeight += listWeight[id]));
      for (let i = 0; i < allElement.length; i++) {
        listWeight[allElement[i]] = sumWeight / allElement.length;
      }
      mapElementArr[listAllElement.indexOf(first)][
        listAllElement.indexOf(second)
      ] = 1;
      inDegree[listAllElement.indexOf(second)] += 1;
    }
  }
  return [mapElementArr, inDegree];
}
