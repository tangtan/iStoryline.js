import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStorylinePath } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'

const filePath = '../../data/json/'
const fileName = 'Redcap.json'

async function main() {
  const iStorylineInstance = new iStoryline()
  const fileUrl = filePath + fileName
  let graph = await iStorylineInstance.load(fileUrl)
  // graph = iStorylineInstance.sort(['Red cap', 'Mother'], [1, 10])
  // graph = iStorylineInstance.bend(['Mother'], [10])
  // graph = iStorylineInstance.straighten(['Red cap'], [1, 20])
  // graph = iStorylineInstance.compress(['Red cap', 'Wolf'], [1, 20], 0.5)
  // graph = iStorylineInstance.expand(['Red cap', 'Wolf'], [1, 20], 1.5)
  // graph = iStorylineInstance.space(10, 20)
  // graph = iStorylineInstance.adjust(['Red cap'], [1, 20], [[10, 200], [100, 200]])
  // graph = iStorylineInstance.relate(['Red cap', 'Mother'], [1, 10], 'Merge')
  // graph = iStorylineInstance.stylish(['Red cap'], [1, 20], 'Zigzag')
  // graph = iStorylineInstance.reshape([[10, 200], [100, 200]], [[10, 400], [100, 400]])
  // graph = iStorylineInstance.scale(500, 200)
  // graph = iStorylineInstance.addCharacter('TT', [[1, 10]])
  // graph = iStorylineInstance.addCharacter('TT2', [[1, 5], [7, 22]])
  // graph = iStorylineInstance.addCharacter('TT3', [[7, 30], [65, 80]])
  // graph = iStorylineInstance.deleteCharacter('TT2')
  // graph = iStorylineInstance.changeCharacter('TT3', [[1, 5], [7, 22]])
  // graph = iStorylineInstance.addSession([0, 1, 2, 3], [1, 9])
  iStorylineInstance.dump(fileName + '.json', 'json')
  logStoryInfo(iStorylineInstance._story)
  const storylinePaths = graph.storylinePaths
  storylinePaths.forEach(storylinePath => drawStorylinePath(storylinePath))
}

main()
