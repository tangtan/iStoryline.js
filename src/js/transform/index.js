import { freeTransform } from "./freeTransform";
import { circleTransform } from "./circleTransform";
import { transformModelError } from "../utils";

export function storyTransform(
  transformModule,
  renderedGraph,
  upperPath,
  lowerPath) {
  switch (transformModule) {
    case "CircleTransform": return circleTransform();
    case "FreeTransform": return freeTransform(renderedGraph);
    default:
      transformModelError(transformModule);
  }
}