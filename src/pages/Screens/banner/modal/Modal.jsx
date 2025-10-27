import {
  Input,
  Modal,
  Select,
  Switch,
  InputNumber,
  Button,
  message,
} from "antd";
import React, { useEffect, useState } from "react";
import { apiCall } from "../../../../hooks/useFetch";

const { Option } = Select;

export const BannerModal = ({
  isOpen,
  setIsOpen,
  record,
  setRecord,
  onSuccess,
}) => {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [priority, setPriority] = useState(1);
  const [active, setActive] = useState(true);
  const [background, setBackground] = useState("");
  const [hidden, setHidden] = useState(false);
  const [loading, setLoading] = useState(false);
  const [map, setMap] = useState([]);

  
  useEffect(() => {
    if (isOpen) {
      if (record) {
        setName(record.name || "");
        setType(record.type || "");
        setPriority(record.priority || 1);
        setActive(record.active !== false);
        setBackground(record.background || "");
        setHidden(record.hidden === true);
        setMap(record?.map);
      } else {
        clear();
      }
    }
  }, [record, isOpen]);

  const clear = () => {
    setName("");
    setType("");
    setPriority(1);
    setActive(true);
    setBackground("");
    setHidden(false);
    setRecord(null);
    
  };

  const validateForm = () => {
    if (!name || name.trim().length < 2) {
      message.error("يرجى إدخال اسم البانر (أكثر من حرفين)");
      return false;
    }
    if (!type) {
      message.error("يرجى اختيار نوع البانر");
      return false;
    }
    if (!priority || priority < 1 || priority > 100) {
      message.error("يرجى إدخال أولوية صحيحة (1-100)");
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setLoading(true);
    const formData = {
      name: name.trim(),
      type,
      priority: Number(priority),
      map, // <-- Use local map state
      active,
      background: background.trim(),
      hidden,
    };

    try {
      let response;

      if (record && record.id) {
        console.log("Updating banner with ID:", record.id);
        response = await apiCall({
          pathname: `/admin/banners/${record.id}`,
          method: "PUT",
          data: formData,
          auth: true,
        });
        if (!response?.error) {
          message.success("تم تحديث البانر بنجاح");
        } else throw new Error(response?.message || "فشل في تحديث البانر");
      } else {
        console.log("Creating new banner");
        response = await apiCall({
          pathname: "/admin/banners",
          method: "POST",
          data: formData,
          auth: true,
        });
        if (!response?.error) {
          message.success("تم إضافة البانر بنجاح");
        } else throw new Error(response?.message || "فشل في إضافة البانر");
      }

      setIsOpen(false);
      clear();
      onSuccess && onSuccess();
    } catch (error) {
      console.error("Banner operation failed:", error);
      message.error(error.message || "حدث خطأ في العملية");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    clear();
  };
  return (
    <Modal
      title={record ? "تحديث البانر" : "إضافة بانر جديد"}
      open={isOpen}
      onCancel={handleCancel}
      width={600}
     destroyOnHidden={true} 
      footer={[
        <Button key="cancel" onClick={handleCancel} size="large">
          إلغاء
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={loading}
          onClick={handleSubmit}
          size="large"
        >
          {record ? "تحديث البانر" : "إضافة البانر"}
        </Button>,
      ]}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "16px",
          maxHeight: "70vh",
          overflowY: "auto",
        }}
      >
        {/* Name */}
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            اسم البانر *
          </label>
          <Input
            placeholder="أدخل اسم البانر"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="large"
          />
        </div>

        {/* Type */}
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            نوع البانر *
          </label>
          <Select
            placeholder="اختر نوع البانر"
            value={type || undefined}
            onChange={setType}
            size="large"
            style={{ width: "100%" }}
          >
            <Option value="Slider">Slider</Option>
            <Option value="Timer">Timer</Option>
            <Option value="List">List</Option>
            <Option value="Category">Category</Option>
            <Option value="Single">Single</Option>
          </Select>
        </div>

        {/* Priority */}
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            الأولوية *
          </label>
          <InputNumber
            placeholder="الأولوية"
            value={priority}
            onChange={setPriority}
            min={1}
            max={100}
            size="large"
            style={{ width: "100%" }}
          />
        </div>

        {/* Color */}
        <div>
          <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
            لون خلفية البانر
          </label>
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <Input
              placeholder="لون الخلفية (مثل: #ffffff)"
              value={background}
              onChange={(e) => setBackground(e.target.value)}
              size="large"
              style={{ flex: 1 }}
            />
            {background && (
              <div
                style={{
                  width: 32,
                  height: 32,
                  backgroundColor: background.startsWith("#")
                    ? background
                    : "#f0f0f0",
                  border: "1px solid #d9d9d9",
                  borderRadius: "6px",
                }}
              />
            )}
          </div>
        </div>

        {/* Switches */}
        <div style={{ display: "flex", gap: 24 }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              حالة البانر
            </label>
            <Switch
              checked={active}
              onChange={setActive}
              checkedChildren="نشط"
              unCheckedChildren="غير نشط"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: 8, fontWeight: 500 }}>
              إخفاء البانر
            </label>
            <Switch
              checked={hidden}
              onChange={setHidden}
              checkedChildren="مخفي"
              unCheckedChildren="ظاهر"
            />
          </div>
        </div>
      </div>
    </Modal>
  );
};
