import { useCurrentApp } from "@/components/context/app.context";
import {
  Card,
  Row,
  Col,
  Form,
  Input,
  Select,
  Switch,
  Button,
  Typography,
  TimePicker
} from "antd";
import { useEffect, useState } from "react";
import type { FormProps } from "antd";
import { updateUserPreferencesAPI } from "@/services/api";
import { App } from "antd";
import dayjs from "dayjs";

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

type FieldType = {
  favoriteSports: string[];
  preferredDays: string[];
  preferredTimeRange: {
    from: string;
    to: string;
  };
  bio: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  notificationSettings: {
    email: boolean;
    push: boolean;
    sms: boolean;
  };
};

const UserPreferences = () => {
  const [form] = Form.useForm();
  const { user, setUser } = useCurrentApp();
  const [isSubmit, setIsSubmit] = useState(false);
  const { message, notification } = App.useApp();

  const sportsOptions = [
    { value: "football", label: "Bóng đá" },
    { value: "tennis", label: "Tennis" },
    { value: "badminton", label: "Cầu lông" },
    { value: "basketball", label: "Bóng rổ" },
    { value: "volleyball", label: "Bóng chuyền" },
    { value: "table-tennis", label: "Bóng bàn" }
  ];

  const dayOptions = [
    { value: "Monday", label: "Thứ 2" },
    { value: "Tuesday", label: "Thứ 3" },
    { value: "Wednesday", label: "Thứ 4" },
    { value: "Thursday", label: "Thứ 5" },
    { value: "Friday", label: "Thứ 6" },
    { value: "Saturday", label: "Thứ 7" },
    { value: "Sunday", label: "Chủ nhật" }
  ];

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        favoriteSports: user.favoriteSports || [],
        preferredDays: user.preferredDays || [],
        preferredTimeRange: user.preferredTimeRange
          ? {
              from: user.preferredTimeRange.from
                ? dayjs(user.preferredTimeRange.from, "HH:mm")
                : null,
              to: user.preferredTimeRange.to
                ? dayjs(user.preferredTimeRange.to, "HH:mm")
                : null
            }
          : {},
        bio: user.bio || "",
        emergencyContact: user.emergencyContact || {},
        notificationSettings: user.notificationSettings || {
          email: true,
          push: true,
          sms: false
        }
      });
    }
  }, [user, form]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    setIsSubmit(true);

    const formattedValues = {
      ...values,
      preferredTimeRange: {
        from: values.preferredTimeRange?.from
          ? dayjs(values.preferredTimeRange.from).format("HH:mm")
          : "",
        to: values.preferredTimeRange?.to
          ? dayjs(values.preferredTimeRange.to).format("HH:mm")
          : ""
      }
    };

    try {
      const res = await updateUserPreferencesAPI(user?.id, formattedValues);

      if (res && res.data) {
        setUser({
          ...user!,
          ...formattedValues
        });
        message.success("Cập nhật sở thích thành công");
      } else {
        notification.error({
          message: "Đã có lỗi xảy ra",
          description: res.message
        });
      }
    } catch (error) {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: "Không thể cập nhật sở thích"
      });
    }

    setIsSubmit(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Form
        form={form}
        layout="vertical"
        onFinish={onFinish}
        initialValues={{
          notificationSettings: {
            email: true,
            push: true,
            sms: false
          }
        }}
      >
        <Row gutter={[24, 24]}>
          {/* Sports Preferences */}
          <Col span={12}>
            <Card title="Sở thích thể thao" size="small">
              <Form.Item<FieldType>
                name="favoriteSports"
                label="Môn thể thao yêu thích"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các môn thể thao yêu thích"
                  options={sportsOptions}
                  maxTagCount={3}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Preferred Days */}
          <Col span={12}>
            <Card title="Ngày thích chơi" size="small">
              <Form.Item<FieldType>
                name="preferredDays"
                label="Ngày trong tuần"
              >
                <Select
                  mode="multiple"
                  placeholder="Chọn các ngày thích chơi"
                  options={dayOptions}
                  maxTagCount={3}
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Time Range */}
          <Col span={24}>
            <Card title="Khung giờ thích chơi" size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item<FieldType>
                    name={["preferredTimeRange", "from"]}
                    label="Từ giờ"
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Chọn giờ bắt đầu"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<FieldType>
                    name={["preferredTimeRange", "to"]}
                    label="Đến giờ"
                  >
                    <TimePicker
                      format="HH:mm"
                      placeholder="Chọn giờ kết thúc"
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Bio */}
          <Col span={24}>
            <Card title="Giới thiệu bản thân" size="small">
              <Form.Item<FieldType> name="bio" label="Mô tả ngắn">
                <TextArea
                  rows={4}
                  placeholder="Giới thiệu về bản thân, sở thích thể thao..."
                  maxLength={500}
                  showCount
                />
              </Form.Item>
            </Card>
          </Col>

          {/* Emergency Contact */}
          <Col span={24}>
            <Card title="Liên hệ khẩn cấp" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item<FieldType>
                    name={["emergencyContact", "name"]}
                    label="Tên người liên hệ"
                  >
                    <Input placeholder="Nhập tên" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<FieldType>
                    name={["emergencyContact", "phone"]}
                    label="Số điện thoại"
                  >
                    <Input placeholder="Nhập số điện thoại" />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<FieldType>
                    name={["emergencyContact", "relationship"]}
                    label="Mối quan hệ"
                  >
                    <Input placeholder="Ví dụ: Bạn bè, Gia đình..." />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Notification Settings */}
          <Col span={24}>
            <Card title="Cài đặt thông báo" size="small">
              <Row gutter={16}>
                <Col span={8}>
                  <Form.Item<FieldType>
                    name={["notificationSettings", "email"]}
                    label="Thông báo qua Email"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<FieldType>
                    name={["notificationSettings", "push"]}
                    label="Thông báo Push"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
                <Col span={8}>
                  <Form.Item<FieldType>
                    name={["notificationSettings", "sms"]}
                    label="Thông báo SMS"
                    valuePropName="checked"
                  >
                    <Switch />
                  </Form.Item>
                </Col>
              </Row>
            </Card>
          </Col>

          {/* Submit Button */}
          <Col span={24}>
            <div style={{ textAlign: "center", marginTop: "20px" }}>
              <Button
                type="primary"
                size="large"
                htmlType="submit"
                loading={isSubmit}
              >
                Cập nhật sở thích
              </Button>
            </div>
          </Col>
        </Row>
      </Form>
    </div>
  );
};

export default UserPreferences;
