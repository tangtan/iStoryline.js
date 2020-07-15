import { Table } from '../data/table'
import { STYLE_LABELS } from '../utils/CONSTANTS'
export class StyleConfiger {
  constructor(story, constraints) {
    const { style, styleFlag, moveMark, styleY } = this.genStyle(
      story,
      constraints
    )
    this._style = style
    this._styleFlag = styleFlag //0 for even 1 for odd
    this._moveMark = moveMark
    this._styleY = styleY
  }
  get style() {
    return this._style
  }
  get styleFlag() {
    return this._styleFlag
  }
  get moveMark() {
    return this._moveMark
  }
  get styleY() {
    return this._styleY
  }
  genStyle(story, oConstraints) {
    const constraints = this.ctrsFilter(oConstraints)
    const tstyle = this.newArray(story.getTableRows(), story.getTableCols())
    const tstyleFlag = this.newArray(story.getTableRows(), story.getTableCols())
    const tmoveMark = this.newArray(story.getTableRows(), story.getTableCols())
    const tstyleY = this.newArray(story.getTableRows(), story.getTableCols())
    constraints.forEach(ctr => {
      this._changeStyle(ctr, story, tstyle, tmoveMark)
      this._changeStyleY(ctr, story, tstyleFlag, tstyleY)
    })
    const style = new Table(tstyle)
    const styleFlag = tstyleFlag,
      moveMark = tmoveMark,
      styleY = tstyleY
    return { style, styleFlag, moveMark, styleY }
  }
  ctrsFilter(octrs) {
    let tctrs = []
    octrs.forEach(ctr => {
      for (let i = 0; i < STYLE_LABELS.length; i++) {
        if (STYLE_LABELS[i] === ctr.style) {
          tctrs.push(ctr)
          break
        }
      }
    })
    return tctrs
  }
  getStyleId(styleName) {
    for (let i = 0; i < STYLE_LABELS.length; i++) {
      if (styleName === STYLE_LABELS[i]) return i
    }
    return 0
  }
  newArray(n, m) {
    let ret = []
    for (let i = 0; i < n; i++) {
      ret[i] = []
      for (let j = 0; j < m; j++) ret[i][j] = 0
    }
    return ret
  }
  _changeStyle(ctr, story, style, moveMark) {
    const timesteps = story.getTimeSteps([ctr.timeSpan])
    ctr.names.forEach(name => {
      const id = story.getCharacterID(name)
      for (let i = 0; i < timesteps.length; i++) {
        const timestep = timesteps[i]
        style[id][timestep] = this.getStyleId(ctr.style)
        moveMark[id][timestep] = 0
        if (style[id][timestep] >= this.getStyleId('Twine')) {
          if (i === 0) moveMark[id][timestep] |= 1
          if (i === timesteps.length - 1) moveMark[id][timestep] |= 2
          if (!moveMark[id][timestep]) moveMark[id][timestep] = 4
        }
      }
    })
  }
  _changeStyleY(ctr, story, styleFlag, styleY) {
    const timesteps = story.getTimeSteps([ctr.timeSpan])
    if (timesteps.length <= 0) return
    const layout = story.getTable('layout')
    let avgY = 0,
      tot = 0
    ctr.names.forEach(name => {
      const id = story.getCharacterID(name)
      avgY += layout.value(id, timesteps[0])
      tot += 1
    })
    if (tot > 0) {
      avgY /= tot
      ctr.names.forEach(name => {
        const id = story.getCharacterID(name)
        const y = layout.value(id, timesteps[0])
        timesteps.forEach(timestep => {
          styleFlag[id][timestep] = y > avgY ? 1 : 0
          styleY[id][timestep] = avgY
        })
      })
    }
  }
}
