// Upload API Response Types

export interface UploadResponse {
  fileUploaded: string;
  publicId: string;
  folderPath: string;
  uploadType: string;
  venueId?: string;
  courtId?: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
}

export interface UploadApiResponse {
  success: boolean;
  message: string;
  data: UploadResponse;
}

// Upload Types
export type UploadType =
  | "avatar"
  | "venue-image"
  | "court-image"
  | "general"
  | "documents"
  | "profiles"
  | "tournaments";

// Upload Headers
export interface UploadHeaders {
  "Content-Type": "multipart/form-data";
  "upload-type": UploadType;
  "venue-id"?: string;
  "court-id"?: string;
  [key: string]: string | undefined;
}

// File Upload Constraints
export interface FileConstraints {
  maxSizeBytes: number; // 10MB = 10 * 1024 * 1024
  allowedTypes: string[];
  maxFiles?: number;
}

export const DEFAULT_FILE_CONSTRAINTS: FileConstraints = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/gif",
    "image/webp",
  ],
  maxFiles: 10,
};

export const DOCUMENT_CONSTRAINTS: FileConstraints = {
  maxSizeBytes: 10 * 1024 * 1024, // 10MB
  allowedTypes: [
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  ],
  maxFiles: 5,
};

// Folder Structure Constants
export const UPLOAD_FOLDERS = {
  USERS: {
    AVATARS: "users/avatars",
  },
  VENUES: {
    IMAGES: (venueId: string) => `venues/${venueId}/venue-images`,
    COURTS: (venueId: string, courtId: string) =>
      `venues/${venueId}/courts/${courtId}`,
  },
  GENERAL: {
    DOCUMENTS: "general/documents",
    IMAGES: "general/images",
  },
} as const;

// Upload Validation Utilities
export const validateFile = (
  file: File,
  constraints: FileConstraints
): { valid: boolean; error?: string } => {
  // Check file size
  if (file.size > constraints.maxSizeBytes) {
    return {
      valid: false,
      error: `File size must be less than ${
        constraints.maxSizeBytes / 1024 / 1024
      }MB`,
    };
  }

  // Check file type
  if (!constraints.allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `File type ${
        file.type
      } is not allowed. Allowed types: ${constraints.allowedTypes.join(", ")}`,
    };
  }

  return { valid: true };
};

export const validateFiles = (
  files: File[],
  constraints: FileConstraints
): { valid: boolean; error?: string } => {
  // Check number of files
  if (constraints.maxFiles && files.length > constraints.maxFiles) {
    return {
      valid: false,
      error: `Maximum ${constraints.maxFiles} files allowed`,
    };
  }

  // Validate each file
  for (const file of files) {
    const validation = validateFile(file, constraints);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
};
