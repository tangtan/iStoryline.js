import { render } from "./render";
import { renderModelError } from "../utils"
export function storyRender(renderModule, initialGraph, constraints) {
  switch (renderModule) {
    case "Render":
      return render(
        initialGraph,
        constraints.filter(ctrs => ctrs.styles === 'Adjust'),
        constraints.filter(ctrs => ctrs.styles === 'Twine' || ctrs.styles === 'Knot' || ctrs.styles === 'Collide'),
        constraints.filter(ctrs => ctrs.styles === 'Width' || ctrs.styles === 'Color' || ctrs.styles === 'Dash' || ctrs.styles === 'Zigzag' || ctrs.styles === 'Wave' || ctrs.styles === 'Bump')
      );
    default:
      renderModelError(renderModule);
  }
}