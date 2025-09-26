import { useCurrentApp } from "@/components/context/app.context";
import { changePasswordAPI } from "@/services/api";
import { App, Button, Col, Form, Input, Row } from "antd";
import { useEffect, useState } from "react";
import type { FormProps } from "antd";

type FieldType = {
  email: string;
  oldpass: string;
  newpass: string;
};

const ChangePassword = () => {
  const [form] = Form.useForm();
  const [isSubmit, setIsSubmit] = useState(false);
  const { user } = useCurrentApp();
  const { message, notification } = App.useApp();

  useEffect(() => {
    if (user) {
      form.setFieldValue("email", user.email);
    }
  }, [user]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const { oldpass, newpass } = values;
    setIsSubmit(true);
    try {
      const token =
        localStorage.getItem("access_token") ||
        sessionStorage.getItem("access_token");
      const res = await changePasswordAPI(oldpass, newpass, token || "");
      if (res && res.data) {
        message.success("Cập nhật mật khẩu thành công");
        form.setFieldValue("oldpass", "");
        form.setFieldValue("newpass", "");
        form.setFieldValue("confirmNewpass", "");
      } else {
        notification.error({
          message: "Đã có lỗi xảy ra",
          description: res.data?.message || "",
        });
      }
    } catch (err: any) {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: err?.response?.data?.message || err.message || "",
      });
    }
    setIsSubmit(false);
  };

  return (
    <div style={{ minHeight: 400 }}>
      <Row>
        <Col span={1}></Col>
        <Col span={12}>
          <Form
            name="change-password"
            onFinish={onFinish}
            autoComplete="off"
            form={form}
          >
            <Form.Item<FieldType>
              labelCol={{ span: 24 }} //whole column
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Email không được để trống!" },
              ]}
            >
              <Input disabled />
            </Form.Item>

            <Form.Item<FieldType>
              labelCol={{ span: 24 }} //whole column
              label="Mật khẩu hiện tại"
              name="oldpass"
              rules={[
                { required: true, message: "Mật khẩu không được để trống!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item<FieldType>
              labelCol={{ span: 24 }} //whole column
              label="Mật khẩu mới"
              name="newpass"
              rules={[
                { required: true, message: "Mật khẩu không được để trống!" },
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item
              labelCol={{ span: 24 }}
              label="Xác nhận mật khẩu mới"
              name="confirmNewpass"
              dependencies={["newpass"]}
              rules={[
                { required: true, message: "Vui lòng xác nhận mật khẩu mới!" },
                ({ getFieldValue }) => ({
                  validator(_, value) {
                    if (!value || getFieldValue("newpass") === value) {
                      return Promise.resolve();
                    }
                    return Promise.reject(
                      new Error("Mật khẩu xác nhận không khớp!")
                    );
                  },
                }),
              ]}
            >
              <Input.Password />
            </Form.Item>

            <Form.Item>
              <Button type="primary" htmlType="submit" loading={isSubmit}>
                Xác nhận
              </Button>
            </Form.Item>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default ChangePassword;
