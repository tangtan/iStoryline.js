import {locationSort} from "./locationSort";
import {greedySort} from "./greedySort";
import {orderModelError} from "../utils";

export function storyOrder(orderModule, data,  constraints) {
  switch (orderModule) {
    case "GreedyOrder": return greedySort(data,constraints.filter(ctrs=>ctrs.style==="Sort"));
    case "LocationOrder": return locationSort(data,constraints.filter(ctrs=>ctrs.style==="Sort"));
    default:
      orderModelError(orderModule);
  }
}