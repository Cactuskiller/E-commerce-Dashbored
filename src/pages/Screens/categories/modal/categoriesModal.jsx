import {
  Input,
  Modal,
  InputNumber,
  Button,
  message,
  Switch,
  Upload,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { apiCall } from "../../../../hooks/useFetch";
import {
  DeleteOutlined,
  ExclamationCircleOutlined,
  UploadOutlined,
  PictureOutlined,
} from "@ant-design/icons";

const { TextArea } = Input;
const { confirm } = Modal;

export const CategoriesModal = ({
  isOpen,
  setIsOpen,
  record,
  mode = "edit",
  onSuccess,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [priority, setPriority] = useState(1);
  const [image, setImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null); // Store the actual file
  const [fileList, setFileList] = useState([]); // For Upload component
  const [active, setActive] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleDelete = useCallback(() => {
    if (!record || !record.id) {
      message.error("لا يمكن حذف فئة غير محفوظة");
      setIsOpen(false);
      return;
    }

    confirm({
      title: "تأكيد الحذف",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            هل أنت متأكد من حذف الفئة <strong>"{record.name}"</strong>؟
          </p>
          <p style={{ color: "#ff4d4f", fontSize: "12px" }}>
            هذا الإجراء لا يمكن التراجع عنه
          </p>
        </div>
      ),
      okText: "نعم، احذف",
      cancelText: "إلغاء",
      okType: "danger",
      width: 450,
      onOk: async () => {
        try {
          const response = await apiCall({
            pathname: `/admin/categories/${record.id}`,
            method: "DELETE",
            auth: true,
          });

          if (response && response.error === true) {
            throw new Error(response.message || "فشل في حذف الفئة");
          }

          if (response && response.unauthorized) {
            message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
            return;
          }

          message.success("تم حذف الفئة بنجاح");
          setIsOpen(false);
          clear();

          if (onDelete) {
            onDelete();
          }
          if (onSuccess) {
            onSuccess();
          }
        } catch (error) {
          message.error(
            `فشل في حذف الفئة: ${error.message || "حدث خطأ غير متوقع"}`
          );
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

  const clear = () => {
    setName("");
    setPriority(1);
    setImage("");
    setImageFile(null);
    setFileList([]);
    setActive(true);
  };

  useEffect(() => {
    if (isOpen && mode !== "delete") {
      if (record) {
        setName(record.name || "");
        setPriority(record.priority || 1);
        setImage(record.image || "");
        setActive(record.active !== false);

        // Set file list for existing image
        if (record.image) {
          setFileList([
            {
              uid: "-1",
              name: "current-image",
              status: "done",
              url: record.image,
            },
          ]);
        } else {
          setFileList([]);
        }
      } else {
        clear();
      }
    }
  }, [record, isOpen, mode]);

  const validateForm = () => {
    if (!name || name.trim().length < 2) {
      message.error("يرجى إدخال اسم الفئة (أكثر من حرفين)");
      return false;
    }
    if (!priority || priority < 1) {
      message.error("يرجى إدخال أولوية صحيحة (أكبر من 0)");
      return false;
    }

    return true;
  };

  const props = {
    name: "image",
    action: "http://localhost:3000/admin/upload",
    onChange(info) {
      if (info.file.status !== "uploading") {
        setImageLoading(true);
      }
      if (info.file.status === "done") {
        message.success(`${info.file.name} file uploaded successfully`);
        setImageLoading(false);
        setImage(info.file.response.imageUrl);
      } else if (info.file.status === "error") {
        message.error(`${info.file.name} file upload failed.`);
        setImageLoading(false);
      }
    },
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      return;
    }
    setLoading(true);
    try {
      const formData = {
        name: name.trim(),
        priority: Number(priority),
        image,
        active,
      };
      if (record && record.id) {
        let response = await apiCall({
          pathname: `/admin/categories/${record.id}`,
          method: "PUT",
          data: formData,
          auth: true,
        });

        if (response && !response.error) {
          message.success("تم تحديث الفئة بنجاح");
        } else {
          throw new Error(response?.message || "فشل في تحديث الفئة");
        }
      } else {
        response = await apiCall({
          pathname: "/admin/categories",
          method: "POST",
          data: formData,
          auth: true,
        });

        if (response && !response.error) {
          message.success("تم إضافة الفئة بنجاح");
        } else {
          throw new Error(response?.message || "فشل في إضافة الفئة");
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
    if (mode === "delete") return `حذف الفئة: ${record?.name || ""}`;
    if (mode === "create") return "إضافة فئة جديدة";
    return "تحديث الفئة";
  };

  if (mode === "delete") {
    return (
      <Modal
        title={getModalTitle()}
        open={isOpen}
        onCancel={handleCancel}
        footer={null}
        width={400}
        destroyOnHidden={true}
      >
        <div style={{ textAlign: "center", padding: "20px" }}>
          <DeleteOutlined
            style={{ fontSize: "48px", color: "#ff4d4f", marginBottom: "16px" }}
          />
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
      width={600}
      destroyOnHidden={true}
      footer={[
        <Button key="cancel" onClick={handleCancel} size="large">
          إلغاء
        </Button>,
        <Button
          key="submit"
          type="primary"
          loading={imageLoading}
          onClick={handleSubmit}
          disabled={imageLoading}
          size="large"
        >
          {mode === "create" ? "إضافة الفئة" : "تحديث الفئة"}
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
        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            اسم الفئة *
          </label>
          <Input
            placeholder="أدخل اسم الفئة"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="large"
          />
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            الأولوية *
          </label>
          <InputNumber
            placeholder="أولوية الفئة"
            value={priority}
            onChange={setPriority}
            min={1}
            size="large"
            style={{ width: "100%" }}
          />
          <small style={{ color: "#666", fontSize: "12px" }}>
            الأولوية الأقل تظهر أولاً (1 = أعلى أولوية)
          </small>
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            صورة الفئة
          </label>

          <Upload {...props}>
            {fileList.length === 0 ? (
              <div style={{ textAlign: "center" }}>
                <PictureOutlined style={{ fontSize: "24px", color: "#999" }} />
                <div style={{ marginTop: "8px", color: "#666" }}>اختر صورة</div>
              </div>
            ) : (
              <Button icon={<UploadOutlined />} loading={imageLoading}>
                تغيير الصورة
              </Button>
            )}
          </Upload>

          <small
            style={{
              color: "#666",
              fontSize: "12px",
              display: "block",
              marginTop: "8px",
            }}
          >
            أنواع الملفات المدعومة: JPG, PNG, GIF (أقل من 5MB)
          </small>
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            حالة التفعيل
          </label>
          <Switch
            checked={active}
            onChange={setActive}
            checkedChildren="مفعل"
            unCheckedChildren="غير مفعل"
            size="default"
          />
          <span style={{ marginLeft: "12px", color: "#666", fontSize: "14px" }}>
            {active
              ? "الفئة مفعلة وتظهر للمستخدمين"
              : "الفئة غير مفعلة ولا تظهر للمستخدمين"}
          </span>
        </div>
      </div>
    </Modal>
  );
};
