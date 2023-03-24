import { TIME_UNIT, TIME_GAP_RATIO, TWIST_FACTOR } from '../utils/CONSTANTS'

const UP = -1
const DOWN = 1
const SAME = 0

export class LayoutRelaxer {
  constructor(story, constraints) {
    const { origX, renderX } = this.layoutRelax(story, constraints)
    this._origX = origX
    this._renderX = renderX
    story._timeStamps2X = []
    for (let idx = 0, len = story.timeline.length; idx < len; idx++) {
      if (idx < renderX[0].length) {
        for (let jdx = 0, jLen = story.characters.length; jdx < jLen; jdx++) {
          const tmpX = renderX[jdx][idx][0]
          if (tmpX > -1) {
            story._timeStamps2X.push(tmpX)
            break
          }
        }
      } else {
        for (let jdx = 0, jLen = story.characters.length; jdx < jLen; jdx++) {
          const tmpX = renderX[jdx][idx - 1][1]
          if (tmpX > -1) {
            story._timeStamps2X.push(tmpX)
            break
          }
        }
      }
    }
  }
  get origX() {
    return this._origX
  }
  get renderX() {
    return this._renderX
  }
  layoutRelax(story) {
    const timeline = story.timeline
    const character = story.getTable('character')
    const layout = story.getTable('layout')
    let originX = this.newArray(story.getTableRows(), story.getTableCols())
    for (let i = 0, len = story.getTableRows(); i < len; i++) {
      for (let j = 0, len = story.getTableCols(); j < len; j++) {
        originX[i][j] = []
        if (character.value(i, j) === 0 || layout.value(i, j) < 0) {
          originX[i][j] = [-1, -1]
        } else {
          originX[i][j][0] = timeline[j] * TIME_UNIT
          originX[i][j][1] =
            timeline[j + 1] * TIME_UNIT -
            (timeline[j + 1] - timeline[j]) * TIME_UNIT * TIME_GAP_RATIO
        }
      }
    }
    const origX = originX
    const renderX = this._getRenderX(originX, story)
    return { origX, renderX }
  }
  _getRenderX(originX, story) {
    let renderX = []
    const sessionTable = story.getTable('session')
    const twister = new SplineTwister(story, originX)
    const rawRenderX = twister.twist()
    rawRenderX.forEach((charXArr, cIdx) => {
      let tmpCharXArr = []
      for (let tIdx = 0; tIdx < story.getTableCols(); tIdx++) {
        if (sessionTable.value(cIdx, tIdx) > 0) {
          const leftIdx = 2 * tIdx
          const rightIdx = leftIdx + 1
          tmpCharXArr.push([
            charXArr.points[leftIdx].x,
            charXArr.points[rightIdx].x,
          ])
        } else {
          tmpCharXArr.push([-1, -1])
        }
      }
      renderX.push(tmpCharXArr)
    })
    return renderX
  }
  newArray(n, m) {
    let ret = []
    for (let i = 0; i < n; i++) {
      ret[i] = []
      for (let j = 0; j < m; j++) ret[i][j] = 0
    }
    return ret
  }
}

export class SplineTwister {
  constructor(story, renderX) {
    const layoutTable = story.getTable('layout')
    this.data = []
    renderX.forEach((charXArr, charIdx) => {
      let tmpCharPoints = []
      charXArr.forEach((xPair, timeStep) => {
        const charY = layoutTable.value(charIdx, timeStep)
        const [xLeft, xRight] = xPair
        tmpCharPoints.push({
          x: xLeft,
          y: charY,
        })
        tmpCharPoints.push({
          x: xRight,
          y: charY,
        })
      })
      this.data.push({
        points: tmpCharPoints,
      })
    })
  }

  twist() {
    if (!this.validateData()) {
      console.error('invalid input data')
    }

    let data = this.data
    let timeframeCount = this.data[0].points.length / 2
    let characterCount = this.data.length

    let characterByOrders = []
    for (let timeframe = 0; timeframe < timeframeCount; timeframe++) {
      let right = timeframe * 2 + 1
      let characterByOrder = []

      for (let character = 0; character < characterCount; character++) {
        characterByOrder.push({
          character: character,
          y: data[character].points[right].y,
        })
      }

      characterByOrder.sort((a, b) => a.y - b.y)
      characterByOrders.push(characterByOrder)
    }

    for (let timeframe = 0; timeframe < timeframeCount - 1; timeframe++) {
      let right = timeframe * 2 + 1
      let nextRight = right + 2

      let characterList = characterByOrders[timeframe]

      let upSet = []
      let downSet = []
      let up = []
      let down = []
      let previousDirection = SAME
      let lastDiff = -1
      let lastY = -1
      characterList.forEach(({ character, y }, i) => {
        let nextY = data[character].points[nextRight].y

        let diff = 0
        if (y > -1 && nextY > -1) {
          diff = Math.round(nextY - y)
        }
        if (Math.abs(diff) < 0.0001) {
          // same
          return
        }

        let currentDirection = diff > 0 ? DOWN : UP
        if (currentDirection === DOWN) {
          // down
          if (previousDirection === UP && up.length > 0) {
            upSet.push(up)
            up = []
          }
          if (lastDiff === -1 || lastY === -1) {
            down.push(character)
            lastDiff = diff
          } else if (
            Math.abs(lastDiff - diff) < 100 &&
            Math.abs(y - lastY) < 100
          ) {
            down.push(character)
          } else {
            downSet.push(down)
            down = [character]
            lastDiff = diff
          }
          previousDirection = DOWN
        } else {
          // up
          if (previousDirection === DOWN && down.length > 0) {
            downSet.push(down)
            down = []
          }
          if (lastDiff === -1 || lastY === -1) {
            up.push(character)
            lastDiff = diff
          } else if (
            Math.abs(lastDiff - diff) < 100 &&
            Math.abs(y - lastY) < 100
          ) {
            up.push(character)
          } else {
            upSet.push(up)
            up = [character]
            lastDiff = diff
          }
          up.push(character)
          previousDirection = UP
        }
        lastY = y
      })
      // if direction never change
      if (up.length > 0) {
        upSet.push(up)
        up = []
      }
      if (down.length > 0) {
        downSet.push(down)
        down = []
      }

      ;[upSet, downSet] = this.cleanUpDownSet(upSet, downSet)

      let maxXDiff = 0
      const factor = TWIST_FACTOR * TIME_UNIT
      for (let charactersArray of upSet) {
        maxXDiff = Math.max(
          SplineTwister.internalTwist(charactersArray, factor, UP, data, right),
          maxXDiff
        )
      }

      for (let charactersArray of downSet) {
        maxXDiff = Math.max(
          SplineTwister.internalTwist(
            charactersArray,
            factor,
            DOWN,
            data,
            right
          ),
          maxXDiff
        )
      }

      // TOOD: O(n^2) -> O(n)
      for (let info of data) {
        for (let i = nextRight; i < info.points.length; i++) {
          info.points[i].x += maxXDiff
        }
      }
    }
    this.fixWrongPosition(data)
    return data
  }

