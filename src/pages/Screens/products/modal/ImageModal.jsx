import React, { useState, useEffect } from "react";
import { Modal, Button, Upload, InputNumber, message, Spin, Select } from "antd";
import { UploadOutlined, PictureOutlined, DeleteOutlined, StarFilled, StarOutlined } from "@ant-design/icons";
import { apiCall } from "../../../../hooks/useFetch"; // adjust path if needed
import { URL } from "../../../../utils/api";

export const ImageModal = ({ visible, onClose, onSuccess, productId }) => {
  const [imageLoading, setImageLoading] = useState(false);
  const [priority, setPriority] = useState(1);
  const [fileList, setFileList] = useState([]);
  const [images, setImages] = useState([]);
  const [fetching, setFetching] = useState(false);
  const [modalMessage, setModalMessage] = useState(""); // Add this state at the top

  // Fetch all images for this product
  useEffect(() => {
    if (visible && productId) {
      setFetching(true);
      apiCall({
        pathname: `/admin/upload/product-images/${productId}`,
        method: "GET",
        auth: true,
      }).then(res => {
        setImages(Array.isArray(res) ? res : []);
        setFetching(false);
      });
    }
  }, [visible, productId]);

  // Reset message when modal closes
  useEffect(() => {
    if (!visible) {
      setModalMessage(""); // Reset message when modal closes
    }
  }, [visible]);

  // Upload props
  const props = {
    name: "image",
    action: "http://localhost:3000/admin/upload/save-product-image",
    showUploadList: false,
    data: {
      product_id: productId,
      priority: priority,
    },
    onChange(info) {
      setImageLoading(true);
      if (info.file.status === "done") {
        setFileList([
          {
            uid: "-1",
            name: "product-image",
            status: "done",
            url: info.file.response.imageUrl,
          },
        ]);
        setImageLoading(false);
        if (info.file.response && info.file.response.success) {
          setModalMessage(" تم إضافة الصورة بنجاح");
        } else {
          setModalMessage(" فشل إضافة الصورة");
        }
        if (onSuccess) onSuccess();
        // Refetch images after upload
        apiCall({
          pathname: `/admin/upload/product-images/${productId}`,
          method: "GET",
          auth: true,
        }).then(res => {
          setImages(Array.isArray(res) ? res : []);
        });
      } else if (info.file.status === "error") {
        setImageLoading(false);
        setModalMessage("فشل رفع الصورة");
      }
    },
  };

  // Delete image handler
  const handleDelete = async (imgId) => {
    await apiCall({
      pathname: `/admin/upload/delete-image/${imgId}`,
      method: "DELETE",
      auth: true,
    });
    // Refetch images after delete
    apiCall({
      pathname: `/admin/upload/product-images/${productId}`,
      method: "GET",
      auth: true,
    }).then(res => {
      setImages(Array.isArray(res) ? res : []);
    });
    message.success("تم حذف الصورة");
  };

  // Find the primary image
  const primaryImage = images.find(img => img.priority === 1);
  const secondaryImages = images.filter(img => img.priority !== 1);

  // Handler for setting primary image
  const handleSetPrimary = async (imgId) => {
    await apiCall({
      pathname: `/admin/upload/set-primary-image/${imgId}`,
      method: "PUT",
      auth: true,
    });
    apiCall({
      pathname: `/admin/upload/product-images/${productId}`,
      method: "GET",
      auth: true,
    }).then(res => {
      setImages(Array.isArray(res) ? res : []);
    });
    setModalMessage("✅ تم تعيين الصورة كصورة رئيسية");
  };

  const handleSetSecondaryPriority = async (imgId, newPriority) => {
    await apiCall({
      pathname: `/admin/upload/set-secondary-priority/${imgId}`,
      method: "PUT",
      data: { priority: newPriority },
      auth: true,
    });
    apiCall({
      pathname: `/admin/upload/product-images/${productId}`,
      method: "GET",
      auth: true,
    }).then(res => {
      setImages(Array.isArray(res) ? res : []);
    });
    setModalMessage("✅ تم تحديث أولوية الصورة");
  };

  return (
    <Modal
      title="إضافة صور للمنتج"
      open={visible}
      onCancel={onClose}
      footer={null}
      destroyOnHidden
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <Upload {...props}>
          <div
            style={{
              textAlign: "center",
              border: "2px dashed #aaa",
              borderRadius: 8,
              padding: "20px 10px",
              marginBottom: 8,
              background: "#fafafa",
            }}
          >
            <PictureOutlined style={{ fontSize: "24px", color: "#999" }} />
            <div style={{ marginTop: "8px", color: "#666" }}>اختر صورة</div>
          </div>
        </Upload>
        <InputNumber
          min={1}
          value={priority}
          onChange={setPriority}
          style={{ width: 120 }}
          placeholder="الأولوية"
        />
        {modalMessage && (
          <div style={{ textAlign: "center", color: modalMessage.includes("نجاح") ? "green" : "red", marginBottom: 8 }}>
            {modalMessage}
          </div>
        )}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontWeight: 500, marginBottom: 8 }}>صور المنتج:</div>
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
            {images
              .sort((a, b) => a.priority - b.priority)
              .map((img, idx) => (
                <div
                  key={img.id}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    borderBottom: "1px solid #eee",
                    padding: "8px 0",
                    background: "#fff",
                  }}
                >
                  {/* Image */}
                  <img
                    src={img.link}
                    alt={`img-${img.id}`}
                    style={{
                      width: 60,
                      height: 60,
                      objectFit: "cover",
                      borderRadius: 8,
                      background: "#f6f6f6",
                      marginRight: 16,
                    }}
                  />
                  {/* Priority */}
                  <div style={{ minWidth: 90, textAlign: "center", marginRight: 16 }}>
                    <span style={{ fontSize: 14, color: "#888" }}>أولوية: </span>
                    {img.priority === 1 ? (
                      <span style={{ fontWeight: "bold", color: "#faad14" }}>1</span>
                    ) : (
                      <InputNumber
                        min={2}
                        value={img.priority}
                        onChange={val => handleSetSecondaryPriority(img.id, val)}
                        size="small"
                        style={{ width: 50, marginLeft: 4 }}
                      />
                    )}
                  </div>
                  {/* Buttons */}
                  <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
                    <Button
                      icon={img.priority === 1 ? <StarFilled style={{ color: "#faad14" }} /> : <StarOutlined />}
                      type={img.priority === 1 ? "primary" : "default"}
                      size="small"
                      style={{
                        background: img.priority === 1 ? "#fffbe6" : "#fff",
                        borderRadius: "50%",
                        boxShadow: img.priority === 1 ? "0 0 6px #faad14" : "none",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => handleSetPrimary(img.id)}
                    />
                    <Button
                      icon={<DeleteOutlined />}
                      size="small"
                      danger
                      style={{
                        borderRadius: "50%",
                        width: 32,
                        height: 32,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                      onClick={() => handleDelete(img.id)}
                    />
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};