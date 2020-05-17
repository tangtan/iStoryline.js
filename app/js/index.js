import Story from "../../src/js/index";

async function main() {
  let a = new Story();
  await a.load("../../data/busan.xml", "xml");
  await a.dump("11", "json");
}

main();
