import { shauns } from './data/shauns';

export const getShaun = (id) => shauns.find((shaun) => shaun.id === id);

export const clusterCentre = (cluster) => {
  const clusterSeans = cluster.map((id) => getShaun(id));
  const lat = clusterSeans.reduce((sum, shaun) => sum + shaun.location.lat, 0) / clusterSeans.length;
  const lng = clusterSeans.reduce((sum, shaun) => sum + shaun.location.lng, 0) / clusterSeans.length;

  return { lat, lng };
};

export function computeTotalDistance(result) {
  let total = 0;
  const myroute = result.routes[0];

  if (!myroute) {
    return;
  }

  for (let i = 0; i < myroute.legs.length; i++) {
    total += myroute.legs[i].distance.value;
  }

  total = total / 1000;
  return total;
}
