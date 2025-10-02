import { useEffect, useState } from "react";
import {
  App,
  Divider,
  Form,
  Input,
  Modal,
  Select,
  DatePicker,
  InputNumber
} from "antd";
import type { FormProps } from "antd";
import { updateUserAPI } from "@/services/api";
import dayjs from "dayjs";

interface IProps {
  openModalUpdate: boolean;
  setOpenModalUpdate: (v: boolean) => void;
  refreshTable: () => void;
  setDataUpdate: (v: IUserTable | null) => void;
  dataUpdate: IUserTable | null;
}

type FieldType = {
  _id: string;
  email: string;
  fullName: string;
  phone: string;
  role?: string;
  status?: string;
  gender?: string;
  dateOfBirth?: any;
  rewardPoints?: number;
  address?: {
    city?: string;
    district?: string;
    ward?: string;
    street?: string;
  };
};

const UpdateUser = (props: IProps) => {
  const {
    openModalUpdate,
    setOpenModalUpdate,
    refreshTable,
    setDataUpdate,
    dataUpdate
  } = props;
  const [isSubmit, setIsSubmit] = useState<boolean>(false);
  const { message, notification } = App.useApp();

  // https://ant.design/components/form#components-form-demo-control-hooks
  const [form] = Form.useForm();

  useEffect(() => {
    if (dataUpdate) {
      form.setFieldsValue({
        _id: dataUpdate._id,
        fullName: dataUpdate.fullName,
        email: dataUpdate.email,
        phone: dataUpdate.phone,
        role: (dataUpdate as any).role,
        status: (dataUpdate as any).status,
        gender: (dataUpdate as any).gender,
        rewardPoints: (dataUpdate as any).rewardPoints,
        dateOfBirth: (dataUpdate as any).dateOfBirth
          ? dayjs((dataUpdate as any).dateOfBirth)
          : null,
        address: (dataUpdate as any).address || {}
      });
    }
  }, [dataUpdate]);

  const onFinish: FormProps<FieldType>["onFinish"] = async (values) => {
    const {
      _id,
      fullName,
      phone,
      role,
      status,
      gender,
      rewardPoints,
      dateOfBirth,
      address
    } = values;
    setIsSubmit(true);
    const payload: any = {
      fullName,
      phone,
      role,
      status,
      gender,
      rewardPoints,
      address
    };
    if (dateOfBirth) payload.dateOfBirth = dayjs(dateOfBirth).toISOString();
    const res = await updateUserAPI(_id, payload);
    if (res && res.data) {
      message.success("Cập nhật user thành công");
      form.resetFields();
      setOpenModalUpdate(false);
      setDataUpdate(null);
      refreshTable();
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message
      });
    }
    setIsSubmit(false);
  };

  return (
    <>
      <Modal
        title="Cập nhật người dùng"
        open={openModalUpdate}
        onOk={() => {
          form.submit();
        }}
        onCancel={() => {
          setOpenModalUpdate(false);
          setDataUpdate(null);
          form.resetFields();
        }}
        okText={"Cập nhật"}
        cancelText={"Hủy"}
        confirmLoading={isSubmit}
      >
        <Divider />

        <Form
          form={form}
          name="form-update"
          style={{ maxWidth: 600 }}
          onFinish={onFinish}
          autoComplete="off"
        >
          <Form.Item<FieldType>
            hidden
            labelCol={{ span: 24 }}
            label="_id"
            name="_id"
            rules={[{ required: true, message: "Vui lòng nhập _id!" }]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Role"
            name="role"
          >
            <Select
              options={[
                { value: "customer", label: "customer" },
                { value: "owner", label: "owner" },
                { value: "coach", label: "coach" },
                { value: "admin", label: "admin" }
              ]}
            />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Status"
            name="status"
          >
            <Select
              options={[
                { value: "ACTIVE", label: "ACTIVE" },
                { value: "INACTIVE", label: "INACTIVE" },
                { value: "BANNED", label: "BANNED" }
              ]}
            />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Gender"
            name="gender"
          >
            <Select
              options={[
                { value: "male", label: "male" },
                { value: "female", label: "female" },
                { value: "other", label: "other" }
              ]}
            />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Date of Birth"
            name="dateOfBirth"
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Reward Points"
            name="rewardPoints"
          >
            <InputNumber style={{ width: "100%" }} min={0} />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="City"
            name={["address", "city"]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="District"
            name={["address", "district"]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Ward"
            name={["address", "ward"]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Street"
            name={["address", "street"]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Email"
            name="email"
            rules={[
              { required: true, message: "Vui lòng nhập email!" },
              { type: "email", message: "Email không đúng định dạng!" }
            ]}
          >
            <Input disabled />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Tên hiển thị"
            name="fullName"
            rules={[{ required: true, message: "Vui lòng nhập tên hiển thị!" }]}
          >
            <Input />
          </Form.Item>

          <Form.Item<FieldType>
            labelCol={{ span: 24 }}
            label="Số điện thoại"
            name="phone"
            rules={[
              { required: true, message: "Vui lòng nhập số điện thoại!" }
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default UpdateUser;
