declare global {
  interface Window {
    _dcq: any[];
    _dcs: {
      account?: string;
    };
  }
}