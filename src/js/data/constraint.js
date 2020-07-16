export class ConstraintStore {
  constructor() {
    this._constraints = [];
  }

  get constraints() {
    return this._constraints;
  }

  add(names, timeSpan, style, param) {
    this._constraints.push({
      names: names,
      timeSpan: timeSpan,
      style: style,
      param: param
    });
  }
}
