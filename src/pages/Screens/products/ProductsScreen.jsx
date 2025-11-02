import React, { useEffect, useState } from "react";
import { Table, Tag, Button, message, Modal, Popconfirm, Select } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
  PictureOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../hooks/useFetch";
import { ProductModal } from "./modal/ProductModal";
import { ImageModal } from "./modal/ImageModal";

const ProductsScreen = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [record, setRecord] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState("edit");
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState(null);
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
  });
  const [total, setTotal] = useState(0);
  const [searchText, setSearchText] = useState("");
  const [filteredProducts, setFilteredProducts] = useState([]);

  const getProducts = async (page = pagination.current, limit = pagination.pageSize) => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await apiCall({
        pathname: `/admin/products?page=${page}&limit=${limit}`,
        method: "GET",
        auth: true,
      });

      if (data?.unauthorized) {
        message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
        navigate("/auth");
        return;
      }

      let productsArray = [];
      if (Array.isArray(data)) productsArray = data;
      else if (Array.isArray(data.data)) productsArray = data.data;
      else if (Array.isArray(data.products)) productsArray = data.products;

      setProductsData(productsArray);
      setFilteredProducts(productsArray); // <-- Add this line
      setTotal(data?.total || productsArray.length); // Adjust if your API returns total
    } catch (error) {
      message.error("حدث خطأ في تحميل المنتجات");
      setProductsData([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getProducts(pagination.current, pagination.pageSize);
    // eslint-disable-next-line
  }, [pagination.current, pagination.pageSize]);

  useEffect(() => {
    if (searchText.trim() === "") {
      setFilteredProducts(productsData);
    } else {
      const lower = searchText.toLowerCase();
      setFilteredProducts(
        productsData.filter(
          (p) =>
            p.name?.toLowerCase().includes(lower) ||
            p.description?.toLowerCase().includes(lower)
        )
      );
    }
  }, [searchText, productsData]);

  const handleDeleteClick = async (id) => {
    const response = await apiCall({
      pathname: `/admin/products/${id}`,
      method: "DELETE",
      auth: true,
    });
    if (response && !response.error) {
      message.success("تم حذف المنتج بنجاح");
      getProducts();
    } else {
      message.error("فشل في حذف المنتج");
    }
  };

  const handleEditClick = (record) => {
    console.log("✏️ Edit button clicked for:", record.name);
    setRecord(record);
    setModalMode("edit");
    setIsOpen(true);
  };

  const handleAddClick = () => {
    console.log("➕ Add new product button clicked");
    setRecord(null);
    setModalMode("create");
    setIsOpen(true);
  };

  const getFallbackImage = (width = 50, height = 50, text = "IMG") => {
    return `data:image/svg+xml;base64,${btoa(`
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-size="12" text-anchor="middle" dy=".3em" fill="#999">${text}</text>
      </svg>
    `)}`;
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
      width: 150,
      ellipsis: true,
    },
    {
      title: "الوصف",
      dataIndex: "description",
      key: "description",
      ellipsis: true,
      width: 200,
      render: (text) => text || "غير محدد",
    },
    {
      title: "الصورة",
      dataIndex: "image",
      key: "image",
      width: 80,
      render: (image) => (
        <img
          src={image || getFallbackImage(50, 50)}
          alt="product"
          style={{
            width: 50,
            height: 50,
            objectFit: "cover",
            borderRadius: "6px",
            border: "1px solid #f0f0f0",
          }}
          onError={(e) => {
            e.target.src = getFallbackImage(50, 50);
          }}
        />
      ),
    },
    {
      title: "السعر",
      dataIndex: "price",
      key: "price",
      width: 100,
      render: (price, record) => (
        <div>
          <div>${price}</div>
          {record.endprice && record.endprice < price && (
            <div style={{ fontSize: "12px", color: "#ff4d4f" }}>
              خصم: ${record.endprice}
            </div>
          )}
        </div>
      ),
      sorter: (a, b) => a.price - b.price,
    },
    {
      title: "المخزون",
      dataIndex: "stock",
      key: "stock",
      width: 80,
      render: (stock) => (
        <Tag color={stock > 10 ? "green" : stock > 0 ? "orange" : "red"}>
          {stock}
        </Tag>
      ),
      sorter: (a, b) => a.stock - b.stock,
    },
    {
  title: "التوفر",
  dataIndex: "available",
  key: "available",
  width: 100,
  render: (available, record) => {
    if (record.stock === 0) {
      return (
        <div>
          <Tag color="red">غير متوفر</Tag>
          <div style={{ fontSize: "10px", color: "#ff4d4f", marginTop: "2px" }}>
            نفد المخزون
          </div>
        </div>
      );
    }
    return (
      <Tag color="green">متوفر</Tag>
    );
  },
},
    {
      title: "نشط",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active) => (
        <Tag color={active ? "blue" : "orange"}>{active ? "نشط" : "مخفي"}</Tag>
      ),
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
            title="حذف المنتج"
            description="هل أنت متأكد من حذف هذا المنتج؟"
            onConfirm={() => handleDeleteClick(record.id)}
            okText="نعم"
            cancelText="إلغاء"
          >
            <Button icon={<DeleteOutlined />} size="small" danger title="حذف" />
          </Popconfirm>
          <Button
            icon={<PictureOutlined />}
            size="small"
            title="إدارة صور المنتج"
            onClick={() => {
              setSelectedProductId(record.id);
              setImageModalOpen(true);
            }}
          />
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
          <h1 style={{ margin: 0 }}>إدارة المنتجات</h1>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
            {loading ? "جاري التحميل..." : `العدد: ${productsData.length} منتج`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <input
            type="text"
            placeholder="بحث عن منتج..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: "1px solid #ddd",
              minWidth: 180,
              fontSize: "14px",
            }}
          />
          <Button onClick={getProducts} loading={loading}>
            تحديث
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
          >
            إضافة منتج جديد
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={filteredProducts}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1200 }}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} من ${total} منتج`,
          onChange: (page, pageSize) => {
            setPagination({ current: page, pageSize });
          },
        }}
        locale={{
          emptyText: loading ? "جاري التحميل..." : "لا توجد منتجات",
        }}
      />

      <ProductModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        record={record}
        setRecord={setRecord}
        mode={modalMode}
        onSuccess={() => {
          getProducts();
        }}
      />

      <ImageModal
        visible={imageModalOpen}
        onClose={() => {
          setImageModalOpen(false);
          getProducts();
        }}
        productId={selectedProductId}
        onSuccess={() => {}}
      />
    </div>
  );
};

export default ProductsScreen;
