import { greedyAlign } from "./greedyAlign";
import { alignModelError } from "../utils";
import { locationAlign } from "./locationAlign";

export function storyAlign(alignModule, sequence, constraints) {
  switch (alignModule) {
    case "GreedyAlign":
      return greedyAlign(
        sequence,
        constraints.filter(ctrs => ctrs.style === "Straighten"),
        constraints.filter(ctrs => ctrs.style === "Bend")
      );
    case "LocationAlign":
      return locationAlign(sequence);
    default:
      alignModelError(alignModule);
  }
}
