import { Story } from "../../src/js/data/story";
import { greedySort } from "../../src/js/order/greedySort";

const fileUrl = "../../data/json/Redcap.json";

let story = new Story();

story.load(fileUrl, "json");

greedySort(story, []);
