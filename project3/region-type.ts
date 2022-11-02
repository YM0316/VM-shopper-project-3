

export class RegionType {
  label: string;
  title: string;
  value: string;
}
export class X_RegionType {
  label: string;
  value: string;
  items: {
    item_label: string;
    item_value: string;
    item_title: string;
  };
}



export class VMShopperQuery {
  preferedVendor: string;
  preferedRegion: string;
  vCPUs: number;
  ram: number;
  operatingSystem: string;
  gpu: number;
  topN: number;
}



export class CPUType {
  label: string;
  value: string;
  title: string;

}


