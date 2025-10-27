import React, { useEffect, useState } from "react";
import { Table, Tag, Switch, Button, message, Popconfirm } from "antd";
import {
  EditOutlined,
  PlusOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { apiCall } from "../../../hooks/useFetch";
import { VoucherModal } from "./modal/VoucherModal";

const VouchersScreen = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const [record, setRecord] = useState(null);
  const [vouchersData, setVouchersData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalMode, setModalMode] = useState("edit");

  const getVouchers = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const data = await apiCall({
        pathname: "/admin/vouchers",
        method: "GET",
        auth: true,
      });

      if (data?.unauthorized) {
        message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
        navigate("/auth");
        return;
      }

      if (data && !data.error) {
        let vouchersArray = [];
        if (Array.isArray(data)) vouchersArray = data;
        else if (Array.isArray(data.data)) vouchersArray = data.data;
        else if (Array.isArray(data.vouchers)) vouchersArray = data.vouchers;

        setVouchersData(vouchersArray);
      } else {
        message.error("فشل في تحميل القسائم");
        setVouchersData([]);
      }
    } catch (error) {
      message.error("حدث خطأ في تحميل القسائم");
      setVouchersData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getVouchers();
  }, []);

  // const handleStatusToggle = async (id, checked) => {
  //   try {
  //     const currentVoucher = await apiCall({
  //       pathname: `/admin/vouchers/${id}`,
  //       method: "GET",
  //       auth: true,
  //     });

  //     if (!currentVoucher || currentVoucher.error) {
  //       throw new Error("فشل في جلب بيانات القسيمة الحالية");
  //     }

  //     const updatedData = {
  //       ...currentVoucher,
  //       active: checked,
  //     };

  //     // delete updatedData.id;
  //     // delete updatedData.created_at;
  //     // delete updatedData.updated_at;

  //     const response = await apiCall({
  //       pathname: `/admin/vouchers/${id}`,
  //       method: "PUT",
  //       data: updatedData,
  //       auth: true,
  //     });

  //     if (response && !response.error) {
  //       message.success(`تم ${checked ? "تفعيل" : "إلغاء تفعيل"} القسيمة`);
  //       getVouchers();
  //     } else {
  //       throw new Error(response?.message || "فشل في تحديث الحالة");
  //     }
  //   } catch (error) {
  //     message.error("حدث خطأ في تحديث حالة القسيمة");
  //   }
  // };

  const handleDeleteClick = async (id) => {
    const response = await apiCall({
      pathname: `/admin/vouchers/${id}`,
      method: "DELETE",
      auth: true,
    });
    if (response && !response.error) {
      message.success("تم حذف القسيمة بنجاح");
      getVouchers();
    } else {
      message.error("فشل في حذف القسيمة");
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

  const isExpired = (date) => {
    return new Date(date) < new Date();
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
      width: 180,
      ellipsis: true,
    },
    {
      title: "الكود",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (code) => (
        <span 
          style={{ 
            fontFamily: 'monospace', 
            fontSize: '12px',
            backgroundColor: '#f0f0f0',
            padding: '4px 8px',
            borderRadius: '4px',
            fontWeight: 'bold'
          }}
        >
          {code}
        </span>
      ),
    },
    {
      title: "النوع",
      dataIndex: "type",
      key: "type",
      width: 100,
      render: (type) => (
        <Tag color={type === 'per' ? 'blue' : 'green'}>
          {type === 'per' ? 'نسبة مئوية' : 'مبلغ ثابت'}
        </Tag>
      ),
    },
    {
      title: "القيمة",
      dataIndex: "value",
      key: "value",
      width: 100,
      render: (value, record) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a' }}>
          {record.type === 'per' ? `${value}%` : `$${value}`}
        </span>
      ),
      sorter: (a, b) => a.value - b.value,
    },
    {
      title: "الحد الأدنى",
      dataIndex: "min_value",
      key: "min_value",
      width: 100,
      render: (minValue) => minValue ? `$${minValue}` : "لا يوجد",
    },
    {
      title: "الحد الأقصى",
      dataIndex: "max_value",
      key: "max_value",
      width: 100,
      render: (maxValue) => maxValue ? `$${maxValue}` : "غير محدود",
    },
    {
      title: "عدد الاستخدام",
      dataIndex: "no_of_usage",
      key: "no_of_usage",
      width: 100,
      render: (usage) => (
        <Tag color={usage === 0 ? "blue" : "orange"}>
          {usage === 0 ? "غير محدود" : usage}
        </Tag>
      ),
    },
    {
      title: "تاريخ الانتهاء",
      dataIndex: "expire_date",
      key: "expire_date",
      width: 130,
      render: (date) => {
        const expired = isExpired(date);
        return (
          <div>
            <span style={{ color: expired ? '#ff4d4f' : '#52c41a' }}>
              {new Date(date).toLocaleDateString('ar')}
            </span>
            {expired && (
              <div>
                <Tag color="red" size="small" style={{ fontSize: "10px" }}>
                  منتهية الصلاحية
                </Tag>
              </div>
            )}
          </div>
        );
      },
      sorter: (a, b) => new Date(a.expire_date) - new Date(b.expire_date),
    },
    {
      title: "للمستخدمين الجدد",
      dataIndex: "is_first",
      key: "is_first",
      width: 120,
      render: (isFirst) => (
        <Tag color={isFirst ? "purple" : "default"}>
          {isFirst ? "نعم" : "لا"}
        </Tag>
      ),
    },
    {
      title: "الحالة",
      dataIndex: "active",
      key: "active",
      width: 100,
      render: (active, record) => {
        const expired = isExpired(record.expire_date);
        return (
          <div>
            <Tag color={active ? "green" : "orange"}>
              {active ? "نشط" : "غير نشط"}
            </Tag>
            {expired && (
              <Tag color="red" size="small" style={{ fontSize: "10px" }}>
                منتهية
              </Tag>
            )}
          </div>
        );
      },
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
            title="حذف القسيمة"
            description="هل أنت متأكد من حذف هذه القسيمة؟"
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
          <h1 style={{ margin: 0 }}>إدارة القسائم</h1>
          <p style={{ margin: "4px 0 0 0", color: "#666", fontSize: "14px" }}>
            {loading ? "جاري التحميل..." : `العدد: ${vouchersData.length} قسيمة`}
          </p>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <Button onClick={getVouchers} loading={loading}>
            تحديث
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleAddClick}
          >
            إضافة قسيمة جديدة
          </Button>
        </div>
      </div>

      <Table
        columns={columns}
        dataSource={vouchersData}
        loading={loading}
        rowKey="id"
        scroll={{ x: 1400 }}
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) =>
            `${range[0]}-${range[1]} من ${total} قسيمة`,
        }}
        locale={{
          emptyText: loading ? "جاري التحميل..." : "لا توجد قسائم",
        }}
      />

      <VoucherModal
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        record={record}
        setRecord={setRecord}
        mode={modalMode}
        onSuccess={() => {
          getVouchers();
        }}
      />
    </div>
  );
};

export default VouchersScreen;