export class Constraint {
  constructor() {
    this.names = []
    this.timeSpan = []
  }
}

export class Info {
  constructor(constraints) {
    this.constraints = constraints
  }

  _checkParams(nameLimit=-1, timeLimit=2, styleLimit=-1) {}

  _removeConflicts() {}
}