import type { MatchStatus, TournamentFormat, TournamentStatus } from "@/types/tournament";

// Helper functions for tournament display
export const getTournamentStatusDisplay = (status: TournamentStatus): string => {
  const statusMap: Record<TournamentStatus, string> = {
    draft: "Bản nháp",
    upcoming: "Sắp diễn ra",
    registration_open: "Mở đăng ký",
    registration_closed: "Đóng đăng ký",
    about_to_start: "Sắp diễn ra",
    ongoing: "Đang diễn ra",
    completed: "Đã kết thúc",
    cancelled: "Đã hủy",
  };
  return statusMap[status] || status;
};

export const getTournamentStatusColor = (status: TournamentStatus): string => {
  const colorMap: Record<TournamentStatus, string> = {
    draft: "default",
    upcoming: "blue",
    registration_open: "green",
    registration_closed: "orange",
    about_to_start: "purple",
    ongoing: "red",
    completed: "success",
    cancelled: "red",
  };
  return colorMap[status] || "default";
};

export const getTournamentFormatDisplay = (format: TournamentFormat): string => {
  const formatMap: Record<TournamentFormat, string> = {
    single_elimination: "Loại trực tiếp đơn",
    double_elimination: "Loại trực tiếp kép",
    round_robin: "Vòng tròn",
    swiss: "Thụy Sĩ",
  };
  return formatMap[format] || format;
};

export const getMatchStatusDisplay = (status: MatchStatus): string => {
  const statusMap: Record<MatchStatus, string> = {
    scheduled: "Đã lên lịch",
    ongoing: "Đang diễn ra",
    completed: "Hoàn thành",
    cancelled: "Đã hủy",
    postponed: "Hoãn lại",
  };
  return statusMap[status] || status;
};

export const getMatchStatusColor = (status: MatchStatus): string => {
  const colorMap: Record<MatchStatus, string> = {
    scheduled: "blue",
    ongoing: "purple",
    completed: "green",
    cancelled: "red",
    postponed: "orange",
  };
  return colorMap[status] || "default";
};
