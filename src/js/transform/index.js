import { freeTransform } from "./freeTransform";
import { circleTransform } from "./circleTransform";
import { transformModelError } from "../utils";

export function storyTransform(transformModule, renderedGraph, constraints) {
  const reshapeInfo = constraints.filter(ctr => ctr.style === "Reshape");
  let transformFunc = freeTransform;
  switch (transformModule) {
    case "CircleTransform":
      transformFunc = circleTransform;
      break;
    case "FreeTransform":
      transformFunc = freeTransform;
      break;
    default:
      transformModelError(transformModule);
  }
  let upperPath = reshapeInfo.length > 0 ? reshapeInfo[0].param.upperPath : [];
  let lowerPath = reshapeInfo.length > 0 ? reshapeInfo[0].param.lowerPath : [];
  return transformFunc(renderedGraph, upperPath, lowerPath);
}
