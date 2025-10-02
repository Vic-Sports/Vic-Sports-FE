import { useCurrentApp } from "@/components/context/app.context";
import { updateUserInfoAPI, uploadFileAPI } from "@/services/api";
import {
  AntDesignOutlined,
  EnvironmentOutlined,
  MailOutlined,
  PhoneOutlined,
  UploadOutlined,
  UserOutlined,
} from "@ant-design/icons";
import type { FormProps, UploadFile } from "antd";
import {
  App,
  Avatar,
  Button,
  Card,
  Col,
  DatePicker,
  Divider,
  Form,
  Input,
  Row,
  Select,
  Typography,
  Upload,
} from "antd";
import ImgCrop from "antd-img-crop";
import type { UploadChangeParam } from "antd/es/upload";
import dayjs from "dayjs";
import type { UploadRequestOption as RcCustomRequestOptions } from "rc-upload/lib/interface";
import { useEffect, useState } from "react";

const { Title, Text } = Typography;
const { Option } = Select;

type FieldType = {
  _id: string;
  email: string;
  fullName: string;
  phone: string;
  dateOfBirth: any;
  gender: string;
  address: {
    province: string;
    district: string;
    ward: string;
    street: string;
  };
};

const UserInfo = () => {
  const [form] = Form.useForm();
  const { user, setUser } = useCurrentApp();

  const [userAvatar, setUserAvatar] = useState(user?.avatar ?? "");
  const [avatarKey, setAvatarKey] = useState(Date.now()); // Key để force refresh avatar
  const [displayName, setDisplayName] = useState(
    user?.fullName ?? "Người dùng"
  );
  const [isSubmit, setIsSubmit] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const { message, notification } = App.useApp();

  // Kiểm tra xem userAvatar đã là URL đầy đủ hay chỉ là tên file
  const urlAvatar = userAvatar
    ? userAvatar.startsWith("http")
      ? `${userAvatar}?t=${avatarKey}` // Đã là URL đầy đủ (Cloudinary) + timestamp
      : `${
          import.meta.env.VITE_BACKEND_URL
        }/images/avatar/${userAvatar}?t=${avatarKey}` // Chỉ là tên file + timestamp
    : null;

  // Đồng bộ userAvatar khi user thay đổi
  useEffect(() => {
    if (user?.avatar && user.avatar !== userAvatar) {
      setUserAvatar(user.avatar);
    }
  }, [user?.avatar, userAvatar]);

  useEffect(() => {
    // Luôn fetch lại user khi mở trang
    const fetchUser = async () => {
      try {
        const accountRes = await import("@/services/api").then((m) =>
          m.fetchAccountAPI()
        );
        if (accountRes && accountRes.data && accountRes.data.user) {
          setUser(accountRes.data.user);
          setUserAvatar(accountRes.data.user.avatar ?? "");
          setDisplayName(accountRes.data.user.fullName ?? "Người dùng");
          sessionStorage.setItem("user", JSON.stringify(accountRes.data.user));
          form.setFieldsValue({
            _id: accountRes.data.user.id,
            email: accountRes.data.user.email,
            phone: accountRes.data.user.phone ?? "",
            fullName: accountRes.data.user.fullName ?? "",
            dateOfBirth: accountRes.data.user.dateOfBirth
              ? dayjs(accountRes.data.user.dateOfBirth)
              : null,
            gender: accountRes.data.user.gender ?? "",
            address: {
              province: accountRes.data.user.address?.province ?? "",
              district: accountRes.data.user.address?.district ?? "",
              ward: accountRes.data.user.address?.ward ?? "",
              street: accountRes.data.user.address?.street ?? "",
            },
          });
          return;
        }
      } catch {
        // ignore error when fetching user
      }
      // fallback: dùng user từ context nếu có
      if (user) {
        setUserAvatar(user.avatar ?? "");
        setDisplayName(user.fullName ?? "Người dùng");
        form.setFieldsValue({
          _id: user.id,
          email: user.email,
          phone: user.phone ?? "",
          fullName: user.fullName ?? "",
          dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
          gender: user.gender ?? "",
          address: {
            province: user.address?.province ?? "",
            district: user.address?.district ?? "",
            ward: user.address?.ward ?? "",
            street: user.address?.street ?? "",
          },
        });
      }
    };
    fetchUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;

    setIsUploadingAvatar(true);

    try {
      const res = await uploadFileAPI(file, "avatar");

      if (res && res.data) {
        const newAvatar = res.data.fileUploaded;
        setUserAvatar(newAvatar);
        setAvatarKey(Date.now()); // Force refresh avatar

        // Tự động cập nhật avatar vào database ngay lập tức
        const formValues = form.getFieldsValue();
        const updateRes = await updateUserInfoAPI(formValues._id, newAvatar, {
          fullName: formValues.fullName,
          phone: formValues.phone,
          dateOfBirth: formValues.dateOfBirth
            ? formValues.dateOfBirth.toISOString()
            : null,
          gender: formValues.gender,
          address: formValues.address,
        });

        if (updateRes && updateRes.data) {
          // Cập nhật user context với thông tin mới
          const updatedUser = {
            ...user!,
            avatar: newAvatar,
            fullName: formValues.fullName,
            phone: formValues.phone,
            dateOfBirth: formValues.dateOfBirth
              ? formValues.dateOfBirth.toISOString()
              : null,
            gender: formValues.gender,
            address: formValues.address,
          };
          setUser(updatedUser);
          sessionStorage.setItem("user", JSON.stringify(updatedUser));
          message.success("Cập nhật ảnh đại diện thành công!");
        }

        if (onSuccess) onSuccess("ok");
      } else {
        message.error(res.message);
      }
    } catch {
      message.error(
        "Upload ảnh thành công nhưng có lỗi khi cập nhật thông tin!"
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const propsUpload = {
    maxCount: 1,
    multiple: false,
    showUploadList: false,
    accept: "image/*",
    customRequest: handleUploadFile,
    beforeUpload: (file: any) => {
      const isImage = file.type.startsWith("image/");
      if (!isImage) {
        message.error("Chỉ có thể upload file ảnh!");
        return false;
      }
      const isLt5M = file.size / 1024 / 1024 < 5;
      if (!isLt5M) {
        message.error("Kích thước ảnh phải nhỏ hơn 5MB!");
        return false;
      }
      return true;
    },
    onChange(info: UploadChangeParam) {
      if (info.file.status !== "uploading") {
        //do
      }
      if (info.file.status === "done") {
        message.success(`Upload ảnh đại diện thành công`);
      } else if (info.file.status === "error") {
        message.error(`Upload ảnh đại diện thất bại`);
      }
    },
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { fullName, phone, _id, dateOfBirth, gender, address } = values;
    setIsSubmit(true);

    const formattedValues = {
      fullName,
      phone,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
      gender,
      address,
    };

    const res = await updateUserInfoAPI(_id, userAvatar, formattedValues);

    if (res && res.data) {
      // Sau khi cập nhật, luôn fetch lại user từ backend để lấy đủ thông tin
      try {
        const accountRes = await import("@/services/api").then((m) =>
          m.fetchAccountAPI()
        );
        if (accountRes && accountRes.data && accountRes.data.user) {
          setUser(accountRes.data.user);
          setUserAvatar(accountRes.data.user.avatar ?? "");
          setDisplayName(accountRes.data.user.fullName ?? "Người dùng");
          sessionStorage.setItem("user", JSON.stringify(accountRes.data.user));
        }
      } catch {
        // fallback: chỉ cập nhật các trường vừa sửa
        const updatedUser = {
          ...user!,
          avatar: userAvatar,
          fullName,
          phone,
          dateOfBirth: formattedValues.dateOfBirth,
          gender,
          address,
        };
        setUser(updatedUser);
        setDisplayName(fullName);
        sessionStorage.setItem("user", JSON.stringify(updatedUser));
      }
      message.success("Cập nhật thông tin user thành công");
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message,
      });
    }
    setIsSubmit(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <Row gutter={[24, 24]}>
        {/* Avatar Section */}
        <Col span={24}>
          <Card>
            <Row gutter={24} align="middle">
              <Col>
                <Avatar
                  size={120}
                  icon={<AntDesignOutlined />}
                  src={urlAvatar || undefined}
                  shape="circle"
                />
              </Col>
              <Col flex="1">
                <Title level={4} style={{ margin: 0 }}>
                  <UserOutlined /> {displayName}
                </Title>
                <Text type="secondary">
                  Cập nhật thông tin cá nhân và ảnh đại diện
                </Text>
              </Col>
              <Col>
                <ImgCrop
                  rotationSlider
                  aspectSlider
                  showGrid
                  aspect={1}
                  quality={0.8}
                  modalTitle="Chỉnh sửa ảnh đại diện"
                  modalOk="Xác nhận"
                  modalCancel="Hủy"
                  cropShape="round"
                  showReset
                  resetText="Khôi phục"
                >
                  <Upload {...propsUpload}>
                    <Button
                      icon={<UploadOutlined />}
                      type="primary"
                      loading={isUploadingAvatar}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? "Đang cập nhật..." : "Thay đổi ảnh"}
                    </Button>
                  </Upload>
                </ImgCrop>
              </Col>
            </Row>
          </Card>
        </Col>

        {/* Form Section */}
        <Col span={24}>
          <Card>
            <Form
              onFinish={onFinish}
              form={form}
              name="user-info"
              autoComplete="off"
              layout="vertical"
            >
              <Form.Item<FieldType> hidden name="_id">
                <Input disabled hidden />
              </Form.Item>

              {/* Basic Information */}
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item<FieldType>
                    label="Email"
                    name="email"
                    rules={[
                      { required: true, message: "Email không được để trống!" },
                    ]}
                  >
                    <Input
                      prefix={<MailOutlined />}
                      disabled
                      placeholder="Email của bạn"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<FieldType>
                    label="Tên hiển thị"
                    name="fullName"
                    rules={[
                      {
                        required: true,
                        message: "Tên hiển thị không được để trống!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập tên hiển thị"
                      onChange={(e) =>
                        setDisplayName(e.target.value || "Người dùng")
                      }
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item<FieldType>
                    label="Số điện thoại"
                    name="phone"
                    rules={[
                      {
                        required: true,
                        message: "Số điện thoại không được để trống!",
                      },
                    ]}
                  >
                    <Input
                      prefix={<PhoneOutlined />}
                      placeholder="Nhập số điện thoại"
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item<FieldType> label="Ngày sinh" name="dateOfBirth">
                    <DatePicker
                      style={{ width: "100%" }}
                      placeholder="Chọn ngày sinh"
                      format="DD/MM/YYYY"
                    />
                  </Form.Item>
                </Col>
              </Row>

              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item<FieldType> label="Giới tính" name="gender">
                    <Select placeholder="Chọn giới tính">
                      <Option value="male">Nam</Option>
                      <Option value="female">Nữ</Option>
                      <Option value="other">Khác</Option>
                    </Select>
                  </Form.Item>
                </Col>
              </Row>

              <Divider>
                <EnvironmentOutlined /> Địa chỉ
              </Divider>

              <Row gutter={16}>
                <Col span={6}>
                  <Form.Item<FieldType>
                    label="Tỉnh/Thành phố"
                    name={["address", "province"]}
                  >
                    <Input placeholder="Nhập tỉnh/thành phố" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item<FieldType>
                    label="Quận/Huyện"
                    name={["address", "district"]}
                  >
                    <Input placeholder="Nhập quận/huyện" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item<FieldType>
                    label="Phường/Xã"
                    name={["address", "ward"]}
                  >
                    <Input placeholder="Nhập phường/xã" />
                  </Form.Item>
                </Col>
                <Col span={6}>
                  <Form.Item<FieldType>
                    label="Đường/Số nhà"
                    name={["address", "street"]}
                  >
                    <Input placeholder="Nhập đường/số nhà" />
                  </Form.Item>
                </Col>
              </Row>

              <div style={{ textAlign: "center", marginTop: "20px" }}>
                <Button
                  type="primary"
                  size="large"
                  htmlType="submit"
                  loading={isSubmit}
                >
                  Cập nhật thông tin
                </Button>
              </div>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserInfo;
