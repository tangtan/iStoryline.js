import { renderModelError } from "../utils";
import { smoothRender } from "./smoothRender";
import { sketchRender } from "./sketchRender";
export function storyRender(renderModule, initialGraph, constraints) {
  switch (renderModule) {
    case "SmoothRender":
      return smoothRender(
        initialGraph,
        constraints.filter(ctrs => ctrs.styles === 'Adjust'),
        constraints.filter(ctrs => ctrs.styles === 'Twine' || ctrs.styles === 'Knot' || ctrs.styles === 'Collide'),
        constraints.filter(ctrs => ctrs.styles === 'Width' || ctrs.styles === 'Color' || ctrs.styles === 'Dash' || ctrs.styles === 'Zigzag' || ctrs.styles === 'Wave' || ctrs.styles === 'Bump')
      );
    case "SketchRender":
      return sketchRender(
        initialGraph,
        constraints.filter(ctrs => ctrs.styles === 'Adjust'),
        constraints.filter(ctrs => ctrs.styles === 'Twine' || ctrs.styles === 'Knot' || ctrs.styles === 'Collide'),
        constraints.filter(ctrs => ctrs.styles === 'Width' || ctrs.styles === 'Color' || ctrs.styles === 'Dash' || ctrs.styles === 'Zigzag' || ctrs.styles === 'Wave' || ctrs.styles === 'Bump')
      );
    default:
      renderModelError(renderModule);
  }
}