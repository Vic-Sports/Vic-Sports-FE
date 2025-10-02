import React, { useState } from "react";
import { Upload, Button, message } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { uploadVenueImage } from "@/services/uploadHelpers";

interface VenueImageUploadProps {
  venueId: string;
  onUploadSuccess?: (imageUrl: string) => void;
  loading?: boolean;
  disabled?: boolean;
}

const VenueImageUpload: React.FC<VenueImageUploadProps> = ({
  venueId,
  onUploadSuccess,
  loading: externalLoading = false,
  disabled = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const loading = externalLoading || internalLoading;

  const handleUpload = async (file: File) => {
    if (!venueId) {
      message.error("Venue ID is required");
      return;
    }

    setInternalLoading(true);
    try {
      const res = await uploadVenueImage(file, venueId);

      if (res?.data) {
        message.success("Venue image uploaded successfully!");
        onUploadSuccess?.(res.data.fileUploaded);
      } else {
        throw new Error(res.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      message.error(error.message || "Upload failed");
    } finally {
      setInternalLoading(false);
    }
  };

  const uploadProps = {
    beforeUpload: (file: File) => {
      // Validate file type
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("You can only upload image files!");
        return false;
      }

      // Validate file size (10MB)
      const isLt10M = file.size / 1024 / 1024 < 10;
      if (!isLt10M) {
        message.error("Image must be smaller than 10MB!");
        return false;
      }

      handleUpload(file);
      return false; // Prevent auto upload
    },
    showUploadList: false,
    disabled: disabled || loading,
  };

  return (
    <Upload {...uploadProps}>
      <Button icon={<PlusOutlined />} loading={loading} disabled={disabled}>
        Upload Venue Image
      </Button>
    </Upload>
  );
};

export default VenueImageUpload;
