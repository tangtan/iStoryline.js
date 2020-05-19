import { Story } from "../../src/js/data/story";

const fileUrl = "../../data/Redcap.xml";

let story = new Story();

story.load(fileUrl, "xml");

console.log(story.characters);
