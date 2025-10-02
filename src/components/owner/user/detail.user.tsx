import { FORMATE_DATE_VN } from "@/services/helper";
import { Avatar, Badge, Descriptions, Drawer, Tag } from "antd";
import { useEffect, useState } from "react";
import { getUserDetailsAPI } from "@/services/api";
import dayjs from "dayjs";

interface IProps {
  openViewDetail: boolean;
  setOpenViewDetail: (v: boolean) => void;
  dataViewDetail: IUserTable | null;
  setDataViewDetail: (v: IUserTable | null) => void;
}
const DetailUser = (props: IProps) => {
  const {
    openViewDetail,
    setOpenViewDetail,
    dataViewDetail,
    setDataViewDetail
  } = props;

  const [fullUser, setFullUser] = useState<any | null>(null);

  useEffect(() => {
    const fetchDetails = async () => {
      if (openViewDetail && dataViewDetail?._id) {
        const res = await getUserDetailsAPI(dataViewDetail._id);
        if (res && res.data) setFullUser(res.data);
      }
    };
    fetchDetails();
  }, [openViewDetail, dataViewDetail?._id]);

  const onClose = () => {
    setOpenViewDetail(false);
    setDataViewDetail(null);
    setFullUser(null);
  };

  const avatarURL = `${import.meta.env.VITE_BACKEND_URL}/images/avatar/${
    dataViewDetail?.avatar
  }`;
  return (
    <>
      <Drawer
        title="Chức năng xem chi tiết"
        width={"50vw"}
        onClose={onClose}
        open={openViewDetail}
      >
        <Descriptions title="Thông tin user" bordered column={2}>
          <Descriptions.Item label="Id">
            {dataViewDetail?._id}
          </Descriptions.Item>
          <Descriptions.Item label="Tên hiển thị">
            {dataViewDetail?.fullName}
          </Descriptions.Item>
          <Descriptions.Item label="Email">
            {dataViewDetail?.email}
          </Descriptions.Item>
          <Descriptions.Item label="Số điện thoại">
            {dataViewDetail?.phone}
          </Descriptions.Item>

          <Descriptions.Item label="Role">
            <Badge
              status="processing"
              text={(
                fullUser?.role ||
                dataViewDetail?.role ||
                "-"
              )?.toUpperCase()}
            />
          </Descriptions.Item>
          <Descriptions.Item label="Avatar">
            <Avatar size={40} src={avatarURL}></Avatar>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag
              color={
                fullUser?.status === "ACTIVE"
                  ? "green"
                  : fullUser?.status === "INACTIVE"
                  ? "gold"
                  : "red"
              }
            >
              {fullUser?.status}
            </Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Reward Points">
            {fullUser?.rewardPoints}
          </Descriptions.Item>
          <Descriptions.Item label="Gender">
            {(fullUser?.gender || "-")?.toUpperCase()}
          </Descriptions.Item>
          <Descriptions.Item label="DOB">
            {fullUser?.dateOfBirth
              ? dayjs(fullUser?.dateOfBirth).format(FORMATE_DATE_VN)
              : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Address" span={2}>
            {fullUser?.address?.street || ""} {fullUser?.address?.ward || ""}{" "}
            {fullUser?.address?.district || ""} {fullUser?.address?.city || ""}
          </Descriptions.Item>
          <Descriptions.Item label="Social Login" span={2}>
            Google: {fullUser?.socialLogin?.google?.email || "-"} | Facebook:{" "}
            {fullUser?.socialLogin?.facebook?.email || "-"}
          </Descriptions.Item>
          <Descriptions.Item label="Created At">
            {dayjs(fullUser?.createdAt || dataViewDetail?.createdAt).format(
              FORMATE_DATE_VN
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Updated At">
            {dayjs(fullUser?.updatedAt || dataViewDetail?.updatedAt).format(
              FORMATE_DATE_VN
            )}
          </Descriptions.Item>
        </Descriptions>
      </Drawer>
    </>
  );
};
export default DetailUser;
