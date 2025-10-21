import { useState, useEffect } from "react";
import { Button, message } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { useTranslation } from "react-i18next";
import type { IVenueFilterParams } from "@/types/venue";
import type { ILocationOption } from "@/types/location";
import { locationApiService } from "@/services/locationApi";
import CustomSelect from "@/components/client/community/CustomSelect";
import { FaFutbol, FaMapMarkerAlt, FaCity } from "react-icons/fa";
import "./SearchFilter.scss";

interface SearchFilterProps {
  onSearch: (params: IVenueFilterParams) => void;
  loading?: boolean;
}

interface SearchFormData {
  sportType?: string;
  cityCode?: number;
  districtCode?: number;
}

const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  loading = false,
}) => {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<SearchFormData>({});
  const [cityOptions, setCityOptions] = useState<ILocationOption[]>([]);
  const [districtOptions, setDistrictOptions] = useState<ILocationOption[]>([]);
  const [loadingCities, setLoadingCities] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load cities on component mount
  useEffect(() => {
    const loadCities = async () => {
      setLoadingCities(true);
      try {
        const provinces = await locationApiService.getProvinces();
        const options = locationApiService.convertProvincesToOptions(provinces);
        setCityOptions(options);
      } catch (error) {
        console.error("Failed to load cities:", error);
        message.error(t("search.filter.error_load_cities"));
      } finally {
        setLoadingCities(false);
      }
    };

    loadCities();
  }, [t]);

  // Load districts when city changes
  useEffect(() => {
    const loadDistricts = async () => {
      if (!formData.cityCode) {
        setDistrictOptions([]);
        return;
      }

      setLoadingDistricts(true);
      try {
        const districts = await locationApiService.getDistrictsByProvinceCode(
          formData.cityCode
        );
        const options = locationApiService.convertDistrictsToOptions(districts);
        setDistrictOptions(options);

        // Reset district when city changes
        setFormData((prev) => ({
          ...prev,
          districtCode: undefined,
        }));
      } catch (error) {
        console.error("Failed to load districts:", error);
        message.error(t("search.filter.error_load_districts"));
        setDistrictOptions([]);
      } finally {
        setLoadingDistricts(false);
      }
    };

    loadDistricts();
  }, [formData.cityCode, t]);

  // Map Vietnamese sport types to Backend format
  const mapSportTypeToBackend = (vietnameseSport: string): string => {
    const sportMapping: Record<string, string> = {
      "bóng đá": "football",
      "cầu lông": "badminton",
      tennis: "tennis",
      "bóng rổ": "basketball",
      "bóng chuyền": "volleyball",
      pickleball: "pickleball",
    };

    return sportMapping[vietnameseSport] || vietnameseSport;
  };

  const handleSearch = () => {
    // Get selected city and district names for search
    let searchLocation = "";

    if (formData.cityCode) {
      const selectedCity = cityOptions.find(
        (option) => option.value === formData.cityCode
      );
      if (selectedCity) {
        // Extract city name without icon
        const cityName = selectedCity.label.replace(/^[^\s]+\s/, "");
        searchLocation = cityName;
      }
    }

    if (formData.districtCode) {
      const selectedDistrict = districtOptions.find(
        (option) => option.value === formData.districtCode
      );
      if (selectedDistrict) {
        searchLocation = selectedDistrict.label;
      }
    }

    // Search for venues only
    const venueParams: IVenueFilterParams = {
      sportType: formData.sportType
        ? mapSportTypeToBackend(formData.sportType)
        : undefined,
      location: searchLocation || undefined,
      sortBy: "rating",
      sortOrder: "desc",
      page: 1,
      limit: 10,
    };

    console.log("Sending to Backend:", venueParams); // Debug log

    // Debug: Log if no sport filter applied
    if (!venueParams.sportType) {
      console.log("🔍 Searching all venues (no sport filter)");
    } else {
      console.log(`🏀 Searching venues with sport: ${venueParams.sportType}`);
    }

    onSearch(venueParams);
  };

  const handleFormChange = (field: keyof SearchFormData, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const sportOptions = [
    { value: "bóng đá", label: t("search.filter.sports.football") },
    { value: "tennis", label: t("search.filter.sports.tennis") },
    { value: "cầu lông", label: t("search.filter.sports.badminton") },
    { value: "bóng rổ", label: t("search.filter.sports.basketball") },
    { value: "bóng chuyền", label: t("search.filter.sports.volleyball") },
    { value: "pickleball", label: t("search.filter.sports.pickleball") },
  ];

  return (
    <div className="search-filter">
      <div className="search-container">
        <div className="search-info">
          <div className="search-mode venue-mode">
            <span className="mode-icon">🏢</span>
            <span className="mode-text">{t("search.filter.mode_text")}</span>
          </div>
          <div className="search-description">
            {t("search.filter.description")}
          </div>
        </div>

        <div className="search-grid">
          <div className="search-field">
            <CustomSelect
              value={formData.sportType || ""}
              onChange={(value) =>
                handleFormChange("sportType", value || undefined)
              }
              options={[
                { value: "", label: t("search.filter.sport_placeholder") },
                ...sportOptions.map((opt) => ({
                  value: opt.value,
                  label: opt.label,
                })),
              ]}
              placeholder={t("search.filter.sport_placeholder")}
              icon={<FaFutbol />}
            />
          </div>

          <div className="search-field">
            <CustomSelect
              value={formData.cityCode?.toString() || ""}
              onChange={(value) =>
                handleFormChange("cityCode", value ? Number(value) : undefined)
              }
              options={[
                { value: "", label: t("search.filter.city_placeholder") },
                ...cityOptions.map((opt) => ({
                  value: opt.value.toString(),
                  label: opt.label,
                })),
              ]}
              placeholder={
                loadingCities
                  ? "Loading cities..."
                  : t("search.filter.city_placeholder")
              }
              icon={<FaCity />}
            />
          </div>

          <div className="search-field">
            <CustomSelect
              value={formData.districtCode?.toString() || ""}
              onChange={(value) =>
                handleFormChange(
                  "districtCode",
                  value ? Number(value) : undefined
                )
              }
              options={[
                { value: "", label: t("search.filter.district_placeholder") },
                ...districtOptions.map((opt) => ({
                  value: opt.value.toString(),
                  label: opt.label,
                })),
              ]}
              placeholder={
                !formData.cityCode
                  ? "Select city first"
                  : loadingDistricts
                  ? "Loading districts..."
                  : t("search.filter.district_placeholder")
              }
              icon={<FaMapMarkerAlt />}
            />
          </div>

          <Button
            type="primary"
            size="large"
            icon={<SearchOutlined />}
            loading={loading}
            onClick={handleSearch}
            style={{
              height: "50px",
              background: "linear-gradient(45deg, #0ea5e9, #d946ef)",
              border: "none",
              borderRadius: "25px",
              fontWeight: "600",
              fontSize: "16px",
              minWidth: "120px",
            }}
          >
            {t("search.filter.search_button")}
          </Button>
        </div>

        {/* Search Tips */}
        <div className="search-tips">
          <div className="tip-item">
            <span className="tip-icon">🏙️</span>
            <span>{t("search.filter.tip_api")}</span>
          </div>
          <div className="tip-item">
            <span className="tip-icon">🎯</span>
            <span>{t("search.filter.tip_districts")}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SearchFilter;
