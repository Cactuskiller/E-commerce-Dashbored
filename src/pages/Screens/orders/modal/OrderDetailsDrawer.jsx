import React, { useEffect, useState } from "react";
import {
  Drawer,
  Tabs,
  Descriptions,
  List,
  Tag,
  Select,
  Button,
  message,
  Avatar,
  InputNumber,
  Modal,
  Input,
  Space,
  Popconfirm,
  Card,
} from "antd";
import {
  ReloadOutlined,
  EditOutlined,
  SaveOutlined,
  DeleteOutlined,
  PlusOutlined,
  MinusOutlined,
} from "@ant-design/icons";
import { apiCall } from "../../../../hooks/useFetch";

const { Option } = Select;
const { TextArea } = Input;

export const OrderDetailsDrawer = ({
  isOpen,
  setIsOpen,
  order,
  refreshOrders,
}) => {
  const [userOrders, setUserOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [localItems, setLocalItems] = useState([]);
  const [liveItems, setLiveItems] = useState([]);
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [differentValueStock, setDifferentValueStock] = useState([]);

  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState(null);
  const [addProductForm, setAddProductForm] = useState({
    quantity: 1,
    notes: "",
  });

  const [saveOrderError, setSaveOrderError] = useState("");

  // Add these states at the top with your other useState hooks:
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [editForm, setEditForm] = useState({
    quantity: 1,
    selectedOptions: {},
    notes: "",
  });

  // Helper to get product options from liveItems
  const getProductOptions = (productId) => {
    const product = liveItems.find((p) => p.id === productId);
    return product?.options || [];
  };

  // Helper to get product stock from liveItems
  const getProductStock = (productId) => {
    const product = liveItems.find((p) => p.id === productId);
    return product?.stock || 999;
  };

  // ✅ ADD THIS
  const getItemQuantity = (item) => {
    return parseInt(item.qty || item.quantity || 1);
  };

  const handleEditProduct = async (index, item) => {
    // Fetch products if not loaded
    if (!availableProducts.length) {
      await fetchAvailableProducts();
    }

    setEditingProduct({ index, ...item });

    // Parse user's selected options safely
    let userSelectedOptions = {};
    try {
      if (typeof item.options === "string") {
        userSelectedOptions = JSON.parse(item.options);
      } else if (typeof item.options === "object" && item.options !== null) {
        userSelectedOptions = item.options;
      }
    } catch (error) {
      userSelectedOptions = {};
    }

    setEditForm({
      name: item.name || item.title || "",
      price: item.price || 0,
      quantity: getItemQuantity(item),
      selectedOptions: userSelectedOptions,
      notes: userSelectedOptions.notes || item.notes || "",
    });

    setEditModalVisible(true);
  };

  const handleSaveEditProduct = () => {
    if (!editingProduct) return;
    const stock = getProductStock(
      editingProduct.product_id || editingProduct.id
    );
    if (editForm.quantity < 1 || editForm.quantity > stock) {
      message.error(`الكمية المطلوبة تتجاوز المخزون المتاح (${stock})`);
      return;
    }

    setLocalItems((prev) =>
      prev.map((itm, idx) =>
        idx === editingProduct.index
          ? {
              ...itm,
              qty: editForm.quantity,
              options: editForm.selectedOptions,
              notes: editForm.notes,
            }
          : itm
      )
    );
    setEditModalVisible(false);
    setEditingProduct(null);
    setEditForm({
      quantity: 1,
      selectedOptions: {},
      notes: "",
    });
    message.success("تم تعديل المنتج بنجاح");
  };

  useEffect(() => {
    fetchOrderProductsStock();
  }, [order?.items]);

  const fetchUserOrders = async () => {
    if (!order?.user_id) return;
    setLoadingOrders(true);
    try {
      const data = await apiCall({
        pathname: `/admin/orders/user/${order.user_id}`,
        method: "GET",
        auth: true,
      });
      const ordersArray = Array.isArray(data)
        ? data
        : Array.isArray(data?.orders)
        ? data.orders
        : [];
      setUserOrders(ordersArray.filter((o) => o.id !== order.id));
    } catch {
      message.error("تعذر تحميل الطلبات السابقة للمستخدم");
      setUserOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (!order?.id) return;
    setUpdatingStatus(true);
    try {
      const res = await apiCall({
        pathname: `/admin/orders/${order.id}/status`,
        method: "PATCH",
        auth: true,
        data: { status: newStatus },
      });

      if (res?.success) {
        message.success(`تم تحديث الحالة إلى: ${getStatusLabel(newStatus)}`);
        refreshOrders?.();
        setIsOpen(false);
      } else {
        throw new Error(res?.error || res?.message || "فشل في تحديث الحالة");
      }
    } catch {
      message.error("فشل تحديث الحالة");
    } finally {
      setUpdatingStatus(false);
    }
  };

  useEffect(() => {
    if (isOpen && order?.user_id) fetchUserOrders();
  }, [isOpen, order?.user_id]);

  const fetchAvailableProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await apiCall({
        pathname: `/admin/products`,
        method: "GET",
        auth: true,
      });
      let productsArray = [];
      if (Array.isArray(res)) productsArray = res;
      else if (Array.isArray(res.data)) productsArray = res.data;
      else if (Array.isArray(res.products)) productsArray = res.products;
      setAvailableProducts(productsArray);
    } catch {
      message.error("فشل في تحميل المنتجات المتاحة");
      setAvailableProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const handleAddProductClick = () => {
    fetchAvailableProducts();
    setAddProductModalVisible(true);
  };

  const handleProductSelect = (productId) => {
    const product = availableProducts.find((p) => p.id === productId);
    if (!product) return;
    setSelectedProductToAdd(product);
    setAddProductForm({
      quantity: 1,
      notes: "",
    });
  };

  const handleAddProductToOrder = () => {
    if (!selectedProductToAdd) {
      message.error("يرجى اختيار منتج");
      return;
    }
    if (selectedProductToAdd.stock < 1) {
      message.error("لا يوجد مخزون متاح لهذا المنتج");
      return;
    }
    if (
      addProductForm.quantity < 1 ||
      addProductForm.quantity > selectedProductToAdd.stock
    ) {
      message.error(
        `الكمية المطلوبة تتجاوز المخزون المتاح (${selectedProductToAdd.stock})`
      );
      return;
    }
    const newItem = {
      id: selectedProductToAdd.id,
      product_id: selectedProductToAdd.id,
      name: selectedProductToAdd.name,
      title: selectedProductToAdd.name,
      price: parseFloat(selectedProductToAdd.price) || 0,
      qty: parseInt(addProductForm.quantity),
      quantity: parseInt(addProductForm.quantity),
      image:
        selectedProductToAdd.image ||
        (Array.isArray(selectedProductToAdd.images) &&
        selectedProductToAdd.images.length > 0
          ? selectedProductToAdd.images[0].link
          : null),
      notes: addProductForm.notes || "",
    };
    setLocalItems((prev) => [...prev, newItem]);
    setAddProductModalVisible(false);
    setSelectedProductToAdd(null);
    setAddProductForm({
      quantity: 1,
      notes: "",
    });
    message.success("تم إضافة المنتج بنجاح");
  };

  const handleQuantityChange = (index, item, process, value = null) => {
    const liveStockItem = liveItems.find((p) => p.id === item.id);
    const liveStock = liveStockItem ? Number(liveStockItem.stock) : 0;
    const oldQty = Number(item.qty) || 0;
    let newQty = oldQty;

    // ✅ Compute the total allowed (current reserved + live stock)
    const maxAvailable = liveStock + oldQty;

    // 🪵 DEBUG LOGS
    console.log("🔍 DEBUG STOCK CHECK ----------------------");
    console.log("🧩 Product ID:", item.id);
    console.log("📦 Live Stock (from DB):", liveStock);
    console.log("🧾 Old Qty (in current order):", oldQty);
    console.log("✅ Max Available (live + old):", maxAvailable);
    console.log("⚙️ Process:", process);
    console.log("💡 Value provided:", value);
    console.log("------------------------------------------");

    // ✅ Validation Logic
    if (value !== null) {
      if (value < 1) {
        message.error("الكمية لا يمكن أن تكون أقل من 1");
        return;
      }
      if (value > maxAvailable) {
        message.error(`الكمية المطلوبة تتجاوز الحد المسموح (${maxAvailable})`);
        return;
      }
      newQty = value;
    } else if (process === "increment") {
      if (oldQty + 1 > maxAvailable) {
        message.error(`الكمية المطلوبة تتجاوز الحد المسموح (${maxAvailable})`);
        return;
      }
      newQty = oldQty + 1;
    } else if (process === "decrement") {
      if (oldQty - 1 < 1) {
        message.error("الكمية لا يمكن أن تكون أقل من 1");
        return;
      }
      newQty = oldQty - 1;
    }

    console.log("🎯 New Qty to set:", newQty);

    // ✅ Update local state immutably
    setLocalItems((prev) =>
      prev.map((itm, idx) => (idx === index ? { ...itm, qty: newQty } : itm))
    );

    // ✅ Track the difference
    const diff = newQty - oldQty;
    console.log("📊 Difference in qty:", diff);

    setDifferentValueStock((prev) => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + diff,
    }));

    console.log("📦 Updated differentValueStock:", {
      ...differentValueStock,
      [item.id]: (differentValueStock[item.id] || 0) + diff,
    });
  };

  const handleRemoveProduct = (index) => {
    const updatedItems = localItems?.filter((_, i) => i !== index);
    setLocalItems(updatedItems);
    message.success("تم حذف المنتج");
  };

  const fetchOrderProductsStock = async () => {
    try {
      const res = await apiCall({
        pathname: `/admin/orders/${order.id}/products`,
        method: "GET",
        auth: true,
      });
      if (res?.success && Array.isArray(res.products)) {
        const stockMap = {};

        setLocalItems(
          res?.order.items.map((i) => ({ ...i, initialQty: i.qty }))
        );

        setLiveItems(res?.products || []);
        res.products.forEach((p) => {
          stockMap[p.id] = p.stock;
        });
        return stockMap;
      }
      return {};
    } catch {
      return {};
    }
  };

  const handleSaveOrder = async () => {
    setSaveOrderError("");

    if (!localItems?.length) {
      setSaveOrderError("لا يمكن حفظ طلب بدون منتجات");
      return;
    }

    setUpdatingOrder(true);

    try {
      // ✅ Prepare data to send
      const payload = {
        user_id: order.user_id,
        items: JSON.stringify(localItems),
        phone: order.phone,
        address: order.address,
        status: order.status,
        active: order.active,
        voucher_info: order.voucher_info,
        delivery_cost: order.delivery_cost,
        voucher_id: order.voucher_id,
        different_stock: differentValueStock, // ✅ NEW FIELD
      };

      // ✅ Send the updated order to the backend
      const res = await apiCall({
        pathname: `/admin/orders/${order.id}`,
        method: "PUT",
        auth: true,
        data: payload,
      });

      console.log("🟩 Order update payload:", payload);

      if (!res?.success) throw new Error(res?.error || "فشل في حفظ التغييرات");

      message.success("✅ تم حفظ التغييرات بنجاح");
      refreshOrders?.();

      // ✅ Optionally update local state to reflect saved data
      order.items = JSON.stringify(localItems);
    } catch (error) {
      console.error("❌ Save Order Error:", error);
      setSaveOrderError(error.message || "فشل في حفظ التغييرات");
    } finally {
      setUpdatingOrder(false);
    }
  };

  const getStatusLabel = (status) => {
    const map = {
      Created: "تم الإنشاء",
      Accepted: "مقبول",
      Preparing: "قيد التحضير",
      Shipping: "قيد الشحن",
      Delivered: "تم التسليم",
      Canceled: "ملغي",
    };
    return map[status] || status;
  };

  const getStatusTag = (status) => {
    const colors = {
      Created: "default",
      Accepted: "blue",
      Preparing: "orange",
      Shipping: "purple",
      Delivered: "green",
      Canceled: "red",
    };
    return <Tag color={colors[status]}>{getStatusLabel(status)}</Tag>;
  };

  const fallbackImage = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>
      <rect width='100%' height='100%' fill='#f0f0f0'/>
      <text x='50%' y='50%' font-size='10' text-anchor='middle' dy='.3em' fill='#888'>IMG</text>
    </svg>
  `)}`;

  const tabs = [
    {
      key: "1",
      label: "🧾 تفاصيل الطلب",

      children: (
        <Descriptions bordered column={1} size="small">
          <Descriptions.Item label="رقم الطلب">#{order?.id}</Descriptions.Item>
          <Descriptions.Item label="الحالة">
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              {getStatusTag(order?.status)}
              <Select
                value={order?.status}
                size="small"
                style={{ width: 150 }}
                onChange={handleStatusChange}
                loading={updatingStatus}
              >
                <Option value="Created">تم الإنشاء</Option>
                <Option value="Accepted">مقبول</Option>
                <Option value="Preparing">قيد التحضير</Option>
                <Option value="Shipping">قيد الشحن</Option>
                <Option value="Delivered">تم التسليم</Option>
                <Option value="Canceled">ملغي</Option>
              </Select>
            </div>
          </Descriptions.Item>
          <Descriptions.Item label="إجمالي المنتجات">
            $
            {localItems
              .reduce((t, i) => {
                const price = parseFloat(i.price) || 0;
                const quantity = i?.qty || 0;
                return t + price * quantity;
              }, 0)
              .toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="رسوم التوصيل">
            ${(parseFloat(order?.delivery_cost) || 0).toFixed(2)}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    {
      key: "2",
      label: "👤 معلومات المستخدم",
      children: (
        <>
          <Descriptions bordered column={1} size="small">
            <Descriptions.Item label="اسم المستخدم">
              {order?.user_name || "غير محدد"}
            </Descriptions.Item>
            <Descriptions.Item label="البريد">
              {order?.user_email || "غير محدد"}
            </Descriptions.Item>
            <Descriptions.Item label="الهاتف">
              {order?.phone || "غير محدد"}
            </Descriptions.Item>
            <Descriptions.Item label="العنوان">
              {order?.address || "غير محدد"}
            </Descriptions.Item>
          </Descriptions>
          <div
            style={{
              marginTop: 16,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <h4>الطلبات السابقة ({userOrders.length})</h4>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchUserOrders}
              loading={loadingOrders}
              size="small"
            >
              تحديث
            </Button>
          </div>
          {userOrders.length > 0 ? (
            <List
              bordered
              size="small"
              dataSource={userOrders}
              style={{ marginTop: 10 }}
              renderItem={(o) => (
                <List.Item
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <div>
                    <strong>#{o.id}</strong>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {new Date(o.created_at).toLocaleDateString("ar")}
                    </div>
                  </div>
                  <div>{getStatusTag(o.status)}</div>
                  <div>
                    <strong>
                      $
                      {Array.isArray(o.items)
                        ? o.items
                            .reduce(
                              (sum, item) =>
                                sum +
                                (parseFloat(item.price) || 0) *
                                  parseInt(item.qty || item.quantity || 0),
                              0
                            )
                            .toFixed(2)
                        : "0.00"}
                    </strong>
                  </div>
                </List.Item>
              )}
            />
          ) : (
            <div
              style={{
                textAlign: "center",
                padding: "20px",
                color: "#999",
              }}
            >
              {loadingOrders ? "جاري التحميل..." : "لا توجد طلبات سابقة"}
            </div>
          )}
        </>
      ),
    },
    {
      key: "3",
      label: `📦 المنتجات (${localItems?.length})`,
      children: (
        <>
          <div style={{ marginBottom: 16 }}>
            <Button
              type="dashed"
              icon={<PlusOutlined />}
              onClick={handleAddProductClick}
              style={{ width: "100%" }}
            >
              إضافة منتج جديد للطلب
            </Button>
          </div>
          <List
            bordered
            dataSource={localItems}
            locale={{ emptyText: "لا توجد منتجات" }}
            renderItem={(item, index) => (
              <List.Item
                actions={[
                  <Button
                    key="edit"
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEditProduct(index, item)}
                    title="تعديل المنتج"
                  />,
                  <Popconfirm
                    key="delete"
                    title="هل أنت متأكد من حذف هذا المنتج؟"
                    onConfirm={() => handleRemoveProduct(index)}
                    okText="نعم"
                    cancelText="لا"
                  >
                    <Button
                      type="text"
                      danger
                      icon={<DeleteOutlined />}
                      title="حذف المنتج"
                    />
                  </Popconfirm>,
                ]}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <Avatar
                    shape="square"
                    src={
                      item.image ||
                      (Array.isArray(item.images) && item.images.length > 0
                        ? item.images[0].link
                        : fallbackImage)
                    }
                    size={50}
                    style={{ marginRight: 12 }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      {item.name || item.title || "منتج غير محدد"}
                    </div>
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 4,
                      }}
                    >
                      <span style={{ fontSize: 12, color: "#666" }}>
                        السعر: ${parseFloat(item.price || 0).toFixed(2)}
                      </span>
                      <div
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Button
                          size="small"
                          type="text"
                          icon={<MinusOutlined />}
                          onClick={() =>
                            handleQuantityChange(index, item, "decrement")
                          }
                          disabled={item?.qty <= 1}
                        />

                        <InputNumber
                          size="small"
                          min={1}
                          max={(() => {
                            const liveStockItem = liveItems.find(
                              (p) => p.id === item.id
                            );
                            const liveStock = liveStockItem
                              ? liveStockItem.stock
                              : 0;
                            // ✅ allow up to live + old
                            return (
                              liveStock + (item?.initialQty || item?.qty || 0)
                            );
                          })()}
                          value={item?.qty || 0}
                          onChange={(value) =>
                            handleQuantityChange(index, item, null, value)
                          }
                          style={{ width: 60 }}
                        />

                        <Button
                          size="small"
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() =>
                            handleQuantityChange(index, item, "increment")
                          }
                          disabled={(() => {
                            const liveStockItem = liveItems.find(
                              (p) => p.id === item.id
                            );
                            const liveStock = liveStockItem
                              ? liveStockItem.stock
                              : 0;
                            const oldQty = item?.initialQty || item?.qty || 0;
                            // ✅ disable only when reaching (oldQty + liveStock)
                            return item?.qty >= oldQty + liveStock;
                          })()}
                        />
                      </div>
                    </div>
                  </div>
                  <div
                    style={{
                      fontWeight: 600,
                      color: "#52c41a",
                      textAlign: "right",
                    }}
                  >
                    <div>
                      ${((parseFloat(item.price) || 0) * item?.qty).toFixed(2)}
                    </div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </>
      ),
    },
  ];

  const handleOptionChange = (optionName, value) => {
    setAddProductForm((prev) => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [optionName]: value,
      },
    }));
  };

  return (
    <>
      <Drawer
        title={`تفاصيل الطلب #${order?.id || ""}`}
        open={isOpen}
        onClose={() => {
          setIsOpen(false);
          try {
            const originalItems =
              typeof order?.items === "string"
                ? JSON.parse(order.items)
                : order?.items || [];
            setLocalItems(originalItems);
            setSaveOrderError("");
          } catch {
            setLocalItems([]);
            setSaveOrderError("");
          }
        }}
        width={700}
        extra={
          <Button key="save" type="primary" onClick={handleSaveOrder}>
            حفظ التغييرات
          </Button>
        }
      >
        <Tabs defaultActiveKey="1" items={tabs} />
      </Drawer>
      <Modal
        title="إضافة منتج جديد للطلب"
        open={addProductModalVisible}
        onCancel={() => {
          setAddProductModalVisible(false);
          setSelectedProductToAdd(null);
          setAddProductForm({
            quantity: 1,
            notes: "",
          });
        }}
        footer={[
          <Button key="cancel" onClick={() => setAddProductModalVisible(false)}>
            إلغاء
          </Button>,
          <Button
            key="add"
            type="primary"
            onClick={handleAddProductToOrder}
            disabled={
              !selectedProductToAdd ||
              selectedProductToAdd.stock < 1 ||
              addProductForm.quantity > selectedProductToAdd.stock
            }
          >
            إضافة للطلب
          </Button>,
        ]}
        width={700}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontWeight: 500,
                marginBottom: 8,
                display: "block",
              }}
            >
              اختر المنتج:
            </label>
            <Select
              placeholder="ابحث عن المنتج..."
              showSearch
              loading={loadingProducts}
              onChange={handleProductSelect}
              style={{ width: "100%" }}
              filterOption={(input, option) =>
                option?.children?.toLowerCase()?.includes(input.toLowerCase())
              }
            >
              {availableProducts.map((product) => (
                <Option key={product.id} value={product.id}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <Avatar
                      src={
                        product.image ||
                        (Array.isArray(product.images) &&
                        product.images.length > 0
                          ? product.images[0].link
                          : fallbackImage)
                      }
                      size="small"
                      shape="square"
                    />
                    <span>
                      {product.name} - ${product.price}
                    </span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>
          {selectedProductToAdd && (
            <Card size="small" style={{ backgroundColor: "#f9f9f9" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <Avatar
                  src={
                    selectedProductToAdd.image ||
                    (Array.isArray(selectedProductToAdd.images) &&
                    selectedProductToAdd.images.length > 0
                      ? selectedProductToAdd.images[0].link
                      : fallbackImage)
                  }
                  size={50}
                  shape="square"
                />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 500 }}>
                    {selectedProductToAdd.name}
                  </div>
                  <div style={{ color: "#666" }}>
                    السعر: ${selectedProductToAdd.price}
                  </div>
                  <div style={{ color: "#666", fontSize: 12 }}>
                    المخزون: {selectedProductToAdd.stock}
                  </div>
                </div>
              </div>
            </Card>
          )}
          {selectedProductToAdd && (
            <div>
              <label
                style={{
                  fontWeight: 500,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                الكمية:
              </label>
              <InputNumber
                min={1}
                max={selectedProductToAdd.stock || 999}
                value={addProductForm.quantity}
                onChange={(value) =>
                  setAddProductForm((prev) => ({
                    ...prev,
                    quantity: value,
                  }))
                }
                style={{ width: "100%" }}
              />
            </div>
          )}
          {selectedProductToAdd &&
            Array.isArray(selectedProductToAdd.options) &&
            selectedProductToAdd.options.length > 0 && (
              <div>
                <label
                  style={{ fontWeight: 500, marginBottom: 8, display: "block" }}
                >
                  الخيارات:
                </label>
                {selectedProductToAdd.options.map((opt) => (
                  <div key={opt.name} style={{ marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>{opt.name}:</span>
                    <Select
                      style={{ minWidth: 120 }}
                      value={addProductForm.selectedOptions?.[opt.name]}
                      onChange={(value) => handleOptionChange(opt.name, value)}
                    >
                      {opt.values.map((val) => (
                        <Option key={val} value={val}>
                          {val}
                        </Option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            )}
          {selectedProductToAdd && (
            <div>
              <label
                style={{
                  fontWeight: 500,
                  marginBottom: 8,
                  display: "block",
                }}
              >
                ملاحظات:
              </label>
              <TextArea
                value={addProductForm.notes}
                onChange={(e) =>
                  setAddProductForm((prev) => ({
                    ...prev,
                    notes: e.target.value,
                  }))
                }
                rows={2}
                placeholder="ملاحظات إضافية..."
              />
            </div>
          )}
        </div>
      </Modal>
      <Modal
        title="تعديل المنتج في الطلب"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingProduct(null);
          setEditForm({
            quantity: 1,
            selectedOptions: {},
            notes: "",
          });
        }}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            إلغاء
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveEditProduct}>
            حفظ التغييرات
          </Button>,
        ]}
        width={700}
      >
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label
              style={{
                fontWeight: 500,
                marginBottom: 8,
                display: "block",
              }}
            >
              المنتج:
            </label>
            <Select
              value={editingProduct?.product_id}
              style={{ width: "100%" }}
              disabled
            >
              {availableProducts.map((product) => (
                <Option key={product.id} value={product.id}>
                  {product.name}
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <label
              style={{
                fontWeight: 500,
                marginBottom: 8,
                display: "block",
              }}
            >
              الكمية:
            </label>
            <InputNumber
              min={1}
              value={editForm.quantity}
              onChange={(value) =>
                setEditForm((prev) => ({
                  ...prev,
                  quantity: value,
                }))
              }
              style={{ width: "100%" }}
            />
          </div>
          {editingProduct &&
            getProductOptions(editingProduct.product_id || editingProduct.id)
              .length > 0 && (
              <div>
                <label style={{ fontWeight: 500, marginBottom: 8, display: "block" }}>
                  الخيارات:
                </label>
                {getProductOptions(editingProduct.product_id || editingProduct.id).map((opt) => (
                  <div key={opt.name} style={{ marginBottom: 8 }}>
                    <span style={{ marginRight: 8 }}>{opt.name}:</span>
                    <Select
                      style={{ minWidth: 120 }}
                      value={editForm.selectedOptions?.[opt.name]}
                      onChange={(value) =>
                        setEditForm((prev) => ({
                          ...prev,
                          selectedOptions: {
                            ...prev.selectedOptions,
                            [opt.name]: value,
                          },
                        }))
                      }
                      placeholder={`اختر ${opt.name}`}
                    >
                      {opt.values.map((val) => (
                        <Option key={val} value={val}>
                          {val}
                        </Option>
                      ))}
                    </Select>
                  </div>
                ))}
              </div>
            )}
          
          <div>
            <label
              style={{
                fontWeight: 500,
                marginBottom: 8,
                display: "block",
              }}
            >
              ملاحظات:
            </label>
            <TextArea
              value={editForm.notes}
              onChange={(e) =>
                setEditForm((prev) => ({
                  ...prev,
                  notes: e.target.value,
                }))
              }
              rows={2}
              placeholder="ملاحظات إضافية..."
            />
          </div>
        </div>
      </Modal>
    </>
  );
};
