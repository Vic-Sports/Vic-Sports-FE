import React, { useState, useEffect } from "react";
import {
  Modal,
  Upload,
  message as antMessage,
  Input,
  Select,
  DatePicker,
  TimePicker,
  Spin,
} from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";
import type { UploadFile, UploadProps } from "antd/es/upload/interface";
import dayjs from "dayjs";
import { FaTimes } from "react-icons/fa";
import { createPostAPI } from "@/services/communityApi";
import { getAllVenuesAPI, getVenueCourtsAPI } from "@/services/venueApi";
import "./CreatePostModal.scss";

const { TextArea } = Input;
const { Option } = Select;

interface CreatePostModalProps {
  open: boolean;
  onCancel: () => void;
  onCreate: (post: any) => void;
  onRefresh?: () => void;
  initialData?: {
    title?: string;
    description?: string;
    sport?: string;
    venueId?: string;
    courtId?: string;
    location?: string;
    date?: string;
    startTime?: string;
    endTime?: string;
    maxParticipants?: number;
    currentParticipants?: number;
  };
}

const CreatePostModal: React.FC<CreatePostModalProps> = ({
  open,
  onCancel,
  onCreate,
  onRefresh,
  initialData,
}) => {
  const [loading, setLoading] = useState(false);
  const [loadingVenues, setLoadingVenues] = useState(false);
  const [loadingCourts, setLoadingCourts] = useState(false);
  const [venues, setVenues] = useState<any[]>([]);
  const [courts, setCourts] = useState<any[]>([]);
  const [venueId, setVenueId] = useState(""); // Selected venue ID
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sport, setSport] = useState("Bóng đá");
  const [courtId, setCourtId] = useState(""); // Court ID from dropdown
  const [location, setLocation] = useState("");
  const [date, setDate] = useState<dayjs.Dayjs | null>(null);
  const [startTime, setStartTime] = useState<dayjs.Dayjs | null>(null);
  const [endTime, setEndTime] = useState<dayjs.Dayjs | null>(null);
  const [currentParticipants, setCurrentParticipants] = useState(0);
  const [maxParticipants, setMaxParticipants] = useState(10);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // Load venues on mount
  useEffect(() => {
    const fetchVenues = async () => {
      try {
        setLoadingVenues(true);
        const response = await getAllVenuesAPI();
        if (response.data) {
          setVenues(response.data.venues || []);
          console.log("Venues loaded:", response.data.venues);
        }
      } catch (error) {
        console.error("Error loading venues:", error);
        antMessage.error("Không thể tải danh sách khu thể thao!");
      } finally {
        setLoadingVenues(false);
      }
    };

    if (open) {
      fetchVenues();
    }
  }, [open]);

  // Load courts when venue is selected
  useEffect(() => {
    const fetchCourts = async () => {
      if (!venueId) {
        setCourts([]);
        setCourtId(""); // Clear court selection
        return;
      }

      try {
        setLoadingCourts(true);
        const response = await getVenueCourtsAPI(venueId);
        if (response.data) {
          setCourts(response.data.courts || []);
          console.log(
            "Courts loaded for venue:",
            venueId,
            response.data.courts
          );
        }
      } catch (error) {
        console.error("Error loading courts:", error);
        antMessage.error("Không thể tải danh sách sân!");
        setCourts([]);
      } finally {
        setLoadingCourts(false);
      }
    };

    fetchCourts();
  }, [venueId]);

  // Populate form with initial data when modal opens
  useEffect(() => {
    if (open && initialData) {
      console.log("Populating form with initial data:", initialData);

      if (initialData.title) setTitle(initialData.title);
      if (initialData.description) setDescription(initialData.description);
      if (initialData.sport) setSport(initialData.sport);
      if (initialData.location) setLocation(initialData.location);
      if (initialData.date) setDate(dayjs(initialData.date));
      if (initialData.startTime)
        setStartTime(dayjs(initialData.startTime, "HH:mm"));
      if (initialData.endTime) setEndTime(dayjs(initialData.endTime, "HH:mm"));
      if (initialData.maxParticipants)
        setMaxParticipants(initialData.maxParticipants);
      if (initialData.currentParticipants !== undefined) {
        setCurrentParticipants(initialData.currentParticipants);
      }
    }
  }, [open, initialData]);

  // Set venue and court from initial data after venues/courts are loaded
  useEffect(() => {
    if (open && initialData?.venueId && venues.length > 0) {
      setVenueId(initialData.venueId);
    }
  }, [open, initialData?.venueId, venues]);

  useEffect(() => {
    if (open && initialData?.courtId && courts.length > 0) {
      setCourtId(initialData.courtId);
    }
  }, [open, initialData?.courtId, courts]);

  const sports = [
    "Bóng đá",
    "Bóng rổ",
    "Quần vợt",
    "Cầu lông",
    "Bóng chuyền",
    "Bơi lội",
    "Bóng bàn",
  ];

  const handleImageChange: UploadProps["onChange"] = ({
    fileList: newFileList,
  }) => {
    setFileList(newFileList);

    // Create preview URLs
    const previews: string[] = [];
    newFileList.forEach((file) => {
      if (file.originFileObj) {
        const reader = new FileReader();
        reader.onload = (e) => {
          if (e.target?.result) {
            previews.push(e.target.result as string);
            setPreviewImages([...previews]);
          }
        };
        reader.readAsDataURL(file.originFileObj);
      }
    });
  };

  const handleRemoveImage = (index: number) => {
    const newFileList = [...fileList];
    newFileList.splice(index, 1);
    setFileList(newFileList);

    const newPreviews = [...previewImages];
    newPreviews.splice(index, 1);
    setPreviewImages(newPreviews);
  };

  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith("image/");
    if (!isImage) {
      antMessage.error("Bạn chỉ có thể tải lên file hình ảnh!");
      return false;
    }
    const isLt5M = file.size / 1024 / 1024 < 5;
    if (!isLt5M) {
      antMessage.error("Hình ảnh phải nhỏ hơn 5MB!");
      return false;
    }
    return false; // Prevent auto upload
  };

  const handleCreate = async () => {
    console.log("=== CREATE POST CLICKED ===");
    console.log("Form values:", {
      title,
      description,
      sport,
      courtId,
      location,
      date,
      startTime,
      endTime,
      currentParticipants,
      maxParticipants,
    });

    if (!title.trim()) {
      console.log("❌ Validation failed: title is empty");
      antMessage.error("Vui lòng nhập tiêu đề!");
      return;
    }
    if (!description.trim()) {
      console.log("❌ Validation failed: description is empty");
      antMessage.error("Vui lòng nhập mô tả!");
      return;
    }
    if (!courtId.trim()) {
      console.log("❌ Validation failed: courtId is empty");
      antMessage.error("Vui lòng chọn sân!");
      return;
    }
    if (!location.trim()) {
      console.log("❌ Validation failed: location is empty");
      antMessage.error("Vui lòng nhập địa điểm!");
      return;
    }
    if (!date) {
      console.log("❌ Validation failed: date is empty");
      antMessage.error("Vui lòng chọn ngày!");
      return;
    }
    if (!startTime || !endTime) {
      console.log("❌ Validation failed: time is empty");
      antMessage.error("Vui lòng chọn giờ bắt đầu và kết thúc!");
      return;
    }
    if (currentParticipants >= maxParticipants) {
      console.log(
        "❌ Validation failed: currentParticipants >= maxParticipants"
      );
      antMessage.error("Số người hiện tại phải nhỏ hơn số người tối đa!");
      return;
    }

    console.log("✅ All validations passed!");

    const postData = {
      title: title.trim(),
      description: description.trim(),
      sport,
      court: courtId, // Send court ID, not name
      location: location.trim(),
      date: date.format("YYYY-MM-DD"),
      timeSlot: {
        start: startTime.format("HH:mm"),
        end: endTime.format("HH:mm"),
      },
      currentParticipants,
      maxParticipants,
      images: previewImages,
    };

    try {
      setLoading(true);
      console.log("Creating post with data:", postData);

      const response = await createPostAPI(postData);
      console.log("Create post response:", response);

      if (response.success) {
        antMessage.success(response.message || "Tạo bài viết thành công!");
        onCreate(response.data);
        handleReset();

        // Refresh posts list if callback provided
        if (onRefresh) {
          onRefresh();
        }
      } else {
        console.error("Create post failed:", response);
        antMessage.error("Không thể tạo bài viết. Vui lòng thử lại!");
      }
    } catch (error: any) {
      console.error("Error creating post:", error);
      console.error("Error details:", {
        message: error?.message,
        response: error?.response,
        data: error?.response?.data,
      });

      const errorMessage =
        error?.response?.data?.message ||
        error?.message ||
        "Đã xảy ra lỗi khi tạo bài viết!";
      antMessage.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setTitle("");
    setDescription("");
    setSport("Bóng đá");
    setVenueId("");
    setCourtId("");
    setLocation("");
    setDate(null);
    setStartTime(null);
    setEndTime(null);
    setCurrentParticipants(0);
    setMaxParticipants(10);
    setFileList([]);
    setPreviewImages([]);
  };

  const handleCancel = () => {
    handleReset();
    onCancel();
  };

  return (
    <Modal
      open={open}
      onCancel={handleCancel}
      footer={null}
      width={700}
      className="create-post-modal"
      destroyOnClose
    >
      <div className="modal-content">
        <div className="modal-header">
          <h2 className="modal-title">Tạo bài viết mới</h2>
          <button className="close-btn" onClick={handleCancel}>
            <FaTimes />
          </button>
        </div>

        <div className="modal-body">
          {/* Title */}
          <div className="form-group">
            <label className="form-label">
              Tiêu đề <span className="required">*</span>
            </label>
            <Input
              placeholder="Nhập tiêu đề hoạt động..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              size="large"
            />
          </div>

          {/* Description */}
          <div className="form-group">
            <label className="form-label">
              Mô tả <span className="required">*</span>
            </label>
            <TextArea
              placeholder="Mô tả chi tiết về hoạt động..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              maxLength={500}
              showCount
              size="large"
            />
          </div>

          {/* Sport & Venue */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Môn thể thao <span className="required">*</span>
              </label>
              <Select
                value={sport}
                onChange={setSport}
                size="large"
                style={{ width: "100%" }}
                disabled={!!initialData} // Disabled if from history
              >
                {sports.map((s) => (
                  <Option key={s} value={s}>
                    {s}
                  </Option>
                ))}
              </Select>
            </div>

            <div className="form-group">
              <label className="form-label">
                Khu thể thao <span className="required">*</span>
              </label>
              <Select
                placeholder="Chọn khu thể thao..."
                value={venueId || undefined}
                onChange={(value) => setVenueId(value)}
                size="large"
                style={{ width: "100%" }}
                loading={loadingVenues}
                disabled={!!initialData} // Disabled if from history
                showSearch
                filterOption={(input, option) =>
                  (option?.label ?? "")
                    .toLowerCase()
                    .includes(input.toLowerCase())
                }
                options={venues.map((venue) => ({
                  value: venue._id,
                  label: venue.name,
                }))}
                notFoundContent={
                  loadingVenues ? (
                    <Spin size="small" />
                  ) : (
                    "Không tìm thấy khu thể thao nào"
                  )
                }
              />
            </div>
          </div>

          {/* Court */}
          <div className="form-group">
            <label className="form-label">
              Chọn sân <span className="required">*</span>
            </label>
            <Select
              placeholder={
                venueId
                  ? "Chọn sân để chơi..."
                  : "Vui lòng chọn khu thể thao trước"
              }
              value={courtId || undefined}
              onChange={(value) => setCourtId(value)}
              size="large"
              style={{ width: "100%" }}
              loading={loadingCourts}
              disabled={!venueId || !!initialData} // Disabled if no venue OR from history
              showSearch
              filterOption={(input, option) =>
                (option?.label ?? "")
                  .toLowerCase()
                  .includes(input.toLowerCase())
              }
              options={courts.map((court) => ({
                value: court._id,
                label: `${court.name} - ${court.type || ""}`,
              }))}
              notFoundContent={
                loadingCourts ? (
                  <Spin size="small" />
                ) : venueId ? (
                  "Không tìm thấy sân nào"
                ) : (
                  "Vui lòng chọn khu thể thao trước"
                )
              }
            />
          </div>

          {/* Location */}
          <div className="form-group">
            <label className="form-label">
              Địa điểm <span className="required">*</span>
            </label>
            <Input
              placeholder="VD: Quận 1, TP.HCM"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              size="large"
              disabled={!!initialData} // Disabled if from history
            />
          </div>

          {/* Date & Time */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">
                Ngày <span className="required">*</span>
              </label>
              <DatePicker
                value={date}
                onChange={setDate}
                format="DD/MM/YYYY"
                placeholder="Chọn ngày"
                size="large"
                style={{ width: "100%" }}
                disabled={!!initialData} // Disabled if from history
                disabledDate={(current) =>
                  current && current < dayjs().startOf("day")
                }
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Giờ bắt đầu <span className="required">*</span>
              </label>
              <TimePicker
                value={startTime}
                onChange={setStartTime}
                format="HH:mm"
                placeholder="Chọn giờ"
                size="large"
                style={{ width: "100%" }}
                disabled={!!initialData} // Disabled if from history
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Giờ kết thúc <span className="required">*</span>
              </label>
              <TimePicker
                value={endTime}
                onChange={setEndTime}
                format="HH:mm"
                placeholder="Chọn giờ"
                size="large"
                style={{ width: "100%" }}
                disabled={!!initialData} // Disabled if from history
              />
            </div>
          </div>

          {/* Participants */}
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Số người hiện tại</label>
              <Input
                type="number"
                value={currentParticipants}
                onChange={(e) => setCurrentParticipants(Number(e.target.value))}
                min={0}
                max={100}
                size="large"
                placeholder="0"
              />
            </div>

            <div className="form-group">
              <label className="form-label">
                Số người cần tuyển <span className="required">*</span>
              </label>
              <Input
                type="number"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(Number(e.target.value))}
                min={1}
                max={100}
                size="large"
                placeholder="10"
              />
            </div>
          </div>

          {/* Image Upload */}
          <div className="form-group">
            <label className="form-label">Hình ảnh</label>
            <div className="upload-section">
              <Upload
                listType="picture-card"
                fileList={fileList}
                onChange={handleImageChange}
                beforeUpload={beforeUpload}
                maxCount={5}
                multiple
                accept="image/*"
                className="image-uploader"
              >
                {fileList.length < 5 && (
                  <div className="upload-button">
                    <PlusOutlined />
                    <div style={{ marginTop: 8 }}>Tải ảnh lên</div>
                  </div>
                )}
              </Upload>

              {previewImages.length > 0 && (
                <div className="preview-images">
                  {previewImages.map((img, index) => (
                    <div key={index} className="preview-item">
                      <img src={img} alt={`Preview ${index + 1}`} />
                      <button
                        className="remove-btn"
                        onClick={() => handleRemoveImage(index)}
                      >
                        <DeleteOutlined />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <p className="upload-hint">Tối đa 5 ảnh, mỗi ảnh không quá 5MB</p>
          </div>
        </div>

        <div className="modal-footer">
          <button
            className="cancel-btn"
            onClick={handleCancel}
            disabled={loading}
          >
            Hủy bỏ
          </button>
          <button
            className="create-btn"
            onClick={handleCreate}
            disabled={loading}
          >
            {loading ? "Đang tạo..." : "Tạo bài viết"}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CreatePostModal;
