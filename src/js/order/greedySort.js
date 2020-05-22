import {
  topoSort,
  dealSetConstraints,
  getWeight,
  dealElementConstraints
} from "../utils/sort";

/**
 * @param {Story} story
 * @param {constraints} Object
 */

export function greedySort(story, constraints) {
  const param = getParam(story, constraints);
  const sortTable = runAlgorithms(param);
  story.setTable("sort", sortTable);
}

/**
 * @param {Number[][]} list1 第一个维度是集合，第二个维度是集合的元素
 * @param {Number[]} list2 元素的权重顺序
 * @param {Number[][]} constraints  元素的顺序约束
 * @return {Number[]} orderList  元素的顺序
 * @example   let list1=[[1,2,3],[5,6,4],[55,63]];
              let list2=[4,63,55,3,5,6,2,1];
              let constraints=[[5,1],[1,55],[3,2],[1,3]];
 */

export function constrainedCrossingReduction(list1, list2, constraints = []) {
  let list1Weight = [];
  for (let arr of list1) {
    let sumWeight = 0;
    for (let element of arr) {
      sumWeight += getWeight(element, list2);
    }
    list1Weight.push(sumWeight / arr.length);
  }
  let [mapSetArr, setInDegree] = dealSetConstraints(
    list1,
    constraints,
    list1Weight
  );
  let order = topoSort(mapSetArr, setInDegree, list1Weight);
  //
  list1.sort((a, b) => {
    const indexA = list1.indexOf(a);
    const indexB = list1.indexOf(b);
    return order.indexOf(indexA) - order.indexOf(indexB);
  });
  let allElementWeight = [];
  let allElement = [];
  list1.forEach(set => {
    set.forEach(id => {
      allElement.push(id);
      allElementWeight.push(getWeight(id, list2));
    });
  });
  let [mapElementArr, elementInDegree] = dealElementConstraints(
    list1,
    constraints,
    allElementWeight
  );
  let elementOrder = topoSort(mapElementArr, elementInDegree, allElementWeight);
  for (let arr of list1) {
    arr.sort((a, b) => {
      const indexA = allElement.indexOf(a);
      const indexB = allElement.indexOf(b);
      return elementOrder.indexOf(indexA) - elementOrder.indexOf(indexB);
    });
  }
  return list1;
}
