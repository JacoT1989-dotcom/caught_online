export type Region = 'cape-town' | 'johannesburg';

export interface RegionConfig {
  name: string;
  delivery: string;
  postalCodes: [number, number][];
}

export interface RegionStore {
  selectedRegion: Region | null;
  setRegion: (region: Region) => void;
  resetRegion: () => void;
}