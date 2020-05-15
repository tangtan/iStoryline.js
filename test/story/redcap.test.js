import { expect } from "chai";
import { Story } from "../../src/js/data/story";

describe("Redcap.xml", () => {
  let story;

  describe("props", () => {
    beforeEach(() => {
      story = new Story();
    });
    it("props correct when a story is constructed", async () => {
      await story.load("../../data/Redcap.xml");
      console.log(story);
      let sessionTable = story.getTable("timeTable");
      expect(sessionTable.rows).to.equal(3);
      expect(story.characters.length).to.equal(4);
    });
  });
});
