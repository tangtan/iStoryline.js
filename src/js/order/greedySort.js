import { topoSort, dealSetConstraints, getWeight } from "../utils/sort";

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
  let [mapSetArr, inDegree] = dealSetConstraints(
    list1,
    constraints,
    list1Weight
  );
  let order = topoSort(mapSetArr, inDegree, list1Weight);
  //
  list1.sort((a, b) => {
    const indexA = list1.indexOf(a);
    const indexB = list1.indexOf(b);
    return order.indexOf(indexA) - order.indexOf(indexB);
  });

  for (let arr of list1) {
    arr.sort((a, b) => getWeight(a, list2) - getWeight(b, list2));
  }
  return list1;
}
