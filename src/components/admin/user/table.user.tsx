import {
  deleteUserAPI,
  getAdminUsersAPI,
  banUserAdminAPI,
  unbanUserAdminAPI
} from "@/services/api";
import { dateRangeValidate } from "@/services/helper";
import {
  CloudUploadOutlined,
  DeleteTwoTone,
  EditTwoTone,
  ExportOutlined,
  PlusOutlined
} from "@ant-design/icons";
import type { ActionType, ProColumns } from "@ant-design/pro-components";
import { ProTable } from "@ant-design/pro-components";
import { App, Button, Popconfirm } from "antd";
import { useRef, useState } from "react";
import DetailUser from "./detail.user";
import CreateUser from "./create.user";
import ImportUser from "./data/import.user";
import UpdateUser from "./update.user";
import { CSVLink } from "react-csv";

type TSearch = {
  fullName: string;
  email: string;
  createdAt: string;
  createdAtRange: string;
};

const TableUser = () => {
  const actionRef = useRef<ActionType>();
  const [meta, setMeta] = useState({
    current: 1,
    pageSize: 10,
    pages: 0,
    total: 0
  });

  const [openViewDetail, setOpenViewDetail] = useState<boolean>(false);
  const [dataViewDetail, setDataViewDetail] = useState<IUserTable | null>(null);

  const [openModalCreate, setOpenModalCreate] = useState<boolean>(false);
  const [openModalImport, setOpenModalImport] = useState<boolean>(false);

  const [currentDataTable, setCurrentDataTable] = useState<IUserTable[]>([]); // tạo state để lưu data để export

  const [openModalUpdate, setOpenModalUpdate] = useState<boolean>(false);
  const [dataUpdate, setDataUpdate] = useState<IUserTable | null>(null);

  const [isDeleteUser, setIsDeleteUser] = useState<boolean>(false);
  const { message, notification } = App.useApp();

  const handleDeleteUser = async (_id: string) => {
    setIsDeleteUser(true);
    const res = await deleteUserAPI(_id);
    if (res && res.data) {
      message.success("Xóa user thành công");
      refreshTable();
    } else {
      notification.error({
        message: "Đã có lỗi xảy ra",
        description: res.message
      });
    }
    setIsDeleteUser(false);
  };

  const columns: ProColumns<IUserTable>[] = [
    {
      title: "Id",
      dataIndex: "_id",
      hideInSearch: true,
      render(dom, entity) {
        return (
          <a
            onClick={() => {
              setDataViewDetail(entity);
              setOpenViewDetail(true);
            }}
            href="#"
          >
            {entity._id}
          </a>
        );
      }
    },
    {
      title: "Full Name",
      dataIndex: "fullName"
    },
    {
      title: "Email",
      dataIndex: "email",
      copyable: true
    },
    {
      dataIndex: "index",
      valueType: "indexBorder",
      width: 48
    },
    {
      title: "Role",
      dataIndex: "role",
      valueType: "select",
      valueEnum: {
        customer: { text: "customer" },
        owner: { text: "owner" },
        coach: { text: "coach" },
        admin: { text: "admin" }
      }
    },
    {
      title: "Status",
      dataIndex: "status",
      valueType: "select",
      valueEnum: {
        ACTIVE: { text: "ACTIVE" },
        INACTIVE: { text: "INACTIVE" },
        BANNED: { text: "BANNED" }
      }
    },

    {
      title: "Created At",
      dataIndex: "createdAt",
      valueType: "date",
      sorter: true,
      hideInSearch: true
      //   render(dom, entity, index, action, schema) {
      //     return <>{dayjs(entity.createdAt).format("DD-MM-YYYY")}</>;
      //   }
    },
    {
      title: "Created At",
      dataIndex: "createdAtRange",
      valueType: "dateRange",
      hideInTable: true
    },

    {
      title: "Action",
      hideInSearch: true,
      render(dom, entity) {
        const banned = (entity as any).isBlocked || entity.status === "BANNED";
        return (
          <>
            <EditTwoTone
              twoToneColor="#f57800"
              style={{ cursor: "pointer", marginRight: 15 }}
              onClick={() => {
                setDataUpdate(entity);
                setOpenModalUpdate(true);
              }}
            />
            {banned ? (
              <Button
                size="small"
                onClick={async () => {
                  const res = await unbanUserAdminAPI((entity as any)._id);
                  if ((res as any)?.success !== false) {
                    message.success("Đã mở khoá tài khoản");
                    refreshTable();
                  } else {
                    notification.error({
                      message: (res as any).message || "Không thể mở khoá"
                    });
                  }
                }}
                style={{ marginLeft: 10 }}
              >
                Unban
              </Button>
            ) : (
              <Popconfirm
                placement="leftTop"
                title={"Khoá tài khoản"}
                description={"Bạn có chắc chắn muốn khoá user này ?"}
                onConfirm={async () => {
                  const res = await banUserAdminAPI((entity as any)._id, {});
                  if ((res as any)?.success !== false) {
                    message.success("Đã khoá tài khoản");
                    refreshTable();
                  } else {
                    notification.error({
                      message: (res as any).message || "Không thể khoá"
                    });
                  }
                }}
                okText="Xác nhận"
                cancelText="Hủy"
              >
                <span style={{ cursor: "pointer", marginLeft: 20 }}>
                  <DeleteTwoTone twoToneColor="#ff4d4f" />
                </span>
              </Popconfirm>
            )}
          </>
        );
      }
    }
  ];

  const refreshTable = () => {
    actionRef.current?.reload();
  };

  return (
    <>
      <ProTable<IUserTable, TSearch>
        columns={columns}
        actionRef={actionRef}
        cardBordered
        request={async (params, sort, filter) => {
          const role = (filter?.role as string[])?.[0];
          const status = (filter?.status as string[])?.[0];
          const res = await getAdminUsersAPI({
            page: params?.current,
            limit: params?.pageSize,
            role,
            status,
            search: params?.fullName || params?.email,
            sortBy: "createdAt",
            sortOrder: sort?.createdAt === "ascend" ? "asc" : "desc"
          });
          // Handle error responses unified by axios interceptor
          if ((res as any)?.success === false) {
            notification.error({
              message: "Không thể tải danh sách user",
              description: (res as any)?.message || "Đã xảy ra lỗi"
            });
            return {
              data: [],
              page: 1,
              success: false,
              total: 0
            };
          }

          const users = (res as any)?.data?.users ?? [];
          const pagination = (res as any)?.data?.pagination;
          setCurrentDataTable(users as any);
          if (pagination) {
            setMeta({
              current: pagination.currentPage,
              pageSize: params?.pageSize || 10,
              pages: pagination.totalPages,
              total: pagination.totalUsers
            });
          }
          return {
            data: users as any,
            page: 1,
            success: true,
            total: pagination?.totalUsers || 0
          };
        }}
        rowKey="_id"
        pagination={{
          current: meta.current,
          pageSize: meta.pageSize,
          showSizeChanger: true,
          total: meta.total,
          showTotal: (total, range) => {
            return (
              <div>
                {" "}
                {range[0]}-{range[1]} trên {total} rows
              </div>
            );
          }
        }}
        headerTitle="Table user"
        toolBarRender={() => [
          <CSVLink data={currentDataTable} filename="export-user.csv">
            <Button icon={<ExportOutlined />} type="primary">
              Export
            </Button>
          </CSVLink>,
          <Button
            icon={<CloudUploadOutlined />}
            type="primary"
            onClick={() => setOpenModalImport(true)}
          >
            Import
          </Button>,

          <Button
            key="button"
            icon={<PlusOutlined />}
            onClick={() => {
              setOpenModalCreate(true);
            }}
            type="primary"
          >
            Add new
          </Button>
        ]}
      />
      <DetailUser
        openViewDetail={openViewDetail}
        setOpenViewDetail={setOpenViewDetail}
        dataViewDetail={dataViewDetail}
        setDataViewDetail={setDataViewDetail}
      />

      <CreateUser
        openModalCreate={openModalCreate}
        setOpenModalCreate={setOpenModalCreate}
        refreshTable={refreshTable}
      />

      <ImportUser
        openModalImport={openModalImport}
        setOpenModalImport={setOpenModalImport}
        refreshTable={refreshTable}
      />

      <UpdateUser
        openModalUpdate={openModalUpdate}
        setOpenModalUpdate={setOpenModalUpdate}
        refreshTable={refreshTable}
        setDataUpdate={setDataUpdate}
        dataUpdate={dataUpdate}
      />
    </>
  );
};

export default TableUser;
