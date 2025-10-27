// import {
//   Input,
//   Modal,
//   Select,
//   InputNumber,
//   Button,
//   message,
//   DatePicker,
//   Switch,
//   Tag,
// } from "antd";
// import React, { useEffect, useState, useCallback } from "react";
// import { apiCall } from "../../../../hooks/useFetch";
// import {
//   PlusOutlined,
//   MinusCircleOutlined,
//   DeleteOutlined,
//   ExclamationCircleOutlined,
// } from "@ant-design/icons";
// import dayjs from "dayjs";

// const { Option } = Select;
// const { TextArea } = Input;
// const { confirm } = Modal;

// export const ProductModal = ({
//   isOpen,
//   setIsOpen,
//   record,
//   setRecord,
//   mode = "edit",
//   onSuccess,
//   onDelete,
// }) => {
//   const [name, setName] = useState("");
//   const [description, setDescription] = useState("");
//   const [price, setPrice] = useState(0);
//   const [stock, setStock] = useState(0);
//   const [available, setAvailable] = useState(true);
//   const [active, setActive] = useState(true);
//   const [category, setCategory] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [categoriesLoading, setCategoriesLoading] = useState(false);
//   const [options, setOptions] = useState([]);
//   const [hasDiscount, setHasDiscount] = useState(false);
//   const [endPrice, setEndPrice] = useState(0);
//   const [endPriceDate, setEndPriceDate] = useState(null);
//   const [allProducts, setAllProducts] = useState([]);
//   const [related, setRelated] = useState([]);

//   const handleDelete = useCallback(() => {
//     if (!record || !record.id) {
//       message.error("لا يمكن حذف منتج غير محفوظ");
//       setIsOpen(false);
//       return;
//     }

//     confirm({
//       title: "تأكيد الحذف",
//       icon: <ExclamationCircleOutlined />,
//       content: (
//         <div>
//           <p>
//             هل أنت متأكد من حذف المنتج <strong>"{record.name}"</strong>؟
//           </p>
//           <p style={{ color: "#ff4d4f", fontSize: "12px" }}>
//             هذا الإجراء لا يمكن التراجع عنه
//           </p>
//         </div>
//       ),
//       okText: "نعم، احذف",
//       cancelText: "إلغاء",
//       okType: "danger",
//       width: 450,
//       onOk: async () => {
//         try {
//           const response = await apiCall({
//             pathname: `/admin/products/${record.id}`,
//             method: "DELETE",
//             auth: true,
//           });

//           if (response && response.error === true) {
//             throw new Error(response.message || "فشل في حذف المنتج");
//           }

//           message.success("تم حذف المنتج بنجاح");
//           setIsOpen(false);
//           clear();

//           if (onDelete) onDelete();
//           if (onSuccess) onSuccess();
//         } catch (error) {
//           message.error(`فشل في حذف المنتج: ${error.message}`);
//         }
//       },
//       onCancel: () => setIsOpen(false),
//     });
//   }, [record, setIsOpen, onDelete, onSuccess]);

//   useEffect(() => {
//     if (isOpen && mode === "delete" && record && record.id) {
//       setTimeout(() => handleDelete(), 100);
//     }
//   }, [isOpen, mode, record, handleDelete]);

//   const fetchCategories = async () => {
//     setCategoriesLoading(true);
//     try {
//       const response = await apiCall({
//         pathname: "/admin/categories",
//         method: "GET",
//         auth: true,
//       });
//       if (response && !response.error) {
//         let categoriesArray = [];
//         if (Array.isArray(response)) categoriesArray = response;
//         else if (response.data && Array.isArray(response.data))
//           categoriesArray = response.data;
//         else if (response.categories && Array.isArray(response.categories))
//           categoriesArray = response.categories;
//         setCategories(categoriesArray);
//       } else {
//         message.error("فشل في تحميل الفئات");
//         setCategories([]);
//       }
//     } catch {
//       message.error("حدث خطأ في تحميل الفئات");
//       setCategories([]);
//     } finally {
//       setCategoriesLoading(false);
//     }
//   };

