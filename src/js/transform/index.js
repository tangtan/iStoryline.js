import { freeTransform } from "./freeTransform";
import { circleTransform } from "./circleTransform";
import { transformModelError } from "../utils";

export function storyTransform(transformModule, renderedGraph, constraints) {
  const reshapeInfo = constraints.filter(ctr => ctr.style === "Reshape");
  let transformFunc = freeTransform;
  switch (transformModule) {
    case "CircleTransform":
      transformFunc = circleTransform;
      let R = reshapeInfo.length > 0 ? reshapeInfo[0].param.Radius : 200;
      let r = reshapeInfo.length > 0 ? reshapeInfo[0].param.radius : 100;
      let range = reshapeInfo.length > 0 ? reshapeInfo[0].param.range : 2.16;
      return transformFunc(renderedGraph, R, r, range);
    case "FreeTransform":
      let upperPath =
        reshapeInfo.length > 0 ? reshapeInfo[0].param.upperPath : [];
      let lowerPath =
        reshapeInfo.length > 0 ? reshapeInfo[0].param.lowerPath : [];
      return transformFunc(renderedGraph, upperPath, lowerPath);
    default:
      transformModelError(transformModule);
  }
}
