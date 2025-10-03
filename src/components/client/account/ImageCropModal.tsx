import React, { useState, useRef } from "react";
import { Modal, Button, Slider, Space } from "antd";
import ReactCrop, {
  type Crop,
  type PixelCrop,
  makeAspectCrop,
  centerCrop,
} from "react-image-crop";
import "react-image-crop/dist/ReactCrop.css";

interface ImageCropModalProps {
  visible: boolean;
  imageSrc: string;
  onCancel: () => void;
  onOk: (croppedFile: File) => void;
  originalFileName: string;
}

// Hàm để tạo aspect ratio cho crop vuông (1:1)
function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: "%",
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight
    ),
    mediaWidth,
    mediaHeight
  );
}

const ImageCropModal: React.FC<ImageCropModalProps> = ({
  visible,
  imageSrc,
  onCancel,
  onOk,
  originalFileName,
}) => {
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [scale, setScale] = useState(1);
  const imgRef = useRef<HTMLImageElement>(null);

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  // Hàm để tạo file từ canvas
  const getCroppedImg = (
    image: HTMLImageElement,
    crop: PixelCrop
  ): Promise<File> => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("No 2d context");
    }

    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    // Đặt kích thước canvas theo crop
    canvas.width = crop.width;
    canvas.height = crop.height;

    // Vẽ ảnh đã crop lên canvas
    ctx.drawImage(
      image,
      crop.x * scaleX,
      crop.y * scaleY,
      crop.width * scaleX,
      crop.height * scaleY,
      0,
      0,
      crop.width,
      crop.height
    );

    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            throw new Error("Failed to create blob");
          }
          // Tạo file từ blob
          const file = new File([blob], originalFileName, {
            type: "image/jpeg",
            lastModified: Date.now(),
          });
          resolve(file);
        },
        "image/jpeg",
        0.9
      );
    });
  };

  const handleOk = async () => {
    if (!imgRef.current || !completedCrop?.width || !completedCrop?.height) {
      return;
    }

    try {
      const croppedFile = await getCroppedImg(imgRef.current, completedCrop);
      onOk(croppedFile);
    } catch (error) {
      console.error("Error cropping image:", error);
    }
  };

  return (
    <Modal
      title="Cắt ảnh đại diện"
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Hủy
        </Button>,
        <Button key="ok" type="primary" onClick={handleOk}>
          Áp dụng
        </Button>,
      ]}
    >
      <div style={{ textAlign: "center" }}>
        {/* Slider điều chỉnh scale */}
        <Space direction="vertical" style={{ width: "100%", marginBottom: 16 }}>
          <div>
            <span>Phóng to/thu nhỏ: </span>
            <Slider
              min={0.5}
              max={3}
              step={0.1}
              value={scale}
              onChange={setScale}
              style={{ width: 200, display: "inline-block", marginLeft: 8 }}
            />
            <span style={{ marginLeft: 8 }}>{scale.toFixed(1)}x</span>
          </div>
        </Space>

        {/* React Crop component */}
        <ReactCrop
          crop={crop}
          onChange={(_, percentCrop) => setCrop(percentCrop)}
          onComplete={(c) => setCompletedCrop(c)}
          aspect={1} // Tỷ lệ 1:1 cho avatar
          style={{ maxHeight: "400px" }}
        >
          <img
            ref={imgRef}
            alt="Crop me"
            src={imageSrc}
            style={{
              transform: `scale(${scale})`,
              maxWidth: "100%",
              maxHeight: "400px",
            }}
            onLoad={onImageLoad}
          />
        </ReactCrop>
      </div>
    </Modal>
  );
};

export default ImageCropModal;
