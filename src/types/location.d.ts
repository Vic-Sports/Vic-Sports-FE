// Types for Vietnam Provinces API v2
export interface IProvince {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  phone_code: number;
  wards: IWard[];
}

export interface IWard {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
}

// For backward compatibility - treating major wards as districts
export interface IDistrict {
  name: string;
  code: number;
  division_type: string;
  codename: string;
  province_code: number;
  wards: any[];
}

export interface ILocationOption {
  value: string | number;
  label: string;
}

export interface ILocationApiResponse {
  provinces: IProvince[];
  wards: IWard[];
}
