import { useRef, useState } from "react";
import { App, Button, Popconfirm, Tag } from "antd";
import { ActionType, ProColumns, ProTable } from "@ant-design/pro-components";
import DetailVenue from "@/components/admin/venue/detail.venue";
import {
  approveVenueAdminAPI,
  getPendingVenuesAdminAPI,
  rejectVenueAdminAPI
} from "@/services/venueApi";

type TVenue = any;

const ManageVenueAdminPage = () => {
  const actionRef = useRef<ActionType>();
  const { message, notification } = App.useApp();
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0
  });
  const [openDetail, setOpenDetail] = useState(false);
  const [detailVenue, setDetailVenue] = useState<{
    id?: string;
    name?: string;
  } | null>(null);

  const columns: ProColumns<TVenue>[] = [
    { dataIndex: "index", valueType: "indexBorder", width: 48 },
    {
      title: "Name",
      dataIndex: "name",
      render: (_, e) => (
        <a
          onClick={() => {
            setDetailVenue({ id: e._id, name: e.name });
            setOpenDetail(true);
          }}
        >
          {e.name}
        </a>
      )
    },
    { title: "Owner", dataIndex: ["ownerId", "fullName"] },
    { title: "Email", dataIndex: ["ownerId", "email"] },
    { title: "Phone", dataIndex: ["ownerId", "phone"] },
    {
      title: "Verified",
      dataIndex: "isVerified",
      render: (_, e) => (
        <Tag color={e.isVerified ? "green" : "gold"}>
          {e.isVerified ? "VERIFIED" : "PENDING"}
        </Tag>
      )
    },
    {
      title: "Action",
      valueType: "option",
      render: (_, entity) => [
        <Popconfirm
          key="approve"
          title="Duyệt venue"
          description="Xác nhận duyệt venue này?"
          onConfirm={async () => {
            const res = await approveVenueAdminAPI(entity._id);
            if (res && res.data) {
              message.success("Đã duyệt venue");
              await actionRef.current?.reload();
            } else {
              notification.error({ message: "Lỗi", description: res.message });
            }
          }}
        >
          <Button type="primary">Approve</Button>
        </Popconfirm>,
        <Popconfirm
          key="reject"
          title="Từ chối venue"
          description="Xác nhận từ chối venue này?"
          onConfirm={async () => {
            const res = await rejectVenueAdminAPI(entity._id);
            if (res && res.data) {
              message.success("Đã từ chối venue");
              await actionRef.current?.reload();
            } else {
              notification.error({ message: "Lỗi", description: res.message });
            }
          }}
        >
          <Button danger>Reject</Button>
        </Popconfirm>
      ]
    }
  ];

  return (
    <>
      <ProTable<TVenue>
        columns={columns}
        actionRef={actionRef}
        rowKey="_id"
        headerTitle="Pending Venues"
        request={async (params, sort) => {
          let query = "";
          if (params) {
            query += `current=${params.current}&pageSize=${params.pageSize}`;
            if (params.name) query += `&name=/${params.name}/i`;
          }

          if (sort && sort.createdAt) {
            query += `&sort=${
              sort.createdAt === "ascend" ? "createdAt" : "-createdAt"
            }`;
          } else query += `&sort=-createdAt`;

          const res = await getPendingVenuesAdminAPI(query);
          if (res.data) setMeta(res.data.meta);
          return {
            data: res.data?.result || [],
            success: true,
            total: res.data?.meta.total || 0
          };
        }}
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          total: meta.total,
          showSizeChanger: true
        }}
      />
      <DetailVenue
        open={openDetail}
        onClose={() => {
          setOpenDetail(false);
          setDetailVenue(null);
        }}
        venueId={detailVenue?.id}
        venueName={detailVenue?.name}
      />
    </>
  );
};

export default ManageVenueAdminPage;
