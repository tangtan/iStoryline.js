import { logStoryInfo } from '../../src/js/utils/logger'
import { drawStorylinePath } from '../../src/js/utils/drawer'
import iStoryline from '../../src/js'

const filePath = '../../data/json/'
const fileName = 'Redcap.json'

async function main() {
  const iStorylineInstance = new iStoryline()
  const fileUrl = filePath + fileName
  let graph = await iStorylineInstance.load(fileUrl)
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
