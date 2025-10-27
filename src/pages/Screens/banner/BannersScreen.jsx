import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Popconfirm } from "antd"; // 🔧 ADD Popconfirm
import {
  EditOutlined,
  DeleteOutlined,
  SettingOutlined,
  PlusOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../hooks/useFetch";
import { BannerModal } from "./modal/Modal";
import { BannerContentModal } from "./modal/ContentModal";

const BannersScreen = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [contentModalOpen, setContentModalOpen] = useState(false);
  const [record, setRecord] = useState(null);
  const [contentRecord, setContentRecord] = useState(null);
  const [bannersData, setBannersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [categories, setCategories] = useState([]);

  // API call for banners
  const getBanners = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await apiCall({
        pathname: "/admin/banners",
        method: "GET",
        auth: true,
      });

      if (data?.unauthorized) {
        message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
        navigate("/auth");
        return;
      }

      if (data && !data.error) {
        setBannersData(Array.isArray(data) ? data : []);
      } else {
        message.error("فشل في تحميل البانرات");
        setBannersData([]);
      }
    } catch (error) {
      console.error("Failed to fetch banners:", error);
      message.error("حدث خطأ في تحميل البانرات");
      setBannersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getBanners();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const cats = await apiCall({
          pathname: "/admin/categories",
          method: "GET",
          auth: true,
        });
        if (cats && !cats.error) setCategories(cats.data || cats);
      } catch {}
    };
    fetchCategories();
  }, []);

  // 🔧 NEW: Add handleDeleteClick function like other screens
  const handleDeleteClick = async (id) => {
    try {
      const response = await apiCall({
        pathname: `/admin/banners/${id}`,
        method: "DELETE",
        auth: true,
      });

      if (response && !response.error) {
        message.success("تم حذف البانر بنجاح");
        getBanners(); // Refresh the data
      } else {
        message.error("فشل في حذف البانر");
      }
    } catch (error) {
      console.error("Delete error:", error);
      message.error("حدث خطأ أثناء حذف البانر");
    }
  };

  const handleAddClick = () => {
    setRecord(null);
    setModalMode("create");
    setIsOpen(true);
  };

  const handleEditClick = (record) => {
    setRecord(record);
    setModalMode("edit");
    setIsOpen(true);
  };
  const renderBannerContent = (record) => {
    let mapData =
      Array.isArray(record.map) && record.map[0] ? record.map[0] : {};

    switch (record.type) {
      case "Category":
        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setContentRecord(record);
              setContentModalOpen(true);
            }}
          >
            {record?.map?.length > 0
              ? `فئة: ${record?.map?.length}`
              : "فئة: غير محدد"}
          </Button>
        );

      case "Single":
        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setContentRecord(record);
              setContentModalOpen(true);
            }}
          >
            {mapData.link ? `رابط: ${mapData.link}` : "لا يوجد رابط"}
          </Button>
        );

      case "Timer":
        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setContentRecord(record);
              setContentModalOpen(true);
            }}
          >
            {mapData.products && mapData.products.length > 0
              ? `عرض موقت (${mapData.products.length} منتج)`
              : "لا يوجد منتجات"}
          </Button>
        );

      case "List":
        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setContentRecord(record);
              setContentModalOpen(true);
            }}
          >
            {mapData.productIds && mapData.productIds.length > 0
              ? `قائمة (${mapData.productIds.length} منتج)`
              : "قائمة فارغة"}
          </Button>
        );

      case "Slider":
        return (
          <Button
            type="link"
            size="small"
            onClick={() => {
              setContentRecord(record);
              setContentModalOpen(true);
            }}
          >
            {mapData.link ? `رابط: ${mapData.link}` : "سليدر فارغ"}
          </Button>
        );

      default:
        return <span style={{ color: "#999" }}>بدون محتوى</span>;
    }
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
      title: "النوع",
      dataIndex: "type",
      key: "type",
      width: 120,
      render: (type) => {
        const getTypeColor = (type) => {
          switch (type?.toLowerCase()) {
            case "category":
              return "blue";
            case "slider":
              return "purple";
            case "timer":
              return "orange";
            case "list":
              return "green";
            case "single":
              return "magenta";
            case "featured":
              return "cyan";
            default:
              return "default";
          }
        };
        return (
          <Tag color={getTypeColor(type)} style={{ borderRadius: "12px" }}>
            {type}
          </Tag>
        );
      },
    },
    {
      title: "الأولوية",
      dataIndex: "priority",
      key: "priority",
      width: 100,
      sorter: (a, b) => a.priority - b.priority,
      render: (priority) => <Tag color="blue">{priority}</Tag>,
    },
    {
      title: "المحتوى",
      key: "content",
      width: 250,
      render: (_, record) => renderBannerContent(record),
    },
    {
      title: "الحالة",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active, record) => (
        <Tag color={active ? "green" : "orange"}>
          {active ? "نشط" : "غير نشط"}
        </Tag>
      ),
    },
    {
      title: "اللون",
      dataIndex: "background", // <-- use 'background' instead of 'color'
      key: "background",
      width: 80,
      render: (background) => (
        <div
          style={{
            width: 30,
            height: 20,
            backgroundColor: background || "#f0f0f0",
            border: "1px solid #d9d9d9",
            borderRadius: "4px",
            display: "inline-block",
          }}
          title={background}
        />
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
          return new Date(date).toLocaleDateString("ar");
        } catch (error) {
          return "تاريخ غير صحيح";
        }
      },
    },
    {
      title: "الإجراءات",
      key: "actions",
      fixed: "right",
      width: 140,
      render: (_, record) => (
        <div style={{ display: "flex", gap: "4px" }}>
          <Button
            icon={<SettingOutlined />}
            size="small"
            title="تعديل المحتوى"
            onClick={(e) => {
              e.stopPropagation();
              setContentRecord(record);
              setContentModalOpen(true);
            }}
          />
          <Button
            icon={<EditOutlined />}
            size="small"
            title="تعديل"
            onClick={() => {
              handleEditClick(record);
            }}
          />

          <Popconfirm
            title="حذف البانر"
            description="هل أنت متأكد من حذف هذا البانر؟"
            onConfirm={() => handleDeleteClick(record.id)}
            okText="نعم"
            cancelText="إلغاء"
            okType="danger"
            icon={<ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />}
            placement="topRight"
          >
            <Button icon={<DeleteOutlined />} size="small" danger title="حذف" />
          </Popconfirm>
        </div>
      ),
    },
  ];

  const handleModalSuccess = () => {
    getBanners();
  };

  const handleContentModalSuccess = () => {
    getBanners();
    setContentModalOpen(false);
    setContentRecord(null);
  };

  return (
    <div style={{ padding: "24px" }}>
      {/* Header section matching other screens */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "24px",
        }}
      >
        <div>
          <h1 style={{ margin: 0 }}>إدارة البانرات</h1>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
            {loading ? "جاري التحميل..." : `العدد: ${bannersData.length} بانر`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button
            icon={<ReloadOutlined />}
            onClick={getBanners}
            loading={loading}
          >
            تحديث
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
          >
            إضافة بانر جديد
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={bannersData}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} من ${total} بانر`,
        }}
        locale={{
          emptyText: loading ? "جاري التحميل..." : "لا توجد بانرات",
        }}
      />

      <BannerModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        record={record}
        setRecord={setRecord}
        onSuccess={handleModalSuccess}
      />

      <BannerContentModal
        isOpen={contentModalOpen}
        setIsOpen={setContentModalOpen}
        record={contentRecord}
        setRecord={setContentRecord}
        onSuccess={handleContentModalSuccess}
      />
    </div>
  );
};

export default BannersScreen;
