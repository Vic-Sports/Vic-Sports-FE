import type { IProvince, IDistrict, ILocationOption } from "@/types/location";

const API_BASE_URL = "https://provinces.open-api.vn/api/v2";

class LocationApiService {
  // Get all provinces
  async getProvinces(): Promise<IProvince[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: IProvince[] = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching provinces:", error);
      throw error;
    }
  }

  // Get wards by province code (API v2 approach - use major wards as districts)
  async getDistrictsByProvinceCode(provinceCode: number): Promise<IDistrict[]> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${provinceCode}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      // For API v2, we'll create a simplified list of major areas as "districts"
      // This is a workaround since API v2 doesn't have district level
      const majorAreas = this.createMajorAreasForProvince(provinceCode);

      return majorAreas;
    } catch (error) {
      console.error("Error fetching districts:", error);
      throw error;
    }
  }

  // Create major areas as districts for each province (simplified approach)
  private createMajorAreasForProvince(provinceCode: number): IDistrict[] {
    const majorAreasMap: Record<number, IDistrict[]> = {
      1: [
        // Hà Nội
        {
          name: "Quận Ba Đình",
          code: 1001,
          division_type: "quận",
          codename: "quan_ba_dinh",
          province_code: 1,
          wards: [],
        },
        {
          name: "Quận Hoàn Kiếm",
          code: 1002,
          division_type: "quận",
          codename: "quan_hoan_kiem",
          province_code: 1,
          wards: [],
        },
        {
          name: "Quận Tây Hồ",
          code: 1003,
          division_type: "quận",
          codename: "quan_tay_ho",
          province_code: 1,
          wards: [],
        },
        {
          name: "Quận Long Biên",
          code: 1004,
          division_type: "quận",
          codename: "quan_long_bien",
          province_code: 1,
          wards: [],
        },
        {
          name: "Quận Cầu Giấy",
          code: 1005,
          division_type: "quận",
          codename: "quan_cau_giay",
          province_code: 1,
          wards: [],
        },
        {
          name: "Quận Đống Đa",
          code: 1006,
          division_type: "quận",
          codename: "quan_dong_da",
          province_code: 1,
          wards: [],
        },
        {
          name: "Quận Hai Bà Trưng",
          code: 1007,
          division_type: "quận",
          codename: "quan_hai_ba_trung",
          province_code: 1,
          wards: [],
        },
        {
          name: "Quận Hoàng Mai",
          code: 1008,
          division_type: "quận",
          codename: "quan_hoang_mai",
          province_code: 1,
          wards: [],
        },
        {
          name: "Quận Thanh Xuân",
          code: 1009,
          division_type: "quận",
          codename: "quan_thanh_xuan",
          province_code: 1,
          wards: [],
        },
      ],
      79: [
        // TP.HCM
        {
          name: "Quận 1",
          code: 7901,
          division_type: "quận",
          codename: "quan_1",
          province_code: 79,
          wards: [],
        },
        {
          name: "Quận 2",
          code: 7902,
          division_type: "quận",
          codename: "quan_2",
          province_code: 79,
          wards: [],
        },
        {
          name: "Quận 3",
          code: 7903,
          division_type: "quận",
          codename: "quan_3",
          province_code: 79,
          wards: [],
        },
        {
          name: "Quận 4",
          code: 7904,
          division_type: "quận",
          codename: "quan_4",
          province_code: 79,
          wards: [],
        },
        {
          name: "Quận 5",
          code: 7905,
          division_type: "quận",
          codename: "quan_5",
          province_code: 79,
          wards: [],
        },
        {
          name: "Quận 7",
          code: 7907,
          division_type: "quận",
          codename: "quan_7",
          province_code: 79,
          wards: [],
        },
        {
          name: "Quận 10",
          code: 7910,
          division_type: "quận",
          codename: "quan_10",
          province_code: 79,
          wards: [],
        },
        {
          name: "Quận Bình Thạnh",
          code: 7911,
          division_type: "quận",
          codename: "quan_binh_thanh",
          province_code: 79,
          wards: [],
        },
        {
          name: "Quận Tân Bình",
          code: 7912,
          division_type: "quận",
          codename: "quan_tan_binh",
          province_code: 79,
          wards: [],
        },
        {
          name: "TP. Thủ Đức",
          code: 7913,
          division_type: "thành phố",
          codename: "tp_thu_duc",
          province_code: 79,
          wards: [],
        },
      ],
      48: [
        // Đà Nẵng
        {
          name: "Hải Châu",
          code: 4801,
          division_type: "quận",
          codename: "quan_hai_chau",
          province_code: 48,
          wards: [],
        },
        {
          name: "Ngũ Hành Sơn",
          code: 4802,
          division_type: "quận",
          codename: "quan_ngu_hanh_son",
          province_code: 48,
          wards: [],
        },
        {
          name: "Sơn Trà",
          code: 4803,
          division_type: "quận",
          codename: "quan_son_tra",
          province_code: 48,
          wards: [],
        },
        {
          name: "Thanh Khê",
          code: 4804,
          division_type: "quận",
          codename: "quan_thanh_khe",
          province_code: 48,
          wards: [],
        },
        {
          name: "Quận Liên Chiểu",
          code: 4805,
          division_type: "quận",
          codename: "quan_lien_chieu",
          province_code: 48,
          wards: [],
        },
        {
          name: "Quận Cẩm Lệ",
          code: 4806,
          division_type: "quận",
          codename: "quan_cam_le",
          province_code: 48,
          wards: [],
        },
      ],
      31: [
        // Hải Phòng
        {
          name: "Quận Hồng Bàng",
          code: 3101,
          division_type: "quận",
          codename: "quan_hong_bang",
          province_code: 31,
          wards: [],
        },
        {
          name: "Quận Ngô Quyền",
          code: 3102,
          division_type: "quận",
          codename: "quan_ngo_quyen",
          province_code: 31,
          wards: [],
        },
        {
          name: "Quận Lê Chân",
          code: 3103,
          division_type: "quận",
          codename: "quan_le_chan",
          province_code: 31,
          wards: [],
        },
        {
          name: "Quận Hải An",
          code: 3104,
          division_type: "quận",
          codename: "quan_hai_an",
          province_code: 31,
          wards: [],
        },
        {
          name: "Quận Kiến An",
          code: 3105,
          division_type: "quận",
          codename: "quan_kien_an",
          province_code: 31,
          wards: [],
        },
        {
          name: "Quận Đồ Sơn",
          code: 3106,
          division_type: "quận",
          codename: "quan_do_son",
          province_code: 31,
          wards: [],
        },
      ],
      92: [
        // Cần Thơ
        {
          name: "Quận Ninh Kiều",
          code: 9201,
          division_type: "quận",
          codename: "quan_ninh_kieu",
          province_code: 92,
          wards: [],
        },
        {
          name: "Quận Ô Môn",
          code: 9202,
          division_type: "quận",
          codename: "quan_o_mon",
          province_code: 92,
          wards: [],
        },
        {
          name: "Quận Bình Thủy",
          code: 9203,
          division_type: "quận",
          codename: "quan_binh_thuy",
          province_code: 92,
          wards: [],
        },
        {
          name: "Quận Cái Răng",
          code: 9204,
          division_type: "quận",
          codename: "quan_cai_rang",
          province_code: 92,
          wards: [],
        },
        {
          name: "Quận Thốt Nốt",
          code: 9205,
          division_type: "quận",
          codename: "quan_thot_not",
          province_code: 92,
          wards: [],
        },
      ],
      56: [
        // Khánh Hòa (Nha Trang)
        {
          name: "TP. Nha Trang",
          code: 5601,
          division_type: "thành phố",
          codename: "tp_nha_trang",
          province_code: 56,
          wards: [],
        },
        {
          name: "TP. Cam Ranh",
          code: 5602,
          division_type: "thành phố",
          codename: "tp_cam_ranh",
          province_code: 56,
          wards: [],
        },
        {
          name: "Huyện Cam Lâm",
          code: 5603,
          division_type: "huyện",
          codename: "huyen_cam_lam",
          province_code: 56,
          wards: [],
        },
        {
          name: "Huyện Vạn Ninh",
          code: 5604,
          division_type: "huyện",
          codename: "huyen_van_ninh",
          province_code: 56,
          wards: [],
        },
        {
          name: "Huyện Ninh Hòa",
          code: 5605,
          division_type: "huyện",
          codename: "huyen_ninh_hoa",
          province_code: 56,
          wards: [],
        },
      ],
      // Add more provinces with their major districts/areas
      46: [
        // Huế
        {
          name: "TP. Huế",
          code: 4601,
          division_type: "thành phố",
          codename: "tp_hue",
          province_code: 46,
          wards: [],
        },
        {
          name: "Huyện Phong Điền",
          code: 4602,
          division_type: "huyện",
          codename: "huyen_phong_dien",
          province_code: 46,
          wards: [],
        },
        {
          name: "Huyện Quảng Điền",
          code: 4603,
          division_type: "huyện",
          codename: "huyen_quang_dien",
          province_code: 46,
          wards: [],
        },
        {
          name: "Huyện Phú Vang",
          code: 4604,
          division_type: "huyện",
          codename: "huyen_phu_vang",
          province_code: 46,
          wards: [],
        },
      ],
      74: [
        // Bình Dương
        {
          name: "TP. Thủ Dầu Một",
          code: 7401,
          division_type: "thành phố",
          codename: "tp_thu_dau_mot",
          province_code: 74,
          wards: [],
        },
        {
          name: "TP. Dĩ An",
          code: 7402,
          division_type: "thành phố",
          codename: "tp_di_an",
          province_code: 74,
          wards: [],
        },
        {
          name: "TP. Thuận An",
          code: 7403,
          division_type: "thành phố",
          codename: "tp_thuan_an",
          province_code: 74,
          wards: [],
        },
        {
          name: "TP. Tân Uyên",
          code: 7404,
          division_type: "thành phố",
          codename: "tp_tan_uyen",
          province_code: 74,
          wards: [],
        },
        {
          name: "Huyện Bắc Tân Uyên",
          code: 7405,
          division_type: "huyện",
          codename: "huyen_bac_tan_uyen",
          province_code: 74,
          wards: [],
        },
      ],
      75: [
        // Đồng Nai
        {
          name: "TP. Biên Hòa",
          code: 7501,
          division_type: "thành phố",
          codename: "tp_bien_hoa",
          province_code: 75,
          wards: [],
        },
        {
          name: "TP. Long Khánh",
          code: 7502,
          division_type: "thành phố",
          codename: "tp_long_khanh",
          province_code: 75,
          wards: [],
        },
        {
          name: "Huyện Nhơn Trạch",
          code: 7503,
          division_type: "huyện",
          codename: "huyen_nhon_trach",
          province_code: 75,
          wards: [],
        },
        {
          name: "Huyện Trảng Bom",
          code: 7504,
          division_type: "huyện",
          codename: "huyen_trang_bom",
          province_code: 75,
          wards: [],
        },
        {
          name: "Huyện Vĩnh Cửu",
          code: 7505,
          division_type: "huyện",
          codename: "huyen_vinh_cuu",
          province_code: 75,
          wards: [],
        },
      ],
      77: [
        // Bà Rịa - Vũng Tàu
        {
          name: "TP. Vũng Tàu",
          code: 7701,
          division_type: "thành phố",
          codename: "tp_vung_tau",
          province_code: 77,
          wards: [],
        },
        {
          name: "TP. Bà Rịa",
          code: 7702,
          division_type: "thành phố",
          codename: "tp_ba_ria",
          province_code: 77,
          wards: [],
        },
        {
          name: "Huyện Châu Đức",
          code: 7703,
          division_type: "huyện",
          codename: "huyen_chau_duc",
          province_code: 77,
          wards: [],
        },
        {
          name: "Huyện Xuyên Mộc",
          code: 7704,
          division_type: "huyện",
          codename: "huyen_xuyen_moc",
          province_code: 77,
          wards: [],
        },
        {
          name: "Huyện Long Điền",
          code: 7705,
          division_type: "huyện",
          codename: "huyen_long_dien",
          province_code: 77,
          wards: [],
        },
      ],
    };

    return majorAreasMap[provinceCode] || [];
  }

  // Convert provinces to options for Select component
  convertProvincesToOptions(provinces: IProvince[]): ILocationOption[] {
    return provinces
      .map((province) => ({
        value: province.code,
        label: this.getProvinceDisplayName(province.name),
      }))
      .sort((a, b) => {
        // Sort major cities first, then alphabetically
        const majorProvinceCodes = [79, 1, 48, 31, 92, 56]; // HCM, HN, DN, HP, CT, KH
        const aIsMajor = majorProvinceCodes.includes(a.value as number);
        const bIsMajor = majorProvinceCodes.includes(b.value as number);

        if (aIsMajor && !bIsMajor) return -1;
        if (!aIsMajor && bIsMajor) return 1;

        if (aIsMajor && bIsMajor) {
          // Sort major cities by priority
          const aIndex = majorProvinceCodes.indexOf(a.value as number);
          const bIndex = majorProvinceCodes.indexOf(b.value as number);
          return aIndex - bIndex;
        }

        // Sort non-major alphabetically
        return a.label.localeCompare(b.label, "vi");
      });
  }

  // Convert districts to options for Select component
  convertDistrictsToOptions(districts: IDistrict[]): ILocationOption[] {
    return districts.map((district) => ({
      value: district.code,
      label: district.name,
    }));
  }

  // Get display name for province
  private getProvinceDisplayName(name: string): string {
    const iconMap: Record<string, string> = {
      // Major cities
      "Hồ Chí Minh": "🏙️",
      "Hà Nội": "🏛️",
      "Đà Nẵng": "🌊",
      "Hải Phòng": "⚓",
      "Cần Thơ": "🌾",
      "Khánh Hòa": "🏖️",
      Huế: "👑",

      // Northern provinces
      "Hà Giang": "🏔️",
      "Cao Bằng": "🏔️",
      "Bắc Kạn": "🏔️",
      "Tuyên Quang": "🏞️",
      "Lào Cai": "🏔️",
      "Điện Biên": "🏔️",
      "Lai Châu": "🏔️",
      "Sơn La": "🏔️",
      "Yên Bái": "🏞️",
      "Hoà Bình": "🏞️",
      "Thái Nguyên": "⛰️",
      "Lạng Sơn": "🏔️",
      "Quảng Ninh": "🌊",
      "Bắc Giang": "🌾",
      "Phú Thọ": "🏛️",
      "Vĩnh Phúc": "🌾",
      "Bắc Ninh": "🏭",
      "Hải Dương": "🌾",
      "Hưng Yên": "🌾",
      "Thái Bình": "🌾",
      "Hà Nam": "🌾",
      "Nam Định": "🌾",
      "Ninh Bình": "🏛️",

      // Central provinces
      "Thanh Hóa": "🌾",
      "Nghệ An": "🏞️",
      "Hà Tĩnh": "⛰️",
      "Quảng Bình": "🏞️",
      "Quảng Trị": "🏛️",
      "Quảng Nam": "🏛️",
      "Quảng Ngãi": "🌊",
      "Bình Định": "🌊",
      "Phú Yên": "🌊",
      "Ninh Thuận": "🏖️",
      "Bình Thuận": "🏖️",

      // Highland provinces
      "Kon Tum": "🏔️",
      "Gia Lai": "☕",
      "Đắk Lắk": "☕",
      "Đắk Nông": "☕",
      "Lâm Đồng": "🌲",

      // Southern provinces
      "Bình Phước": "🌲",
      "Tây Ninh": "🏛️",
      "Bình Dương": "🏭",
      "Đồng Nai": "🏭",
      "Bà Rịa": "⛽",
      "Long An": "🌾",
      "Tiền Giang": "🌾",
      "Bến Tre": "🥥",
      "Trà Vinh": "🌾",
      "Vĩnh Long": "🌾",
      "Đồng Tháp": "🌾",
      "An Giang": "🌾",
      "Kiên Giang": "🐟",
      "Hậu Giang": "🌾",
      "Sóc Trăng": "🌾",
      "Bạc Liêu": "🐟",
      "Cà Mau": "🐟",
    };

    // Extract city name
    let cityName = name;
    if (name.includes("Thành phố ")) {
      cityName = name.replace("Thành phố ", "");
    } else if (name.includes("Tỉnh ")) {
      cityName = name.replace("Tỉnh ", "");
    }

    // Find icon
    const icon = Object.keys(iconMap).find((key) => cityName.includes(key));
    const displayIcon = icon ? iconMap[icon] : "📍";

    return `${displayIcon} ${cityName}`;
  }

  // Search provinces by name
  async searchProvinces(query: string): Promise<IProvince[]> {
    try {
      const provinces = await this.getProvinces();
      return provinces.filter((province) =>
        province.name.toLowerCase().includes(query.toLowerCase())
      );
    } catch (error) {
      console.error("Error searching provinces:", error);
      throw error;
    }
  }

  // Get province by code
  async getProvinceByCode(code: number): Promise<IProvince | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/p/${code}?depth=0`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: IProvince = await response.json();
      return data;
    } catch (error) {
      console.error("Error fetching province:", error);
      return null;
    }
  }
}

export const locationApiService = new LocationApiService();
export default locationApiService;
