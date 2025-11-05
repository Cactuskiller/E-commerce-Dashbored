import React, { useEffect, useState } from "react";
import {
  Modal,
  Select,
  Button,
  Input,
  List,
  Card,
  Image,
  DatePicker,
  message,
  Radio,
  Upload,
} from "antd";
import {
  PlusOutlined,
  DeleteOutlined,
  PictureOutlined,
  UploadOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";
import { apiCall } from "../../../../hooks/useFetch";

const { Option } = Select;

export const BannerContentModal = ({
  isOpen,
  setIsOpen,
  record,
  setRecord,
  onSuccess,
}) => {
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [image, setImage] = useState("");
  const [imageLoading, setImageLoading] = useState(false);
  const [editIndex, setEditIndex] = useState(null);

  useEffect(() => {
    console.log(record);
    console.log(image);
  }, [record, image]);

  const getFirstMap = (rec) =>
    Array.isArray(rec?.map) && rec.map.length > 0 ? rec.map[0] : {};

  console.log("🔧 Rendering ContentModal with record:", getFirstMap(record));

  const [formData, setFormData] = useState({
    categoryId: null,
    categoryIds: [],
    productIds: [],
    slides: [],
    endDate: null,
    link: "",
  });

  const [sliderTitle, setSliderTitle] = useState("");
  const [sliderSubtitle, setSliderSubtitle] = useState("");
  const [slides, setSlides] = useState([]);
  const [newSlide, setNewSlide] = useState({
    image: "",
    link: "",
    name: "",
    subtitle: "",
    cta: "",
  });
  useEffect(() => {
    if (isOpen && record?.type === "Slider") {
      setSliderTitle(record?.name || ""); 
     setSliderSubtitle(record?.map?.[0]?.subtitle || "");
      setSlides(Array.isArray(record?.map) ? record.map : []);
    }
  }, [isOpen, record]);

  const addOrEditSlide = () => {
    if (!newSlide.image.trim() || !newSlide.link.trim() || !newSlide.name.trim()) {
      message.warning("يرجى إدخال جميع بيانات السلايد (الصورة، الرابط، الاسم)");
      return;
    }
    if (editIndex !== null) {
      // Edit mode: update existing slide
      const updatedSlides = [...slides];
      updatedSlides[editIndex] = newSlide;
      setSlides(updatedSlides);
      setEditIndex(null);
    } else {
      // Add mode: add new slide
      setSlides([...slides, newSlide]);
    }
    setNewSlide({ image: "", link: "", name: "", subtitle: "", cta: "" });
  };

  const removeSlide = (idx) => {
    setSlides(slides.filter((_, i) => i !== idx));
  };

  const slideUploadProps = {
    name: "image",
    action: "https://danya.puretik.info/api/admin/upload",
    showUploadList: false,
    onChange(info) {
      setImageLoading(true);
      if (info.file.status === "done" && info.file.response && info.file.response.imageUrl) {
        setNewSlide((prev) => ({ ...prev, image: info.file.response.imageUrl }));
        setImageLoading(false);
        message.success("تم رفع صورة السلايد بنجاح");
      } else if (info.file.status === "error") {
        setImageLoading(false);
        message.error("فشل رفع صورة السلايد");
      }
    },
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      let map = [];
      let name = record.name;
      let data = {
        name,
        background: record.background,
        active: record.active,
        hidden: record.hidden,
        priority: record.priority,
        type: record.type,
      };

      if (record.type === "Slider") {
        if (!sliderTitle.trim()) {
          message.error("يرجى إدخال عنوان السلايدر");
          setLoading(false);
          return;
        }
        if (!slides.length) {
          message.error("أضف سلايد واحد على الأقل");
          setLoading(false);
          return;
        }
        console.log("Saving slides:", slides); // Debug line
        const validSlides = slides.filter(slide => slide && slide.image && slide.link && slide.name);
        map = validSlides.map(slide => ({
          image: slide.image,
          link: slide.link,
          name: slide.name,
          subtitle: slide.subtitle,
          cta: slide.cta,
        }));
        data.name = sliderTitle;
      } else if (record.type === "Single") {
        const singleMap = record.map ? [...record.map] : [{}];
        map = [{
          ...singleMap[0],
          image: image,
        }];
      } else if (record.type === "List") {
        map = [{
          productIds: record?.map?.[0]?.productIds || [],
        }];
      } else if (record.type === "Category") {
        map = [{
          categoryIds: record?.map?.[0]?.categoryIds || [],
        }];
      } else if (record.type === "Timer") {
        map = [{
          productIds: record?.map?.[0]?.productIds || [],
          endDate: record?.map?.[0]?.endDate || null,
        }];
      }

      // Update banner info
      await apiCall({
        pathname: `/admin/banners/${record.id}`,
        method: "PUT",
        data,
        auth: true,
      });

      // Update map
      await apiCall({
        pathname: `/admin/banners/${record.id}/map`,
        method: "PUT",
        data: { map },
        auth: true,
      });

      message.success("تم حفظ البانر بنجاح");
      setIsOpen(false);
      if (onSuccess) onSuccess();
    } catch (err) {
      message.error("حدث خطأ أثناء الحفظ");
    } finally {
      setLoading(false);
    }
  };

  const props = {
    name: "image",
    action: "http://192.168.8.1:3000/admin/upload",
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
  const addSlideOld = () => {
    if (!newSlide.image.trim()) return message.warning("أضف رابط الصورة أولاً");
    setFormData({ ...formData, slides: [...formData.slides, newSlide] });
    setNewSlide({ image: "", subtitle: "", details: "" });
  };

  const removeSlideOld = (index) => {
    setFormData({
      ...formData,
      slides: formData.slides.filter((_, i) => i !== index),
    });
  };

  // 🔧 Fields by banner type
  const renderFields = () => {
    if (!record) return <div>لا توجد بيانات للعرض</div>;

    switch (record.type) {
      case "Category":
        return (
          <div>
            <label
              style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
            >
              اختر الفئات المراد عرضها *
            </label>
            <Select
              mode="multiple"
              placeholder="اختر فئات متعددة"
              value={getFirstMap(record).categoryIds || []}
              onChange={(vals) => {
                const updatedMap = Array.isArray(record.map)
                  ? [...record.map]
                  : [{}];
                updatedMap[0] = { ...updatedMap[0], categoryIds: vals };
                setRecord({ ...record, map: updatedMap });
                console.log("🔧 Categories selected:", vals);
              }}
              style={{ width: "100%" }}
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {categories.map((c) => (
                <Option key={c.id} value={c.id}>
                  {c.name}
                </Option>
              ))}
            </Select>
            <div style={{ fontSize: "12px", color: "#666", marginTop: "4px" }}>
              الفئات المحددة:{" "}
              {JSON.stringify(getFirstMap(record).categoryIds || [])} | الفئات
              المتاحة: {categories.length}
            </div>
          </div>
        );

      case "Single":
        return (
          <>
            <Input
              placeholder="العنوان الفرعي (اختياري)"
              value={record?.map?.[0]?.subtitle || ""}
              onChange={(e) => {
                const updatedMap = record.map ? [...record.map] : [{}];
                updatedMap[0] = { ...updatedMap[0], subtitle: e.target.value };
                setRecord({ ...record, map: updatedMap });
              }}
              style={{
                marginBottom: 12,
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <Input
              placeholder="أدخل رابط التحويل"
              value={record?.map?.[0]?.link || ""}
              onChange={(e) => {
                const updatedMap = record.map ? [...record.map] : [{}];
                updatedMap[0] = { ...updatedMap[0], link: e.target.value };
                setRecord({ ...record, map: updatedMap });
              }}
              style={{
                marginBottom: 12,
                border: "1px solid #ccc",
                borderRadius: "4px",
              }}
            />
            <div>
              <label
                style={{
                  display: "block",
                  marginBottom: "8px",
                  fontWeight: "500",
                }}
              >
                صورة البانر
              </label>
              <Upload {...props}>
                <div
                  style={{
                    border: "1px solid #bbb",
                    borderRadius: "6px",
                    padding: "16px",
                    textAlign: "center",
                    background: "#fafafa",
                    cursor: "pointer",
                    marginBottom: "8px",
                    transition: "border-color 0.2s",
                  }}
                >
                  {image ? (
                    <>
                      <PictureOutlined
                        style={{ fontSize: "24px", color: "#999" }}
                      />
                      <div style={{ marginTop: "8px", color: "#666" }}>
                        اختر صورة
                      </div>
                    </>
                  ) : (
                    <Button icon={<UploadOutlined />} loading={imageLoading}>
                      تغيير الصورة
                    </Button>
                  )}
                </div>
              </Upload>
              {image && (
                <div style={{ marginTop: 8 }}>
                  <img
                    src={image}
                    alt="banner"
                    style={{ maxWidth: "100%", maxHeight: 120 }}
                  />
                </div>
              )}
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
          </>
        );

      case "List":
        return (
          <Select
            mode="multiple"
            placeholder="اختر منتجات للقائمة"
            value={record?.map[0]?.productIds || []}
            onChange={(vals) => {
              const updatedMap = record.map ? [...record.map] : [{}];
              updatedMap[0] = { ...updatedMap[0], productIds: vals };
              setRecord({ ...record, map: updatedMap });
            }}
            style={{ width: "100%" }}
          >
            {products.map((p) => (
              <Option key={p.id} value={p.id}>
                {p.name} - {p.price}$
              </Option>
            ))}
          </Select>
        );
      case "Timer":
        if (
          Array.isArray(record.products) &&
          (!record.map[0]?.productIds || record.map[0].productIds.length === 0)
        ) {
          const productIds = record.products.map((p) => p.id);
          const updatedMap = record.map ? [...record.map] : [{}];
          updatedMap[0] = { ...updatedMap[0], productIds };
          setRecord({ ...record, map: updatedMap });
        }
        return (
          <>
            <div style={{ marginBottom: 16 }}>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                المنتجات للعرض الموقت *
              </label>
              <Select
                mode="multiple"
                placeholder="اختر منتجات للعرض الموقت"
                value={record?.map[0]?.productIds || []}
                onChange={(vals) => {
                  const updatedMap = record.map ? [...record.map] : [{}];
                  updatedMap[0] = { ...updatedMap[0], productIds: vals };
                  setRecord({ ...record, map: updatedMap });
                }}
                style={{ width: "100%" }}
              >
                {products.map((p) => (
                  <Option key={p.id} value={p.id}>
                    {p.name} - {p.price}$
                  </Option>
                ))}
              </Select>
            </div>

            <div>
              <label
                style={{ display: "block", marginBottom: 8, fontWeight: 500 }}
              >
                تاريخ انتهاء العرض *
              </label>
              <DatePicker
                showTime
                value={
                  record?.map[0]?.endDate ? dayjs(record.map[0].endDate) : null
                }
                onChange={(date) => {
                  const updatedMap = record.map ? [...record.map] : [{}];
                  updatedMap[0] = {
                    ...updatedMap[0],
                    endDate: date ? date.format("YYYY-MM-DD HH:mm:ss") : null,
                  };
                  setRecord({ ...record, map: updatedMap });
                }}
                format="YYYY-MM-DD HH:mm:ss"
                style={{ width: "100%" }}
                placeholder="اختر تاريخ ووقت انتهاء العرض"
              />
            </div>
          </>
        );

      case "Slider":
        return (
          <>
            <Input
              placeholder="اسم السلايدر"
              value={sliderTitle}
              onChange={e => setSliderTitle(e.target.value)}
              style={{ marginBottom: 12 }}
            />
            <Input
              placeholder="العنوان الفرعي للسلايدر (اختياري)"
              value={sliderSubtitle}
              onChange={e => setSliderSubtitle(e.target.value)}
              style={{ marginBottom: 24 }}
            />
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>السلايدات</label>
              <List
                dataSource={slides.filter(slide => slide && slide.image && slide.name && slide.link)}
                renderItem={(slide, idx) => (
                  <List.Item
                    key={slide.image + slide.name + idx} // Always provide a key
                    actions={[
                      <Button
                        type="link"
                        icon={<PlusOutlined />}
                        onClick={() => {
                          setNewSlide(slide);
                          setEditIndex(idx);
                        }}
                      >
                        تعديل
                      </Button>,
                      <Button
                        type="link"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => removeSlide(idx)}
                      >
                        حذف
                      </Button>,
                    ]}
                  >
                    <Card
                      style={{ width: 300 }}
                      cover={
                        <img
                          src={slide.image}
                          alt={`slide-${idx}`}
                          style={{ maxHeight: 120, objectFit: "cover" }}
                        />
                      }
                    >
                      <div>
                        <div style={{ fontWeight: 600 }}>{slide.name}</div>
                        <div style={{ color: "#888", marginBottom: 8 }}>{slide.subtitle}</div>
                        <a href={slide.link} target="_blank" rel="noopener noreferrer">
                          {slide.link}
                        </a>
                        <div style={{ marginTop: 8, color: "#007bff", fontWeight: 500 }}>
                          {slide.cta}
                        </div>
                      </div>
                    </Card>
                  </List.Item>
                )}
              />
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ fontWeight: 500 }}>إضافة سلايد جديد</label>
              <Upload {...slideUploadProps}>
                <Button icon={<UploadOutlined />} loading={imageLoading}>
                  رفع صورة السلايد
                </Button>
              </Upload>
              {newSlide.image && (
                <img
                  src={newSlide.image}
                  alt="slide-preview"
                  style={{ maxWidth: "100%", maxHeight: 120, marginTop: 8 }}
                />
              )}
              <Input
                placeholder="اسم السلايد"
                value={newSlide.name}
                onChange={e => setNewSlide(prev => ({ ...prev, name: e.target.value }))}
                style={{ marginTop: 8, marginBottom: 8 }}
              />
              <Input
                placeholder="العنوان الفرعي للسلايد (اختياري)"
                value={newSlide.subtitle}
                onChange={e => setNewSlide(prev => ({ ...prev, subtitle: e.target.value }))}
                style={{ marginBottom: 8 }}
              />
              <Input
                placeholder="رابط المنتج"
                value={newSlide.link}
                onChange={e => setNewSlide(prev => ({ ...prev, link: e.target.value }))}
                style={{ marginBottom: 8 }}
              />
              <Input
                placeholder="CTA نص الزر (اختياري)"
                value={newSlide.cta}
                onChange={e => setNewSlide(prev => ({ ...prev, cta: e.target.value }))}
                style={{ marginBottom: 8 }}
              />
              <Button type="primary" onClick={addOrEditSlide}>
                {editIndex !== null ? "تحديث السلايد" : "إضافة السلايد"}
              </Button>
            </div>
          </>
        );

      default:
        return <p>نوع البانر غير مدعوم.</p>;
    }
  };

  useEffect(() => {
    // Fetch categories when modal opens for Category type
    if (isOpen && record?.type === "Category") {
      apiCall({
        pathname: "/admin/categories",
        method: "GET",
        auth: true,
      }).then((res) => {
        if (res && !res.error) {
          setCategories(Array.isArray(res.data) ? res.data : res);
          if (Array.isArray(record?.map) && record.map.length > 0 && !record.map[0].categoryIds) {
            const selectedIds = Array.isArray(record.map)
              ? record.map.map(cat => cat.id).filter(Boolean)
              : [];
            const updatedMap = [{ categoryIds: selectedIds }];
            setRecord({ ...record, map: updatedMap });
          }
        } else {
          setCategories([]);
        }
      });
    }
    // Fetch all products when modal opens for List or Timer type
    if (isOpen && (record?.type === "List" || record?.type === "Timer")) {
      // Use /admin/products/all to fetch all products
      apiCall({
        pathname: "/admin/products/all",
        method: "GET",
        auth: true,
      }).then((res) => {
        if (res && !res.error) {
          let productsArray = [];
          if (Array.isArray(res)) productsArray = res;
          else if (Array.isArray(res.data)) productsArray = res.data;
          else if (Array.isArray(res.products)) productsArray = res.products;
          setProducts(productsArray);
          if (
            record?.type === "Timer" &&
            Array.isArray(getFirstMap(record)?.products) &&
            (!getFirstMap(record)?.productIds || getFirstMap(record)?.productIds.length === 0)
          ) {
            const selectedIds = getFirstMap(record).products.map(p => p.id).filter(Boolean);
            const updatedMap = [{
              ...getFirstMap(record),
              productIds: selectedIds,
            }];
            setRecord({ ...record, map: updatedMap });
          }
        } else {
          setProducts([]);
        }
      });
    }
  }, [isOpen]);

  if (!isOpen || !record) return null;

  return (
    <Modal
      title={`تعديل محتوى البانر (${record?.type || ""})`}
      open={isOpen}
      onCancel={() => setIsOpen(false)}
      footer={[
        <Button key="cancel" onClick={() => setIsOpen(false)}>
          إلغاء
        </Button>,
        <Button
          key="save"
          type="primary"
          loading={loading}
          onClick={handleSave}
        >
          حفظ
        </Button>,
      ]}
      width={750}
      destroyOnHidden
    >
      {renderFields()}
    </Modal>
  );
};
