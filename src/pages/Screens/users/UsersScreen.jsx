import React, { useState } from "react";
import { Table, Tag, Button } from "antd";
import useFetch from "../../../hooks/useFetch";

const UsersScreen = ({ onEdit, onDelete, onView }) => {
  const [modalOpen, setModalOpen] = useState(false);

  // API call for users
  const usersData = useFetch("/admin/users", {
    transform: (response) => {
      console.log("Users response:", response);
      return response?.data || response?.users || response || [];
    },
    errorMessage: "فشل في تحميل المستخدمين",
  });

  // Users columns
  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
    },
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
      width: 150,
    },
    {
      title: "اسم المستخدم",
      dataIndex: "user_name",
      key: "user_name",
      width: 120,
    },
    {
      title: "الهاتف",
      dataIndex: "phone",
      key: "phone",
      width: 120,
    },
    {
      title: "البريد الإلكتروني",
      dataIndex: "email",
      key: "email",
      ellipsis: true,
      width: 200,
    },
    {
      title: "الصورة الشخصية",
      dataIndex: "avatar",
      key: "avatar",
      width: 80,
      render: (avatar, record) => (
        <img
          src={avatar}
          alt={record.name}
          style={{
            width: 40,
            height: 40,
            objectFit: "cover",
            borderRadius: "50%",
            border: "2px solid #f0f0f0",
          }}
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${record.name}&background=random&size=40`;
          }}
        />
      ),
    },
    {
      title: "نشط",
      dataIndex: "active",
      key: "active",
      width: 80,
      render: (active) => (
        <Tag color={active ? "green" : "red"}>{active ? "نشط" : "غير نشط"}</Tag>
      ),
    },
    {
      title: "تاريخ الإنشاء",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => {
        const formattedDate = new Date(date).toLocaleDateString("ar");
        return formattedDate;
      },
    },
    
  ];
  return (
    <div>
      <Table
        columns={columns}
        dataSource={usersData.data || []}
        loading={usersData.loading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} من ${total} مستخدم`,
        }}
      />
    </div>
  );
};

export default UsersScreen;