//   const fetchAllProducts = async () => {
//     try {
//       const response = await apiCall({
//         pathname: "/admin/products",
//         method: "GET",
//         auth: true,
//       });
//       if (response && !response.error) {
//         setAllProducts(Array.isArray(response.data) ? response.data : response);
//       } else setAllProducts([]);
//     } catch {
//       setAllProducts([]);
//     }
//   };

//   useEffect(() => {
//     if (isOpen && mode !== "delete") {
//       fetchCategories();
//       fetchAllProducts();
//     }
//   }, [isOpen, mode]);

//   useEffect(() => {
//     if (isOpen && mode !== "delete") {
//       if (record) {
//         setName(record.name || "");
//         setDescription(record.description || "");
//         setPrice(record.price || 0);
//         setStock(record.stock || 0);
//         setAvailable(record.available !== false);
//         setActive(record.active !== false);
//         setCategory(record.category_id || record.category || "");

//         try {
//           const recordOptions =
//             typeof record.options === "string"
//               ? JSON.parse(record.options)
//               : record.options || [];
//           setOptions(Array.isArray(recordOptions) ? recordOptions : []);
//         } catch {
//           setOptions([]);
//         }

//         const hasEndPrice = record.endprice && record.endprice > 0;
//         setHasDiscount(hasEndPrice);
//         setEndPrice(record.endprice || 0);
//         setEndPriceDate(
//           record.endpricedate ? dayjs(record.endpricedate) : null
//         );
//         setRelated(
//           record.related
//             ? Array.isArray(record.related)
//               ? record.related
//               : typeof record.related === "string"
//               ? JSON.parse(record.related)
//               : []
//             : []
//         );
//       } else clear();
//     }
//   }, [record, isOpen, mode]);

//   const clear = () => {
//     setName("");
//     setDescription("");
//     setPrice(0);
//     setStock(0);
//     setAvailable(true);
//     setActive(true);
//     setCategory("");
//     setOptions([]);
//     setHasDiscount(false);
//     setEndPrice(0);
//     setEndPriceDate(null);
//     setRecord(null);
//     setRelated([]);
//   };

//   const addOption = () => setOptions([...options, { name: "", values: [] }]);
//   const removeOption = (i) => setOptions(options.filter((_, idx) => i !== idx));
//   const updateOptionName = (i, name) => {
//     const newOptions = [...options];
//     newOptions[i].name = name;
//     setOptions(newOptions);
//   };
//   const updateOptionValues = (i, values) => {
//     const newOptions = [...options];
//     newOptions[i].values = values;
//     setOptions(newOptions);
//   };

//   const validateForm = () => {
//     if (!name || name.trim().length < 2) {
//       message.error("يرجى إدخال اسم المنتج (أكثر من حرفين)");
//       return false;
//     }
//     if (!price || price <= 0) {
//       message.error("يرجى إدخال سعر صحيح");
//       return false;
//     }
//     if (stock < 0) {
//       message.error("المخزون لا يمكن أن يكون سالباً");
//       return false;
//     }
//     if (!category) {
//       message.error("يرجى اختيار فئة المنتج");
//       return false;
//     }
//     if (
//       hasDiscount &&
//       (!endPrice || endPrice <= 0 || endPrice >= price || !endPriceDate)
//     ) {
//       message.error("تحقق من بيانات الخصم");
//       return false;
//     }
//     return true;
//   };

//   const handleSubmit = async () => {
//     if (!validateForm()) return;

//     try {
//       setLoading(true);
//       const formattedEndDate =
//         hasDiscount && endPriceDate?.isValid()
//           ? endPriceDate.format("YYYY-MM-DD")
//           : null;

//       const formData = {
//         name: name.trim(),
//         description: description.trim(),
//         price: Number(price),
//         stock: Number(stock),
//         available,
//         active,
//         category_id: Number(category),
//         status: available ? "نشط" : "غير نشط",
//         options: JSON.stringify(
//           options.filter((opt) => opt.name && opt.values.length > 0)
//         ),
//         endprice: hasDiscount ? Number(endPrice) : null,
//         endpricedate: formattedEndDate,
//         related: JSON.stringify(related),
//       };

