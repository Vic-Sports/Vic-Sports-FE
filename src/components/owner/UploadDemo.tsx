import React, { useState } from "react";
import {
  Card,
  Row,
  Col,
  Space,
  Button,
  message,
  Divider,
  Typography,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import VenueImageUpload from "./venues/VenueImageUpload";
import CourtImageUpload from "./courts/CourtImageUpload";
import { uploadGeneralFile } from "@/services/uploadHelpers";
import { ownerVenueApi, ownerCourtApi } from "@/services/ownerApi";

const { Title, Text } = Typography;

interface UploadDemoProps {
  venueId?: string;
  courtId?: string;
}

const UploadDemo: React.FC<UploadDemoProps> = ({
  venueId = "demo-venue-123",
  courtId = "demo-court-456",
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const handleVenueImageSuccess = (imageUrl: string) => {
    console.log("Venue image uploaded:", imageUrl);
    setUploadedFiles((prev) => [...prev, imageUrl]);
  };

  const handleCourtImageSuccess = (imageUrl: string) => {
    console.log("Court image uploaded:", imageUrl);
    setUploadedFiles((prev) => [...prev, imageUrl]);
  };

  const handleGeneralFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    try {
      const res = await uploadGeneralFile(file, "documents");
      if (res?.data) {
        message.success("General file uploaded successfully!");
        setUploadedFiles((prev) => [...prev, res.data!.fileUploaded]);
      }
    } catch (error: any) {
      message.error(error.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkVenueUpload = async () => {
    // Demo: Upload multiple venue images using API
    const demoFiles: File[] = []; // In real app, get from file input

    if (demoFiles.length === 0) {
      message.info("Please select files first (demo mode - no files selected)");
      return;
    }

    try {
      setLoading(true);
      const result = await ownerVenueApi.uploadVenueImages(venueId, demoFiles);
      if (result.success) {
        message.success(`Uploaded ${result.data.length} venue images!`);
        setUploadedFiles((prev) => [...prev, ...result.data]);
      }
    } catch (error: any) {
      message.error(error.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  const handleBulkCourtUpload = async () => {
    // Demo: Upload multiple court images using API
    const demoFiles: File[] = []; // In real app, get from file input

    if (demoFiles.length === 0) {
      message.info("Please select files first (demo mode - no files selected)");
      return;
    }

    try {
      setLoading(true);
      const result = await ownerCourtApi.uploadCourtImages(
        venueId,
        courtId,
        demoFiles
      );
      if (result.success) {
        message.success(`Uploaded ${result.data.length} court images!`);
        setUploadedFiles((prev) => [...prev, ...result.data]);
      }
    } catch (error: any) {
      message.error(error.message || "Bulk upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "24px" }}>
      <Title level={2}>📁 File Upload API Demo</Title>
      <Text type="secondary">
        Demo các chức năng upload file với cấu trúc folder phân cấp mới
      </Text>

      <Divider />

      <Row gutter={[16, 16]}>
        {/* Avatar Upload */}
        <Col span={8}>
          <Card title="👤 Avatar Upload" size="small">
            <Text>Đã được implement trong user.info.tsx</Text>
            <br />
            <Text type="secondary">Path: users/avatars/</Text>
          </Card>
        </Col>

        {/* Venue Image Upload */}
        <Col span={8}>
          <Card title="🏢 Venue Images" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <VenueImageUpload
                venueId={venueId}
                onUploadSuccess={handleVenueImageSuccess}
              />
              <Text type="secondary">Path: venues/{venueId}/venue-images/</Text>
            </Space>
          </Card>
        </Col>

        {/* Court Image Upload */}
        <Col span={8}>
          <Card title="🏓 Court Images" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <CourtImageUpload
                venueId={venueId}
                courtId={courtId}
                onUploadSuccess={handleCourtImageSuccess}
                maxImages={5}
              />
              <Text type="secondary">
                Path: venues/{venueId}/courts/{courtId}/
              </Text>
            </Space>
          </Card>
        </Col>

        {/* General File Upload */}
        <Col span={8}>
          <Card title="📄 General Files" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <label>
                <Button
                  icon={<UploadOutlined />}
                  loading={loading}
                  style={{ width: "100%" }}
                >
                  Upload Document
                </Button>
                <input
                  type="file"
                  style={{ display: "none" }}
                  onChange={handleGeneralFileUpload}
                  accept=".pdf,.doc,.docx"
                />
              </label>
              <Text type="secondary">Path: general/documents/</Text>
            </Space>
          </Card>
        </Col>

        {/* Bulk Upload Demo */}
        <Col span={8}>
          <Card title="🚀 Bulk Upload" size="small">
            <Space direction="vertical" style={{ width: "100%" }}>
              <Button
                icon={<PlusOutlined />}
                onClick={handleBulkVenueUpload}
                loading={loading}
                style={{ width: "100%" }}
              >
                Bulk Venue Images
              </Button>
              <Button
                icon={<PlusOutlined />}
                onClick={handleBulkCourtUpload}
                loading={loading}
                style={{ width: "100%" }}
              >
                Bulk Court Images
              </Button>
            </Space>
          </Card>
        </Col>

        {/* API Compatibility */}
        <Col span={8}>
          <Card title="🔄 API Compatibility" size="small">
            <Space direction="vertical">
              <Text>✅ Backward compatible</Text>
              <Text>✅ Legacy API vẫn hoạt động</Text>
              <Text>✅ New API có nhiều tính năng hơn</Text>
              <Text type="secondary">Response có thêm metadata</Text>
            </Space>
          </Card>
        </Col>
      </Row>

      <Divider />

      {/* Upload Results */}
      {uploadedFiles.length > 0 && (
        <Card title="📊 Upload Results">
          <Space direction="vertical" style={{ width: "100%" }}>
            <Text strong>Total uploaded: {uploadedFiles.length} files</Text>
            {uploadedFiles.map((url, index) => (
              <Text key={index} code copyable>
                {url}
              </Text>
            ))}
          </Space>
        </Card>
      )}

      <Divider />

      {/* Usage Examples */}
      <Card title="💻 Usage Examples">
        <Row gutter={16}>
          <Col span={12}>
            <Title level={4}>New API Usage:</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`// Avatar upload
import { uploadUserAvatar } from '@/services/uploadHelpers';
const res = await uploadUserAvatar(file);

// Venue image upload  
import { uploadVenueImage } from '@/services/uploadHelpers';
const res = await uploadVenueImage(file, venueId);

// Court image upload
import { uploadCourtImage } from '@/services/uploadHelpers';
const res = await uploadCourtImage(file, venueId, courtId);`}
            </pre>
          </Col>
          <Col span={12}>
            <Title level={4}>Enhanced Response:</Title>
            <pre
              style={{
                background: "#f5f5f5",
                padding: "12px",
                borderRadius: "4px",
              }}
            >
              {`{
  success: true,
  data: {
    fileUploaded: "https://...",
    publicId: "vic-sports/venues/123/...",
    folderPath: "venues/123/venue-images",
    uploadType: "venue-image",
    venueId: "123",
    width: 1920,
    height: 1080,
    format: "jpg",
    bytes: 245760
  }
}`}
            </pre>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

export default UploadDemo;
