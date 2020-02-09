import { greedySlotCompact } from "./greedySlotCompact";
import { opCompact } from "./opCompact";
import { opSlotCompact } from "./opSlotCompact";
import { compactModelError } from "../utils";

export function storyCompact(compactModule, alignedSession, constraints) {
  const compressInfo = constraints.filter(ctr => ctr.style === "Compress");
  const expandInfo = constraints.filter(ctr => ctr.style === "Expand");
  const mergeInfo = constraints.filter(ctr => ctr.style === "Merge");
  const splitInfo = constraints.filter(ctr => ctr.style === "Split");
  const spaceInfo = constraints.filter(ctr => ctr.style === "Space");
  let compactFunc = greedySlotCompact;
  switch (compactModule) {
    case "GreedySlotCompact":
      compactFunc = greedySlotCompact;
      break;
    case "OpCompact":
      compactFunc = opCompact;
      break;
    case "OpSlotCompact":
      compactFunc = opSlotCompact;
      break;
    default:
      compactFunc = compactModelError;
  }
  const din = spaceInfo.length > 0 ? spaceInfo[0].param.intraSep : 1000;
  const dout = spaceInfo.length > 0 ? spaceInfo[0].param.interSep : 10;
  if (compactFunc === compactModelError) {
    return compactFunc(compactModule);
  }
  return compactFunc(
    alignedSession,
    compressInfo,
    expandInfo,
    mergeInfo,
    splitInfo,
    din,
    dout
  );
}
