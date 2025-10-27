import React, { useEffect, useState } from "react";
import { Table, Button, message, Select } from "antd";
import { ReloadOutlined, EyeOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { OrderDetailsDrawer } from "./modal/OrderDetailsDrawer";
import { apiCall } from "../../../hooks/useFetch";

const { Option } = Select;

const OrdersScreen = () => {
  const navigate = useNavigate();
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  const getOrders = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const data = await apiCall({
        pathname: "/admin/orders",
        method: "GET",
        auth: true,
      });

      if (data?.unauthorized) {
        message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
        navigate("/auth");
        return;
      }

      console.log("Fetched orders:", data); // Debug log

      setOrdersData(Array.isArray(data) ? data : []);
    } catch {
      message.error("فشل في تحميل الطلبات");
      setOrdersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getOrders();
  }, []);

  const handleStatusUpdate = async (orderId, newStatus) => {
    try {
      console.log(`🔄 Updating order ${orderId} to status: ${newStatus}`); 

      const response = await apiCall({
        pathname: `/admin/orders/${orderId}/status`,
        method: "PATCH",
        data: { status: newStatus }, 
        auth: true,
      });

      console.log("📨 Status update response:", response); 
      if (response?.success) {
        message.success(`تم تحديث الحالة إلى: ${newStatus}`);
        getOrders();
      } else {
        throw new Error(
          response?.error || response?.message || "فشل في تحديث الحالة"
        );
      }
    } catch (error) {
      console.error("💥 Status update error:", error);
      message.error("فشل في تحديث الحالة");
    }
  };

  const openDrawer = (record) => {
    setSelectedOrder(record);
    setDrawerOpen(true);
  };


  const calculateOrderTotal = (order) => {
    try {
      // Parse items
      let items = [];
      if (typeof order.items === "string") {
        items = JSON.parse(order.items);
      } else if (Array.isArray(order.items)) {
        items = order.items;
      }

      // Calculate items total
      const itemsTotal = items.reduce((sum, item) => {
        const price = parseFloat(item.price) || 0;
        const quantity = parseInt(item.qty || item.quantity || 0);
        return sum + (price * quantity);
      }, 0);

      // Add delivery cost
      const deliveryCost = parseFloat(order.delivery_cost) || 0;
      
      return itemsTotal + deliveryCost;
    } catch (error) {
      console.error("Error calculating total for order:", order.id, error);
      return 0;
    }
  };

  const columns = [
    {
      title: "رقم الطلب",
      dataIndex: "id",
      key: "id",
      render: (id) => <strong>#{id}</strong>,
    },
    {
      title: "العميل",
      dataIndex: "user_name",
      key: "user_name",
      render: (name, record) => (
        <div>
          <div>{name || "غير محدد"}</div>
          <small style={{ color: "#999" }}>{record.phone || record.user_phone || "لا يوجد"}</small>
        </div>
      ),
    },
    {
      title: "المبلغ",
      key: "total",
      render: (_, record) => {
        const total = calculateOrderTotal(record);
        return (
          <strong style={{ color: "#52c41a" }}>
            ${total.toFixed(2)}
          </strong>
        );
      },
    },
    {
      title: "الحالة",
      dataIndex: "status",
      key: "status",
      render: (status, record) => (
        <Select
          value={status}
          size="small"
          onChange={(newStatus) => handleStatusUpdate(record.id, newStatus)}
          onClick={(e) => e.stopPropagation()}
        >
          <Option value="Created">تم الإنشاء</Option>
          <Option value="Accepted">مقبول</Option>
          <Option value="Preparing">قيد التحضير</Option>
          <Option value="Shipping">قيد الشحن</Option>
          <Option value="Delivered">تم التسليم</Option>
          <Option value="Canceled">ملغي</Option>
        </Select>
      ),
    },
    {
      title: "عرض",
      key: "view",
      render: (_, record) => (
        <Button
          type="link"
          icon={<EyeOutlined />}
          onClick={() => openDrawer(record)}
        >
          تفاصيل
        </Button>
      ),
    },
  ];

  return (
    <div style={{ padding: 24 }}>
      <div className="flex justify-between items-center mb-4">
        <h1>إدارة الطلبات</h1>
        <Button icon={<ReloadOutlined />} onClick={getOrders} loading={loading}>
          تحديث
        </Button>
      </div>

      <Table
        rowKey="id"
        columns={columns}
        dataSource={ordersData}
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <OrderDetailsDrawer
        isOpen={drawerOpen}
        setIsOpen={setDrawerOpen}
        order={selectedOrder}
        refreshOrders={getOrders}
      />
    </div>
  );
};

export default OrdersScreen;