//       const response = record?.id
//         ? await apiCall({
//             pathname: `/admin/products/${record.id}`,
//             method: "PUT",
//             data: formData,
//             auth: true,
//           })
//         : await apiCall({
//             pathname: "/admin/products",
//             method: "POST",
//             data: formData,
//             auth: true,
//           });

//       if (response && response.success)
//         message.success(
//           record?.id ? "تم تحديث المنتج بنجاح" : "تم إضافة المنتج بنجاح"
//         );
//       else throw new Error("فشل في حفظ المنتج");

//       setIsOpen(false);
//       clear();
//       if (onSuccess) onSuccess();
//     } catch (error) {
//       message.error(error.message || "حدث خطأ أثناء الحفظ");
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleCancel = () => {
//     setIsOpen(false);
//     clear();
//   };

//   const getModalTitle = () =>
//     mode === "delete"
//       ? `حذف المنتج: ${record?.name || ""}`
//       : mode === "create"
//       ? "إضافة منتج جديد"
//       : "تحديث المنتج";

//   if (mode === "delete")
//     return (
//       <Modal
//         title={getModalTitle()}
//         open={isOpen}
//         onCancel={handleCancel}
//         footer={null}
//         width={400}
//         destroyOnClose
//       >
//         <div style={{ textAlign: "center", padding: "20px" }}>
//           <DeleteOutlined
//             style={{ fontSize: "48px", color: "#ff4d4f", marginBottom: "16px" }}
//           />
//           <p>جاري معالجة طلب الحذف...</p>
//         </div>
//       </Modal>
//     );

//   return (
//     <Modal
//       title={getModalTitle()}
//       open={isOpen}
//       onCancel={handleCancel}
//       width={800}
//       destroyOnHidden
//       footer={[
//         <Button key="cancel" onClick={handleCancel} size="large">
//           إلغاء
//         </Button>,
//         <Button
//           key="submit"
//           type="primary"
//           loading={loading}
//           onClick={handleSubmit}
//           size="large"
//         >
//           {mode === "create" ? "إضافة المنتج" : "تحديث المنتج"}
//         </Button>,
//       ]}
//     >
//     </Modal>
//   );
// };


import {
  Input,
  Modal,
  Select,
  InputNumber,
  Button,
  message,
  DatePicker,
  Switch,
  Tag,
} from "antd";
import React, { useEffect, useState, useCallback } from "react";
import { apiCall } from "../../../../hooks/useFetch";
import {
  PlusOutlined,
  MinusCircleOutlined,
  DeleteOutlined,
  ExclamationCircleOutlined,
} from "@ant-design/icons";
import dayjs from "dayjs";

const { Option } = Select;
const { TextArea } = Input;
const { confirm } = Modal;

export const ProductModal = ({
  isOpen,
  setIsOpen,
  record,
  setRecord,
  mode = "edit",
  onSuccess,
  onDelete,
}) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState(0);
  const [stock, setStock] = useState(0);
  const [available, setAvailable] = useState(true);
  const [active, setActive] = useState(true);
  const [category, setCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [options, setOptions] = useState([]);
  const [hasDiscount, setHasDiscount] = useState(false);
  const [endPrice, setEndPrice] = useState(0);
  const [endPriceDate, setEndPriceDate] = useState(null);

  const [allProducts, setAllProducts] = useState([]);
  const [related, setRelated] = useState([]);

  const handleDelete = useCallback(() => {
    if (!record || !record.id) {
      message.error("لا يمكن حذف منتج غير محفوظ");
      setIsOpen(false);
      return;
    }

    confirm({
      title: "تأكيد الحذف",
      icon: <ExclamationCircleOutlined />,
      content: (
        <div>
          <p>
            هل أنت متأكد من حذف المنتج <strong>"{record.name}"</strong>؟
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
            pathname: `/admin/products/${record.id}`,
            method: "DELETE",
            auth: true,
          });

          if (response && response.error === true) {
            throw new Error(response.message || "فشل في حذف المنتج");
          }

          if (response && response.unauthorized) {
            message.warning("انتهت صلاحية الجلسة، يرجى تسجيل الدخول مجددًا");
            return;
          }

          message.success("تم حذف المنتج بنجاح");
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
            `فشل في حذف المنتج: ${error.message || "حدث خطأ غير متوقع"}`
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

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const response = await apiCall({
        pathname: "/admin/categories",
        method: "GET",
        auth: true,
      });

      if (response && !response.error) {
        let categoriesArray = [];
        if (Array.isArray(response)) {
          categoriesArray = response;
        } else if (response.data && Array.isArray(response.data)) {
          categoriesArray = response.data;
        } else if (response.categories && Array.isArray(response.categories)) {
          categoriesArray = response.categories;
        }

        setCategories(categoriesArray);
      } else {
        message.error("فشل في تحميل الفئات");
        setCategories([]);
      }
    } catch (error) {
      message.error("حدث خطأ في تحميل الفئات");
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // Fetch all products for the related dropdown
  const fetchAllProducts = async () => {
    try {
      const response = await apiCall({
        pathname: "/admin/products",
        method: "GET",
        auth: true,
      });
      if (response && !response.error) {
        setAllProducts(Array.isArray(response.data) ? response.data : response);
      } else {
        setAllProducts([]);
      }
    } catch {
      setAllProducts([]);
    }
  };

  useEffect(() => {
    if (isOpen && mode !== "delete") {
      fetchCategories();
      fetchAllProducts();
    }
  }, [isOpen, mode]);

  useEffect(() => {
    if (isOpen && mode !== "delete") {
      if (record) {
        setName(record.name || "");
        setDescription(record.description || "");
        setPrice(record.price || 0);
        setStock(record.stock || 0);
        setAvailable(record.available !== false);
        setActive(record.active !== false);
        setCategory(record.category_id || record.category || "");

        try {
          const recordOptions = record.options
            ? typeof record.options === "string"
              ? JSON.parse(record.options)
              : record.options
            : [];
          setOptions(Array.isArray(recordOptions) ? recordOptions : []);
        } catch (error) {
          setOptions([]);
        }

        const hasEndPrice = record.endprice && record.endprice > 0;
        setHasDiscount(hasEndPrice);
        setEndPrice(record.endprice || 0);

        if (record.endpricedate) {
          try {
            const dateValue = dayjs(record.endpricedate);
            setEndPriceDate(dateValue.isValid() ? dateValue : null);
          } catch (error) {
            setEndPriceDate(null);
          }
        } else {
          setEndPriceDate(null);
        }

        // Set related products
        setRelated(
          record && record.related
            ? Array.isArray(record.related)
              ? record.related
              : typeof record.related === "string"
                ? JSON.parse(record.related)
                : []
            : []
        );
      } else {
        clear();
      }
    }
  }, [record, isOpen, mode]);

  const clear = () => {
    setName("");
    setDescription("");
    setPrice(0);
    setStock(0);
    setAvailable(true);
    setActive(true);
    setCategory("");
    setOptions([]);
    setHasDiscount(false);
    setEndPrice(0);
    setEndPriceDate(null);
    setRecord(null);
    setRelated([]);
  };

  const addOption = () => {
    setOptions([...options, { name: "", values: [] }]);
  };

  const removeOption = (index) => {
    const newOptions = options.filter((_, i) => i !== index);
    setOptions(newOptions);
  };

  const updateOptionName = (index, name) => {
    const newOptions = [...options];
    newOptions[index].name = name;
    setOptions(newOptions);
  };

  const updateOptionValues = (index, values) => {
    const newOptions = [...options];
    newOptions[index].values = values;
    setOptions(newOptions);
  };

  const validateForm = () => {
    if (!name || name.trim().length < 2) {
      message.error("يرجى إدخال اسم المنتج (أكثر من حرفين)");
      return false;
    }
    if (!price || price <= 0) {
      message.error("يرجى إدخال سعر صحيح");
      return false;
    }
    if (stock < 0) {
      message.error("المخزون لا يمكن أن يكون سالباً");
      return false;
    }
    if (!category) {
      message.error("يرجى اختيار فئة المنتج");
      return false;
    }

    if (hasDiscount) {
      if (!endPrice || endPrice <= 0) {
        message.error("يرجى إدخال سعر الخصم");
        return false;
      }
      if (endPrice >= price) {
        message.error("سعر الخصم يجب أن يكون أقل من السعر الأصلي");
        return false;
      }
      if (!endPriceDate) {
        message.error("يرجى تحديد تاريخ انتهاء الخصم");
        return false;
      }
      if (endPriceDate.isBefore(dayjs(), "day")) {
        message.error("تاريخ انتهاء الخصم يجب أن يكون في المستقبل");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);

      let formattedEndDate = null;
      if (hasDiscount && endPriceDate && endPriceDate.isValid()) {
        formattedEndDate = endPriceDate.format("YYYY-MM-DD");
      }

      const formData = {
        name: name.trim(),
        description: description.trim(),
        price: Number(price),
        stock: Number(stock),
        available,
        active,
        category_id: Number(category),
        status: available ? "نشط" : "غير نشط",
        options: JSON.stringify(
          options.filter((opt) => opt.name && opt.values.length > 0)
        ),
        endprice: hasDiscount ? Number(endPrice) : null,
        endpricedate: formattedEndDate,
        related: JSON.stringify(related),
      };

      let response;

      if (record && record.id) {
        response = await apiCall({
          pathname: `/admin/products/${record.id}`,
          method: "PUT",
          data: formData,
          auth: true,
        });

        if (response && response.success) {
          message.success("تم تحديث المنتج بنجاح");
        } else {
          throw new Error(response?.error || "فشل في تحديث المنتج");
        }
      } else {
        response = await apiCall({
          pathname: "/admin/products",
          method: "POST",
          data: formData,
          auth: true,
        });

        if (response && response.success) {
          message.success("تم إضافة المنتج بنجاح");
        } else {
          throw new Error(response?.error || "فشل في إضافة المنتج");
        }
      }

      setIsOpen(false);
      clear();
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Submit error:", error);
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
    if (mode === "delete") return `حذف المنتج: ${record?.name || ""}`;
    if (mode === "create") return "إضافة منتج جديد";
    return "تحديث المنتج";
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
        <div style={{ textAlign: "center", padding: "20px" }}>
          <DeleteOutlined
            style={{ fontSize: "48px", color: "#ff4d4f", marginBottom: "16px" }}
          />
          <p>جاري معالجة طلب الحذف...</p>
        </div>
      </Modal>
    );
  }

  const handleToggle = async (field, checked) => {
    if (!record || !record.id) {
      // For new products, just update local state
      if (field === "available") {
        setAvailable(checked);
      } else if (field === "active") {
        setActive(checked);
      }
      return;
    }

    try {
      const currentProduct = await apiCall({
        pathname: `/admin/products/${record.id}/with-primary-image`,
        method: "GET",
        auth: true,
      });

      if (!currentProduct || currentProduct.error) {
        throw new Error("فشل في جلب بيانات المنتج الحالية");
      }

      const updateData = {
        name: currentProduct.name,
        category_id: currentProduct.category_id,
        related: currentProduct.related,
        description: currentProduct.description,
        active: field === "active" ? checked : currentProduct.active,
        options: currentProduct.options,
        price: currentProduct.price,
        endprice: currentProduct.endprice,
        endpricdate: currentProduct.endpricdate,
        stock: currentProduct.stock,
        available: field === "available" ? checked : currentProduct.available,
      };

      const response = await apiCall({
        pathname: `/admin/products/${record.id}`,
        method: "PUT",
        data: updateData,
        auth: true,
      });

      if (response && response.success) {
        const messages = {
          available: `تم ${checked ? "تفعيل توفر" : "إلغاء توفر"} المنتج`,
          active: `تم ${checked ? "إظهار" : "إخفاء"} المنتج`,
        };
        message.success(messages[field]);

        if (field === "available") {
          setAvailable(checked);
        } else if (field === "active") {
          setActive(checked);
        }

        // Update the record state to keep it in sync
        setRecord((prev) => ({ ...prev, [field]: checked }));

        // Refresh parent data
        if (onSuccess) {
          onSuccess();
        }
      } else {
        throw new Error(response?.error || `فشل في تحديث حالة ${field}`);
      }
    } catch (error) {
      console.error("Toggle error:", error);
      message.error(
        `حدث خطأ في تحديث ${field === "available" ? "توفر" : "حالة"} المنتج`
      );

      // Revert the switch to previous state on error
      if (field === "available") {
        setAvailable(record.available);
      } else if (field === "active") {
        setActive(record.active);
      }
    }
  };

  return (
    <Modal
      title={getModalTitle()}
      open={isOpen}
      onCancel={handleCancel}
      width={800}
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
          {mode === "create" ? "إضافة المنتج" : "تحديث المنتج"}
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
            اسم المنتج *
          </label>
          <Input
            placeholder="أدخل اسم المنتج"
            value={name}
            onChange={(e) => setName(e.target.value)}
            size="large"
          />
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            الوصف
          </label>
          <TextArea
            placeholder="وصف المنتج (اختياري)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            size="large"
          />
        </div>

        <div style={{ display: "flex", gap: "16px" }}>
          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              السعر *
            </label>
            <InputNumber
              placeholder="السعر"
              value={price}
              onChange={setPrice}
              min={0}
              step={0.01}
              size="large"
              style={{ width: "100%" }}
              addonBefore="$"
            />
          </div>

          <div style={{ flex: 1 }}>
            <label
              style={{
                display: "block",
                marginBottom: "8px",
                fontWeight: "500",
              }}
            >
              المخزون
            </label>
            <InputNumber
              placeholder="المخزون"
              value={stock}
              onChange={setStock}
              min={0}
              size="large"
              style={{ width: "100%" }}
            />
          </div>
        </div>

        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            padding: "16px",
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <Switch
              checked={hasDiscount}
              onChange={setHasDiscount}
              checkedChildren="يوجد خصم"
              unCheckedChildren="لا يوجد خصم"
            />
            <span style={{ marginLeft: "12px", fontWeight: "500" }}>
              إعدادات الخصم
            </span>
          </div>

          {hasDiscount && (
            <div style={{ display: "flex", gap: "16px" }}>
              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  سعر الخصم *
                </label>
                <InputNumber
                  placeholder="سعر الخصم"
                  value={endPrice}
                  onChange={setEndPrice}
                  min={0}
                  max={price - 0.01}
                  step={0.01}
                  size="large"
                  style={{ width: "100%" }}
                  addonBefore="$"
                />
              </div>

              <div style={{ flex: 1 }}>
                <label
                  style={{
                    display: "block",
                    marginBottom: "8px",
                    fontWeight: "500",
                  }}
                >
                  تاريخ انتهاء الخصم *
                </label>
                <DatePicker
                  placeholder="اختر التاريخ"
                  value={endPriceDate}
                  onChange={setEndPriceDate}
                  size="large"
                  style={{ width: "100%" }}
                  disabledDate={(current) =>
                    current && current < dayjs().startOf("day")
                  }
                />
              </div>
            </div>
          )}
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            الفئة *
          </label>
          <Select
            placeholder="اختر فئة المنتج"
            value={category}
            onChange={setCategory}
            size="large"
            style={{ width: "100%" }}
            loading={categoriesLoading}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {categories.map((cat) => (
              <Option key={cat.id} value={cat.id}>
                {cat.name}
              </Option>
            ))}
          </Select>
        </div>

        <div>
          <label
            style={{ display: "block", marginBottom: "8px", fontWeight: "500" }}
          >
            منتجات ذات صلة
          </label>
          <Select
            mode="multiple"
            placeholder="اختر منتجات ذات صلة"
            value={related}
            onChange={setRelated}
            size="large"
            style={{ width: "100%" }}
            showSearch
            filterOption={(input, option) =>
              option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
            }
          >
            {allProducts
              .filter((p) => !record?.id || p.id !== record.id) // Exclude self
              .map((prod) => (
                <Option key={prod.id} value={prod.id}>
                  {prod.name}
                </Option>
              ))}
          </Select>
        </div>

        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            padding: "16px",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <label style={{ fontWeight: "500", margin: 0 }}>
              خصائص المنتج (اللون، الحجم، إلخ)
            </label>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={addOption}
              size="small"
            >
              إضافة خاصية
            </Button>
          </div>

          {options?.map((option, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #f0f0f0",
                borderRadius: "4px",
                padding: "12px",
                marginBottom: "12px",
                backgroundColor: "#fafafa",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: "12px",
                  marginBottom: "8px",
                  alignItems: "center",
                }}
              >
                <Input
                  placeholder="اسم الخاصية (مثل: اللون)"
                  value={option?.name}
                  onChange={(e) => updateOptionName(index, e.target.value)}
                  style={{ flex: 1 }}
                />
                <Button
                  type="text"
                  danger
                  icon={<MinusCircleOutlined />}
                  onClick={() => removeOption(index)}
                  size="small"
                />
              </div>

              <Select
                mode="tags"
                placeholder="أدخل القيم (مثل: أحمر، أزرق، أخضر)"
                value={option?.values}
                onChange={(values) => updateOptionValues(index, values)}
                style={{ width: "100%" }}
                tokenSeparators={[",", "،"]}
              />

              {option?.values?.length > 0 && (
                <div style={{ marginTop: "8px" }}>
                  {option?.values.map((value, valueIndex) => (
                    <Tag
                      key={valueIndex}
                      color="blue"
                      style={{ margin: "2px" }}
                    >
                      {value}
                    </Tag>
                  ))}
                </div>
              )}
            </div>
          ))}

          {options.length === 0 && (
            <div
              style={{
                textAlign: "center",
                color: "#999",
                padding: "20px",
                fontStyle: "italic",
              }}
            >
              لا توجد خصائص مضافة. اضغط "إضافة خاصية" لإضافة خصائص المنتج.
            </div>
          )}
        </div>

        <div
          style={{
            border: "1px solid #d9d9d9",
            borderRadius: "6px",
            padding: "16px",
          }}
        >
          <h4 style={{ margin: "0 0 16px 0", fontWeight: "500" }}>
            إعدادات المنتج
          </h4>

          <div
            style={{ display: "flex", flexDirection: "column", gap: "16px" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <label style={{ fontWeight: "500", margin: 0 }}>
                  توفر المنتج
                </label>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}
                >
                  يتحكم في إظهار المنتج كمتوفر أو غير متوفر للعملاء
                </div>
              </div>
              <Switch
                checked={available}
                onChange={(checked) => handleToggle("available", checked)}
                checkedChildren="متوفر"
                unCheckedChildren="غير متوفر"
              />
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <div>
                <label style={{ fontWeight: "500", margin: 0 }}>
                  نشاط المنتج
                </label>
                <div
                  style={{ fontSize: "12px", color: "#666", marginTop: "2px" }}
                >
                  يتحكم في إظهار أو إخفاء المنتج في المتجر
                </div>
              </div>
              <Switch
                checked={active}
                onChange={(checked) => handleToggle("active", checked)}
                checkedChildren="نشط"
                unCheckedChildren="مخفي"
              />
            </div>
          </div>

          <div
            style={{
              marginTop: "12px",
              padding: "8px",
              backgroundColor: "#f6f6f6",
              borderRadius: "4px",
            }}
          >
            <small style={{ color: "#666", fontSize: "12px" }}>
              <strong>ملاحظة:</strong> المنتج يجب أن يكون نشطاً ومتوفراً ليظهر
              للعملاء في المتجر
            </small>
          </div>
        </div>
      </div>
    </Modal>
  );
};

