import { Story } from "../../src/js/data/story";
import { Table } from "../../src/js/data/table";

const fileUrl = "../../data/Redcap.xml";

// const table = new Table();

// console.log(table, table.rows, table.cols, table.type);

let story = new Story();

// story.load(fileUrl, "xml");
story.addCharacter("Test1", [[1, 10]]);

console.log(story.characters);
