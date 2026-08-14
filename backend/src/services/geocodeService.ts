import axios from "axios";

export interface GeocodeCandidate {
  resolvedAddress: string;
  lng: number;
  lat: number;
}

interface GsiResponseItem {
  geometry: { coordinates: [number, number] };
  properties: { title: string };
}

const GSI_URL = "https://msearch.gsi.go.jp/address-search/AddressSearch";

export async function geocodeAddress(address: string): Promise<GeocodeCandidate[]> {
  const res = await axios.get<GsiResponseItem[]>(GSI_URL, {
    params: { q: address },
    timeout: 10_000,
  });

  return res.data.map((item) => ({
    resolvedAddress: item.properties.title,
    lng: item.geometry.coordinates[0],
    lat: item.geometry.coordinates[1],
  }));
}
