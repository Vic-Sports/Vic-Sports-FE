import { useCurrentApp } from "@/components/context/app.context";
import { updateUserInfoAPI, uploadFileAPI } from "@/services/api";
import {
    AntDesignOutlined,
    EnvironmentOutlined,
    MailOutlined,
    PhoneOutlined,
    UploadOutlined,
    UserOutlined
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
    Upload
} from "antd";
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
  const [isSubmit, setIsSubmit] = useState(false);
  const { message, notification } = App.useApp();

  const urlAvatar = `${
    import.meta.env.VITE_BACKEND_URL
  }/images/avatar/${userAvatar}`;

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        _id: user.id,
        email: user.email,
        phone: user.phone,
        fullName: user.fullName,
        dateOfBirth: user.dateOfBirth ? dayjs(user.dateOfBirth) : null,
        gender: user.gender || undefined,
        address: {
          province: user.address?.province || "",
          district: user.address?.district || "",
          ward: user.address?.ward || "",
          street: user.address?.street || ""
        }
      });
    }
  }, [user]);

  const handleUploadFile = async (options: RcCustomRequestOptions) => {
    const { onSuccess } = options;
    const file = options.file as UploadFile;
    const res = await uploadFileAPI(file, "avatar");

    if (res && res.data) {
      const newAvatar = res.data.fileUploaded;
      setUserAvatar(newAvatar);

      if (onSuccess) onSuccess("ok");
    } else {
      message.error(res.message);
    }
  };

  const propsUpload = {
    maxCount: 1,
    multiple: false,
    showUploadList: false,
    customRequest: handleUploadFile,
    onChange(info: UploadChangeParam) {
      if (info.file.status !== "uploading") {
        //do
      }
      if (info.file.status === "done") {
        message.success(`Upload file thành công`);
      } else if (info.file.status === "error") {
        message.error(`Upload file thất bại`);
      }
    }
  };

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { fullName, phone, _id, dateOfBirth, gender, address } = values;
    setIsSubmit(true);

    const formattedValues = {
      fullName,
      phone,
      dateOfBirth: dateOfBirth ? dateOfBirth.toISOString() : null,
      gender,
      address
    };

    const res = await updateUserInfoAPI(_id, userAvatar, formattedValues);

    if (res && res.data) {
      //update react context
      setUser({
        ...user!,
        avatar: userAvatar,
        fullName,
        phone,
        dateOfBirth: formattedValues.dateOfBirth,
        gender,
        address
      });
      message.success("Cập nhật thông tin user thành công");

      //force renew token
      localStorage.removeItem("access_token");
      sessionStorage.removeItem("access_token");
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message
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
                  src={urlAvatar}
                  shape="circle"
                />
              </Col>
              <Col flex="1">
                <Title level={4} style={{ margin: 0 }}>
                  <UserOutlined /> Thông tin cá nhân
                </Title>
                <Text type="secondary">
                  Cập nhật thông tin cá nhân và ảnh đại diện
                </Text>
              </Col>
              <Col>
                <Upload {...propsUpload}>
                  <Button icon={<UploadOutlined />} type="primary">
                    Thay đổi ảnh
                  </Button>
                </Upload>
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
                      { required: true, message: "Email không được để trống!" }
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
                        message: "Tên hiển thị không được để trống!"
                      }
                    ]}
                  >
                    <Input
                      prefix={<UserOutlined />}
                      placeholder="Nhập tên hiển thị"
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
                        message: "Số điện thoại không được để trống!"
                      }
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
