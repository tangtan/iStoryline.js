export class CtrInfo {
  constructor(ctrs) {
    this.ctrs = ctrs | [];
  }

  get constraints() {
    return this.ctrs;
  }

  _removeConflicts(ctr) {}

  addCtr(ctr) {
    // TODO: remove conflicted time ranges
    this.ctrs.push(ctr);
  }

  addCtrs(ctrs) {
    ctrs.forEach(ctr => this.addCtr(ctr));
  }
}