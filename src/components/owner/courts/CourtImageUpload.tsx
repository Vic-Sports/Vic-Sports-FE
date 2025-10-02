import React, { useState } from "react";
import { Upload, Button, message, Image } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import { uploadCourtImage } from "@/services/uploadHelpers";

interface CourtImageUploadProps {
  venueId: string;
  courtId: string;
  onUploadSuccess?: (imageUrl: string) => void;
  onUploadStart?: () => void;
  onUploadEnd?: () => void;
  maxImages?: number;
  showPreview?: boolean;
  loading?: boolean;
  disabled?: boolean;
}

const CourtImageUpload: React.FC<CourtImageUploadProps> = ({
  venueId,
  courtId,
  onUploadSuccess,
  onUploadStart,
  onUploadEnd,
  maxImages = 10,
  showPreview = true,
  loading: externalLoading = false,
  disabled = false,
}) => {
  const [internalLoading, setInternalLoading] = useState(false);
  const [imageList, setImageList] = useState<string[]>([]);
  const loading = externalLoading || internalLoading;

  const handleUpload = async (file: File) => {
    if (!venueId || !courtId) {
      message.error("Venue ID and Court ID are required");
      return;
    }

    if (imageList.length >= maxImages) {
      message.error(`Maximum ${maxImages} images allowed`);
      return;
    }

    setInternalLoading(true);
    onUploadStart?.();

    try {
      const res = await uploadCourtImage(file, venueId, courtId);

      if (res?.data) {
        const newImageUrl = res.data.fileUploaded;
        setImageList((prev) => [...prev, newImageUrl]);
        message.success("Court image uploaded successfully!");
        onUploadSuccess?.(newImageUrl);
      } else {
        throw new Error(res.message || "Upload failed");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      message.error(error.message || "Upload failed");
    } finally {
      setInternalLoading(false);
      onUploadEnd?.();
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
      return false;
    },
    showUploadList: false,
    multiple: true,
    disabled: disabled || loading || imageList.length >= maxImages,
  };

  const removeImage = (index: number) => {
    setImageList((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div>
      <Upload {...uploadProps}>
        <Button
          icon={<PlusOutlined />}
          loading={loading}
          disabled={disabled || imageList.length >= maxImages}
        >
          Upload Court Images ({imageList.length}/{maxImages})
        </Button>
      </Upload>

      {showPreview && imageList.length > 0 && (
        <div style={{ marginTop: 16 }}>
          <Image.PreviewGroup>
            {imageList.map((url, index) => (
              <div
                key={index}
                style={{
                  display: "inline-block",
                  position: "relative",
                  marginRight: 8,
                  marginBottom: 8,
                }}
              >
                <Image
                  width={100}
                  height={100}
                  src={url}
                  style={{ objectFit: "cover", borderRadius: 8 }}
                />
                <Button
                  size="small"
                  danger
                  style={{
                    position: "absolute",
                    top: -8,
                    right: -8,
                    minWidth: 24,
                    height: 24,
                    borderRadius: "50%",
                    padding: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onClick={() => removeImage(index)}
                >
                  ×
                </Button>
              </div>
            ))}
          </Image.PreviewGroup>
        </div>
      )}
    </div>
  );
};

export default CourtImageUpload;
