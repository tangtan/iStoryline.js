/**
 * @param {Story} story
 * @param {constraints} Object
 */

export function greedyAlign(story, constraints) {
  const param = getParam(story, constraints);
  const alignTable = runAlgorithms(param);
  story.setTable("align", alignTable);
}

/**
 * @param {Number[]} list1
 * @param {Number[]} list2
 * @param {Number[][]} constraints  元素的对齐约束
 * @return {Number[]} longestCommonSubstring  list1中元素对齐的是第几个list2中元素
 */

export function longestCommonSubstring(list1, list2, constraints) {}
