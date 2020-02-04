import { greedyAlign } from "./greedyAlign";
import { alignModelError } from "../utils";

export function storyAlign(alignModule, sequence, constraints) {
  switch (alignModule) {
    case "GreedyAlign":
      return greedyAlign(
        sequence,
        constraints.filter(ctrs => ctrs.style === "Straighten"),
        constraints.filter(ctrs => ctrs.style === "Bend")
      );
    default:
      alignModelError(alignModule);
  }
}
