import {greedyAlign} from "./greedyAlign";
import {alignModelError} from "../utils";

export function storyAlign(alignModule, sequence, bendInfo, straightenInfo) {
  switch (alignModule) {
    case "GreedyAlign": return greedyAlign(alignModule, sequence, bendInfo, straightenInfo);
    default:
      alignModelError(alignModule);
}
}