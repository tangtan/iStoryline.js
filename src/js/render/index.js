import { renderModelError } from "../utils";
import { smoothRender } from "./smoothRender";
import { sketchRender } from "./sketchRender";

export function storyRender(renderModule, initialGraph, constraints) {
  const adjustInfo = constraints.filter(ctr => ctr.style === "Adjust");
  const relateInfo = constraints.filter(
    ctr =>
      ctr.style === "Twine" || ctr.style === "Knot" || ctr.style === "Collide"
  );
  const stylishInfo = constraints.filter(
    ctr =>
      ctr.style === "Width" ||
      ctr.style === "Color" ||
      ctr.style === "Dash" ||
      ctr.style === "Zigzag" ||
      ctr.style === "Wave" ||
      ctr.style === "Bump"
  );
  const scaleInfo = constraints.filter(ctr => ctr.style === "Scale");
  let renderFunc = smoothRender;
  switch (renderModule) {
    case "SmoothRender":
      renderFunc = smoothRender;
      break;
    case "SketchRender":
      renderFunc = sketchRender;
      break;
    default:
      renderModelError(renderModule);
  }
  return renderFunc(
    initialGraph,
    adjustInfo,
    relateInfo,
    stylishInfo,
    scaleInfo
  );
}
