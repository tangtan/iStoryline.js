import {greedySlotCompact} from "./greedySlotCompact";
import {opCompact} from "./opCompact";
import {opSlotCompact} from "./opSlotCompact";
import {compactModelError} from "../utils";

export function storyCompact(compactModule, alignedSession, compactInfo, extendInfo, mergeInfo, splitInfo, inSep, outSep) {
  switch (compactModule) {
    case "GreedySlotCompact": return greedySlotCompact(alignedSession, compactInfo, extendInfo, mergeInfo, splitInfo, inSep, outSep);
    case "OpCompact": return opCompact(alignedSession, compactInfo, extendInfo, mergeInfo, splitInfo, inSep, outSep);
    case "OpSlotCompact": return opSlotCompact(alignedSession, compactInfo, extendInfo, mergeInfo, splitInfo, inSep, outSep);
    default:
      compactModelError(compactModule);
  }
}