import React, { useEffect, useState } from "react";
import { Table, Tag, Switch, Button, message, Popconfirm } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../hooks/useFetch";
import { CategoriesModal } from "./modal/categoriesModal";

const CategoriesScreen = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [record, setRecord] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState("edit");

  const getCategories = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await apiCall({
        pathname: "/admin/categories",
        method: "GET",
        auth: true,
      });

      if (data?.unauthorized) {
        message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
        navigate("/auth");
        return;
      }

      if (data && !data.error) {
        let categoriesArray = [];
        if (Array.isArray(data)) categoriesArray = data;
        else if (Array.isArray(data.data)) categoriesArray = data.data;
        else if (Array.isArray(data.categories)) categoriesArray = data.categories;

        setCategoriesData(categoriesArray);
      } else {
        message.error("فشل في تحميل الفئات");
        setCategoriesData([]);
      }
    } catch (error) {
      message.error("حدث خطأ في تحميل الفئات");
      setCategoriesData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCategories();
  }, []);

  const handleDeleteClick = async (id) => {
    const response = await apiCall({
      pathname: `/admin/categories/${id}`,
      method: "DELETE",
      auth: true,
    });
    if (response && !response.error) {
      message.success("تم حذف الفئة بنجاح");
      getCategories();
    } else {
      message.error("فشل في حذف الفئة");
    }
  };

  const handleEditClick = (record) => {
    setRecord(record);
    setModalMode("edit");
    setIsOpen(true);
  };

  const handleAddClick = () => {
    setRecord(null);
    setModalMode("create");
    setIsOpen(true);
  };


  const columns = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
      width: 60,
      sorter: (a, b) => a.id - b.id,
    },
    {
      title: "الاسم",
      dataIndex: "name",
      key: "name",
      width: 200,
      ellipsis: true,
    },
    {
      title: "الصورة",
      dataIndex: "image",
      key: "image",
      width: 100,
      render: (image) => {
        if (!image) {
          return <div style={{color: '#999', fontSize: '12px'}}>لا توجد صورة</div>;
        }

        // 🔧 Handle both relative and full URLs
        const imageUrl = image.startsWith('http') 
          ? image 
          : `http://localhost:3000${image}`;

        return (
          <img
            src={imageUrl}
            alt="Category"
            style={{
              width: 50,
              height: 50,
              objectFit: 'cover',
              borderRadius: 4,
              border: '1px solid #d9d9d9'
            }}

          />
        );
      },
    },
    {
      title: "الأولوية",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      render: (priority) => (
        <Tag color="blue">{priority}</Tag>
      ),
      sorter: (a, b) => a.priority - b.priority,
    },
    {
      title: "الحالة",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active) => (
        <Tag color={active ? "green" : "orange"}>
          {active ? "نشط" : "غير نشط"}
        </Tag>
      ),
    },
    {
      title: "تاريخ الإنشاء",
      dataIndex: "created_at",
      key: "created_at",
      width: 150,
      render: (date) => {
        if (!date) return "غير محدد";
        try {
          return new Date(date).toLocaleDateString('ar');
        } catch (error) {
          return "تاريخ غير صحيح";
        }
      },
    },
    {
      title: "الإجراءات",
      key: "actions",
      fixed: "right",
      width: 80,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <Button
            icon={<EditOutlined />}
            size="small"
            title="تعديل"
            onClick={() => {
              handleEditClick(record);
            }}
          />
          <Popconfirm
            title="حذف الفئة"
            description="هل أنت متأكد من حذف هذه الفئة؟"
            onConfirm={() => handleDeleteClick(record.id)}
            okText="نعم"
            cancelText="إلغاء"
          >
            <Button icon={<DeleteOutlined />} size="small" danger title="حذف" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  return (
    <div style={{ padding: "24px" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>إدارة الفئات</h1>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
            {loading ? "جاري التحميل..." : `العدد: ${categoriesData.length} فئة`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={getCategories} loading={loading}>
            تحديث
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
          >
            إضافة فئة جديدة
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={categoriesData}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1000 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} من ${total} فئة`,
        }}
        locale={{
          emptyText: loading ? "جاري التحميل..." : "لا توجد فئات",
        }}
      />

      <CategoriesModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        record={record}
        setRecord={setRecord}
        mode={modalMode}
        onSuccess={() => {
          getCategories();
        }}
      />
    </div>
  );
};

export default CategoriesScreen;