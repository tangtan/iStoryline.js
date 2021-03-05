export class ConstraintStore {
  constructor() {
    this._constraints = []
    // Default scale constraint
    this.add([], [], 'Scale', {
      x0: 100,
      y0: 100,
      width: 1700,
      height: 400,
      reserveRatio: false,
    })
  }

  get constraints() {
    return this._constraints
  }

  add(names, timeSpan, style, param) {
    this._constraints.push({
      names: names,
      timeSpan: timeSpan,
      style: style,
      param: param,
    })
  }
}
