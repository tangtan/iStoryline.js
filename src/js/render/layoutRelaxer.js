const TIME_UNIT = 100
const TIME_GAP_RATIO = 0.8
const INNERGAPS = 10
const SCALE_GAP = 5

export class LayoutRelaxer {
  constructor(story, constraints) {
    const { origX, renderX } = this.layoutRelax(story, constraints)
    this._origX = origX
    this._renderX = renderX
  }
  get origX() {
    return this._origX
  }
  get renderX() {
    return this._renderX
  }
  time2origX(timeStamp, startOrEnd) {
    return timeStamp * TIME_UNIT - startOrEnd * TIME_GAP
  }
  origX2time(origX, startOrEnd) {
    return (origX + startOrEnd * TIME_GAP) / TIME_UNIT
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
    const layout = story.getTable('layout')
    const character = story.getTable('character')

    let renderX = []
    for (let i = 0, n = story.getTableRows(); i < n; i++) {
      renderX[i] = []
      for (let j = 0, m = story.getTableCols(); j < m; j++)
        renderX[i][j] = [-1, -1]
    }
    for (let j = 0, m = story.getTableCols(); j < m; j++) {
      let oriY = []
      for (let i = 0, n = story.getTableRows(); i < n; i++) {
        if (character.value(i, j) === 1 && layout.value(i, j) >= 0)
          oriY.push({
            y: layout.value(i, j),
            ny:
              j === m - 1 ||
              !character.value(i, j + 1) ||
              layout.value(i, j + 1) < 0
                ? -1
                : layout.value(i, j + 1),
            py:
              j === 0 ||
              !character.value(i, j - 1) ||
              layout.value(i, j - 1) < 0
                ? -1
                : layout.value(i, j - 1),
            id: i,
          })
      }
      oriY.sort((a, b) => {
        return a.y - b.y
      })
      let flag = []
      for (let i = 0; i < oriY.length; i++) {
        flag[i] = []
        flag[i][0] =
          oriY[i].y === oriY[i].py || oriY[i].py === -1
            ? 0
            : oriY[i].y > oriY[i].py
            ? 1
            : 2
        flag[i][1] =
          oriY[i].y === oriY[i].ny || oriY[i].ny === -1
            ? 0
            : oriY[i].y > oriY[i].ny
            ? 1
            : 2
      }
      for (let z = 0; z < 2; z++) {
        let st = 0,
          ed = 0
        while (st < oriY.length) {
          while (
            ed < oriY.length - 1 &&
            flag[ed + 1][z] === flag[st][z] &&
            oriY[ed + 1] - oriY[ed] <= INNERGAPS
          )
            ed++
          for (let k = st; k <= ed; k++) {
            if (flag[k][z] === 0)
              renderX[oriY[k].id][j][z] = originX[oriY[k].id][j][z]
            else if (flag[k][z] === 1)
              renderX[oriY[k].id][j][z] =
                originX[oriY[k].id][j][z] + (z ? 1 : -1) * (k - st) * SCALE_GAP
            else
              renderX[oriY[k].id][j][z] =
                originX[oriY[k].id][j][z] + (z ? 1 : -1) * (ed - k) * SCALE_GAP
          }
          st = ed + 1
          ed++
        }
      }
    }
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
