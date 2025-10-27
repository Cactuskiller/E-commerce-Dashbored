import {
  Input,
  Modal,
  Select,
  InputNumber,
  Button,
  message,
  DatePicker,
  Switch,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { apiCall } from "../../../../hooks/useFetch";
import { DeleteOutlined, ExclamationCircleOutlined } from "@ant-design/icons";
import dayjs from 'dayjs';

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

export const VoucherModal = ({
  isOpen,
  setIsOpen,
  record,
  mode = "edit", 
  onSuccess,
  onDelete, 
}) => {
  
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [type, setType] = useState("per"); // Changed from "percentage" to "per"
  const [value, setValue] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [expireDate, setExpireDate] = useState(null);
  const [active, setActive] = useState(true);
  const [isFirst, setIsFirst] = useState(false);
  const [noOfUsage, setNoOfUsage] = useState(0);
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(() => {
    if (!record || !record.id) {
      message.error("لا يمكن حذف قسيمة غير محفوظة");
      setIsOpen(false);
      return;
    }

    confirm({
      title: 'تأكيد الحذف',
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>هل أنت متأكد من حذف القسيمة <strong>"{record.name}"</strong>؟</p>
          <p style={{ color: '#ff4d4f', fontSize: '12px' }}>
            هذا الإجراء لا يمكن التراجع عنه
          </p>
        </div>
      ),
      okText: 'نعم، احذف',
      cancelText: 'إلغاء',
      okType: 'danger',
      width: 450,
      onOk: async () => {
        try {
          const response = await apiCall({
            pathname: `/admin/vouchers/${record.id}`,
            method: "DELETE",
            auth: true,
          });
          
          if (response && response.error === true) {
            throw new Error(response.message || "فشل في حذف القسيمة");
          }
          
          if (response && response.unauthorized) {
            message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
            return;
          }

          message.success("تم حذف القسيمة بنجاح");
          setIsOpen(false);
          clear();
          
          if (onDelete) {
            onDelete();
          }
          if (onSuccess) {
            onSuccess();
          }
          
        } catch (error) {
          message.error(`فشل في حذف القسيمة: ${error.message || 'حدث خطأ غير متوقع'}`);
        }
      },
      onCancel: () => {
        setIsOpen(false);
      },
    });
  }, [record, setIsOpen, onDelete, onSuccess]);

  useEffect(() => {
    if (isOpen && mode === "delete" && record && record.id) {
      setTimeout(() => {
        handleDelete();
      }, 100);
    }
  }, [isOpen, mode, record, handleDelete]);

  useEffect(() => {
    if (isOpen && mode !== "delete") {
      if (record) {
        setName(record.name || "");
        setCode(record.code || "");
        setType(record.type || "per"); // Changed from "percentage" to "per"
        setValue(record.value || 0);
        setMinValue(record.min_value || 0);
        setMaxValue(record.max_value || 0);
        setActive(record.active !== false);
        setIsFirst(record.is_first || false);
        setNoOfUsage(record.no_of_usage || 0);
        
        if (record.expire_date) {
          try {
            const dateValue = dayjs(record.expire_date);
            setExpireDate(dateValue.isValid() ? dateValue : null);
          } catch (error) {
            setExpireDate(null);
          }
        } else {
          setExpireDate(null);
        }
      } else {
        clear();
      }
    }
  }, [record, isOpen, mode]);

  const clear = () => {
    setName("");
    setCode("");
    setType("per"); // Changed from "percentage" to "per"
    setValue(0);
    setMinValue(0);
    setMaxValue(0);
    setExpireDate(null);
    setActive(true);
    setIsFirst(false);
    setNoOfUsage(0);
  };

  const generateCode = () => {
    const prefix = name ? name.substring(0, 3).toUpperCase() : "VOC";
    const randomNum = Math.floor(Math.random() * 10000);
    const generatedCode = `${prefix}${randomNum}`;
    setCode(generatedCode);
  };

  const validateForm = () => {
    if (!name || name.trim().length < 2) {
      message.error("يرجى إدخال اسم القسيمة (أكثر من حرفين)");
      return false;
    }
    if (!code || code.trim().length < 3) {
      message.error("يرجى إدخال كود القسيمة (أكثر من 3 أحرف)");
      return false;
    }
    if (!value || value <= 0) {
      message.error("يرجى إدخال قيمة صحيحة للخصم");
      return false;
    }
    if (type === "per" && value > 100) { // Changed from "percentage" to "per"
      message.error("نسبة الخصم لا يمكن أن تزيد عن 100%");
      return false;
    }
    if (minValue < 0) {
      message.error("الحد الأدنى لا يمكن أن يكون سالباً");
      return false;
    }
    if (maxValue < 0) {
      message.error("الحد الأقصى لا يمكن أن يكون سالباً");
      return false;
    }
    if (maxValue > 0 && maxValue <= minValue) {
      message.error("الحد الأقصى يجب أن يكون أكبر من الحد الأدنى");
      return false;
    }
    if (!expireDate) {
      message.error("يرجى تحديد تاريخ انتهاء الصلاحية");
      return false;
    }
    if (expireDate.isBefore(dayjs(), 'day')) {
      message.error("تاريخ انتهاء الصلاحية يجب أن يكون في المستقبل");
      return false;
    }
    
    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    let formattedExpireDate = null;
    if (expireDate && expireDate.isValid()) {
      formattedExpireDate = expireDate.format('YYYY-MM-DD');
    }

    const formData = {
      name: name.trim(),
      code: code.trim().toUpperCase(),
      type,
      value: Number(value),
      min_value: Number(minValue),
      max_value: maxValue > 0 ? Number(maxValue) : null,
      expire_date: formattedExpireDate,
      active,
      is_first: isFirst,
      no_of_usage: Number(noOfUsage),
    };

    try {
      let response;

      if (record && record.id) {
        response = await apiCall({
          pathname: `/admin/vouchers/${record.id}`,
          method: "PUT",
          data: formData,
          auth: true,
        });

        if (response && !response.error) {
          message.success("تم تحديث القسيمة بنجاح");
        } else {
          throw new Error(response?.message || "فشل في تحديث القسيمة");
        }
      } else {
        response = await apiCall({
          pathname: "/admin/vouchers",
          method: "POST",
          data: formData,
          auth: true,
        });

        if (response && !response.error) {
          message.success("تم إضافة القسيمة بنجاح");
        } else {
          throw new Error(response?.message || "فشل في إضافة القسيمة");
        }
      }

      setIsOpen(false);
      clear();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      message.error(error.message || "حدث خطأ في العملية");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsOpen(false);
    clear();
  };

  const getModalTitle = () => {
    if (mode === "delete") return `حذف القسيمة: ${record?.name || ''}`;
    if (mode === "create") return "إضافة قسيمة جديدة";
    return "تحديث القسيمة";
  };

  if (mode === "delete") {
    return (
      <Modal
        title={getModalTitle()}
        open={isOpen}
        onCancel={handleCancel}
        footer={null}
        width={400}
        destroyOnClose={true}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <DeleteOutlined style={{ fontSize: '48px', color: '#ff4d4f', marginBottom: '16px' }} />
          <p>جاري معالجة طلب الحذف...</p>
        </div>
      </Modal>
    );
  }

  return (
    <Modal
      title={getModalTitle()}
      open={isOpen}
      onCancel={handleCancel}
      width={700}
      destroyOnClose={true}
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
          {mode === "create" ? "إضافة القسيمة" : "تحديث القسيمة"} 
        </Button>,
      ]}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px", maxHeight: "70vh", overflowY: "auto" }}>
        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            اسم القسيمة *
          </label>
          <Input
            placeholder="أدخل اسم القسيمة"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="large"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            كود القسيمة *
          </label>
          <div style={{ display: "flex", gap: "8px" }}>
            <Input
              placeholder="أدخل كود القسيمة"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              size="large"
              style={{ flex: 1 }}
            />
            <Button onClick={generateCode} size="large">
              إنشاء كود
            </Button>
          </div>
          <small style={{ color: "#666", fontSize: "12px" }}>
            الكود يجب أن يكون فريداً ومن 3 أحرف على الأقل
          </small>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              نوع الخصم *
            </label>
            <Select
              placeholder="اختر نوع الخصم"
              value={type}
              onChange={setType}
              size="large"
              style={{ width: "100%" }}
            >
              <Option value="per">نسبة مئوية (%)</Option>
              <Option value="num">مبلغ ثابت ($)</Option>
            </Select>
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              قيمة الخصم *
            </label>
            <InputNumber
              placeholder="قيمة الخصم"
              value={value}
              onChange={setValue}
              min={0}
              max={type === "per" ? 100 : undefined} 
              step={type === "per" ? 1 : 0.01} 
              size="large"
              style={{ width: "100%" }}
              addonAfter={type === "per" ? "%" : "$"} 
            />
          </div>
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              الحد الأدنى للطلب
            </label>
            <InputNumber
              placeholder="الحد الأدنى"
              value={minValue}
              onChange={setMinValue}
              min={0}
              step={0.01}
              size="large"
              style={{ width: "100%" }}
              addonBefore="$"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
              الحد الأقصى للخصم
            </label>
            <InputNumber
              placeholder="الحد الأقصى (اختياري)"
              value={maxValue}
              onChange={setMaxValue}
              min={0}
              step={0.01}
              size="large"
              style={{ width: "100%" }}
              addonBefore="$"
            />
          </div>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            عدد مرات الاستخدام المسموح
          </label>
          <InputNumber
            placeholder="عدد مرات الاستخدام (0 = غير محدود)"
            value={noOfUsage}
            onChange={setNoOfUsage}
            min={0}
            size="large"
            style={{ width: "100%" }}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            0 يعني استخدام غير محدود، أكثر من 0 يحدد عدد مرات الاستخدام
          </small>
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}>
            تاريخ انتهاء الصلاحية *
          </label>
          <DatePicker
            placeholder="اختر تاريخ انتهاء الصلاحية"
            value={expireDate}
            onChange={setExpireDate}
            size="large"
            style={{ width: "100%" }}
            disabledDate={(current) => current && current < dayjs().startOf('day')}
          />
        </div>

        <div style={{ border: "1px solid #d9d9d9", borderRadius: "6px", padding: "16px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "500", margin: 0 }}>
                حالة التفعيل
              </label>
              <Switch
                checked={active}
                onChange={setActive}
                checkedChildren="مفعل"
                unCheckedChildren="غير مفعل"
              />
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <label style={{ fontWeight: "500", margin: 0 }}>
                للمستخدمين الجدد فقط
              </label>
              <Switch
                checked={isFirst}
                onChange={setIsFirst}
                checkedChildren="نعم"
                unCheckedChildren="لا"
              />
            </div>
          </div>

          <div style={{ marginTop: "12px", padding: "8px", backgroundColor: "#f6f6f6", borderRadius: "4px" }}>
            <small style={{ color: "#666", fontSize: "12px" }}>
              <strong>ملاحظة:</strong> إذا كانت القسيمة للمستخدمين الجدد فقط، فلن يتمكن المستخدمون الذين سبق لهم إجراء طلبات من استخدامها
            </small>
          </div>
        </div>
      </div>
    </Modal>
  );
};