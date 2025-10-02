import { uploadFileAPI } from "./api";

/**
 * Upload avatar người dùng
 */
export const uploadUserAvatar = (file: File) => {
  return uploadFileAPI(file, "avatar");
};

/**
 * Upload ảnh venue
 */
export const uploadVenueImage = (file: File, venueId: string) => {
  return uploadFileAPI(file, "venue-image", {
    "venue-id": venueId,
  });
};

/**
 * Upload ảnh court
 */
export const uploadCourtImage = (
  file: File,
  venueId: string,
  courtId: string
) => {
  return uploadFileAPI(file, "court-image", {
    "venue-id": venueId,
    "court-id": courtId,
  });
};

/**
 * Upload file chung
 */
export const uploadGeneralFile = (
  file: File,
  folderName: string = "general"
) => {
  return uploadFileAPI(file, folderName);
};

/**
 * Upload multiple venue images
 */
export const uploadMultipleVenueImages = async (
  files: File[],
  venueId: string
) => {
  const uploadPromises = files.map((file) => uploadVenueImage(file, venueId));
  return Promise.all(uploadPromises);
};

/**
 * Upload multiple court images
 */
export const uploadMultipleCourtImages = async (
  files: File[],
  venueId: string,
  courtId: string
) => {
  const uploadPromises = files.map((file) =>
    uploadCourtImage(file, venueId, courtId)
  );
  return Promise.all(uploadPromises);
};
