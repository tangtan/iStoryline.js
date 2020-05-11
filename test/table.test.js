import { Table } from "../src/js/data/table";

/**
 * Unit test for Table.js
 */
export function testTableUnit() {
  //#example1
  const data1 = 10;
  const table1 = new Table(data1);
  // resize
  table1.resize(3, 3);
  // replace
  table1.replace(1, 1, 20);
  // addScalar
  table1.addScalar(5);
  // subtable
  console.log(table1);
  const subtable1 = table1.subtable([1, 2], [0, 1]);
  subtable1.extend(1, [2, 2]);
  subtable1.extend(2, [2, 2]);
  subtable1.extend(0, [2, 2]);
  subtable1.extend(10, [2, 2]);
  console.log(subtable1);
  const subsubtable1 = subtable1.subtable(0, 1);
  subsubtable1.extend(0, [5, 5, 5, 5], true);
  subsubtable1.extend(1, [5, 5, 5, 5], true);
  console.log(subsubtable1);
  //#example1
}
