import { Story } from "../../src/js/data/story";

const fileUrl = "../../data/json/JurassicPark.json";

async function main() {
  let story = new Story();
  // await story.load(fileUrl, "json");
  story.addCharacter("TT", [[1, 10]]);
  story.addCharacter("TT2", [[1, 5], [7, 22]]);
  story.addCharacter("TT3", [[7, 30], [65, 80]]);
  // story.deleteCharacter('TT3')
  story.changeCharacter("TT3", [[1, 5], [7, 22]]);
  const rows = story.getTableRows();
  const cols = story.getTableCols();
  const timeStamps = story.timeline;
  const charaTable = story.getTable("character");
  const locationTable = story.getTable("location");
  const sessionTable = story.getTable("session");
  story.changeSession(10, [0, 1], [3, 9], false);
  console.log(story);
  console.log(`Story Size: ${rows}x${cols}`);
  console.log(`Story Timeline: ${timeStamps}`);
  console.log(
    `Character Table ${charaTable.rows}x${charaTable.cols}: ${charaTable.mat}`
  );
  console.log(
    `Location Table ${locationTable.rows}x${locationTable.cols}: ${locationTable.mat}`
  );
  console.log(
    `Session Table ${sessionTable.rows}x${sessionTable.cols}: ${sessionTable.mat}`
  );
  // story.dump('test', 'xml')
}

main();
