import { greedySlotCompact } from "./greedySlotCompact";
import { opCompact } from "./opCompact";
import { opSlotCompact } from "./opSlotCompact";
import { compactModelError } from "../utils";

export function storyCompact(
  compactModule,
  alignedSession,
  constraints,
  inSep,
  outSep
) {
  switch (compactModule) {
    case "GreedySlotCompact":
      return greedySlotCompact(
        alignedSession,
        constraints.filter(ctrs => ctrs.style === "Compact"),
        constraints.filter(ctrs => ctrs.style === "Expand"),
        constraints.filter(ctrs => ctrs.style === "Merge"),
        constraints.filter(ctrs => ctrs.style === "Split"),
        inSep,
        outSep
      );
    case "OpCompact":
      return opCompact(
        alignedSession,
        constraints.filter(ctrs => ctrs.style === "Compact"),
        constraints.filter(ctrs => ctrs.style === "Expand"),
        constraints.filter(ctrs => ctrs.style === "Merge"),
        constraints.filter(ctrs => ctrs.style === "Split"),
        inSep,
        outSep
      );
    case "OpSlotCompact":
      return opSlotCompact(
        alignedSession,
        constraints.filter(ctrs => ctrs.style === "Compact"),
        constraints.filter(ctrs => ctrs.style === "Expand"),
        constraints.filter(ctrs => ctrs.style === "Merge"),
        constraints.filter(ctrs => ctrs.style === "Split"),
        inSep,
        outSep
      );
    default:
      compactModelError(compactModule);
  }
}