  fixWrongPosition(data) {
    let delta = 20
    let rowLen = data.length
    let colLen = data[0].points.length
    for (let i = 0; i < colLen - 1; i++) {
      let minDelta = 1000
      for (let c = 0; c < rowLen; c++) {
        let tmpY = data[c].points[i].y
        let tmpNextY = data[c].points[i + 1].y
        if (tmpY > -1 && tmpNextY > -1) {
          let tmpDelta = data[c].points[i + 1].x - data[c].points[i].x
          minDelta = Math.min(minDelta, tmpDelta)
        }
      }
      if (minDelta < 0) {
        let moveDistance = -minDelta + delta
        for (let j = i + 1; j < colLen; j++) {
          for (let c = 0; c < rowLen; c++) {
            data[c].points[j].x += moveDistance
          }
        }
      }
    }
  }

  cleanUpDownSet(upSet, downSet) {
    let _upSet = []
    let _downSet = []
    upSet.forEach(up => {
      let tmpUp = []
      up.forEach(c => {
        if (tmpUp.indexOf(c) === -1) {
          tmpUp.push(c)
        }
      })
      _upSet.push(tmpUp)
    })
    downSet.forEach(down => {
      let tmpDown = []
      down.forEach(c => {
        if (tmpDown.indexOf(c) === -1) {
          tmpDown.push(c)
        }
      })
      _downSet.push(tmpDown)
    })
    return [_upSet, _downSet]
  }

  validateData() {
    let data = this.data
    if (!data) {
      return false
    }

    let size = -1

    for (let v of data) {
      let currentLength = v.points.length
      if (currentLength % 2 !== 0) {
        return false
      }
      if (size === -1) {
        size = currentLength
      } else {
        if (currentLength !== size) {
          return false
        }
      }
    }

    return true
  }

  static calculateMoveDistance(distance, arc) {
    return distance * Math.tan(arc / 2)
  }

  static internalTwist(charactersArray, factor, direction, data, right) {
    let maxXDiff = 0
    let nextLeft = right + 1
    let nextRight = right + 2
    if (direction !== SAME && charactersArray.length > 1) {
      // up
      // move latter ones to right
      let up = direction === UP
      let anchor = up
        ? charactersArray[0]
        : charactersArray[charactersArray.length - 1]
      let xDiff = data[anchor].points[nextLeft].x - data[anchor].points[right].x

      // move this right and next left
      if (up) {
        for (let i = 1; i < charactersArray.length; i++) {
          let c = charactersArray[i]
          let pc = charactersArray[i - 1]
          let diff = data[c].points[nextRight].y - data[c].points[right].y
          let yDiff = data[c].points[right].y - data[pc].points[right].y
          let unitMoveDistance = Math.abs(
            SplineTwister.calculateMoveDistance(yDiff, Math.atan2(diff, xDiff))
          )
          let moveDistance = unitMoveDistance * factor
          data[c].points[right].x = data[pc].points[right].x + moveDistance
          data[c].points[nextLeft].x =
            data[pc].points[nextLeft].x + moveDistance
          maxXDiff = Math.max(moveDistance, maxXDiff)
        }
      } else {
        for (let i = charactersArray.length - 2; i >= 0; i--) {
          let c = charactersArray[i]
          let yDiff = data[anchor].points[right].y - data[c].points[right].y
          let diff = data[c].points[nextRight].y - data[c].points[right].y
          let unitMoveDistance = Math.abs(
            SplineTwister.calculateMoveDistance(yDiff, Math.atan2(diff, xDiff))
          )
          let moveDistance = unitMoveDistance * factor
          data[c].points[right].x += moveDistance
          data[c].points[nextLeft].x += moveDistance
          maxXDiff = Math.max(moveDistance, maxXDiff)
        }
      }
      // composation for adding x
    }
    return maxXDiff
  }
}
