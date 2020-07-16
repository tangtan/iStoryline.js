import { expect } from "chai";
import { Table } from "../src/js/data/table";

describe("Table.js", () => {
  let table, _table;

  describe("props", () => {
    beforeEach(() => {
      table = new Table(10);
    });
    it("props correct when a scalar table is constructed", () => {
      expect(table.rows).to.equal(1);
      expect(table.cols).to.equal(1);
      expect(table.type).to.equal("number");
    });
  });

  describe("methods", () => {
    describe("#resize()", () => {
      beforeEach(() => {
        table.resize(3, 3);
      });
      it("tables can be resized correctly", () => {
        expect(table.rows).to.equal(3);
        expect(table.cols).to.equal(3);
        expect(table.type).to.equal("matrix");
      });
    });

    describe("#replace()", () => {
      beforeEach(() => {
        table.replace(0, 0, 20);
        table.replace([1, 2], [1, 2], [[15, 15], [15, 15]]);
      });
      it("subtables can be replaced correctly", () => {
        expect(table.value(0, 0)).to.equal(20);
        expect(table.value(1, 1)).to.equal(15);
        expect(table.value(1, 2)).to.equal(15);
        expect(table.value(2, 1)).to.equal(15);
        expect(table.value(2, 2)).to.equal(15);
      });
    });

    describe("#addScalar()", () => {
      beforeEach(() => {
        table.addScalar(5);
      });
      it("tables can be added a scalar", () => {
        expect(table.value(0, 0)).to.equal(25);
        expect(table.value(1, 1)).to.equal(20);
        expect(table.value(1, 2)).to.equal(20);
        expect(table.value(2, 1)).to.equal(20);
        expect(table.value(2, 2)).to.equal(20);
      });
    });

    describe("#clone()", () => {
      beforeEach(() => {
        _table = table.clone();
        _table.resize(10, 10);
      });
      it("tables can be cloned successfully", () => {
        expect(table.value(0, 0)).to.equal(_table.value(0, 0));
        expect(table.value(1, 1)).to.equal(_table.value(1, 1));
        expect(table.value(2, 2)).to.equal(_table.value(2, 2));
        expect(table.mat).to.not.deep.equal(_table.mat);
        expect(_table.rows).to.equal(10);
        expect(_table.cols).to.equal(10);
      });
    });

    describe("#extend()", () => {
      beforeEach(() => {
        _table = table.subtable([0, 1], [1, 2]);
        _table.extend(1, [2, 2]);
        _table.extend(0, [2, 2]);
        _table.extend(0, [6, 6, 6, 6], true);
        _table.extend(9, [6, 6, 6, 6], true);
      });
      it("tables can be extended successfully", () => {
        expect(_table.rows).to.equal(4);
        expect(_table.cols).to.equal(10);
        expect(_table.value(0, 0)).to.equal(6);
        expect(_table.value(0, 1)).to.equal(2);
        expect(_table.value(0, 3)).to.equal(0);
        expect(_table.value(0, 9)).to.equal(6);
        expect(_table.value(1, 1)).to.equal(5);
        expect(_table.value(1, 2)).to.equal(5);
        expect(_table.value(2, 1)).to.equal(2);
        expect(_table.value(2, 2)).to.equal(2);
        expect(_table.value(3, 1)).to.equal(20);
        expect(_table.value(3, 2)).to.equal(20);
      });
    });
  });
});
