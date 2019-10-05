import {locationSort} from "./locationSort";
import {greedySort} from "./greedySort";
import {orderModelError} from "../utils";

export function storyOrder(orderModule, data, orderInfo) {
  switch (orderModule) {
    case "GreedyOrder": return greedySort(data,orderInfo);
    case "LocationOrder": return locationSort(data,orderInfo);
    default:
      orderModelError(orderModule);
  }
}