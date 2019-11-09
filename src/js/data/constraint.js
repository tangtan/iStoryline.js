export class CtrInfo {
  constructor(ctrs) {
    this.ctrs = [] || ctrs;
  }

  get constraints() {
    return this.ctrs;
  }

  _removeConflicts(ctr) {}

  addCtr(ctr) {
    // TODO: remove conflicted time ranges
    this.ctrs.push(ctr);
  }

  updateCtr(ctr) {
    const oldCtr = this.ctrs.filter(_ctr => _ctr.style === ctr.style);
    if (oldCtr.length > 0) {
      oldCtr.param = ctr.param;
    } else {
      this.addCtr(ctr);
    }
  }

  addCtrs(ctrs) {
    ctrs.forEach(ctr => this.addCtr(ctr));
  }

  updateCtrs(ctrs) {
    // TODO
  }
}
