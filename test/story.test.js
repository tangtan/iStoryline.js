import { expect } from "chai";
import { Story } from "../src/js/data/story";

describe("Story.js", () => {
  let story;

  describe("props", () => {
    beforeEach(() => {
      story = new Story();
    });
    it("props correct when a story object is constructed", () => {
      const characterTable = story.getTable("character");
      const locationTable = story.getTable("location");
      const sessionTable = story.getTable("session");
      expect(characterTable.rows).to.equal(1);
      expect(locationTable.rows).to.equal(1);
      expect(sessionTable.rows).to.equal(1);
    });
  });

  describe("methods", () => {
    describe("#addCharacter", () => {
      beforeEach(() => {
        story.addCharacter("Test1", [[1, 10], [20, 30]]);
        const characterTable = story.getTable("character");
      });
      it("characters are appended successfully", () => {
        expect(story.characters.length).to.equal(1);
      });
    });
  });
});
