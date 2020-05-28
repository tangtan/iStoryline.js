import { create, all } from "mathjs";

const math = create(all, {});

export class Table {
  /**
   * Table for Generators
   * @param {null | Number | Array | DenseMatrix} param
   */
  constructor(data) {
    console.log(1);
    if (data) {
      if (data.length) {
        this._mat = math.matrix(data);
      } else {
        this._mat = data;
      }
    } else {
      this._mat = null;
    }
  }

  get mat() {
    return this._mat;
  }

  get rows() {
    return this._mat ? (this._mat.type ? this._mat.size()[0] : 1) : 0;
  }

  get cols() {
    return this._mat ? (this._mat.type ? this._mat.size()[1] : 1) : 0;
  }

  get type() {
    return this._mat ? (this._mat.type ? "matrix" : typeof this._mat) : null;
  }

  /**
   * Obtain the value at (row, col).
   * @param {Number} row
   * @param {Number} col
   */
  value(row, col) {
    return this.type === "matrix"
      ? this._mat.subset(math.index(row, col))
      : this._mat;
  }

  /**
   * Obtain a independent copy of the table.
   */
  clone() {
    const data = this.type === "matrix" ? math.clone(this.mat) : this.mat;
    return new Table(data);
  }

  /**
   * Translate the input range into a valid range.
   * @param {Number | Array | DenseMatrix} rowRange
   * @param {Number | Array | DenseMatrix} colRange
   */
  _translateRange(rowRange, colRange) {
    let _rowRange = rowRange;
    if (rowRange.length && rowRange.length === 0) {
      _rowRange = 0;
    }
    if (rowRange.type && rowRange.size()[0] === 0) {
      _rowRange = 0;
    }
    let _colRange = colRange;
    if (colRange.length && colRange.length === 0) {
      _colRange = 0;
    }
    if (colRange.type && colRange.size()[0] === 0) {
      _colRange = 0;
    }
    return [_rowRange, _colRange];
  }

  /**
   * Obtain the sub-table within [rowRange, colRange].
   * @param {Number | Array | DenseMatrix} rowRange
   * @param {Number | Array | DenseMatrix} colRange
   */
  subtable(rowRange, colRange) {
    if (this._mat === null) return null;
    const [_rowRange, _colRange] = this._translateRange(rowRange, colRange);
    const range = math.index(_rowRange, _colRange);
    const submat = this._mat.subset(range);
    return new Table(submat);
  }

  /**
   * Resize the table to (rows, cols).
   * @param {Number} rows
   * @param {Number} cols
   */
  resize(rows, cols, val = 0) {
    if (this.type === "matrix") {
      this._mat.resize([rows, cols]);
    } else {
      const _zeroMat = math.zeros(rows, cols);
      const _mat = math.add(_zeroMat, val);
      if (this._mat) {
        _mat.subset(math.index(0, 0), this.mat);
      }
      this._mat = _mat;
    }
  }

  /**
   * Replace one row or one column of values.
   * @param {Number | Array | DenseMatrix} rowRange
   * @param {Number | Array | DenseMatrix} colRange
   * @param {Number | Array | DenseMatrix} mat
   */
  replace(rowRange, colRange, mat) {
    if (this._mat === null) return null;
    const [_rowRange, _colRange] = this._translateRange(rowRange, colRange);
    const range = math.index(_rowRange, _colRange);
    this._mat.subset(range, mat);
  }

  /**
   *
   * @param {Number} index
   * @param {Array} arr
   * @param {Boolean} isColumn
   */
  extend(index, arr, isColumn = false) {
    // A scalar or null must be resized before beding extended.
    console.log(this._mat, this.type);
    if (this._mat === null || this.type === "number") {
      const rows = isColumn ? arr.length : 1;
      const cols = isColumn ? 1 : arr.length;
      console.log(rows, cols, this._mat);
      this.resize(rows, cols, this._mat || 0);
    }
    let _zeroTable;
    if (isColumn) {
      const rowRange = math.range(0, this.rows);
      if (index < this.cols) {
        _zeroTable = new Table(math.zeros(this.rows, this.cols + 1));
        const headRange = index === 0 ? 0 : math.range(0, index);
        const headTable = this.subtable(rowRange, headRange);
        const tailRange = math.range(index + 1, this.cols + 1);
        const tailTable = this.subtable(rowRange, math.range(index, this.cols));
        if (index > 0) _zeroTable.replace(rowRange, headRange, headTable.mat);
        if (index < this.cols)
          _zeroTable.replace(rowRange, tailRange, tailTable.mat);
      } else {
        _zeroTable = new Table(math.zeros(this.rows, index + 1));
        const colRange = math.range(0, this.cols);
        _zeroTable.replace(rowRange, colRange, this.mat);
      }
      _zeroTable.replace(rowRange, index, arr);
      this._mat = _zeroTable._mat;
    } else {
      const colRange = math.range(0, this.cols);
      if (index < this.rows) {
        _zeroTable = new Table(math.zeros(this.rows + 1, this.cols));
        const headRange = index === 0 ? 0 : math.range(0, index);
        const headTable = this.subtable(headRange, colRange);
        const tailRange = math.range(index + 1, this.rows + 1);
        const tailTable = this.subtable(math.range(index, this.rows), colRange);
        if (index > 0) _zeroTable.replace(headRange, colRange, headTable.mat);
        if (index < this.rows)
          _zeroTable.replace(tailRange, colRange, tailTable.mat);
      } else {
        _zeroTable = new Table(math.zeros(index + 1, this.cols));
        const rowRange = math.range(0, this.rows);
        _zeroTable.replace(rowRange, colRange, this.mat);
      }
      _zeroTable.replace(index, colRange, arr);
      this._mat = _zeroTable._mat;
    }
  }

  addScalar(val) {
    if (this._mat === null) return null;
    if (this.type === "matrix") {
      this._mat = math.add(this.mat, val);
    } else {
      this._mat += val;
    }
  }
}
