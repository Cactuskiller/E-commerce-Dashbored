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
  const [updatingOrder, setUpdatingOrder] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productDetails, setProductDetails] = useState(null);
  const [loadingProductDetails, setLoadingProductDetails] = useState(false);
  
  // 🔹 NEW: Add product functionality
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [availableProducts, setAvailableProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(false);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState(null);
  const [addProductForm, setAddProductForm] = useState({
    quantity: 1,
    selectedOptions: {},
    notes: ''
  });
  
  // Simple state for editing form
  const [editForm, setEditForm] = useState({
    name: '',
    price: 0,
    quantity: 1,
    selectedOptions: {},
    notes: ''
  });

  // Initialize local items when order changes
  useEffect(() => {
    const parsedItems = (() => {
      try {
        if (typeof order?.items === "string") {
          const parsed = JSON.parse(order.items);
          return Array.isArray(parsed) ? parsed : [];
        }
        return Array.isArray(order?.items) ? order.items : [];
      } catch (error) {
        console.warn("Error parsing order items:", error);
        return [];
      }
    })();
    setLocalItems(parsedItems);
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

      if (data?.error) throw new Error(data.message || "Failed to fetch orders");
      const ordersArray = Array.isArray(data) ? data : Array.isArray(data?.orders) ? data.orders : [];
      setUserOrders(ordersArray.filter((o) => o.id !== order.id));
    } catch (error) {
      console.error("Fetch user orders error:", error);
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
    } catch (error) {
      console.error("Status update error:", error);
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

      if (res?.error) throw new Error(res.message || "Failed to fetch products");

      const productsListRaw = Array.isArray(res) ? res : Array.isArray(res?.data) ? res.data : [];
      // Add primary_image property for each product
      const productsList = productsListRaw.map(product => ({
        ...product,
        primary_image: product.image
          ? product.image
          : (Array.isArray(product.images) && product.images.length > 0
              ? product.images[0].link
              : null),
      }));

      setAvailableProducts(productsList);
    } catch (error) {
      console.error("Error fetching products:", error);
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

  const handleProductSelect = async (productId) => {
    const product = availableProducts.find(p => p.id === productId);
    if (!product) return;

    setSelectedProductToAdd(product);
    
    // Reset add form
    setAddProductForm({
      quantity: 1,
      selectedOptions: {},
      notes: ''
    });

    // Fetch product details for options
    await fetchProductDetails(productId);
  };

  const handleAddProductToOrder = () => {
    if (!selectedProductToAdd) {
      message.error('يرجى اختيار منتج');
      return;
    }

    if (addProductForm.quantity < 1) {
      message.error('يرجى إدخال كمية صحيحة');
      return;
    }

    // Build options object
    const options = { ...addProductForm.selectedOptions };
    if (addProductForm.notes) options.notes = addProductForm.notes;

    // Create new item object
    const newItem = {
      id: selectedProductToAdd.id,
      product_id: selectedProductToAdd.id,
      name: selectedProductToAdd.name,
      title: selectedProductToAdd.name,
      price: parseFloat(selectedProductToAdd.price) || 0,
      qty: parseInt(addProductForm.quantity),
      quantity: parseInt(addProductForm.quantity),
      image: selectedProductToAdd.primary_image || (
        Array.isArray(selectedProductToAdd.images) && selectedProductToAdd.images.length > 0
          ? selectedProductToAdd.images[0].link
          : null
      ),
      options: Object.keys(options).length > 0 ? options : null,
    };

    // Add to local items
    setLocalItems(prev => [...prev, newItem]);
    setAddProductModalVisible(false);
    setSelectedProductToAdd(null);
    setProductDetails(null);
    setAddProductForm({
      quantity: 1,
      selectedOptions: {},
      notes: ''
    });

    message.success("تم إضافة المنتج بنجاح");
  };

  const handleAddOptionChange = (optionName, selectedValue) => {
    setAddProductForm(prev => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [optionName]: selectedValue
      }
    }));
  };

  // 🔹 Existing product details fetch function
  const fetchProductDetails = async (productId) => {
    setLoadingProductDetails(true);
    try {
      console.log(`Fetching product details for ID: ${productId}`);
      
      // First, add the missing endpoint or use the existing with-primary-image endpoint
      const data = await apiCall({
        pathname: `/admin/products/${productId}/with-primary-image`,
        method: "GET",
        auth: true,
      });

      if (data?.error) {
        throw new Error(data.message || "Failed to fetch product details");
      }

      console.log("Product details fetched:", data);
      setProductDetails(data);
      return data;
    } catch (error) {
      console.error("Error fetching product details:", error);
      message.error("فشل في تحميل تفاصيل المنتج");
      setProductDetails(null);
      return null;
    } finally {
      setLoadingProductDetails(false);
    }
  };

  // ...existing product editing functions...
  const handleQuantityChange = (index, newQuantity) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...localItems];
    updatedItems[index] = {
      ...updatedItems[index],
      qty: newQuantity,
      quantity: newQuantity,
    };
    setLocalItems(updatedItems);
  };

  const handleEditProduct = async (index, item) => {
    setEditingProduct({ index, ...item });
    
    // Parse user's selected options safely
    let userSelectedOptions = {};
    try {
      if (typeof item.options === 'string') {
        userSelectedOptions = JSON.parse(item.options);
      } else if (typeof item.options === 'object' && item.options !== null) {
        userSelectedOptions = item.options;
      }
    } catch (error) {
      console.warn("Error parsing item options:", error);
      userSelectedOptions = {};
    }

    // Set form state
    setEditForm({
      name: item.name || item.title || '',
      price: item.price || 0,
      quantity: getItemQuantity(item),
      selectedOptions: userSelectedOptions,
      notes: userSelectedOptions.notes || item.notes || '',
    });

    // Fetch product details to get all available options
    if (item.product_id || item.id) {
      await fetchProductDetails(item.product_id || item.id);
    }
    
    setEditModalVisible(true);
  };

  const handleSaveProduct = async () => {
    try {
      // Validate required fields
      if (!editForm.name.trim()) {
        message.error('يرجى إدخال اسم المنتج');
        return;
      }
      if (editForm.price <= 0) {
        message.error('يرجى إدخال سعر صحيح');
        return;
      }
      if (editForm.quantity < 1) {
        message.error('يرجى إدخال كمية صحيحة');
        return;
      }

      // Build final options object from user selections
      const finalOptions = { ...editForm.selectedOptions };
      if (editForm.notes) finalOptions.notes = editForm.notes;

      const updatedItems = [...localItems];
      updatedItems[editingProduct.index] = {
        ...updatedItems[editingProduct.index],
        name: editForm.name,
        title: editForm.name,
        price: parseFloat(editForm.price),
        qty: parseInt(editForm.quantity),
        quantity: parseInt(editForm.quantity),
        options: Object.keys(finalOptions).length > 0 ? finalOptions : null,
      };

      setLocalItems(updatedItems);
      setEditModalVisible(false);
      setEditingProduct(null);
      setProductDetails(null);
      
      // Reset form
      setEditForm({
        name: '',
        price: 0,
        quantity: 1,
        selectedOptions: {},
        notes: ''
      });
      
      message.success("تم تحديث المنتج بنجاح");
    } catch (error) {
      console.error("Error updating product:", error);
      message.error("فشل في تحديث المنتج");
    }
  };

  const handleRemoveProduct = (index) => {
    const updatedItems = localItems.filter((_, i) => i !== index);
    setLocalItems(updatedItems);
    message.success("تم حذف المنتج");
  };

  const handleSaveOrder = async () => {
    if (localItems.length === 0) {
      message.error("لا يمكن حفظ طلب بدون منتجات");
      return;
    }

    setUpdatingOrder(true);
    try {
      const res = await apiCall({
        pathname: `/admin/orders/${order.id}`,
        method: "PUT",
        auth: true,
        data: {
          user_id: order.user_id,
          items: JSON.stringify(localItems),
          phone: order.phone,
          address: order.address,
          status: order.status,
          active: order.active,
          voucher_info: order.voucher_info,
          delivery_cost: order.delivery_cost,
          voucher_id: order.voucher_id,
        },
      });

      if (res?.success) {
        message.success("تم حفظ التغييرات بنجاح");
        refreshOrders?.();
        order.items = JSON.stringify(localItems);
      } else {
        throw new Error(res?.error || "فشل في حفظ التغييرات");
      }
    } catch (error) {
      console.error("Error saving order:", error);
      message.error("فشل في حفظ التغييرات");
    } finally {
      setUpdatingOrder(false);
    }
  };

  // Handle option selection change
  const handleOptionChange = (optionName, selectedValue) => {
    setEditForm(prev => ({
      ...prev,
      selectedOptions: {
        ...prev.selectedOptions,
        [optionName]: selectedValue
      }
    }));
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

  const getItemQuantity = (item) => parseInt(item.qty || item.quantity || 0);

  const calculateOrderTotal = () => {
    const itemsTotal = localItems.reduce((sum, item) => {
      const price = parseFloat(item.price) || 0;
      const quantity = getItemQuantity(item);
      return sum + price * quantity;
    }, 0);

    const deliveryCost = parseFloat(order?.delivery_cost) || 0;
    const total = itemsTotal + deliveryCost;
    return isNaN(total) ? "0.00" : total.toFixed(2);
  };

  const calculatePreviousOrderTotal = (orderData) => {
    let itemsTotal = 0;
    try {
      let items = [];
      if (typeof orderData.items === "string") {
        items = JSON.parse(orderData.items);
      } else if (Array.isArray(orderData.items)) {
        items = orderData.items;
      }

      if (Array.isArray(items)) {
        itemsTotal = items.reduce((sum, item) => {
          const price = parseFloat(item.price) || 0;
          const quantity = getItemQuantity(item);
          return sum + price * quantity;
        }, 0);
      }
    } catch (error) {
      console.warn(`Error parsing items for order ${orderData.id}:`, error);
    }

    const deliveryCost = parseFloat(orderData.delivery_cost) || 0;
    const total = itemsTotal + deliveryCost;
    return isNaN(total) ? "0.00" : total.toFixed(2);
  };

  const fallbackImage = `data:image/svg+xml;base64,${btoa(`
    <svg xmlns='http://www.w3.org/2000/svg' width='40' height='40'>
      <rect width='100%' height='100%' fill='#f0f0f0'/>
      <text x='50%' y='50%' font-size='10' text-anchor='middle' dy='.3em' fill='#888'>IMG</text>
    </svg>
  `)}`;

  // Render user's selected options
  const renderSelectedOptions = (options) => {
    if (!options) return null;
    
    try {
      const opts = typeof options === 'string' ? JSON.parse(options) : options;
      if (!opts || typeof opts !== 'object') return null;
      
      return (
        <div style={{ fontSize: 11, color: "#666", marginTop: 4 }}>
          {Object.entries(opts)
            .filter(([key]) => key !== 'notes')
            .map(([key, value]) => (
              <Tag key={key} size="small" color="blue" style={{ marginBottom: 2 }}>
                {key}: {String(value)}
              </Tag>
            ))}
        </div>
      );
    } catch (error) {
      return null;
    }
  };

  // Check if items have been modified
  const hasItemsChanged = () => {
    try {
      const originalItems = typeof order?.items === "string" 
        ? JSON.parse(order.items) 
        : order?.items || [];
      return JSON.stringify(originalItems) !== JSON.stringify(localItems);
    } catch (error) {
      return false;
    }
  };

  // Enhanced tabs with editing capabilities
  const tabs = [
    // Tab 1: Order Details
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
            ${localItems.reduce((t, i) => {
              const price = parseFloat(i.price) || 0;
              const quantity = getItemQuantity(i);
              return t + price * quantity;
            }, 0).toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="رسوم التوصيل">
            ${(parseFloat(order?.delivery_cost) || 0).toFixed(2)}
          </Descriptions.Item>
          <Descriptions.Item label="المجموع الكلي">
            <strong style={{ color: "#52c41a", fontSize: "16px" }}>
              ${calculateOrderTotal()}
            </strong>
          </Descriptions.Item>
          <Descriptions.Item label="تاريخ الإنشاء">
            {order?.created_at ? new Date(order.created_at).toLocaleString("ar") : "غير محدد"}
          </Descriptions.Item>
          <Descriptions.Item label="معلومات القسيمة">
            {order?.voucher_info ? <Tag color="gold">قسيمة مستخدمة</Tag> : <Tag>لا توجد قسيمة</Tag>}
          </Descriptions.Item>
        </Descriptions>
      ),
    },
    // Tab 2: User Info (keep existing)
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

          <div style={{ marginTop: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4>الطلبات السابقة ({userOrders.length})</h4>
            <Button icon={<ReloadOutlined />} onClick={fetchUserOrders} loading={loadingOrders} size="small">
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
                <List.Item style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div>
                    <strong>#{o.id}</strong>
                    <div style={{ fontSize: "12px", color: "#666" }}>
                      {new Date(o.created_at).toLocaleDateString("ar")}
                    </div>
                  </div>
                  <div>{getStatusTag(o.status)}</div>
                  <div><strong>${calculatePreviousOrderTotal(o)}</strong></div>
                </List.Item>
              )}
            />
          ) : (
            <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
              {loadingOrders ? "جاري التحميل..." : "لا توجد طلبات سابقة"}
            </div>
          )}
        </>
      ),
    },
    // Tab 3: Enhanced Products with editing and adding
    {
      key: "3",
      label: `📦 المنتجات (${localItems.length})`,
      children: (
        <>
          {hasItemsChanged() && (
            <Card size="small" style={{ marginBottom: 16, borderColor: '#ffa940', backgroundColor: '#fff7e6' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <span style={{ color: '#d48806' }}>⚠️ تم تعديل المنتجات</span>
                  <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
                    احفظ التغييرات لتحديث الطلب في قاعدة البيانات
                  </div>
                </div>
                <Space>
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<SaveOutlined />}
                    loading={updatingOrder}
                    onClick={handleSaveOrder}
                  >
                    حفظ التغييرات
                  </Button>
                  <Button size="small" onClick={() => {
                    try {
                      const originalItems = typeof order?.items === "string" 
                        ? JSON.parse(order.items) 
                        : order?.items || [];
                      setLocalItems(originalItems);
                    } catch {
                      setLocalItems([]);
                    }
                  }}>
                    إلغاء التغييرات
                  </Button>
                </Space>
              </div>
            </Card>
          )}

          {/* 🔹 NEW: Add Product Button */}
          <div style={{ marginBottom: 16 }}>
            <Button 
              type="dashed" 
              icon={<PlusOutlined />}
              onClick={handleAddProductClick}
              style={{ width: '100%' }}
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
                    <Button type="text" danger icon={<DeleteOutlined />} title="حذف المنتج" />
                  </Popconfirm>
                ]}
              >
                <div style={{ display: "flex", alignItems: "center", width: "100%" }}>
                  <Avatar
                    shape="square"
                    src={item.image || fallbackImage}
                    size={50}
                    style={{ marginRight: 12 }}
                  />
                  <div style={{ flexGrow: 1 }}>
                    <div style={{ fontWeight: 500, marginBottom: 4 }}>
                      {item.name || item.title || "منتج غير محدد"}
                    </div>
                    
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 4 }}>
                      <span style={{ fontSize: 12, color: "#666" }}>
                        السعر: ${parseFloat(item.price || 0).toFixed(2)}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Button
                          size="small"
                          type="text"
                          icon={<MinusOutlined />}
                          onClick={() => handleQuantityChange(index, getItemQuantity(item) - 1)}
                          disabled={getItemQuantity(item) <= 1}
                        />
                        <InputNumber
                          size="small"
                          min={1}
                          max={999}
                          value={getItemQuantity(item)}
                          onChange={(value) => handleQuantityChange(index, value)}
                          style={{ width: 60 }}
                        />
                        <Button
                          size="small"
                          type="text"
                          icon={<PlusOutlined />}
                          onClick={() => handleQuantityChange(index, getItemQuantity(item) + 1)}
                        />
                      </div>
                    </div>
                    
                    {renderSelectedOptions(item.options)}
                  </div>
                  
                  <div style={{ fontWeight: 600, color: "#52c41a", textAlign: 'right' }}>
                    <div>${((parseFloat(item.price) || 0) * getItemQuantity(item)).toFixed(2)}</div>
                  </div>
                </div>
              </List.Item>
            )}
          />
        </>
      ),
    },
  ];

  return (
    <>
      <Drawer
        title={`تفاصيل الطلب #${order?.id || ""}`}
        open={isOpen}
        onClose={() => setIsOpen(false)}
        width={700}
      >
        <Tabs defaultActiveKey="1" items={tabs} />
      </Drawer>

      {/* Enhanced Product Edit Modal */}
      <Modal
        title="تعديل المنتج"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingProduct(null);
          setProductDetails(null);
          setEditForm({
            name: '',
            price: 0,
            quantity: 1,
            selectedOptions: {},
            notes: ''
          });
        }}
        footer={[
          <Button key="cancel" onClick={() => setEditModalVisible(false)}>
            إلغاء
          </Button>,
          <Button key="save" type="primary" onClick={handleSaveProduct}>
            حفظ التغييرات
          </Button>,
        ]}
        width={600}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>اسم المنتج:</label>
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
            />
          </div>
          
          <div style={{ display: 'flex', gap: 12 }}>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>السعر:</label>
              <InputNumber
                min={0}
                step={0.01}
                value={editForm.price}
                onChange={(value) => setEditForm(prev => ({ ...prev, price: value }))}
                style={{ width: '100%' }}
                addonBefore="$"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>الكمية:</label>
              <InputNumber
                min={1}
                value={editForm.quantity}
                onChange={(value) => setEditForm(prev => ({ ...prev, quantity: value }))}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          {/* Product Options from Admin */}
          {loadingProductDetails ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div>جاري تحميل خيارات المنتج...</div>
            </div>
          ) : productDetails?.options ? (
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}>
              <h4 style={{ margin: '0 0 12px 0' }}>خيارات المنتج:</h4>
              {(() => {
                try {
                  const adminOptions = typeof productDetails.options === 'string' 
                    ? JSON.parse(productDetails.options) 
                    : productDetails.options;
                  
                  if (!Array.isArray(adminOptions) || adminOptions.length === 0) {
                    return <div style={{ color: '#999' }}>لا توجد خيارات متاحة</div>;
                  }

                  return adminOptions.map((option, index) => (
                    <div key={index} style={{ marginBottom: 12 }}>
                      <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>
                        {option.name}:
                      </label>
                      <Select
                        placeholder={`اختر ${option.name}`}
                        value={editForm.selectedOptions[option.name] || undefined}
                        onChange={(value) => handleOptionChange(option.name, value)}
                        style={{ width: '100%' }}
                        allowClear
                      >
                        {option.values?.map((value) => (
                          <Option key={value} value={value}>
                            {value}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  ));
                } catch (error) {
                  console.error("Error parsing admin options:", error);
                  return <div style={{ color: '#ff4d4f' }}>خطأ في تحميل الخيارات</div>;
                }
              })()}
            </div>
          ) : (
            <div style={{ color: '#999', textAlign: 'center', padding: 20 }}>
              لا توجد خيارات لهذا المنتج
            </div>
          )}

          {/* Notes */}
          <div>
            <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>ملاحظات:</label>
            <TextArea
              value={editForm.notes}
              onChange={(e) => setEditForm(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
              placeholder="ملاحظات إضافية..."
            />
          </div>

          {/* Current Selection Preview */}
          {Object.keys(editForm.selectedOptions).length > 0 && (
            <div style={{ backgroundColor: '#f6f6f6', padding: 12, borderRadius: 6 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>الخيارات المحددة حالياً:</div>
              <div>
                {Object.entries(editForm.selectedOptions).map(([key, value]) => (
                  <Tag key={key} color="blue" style={{ marginBottom: 4 }}>
                    {key}: {value}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* 🔹 NEW: Add Product Modal */}
      <Modal
        title="إضافة منتج جديد للطلب"
        open={addProductModalVisible}
        onCancel={() => {
          setAddProductModalVisible(false);
          setSelectedProductToAdd(null);
          setProductDetails(null);
          setAddProductForm({
            quantity: 1,
            selectedOptions: {},
            notes: ''
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
            disabled={!selectedProductToAdd}
          >
            إضافة للطلب
          </Button>,
        ]}
        width={700}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Product Selection */}
          <div>
            <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>اختر المنتج:</label>
            <Select
              placeholder="ابحث عن المنتج..."
              showSearch
              loading={loadingProducts}
              onChange={handleProductSelect}
              style={{ width: '100%' }}
              filterOption={(input, option) =>
                option?.children?.toLowerCase()?.includes(input.toLowerCase())
              }
            >
              {availableProducts.map(product => (
                <Option key={product.id} value={product.id}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <Avatar 
                      src={product.primary_image} 
                      size="small"
                      shape="square"
                    />
                    <span>{product.name} - ${product.price}</span>
                  </div>
                </Option>
              ))}
            </Select>
          </div>

          {/* Selected Product Preview */}
          {selectedProductToAdd && (
            <Card size="small" style={{ backgroundColor: '#f9f9f9' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Avatar 
                  src={selectedProductToAdd.primary_image || fallbackImage} 
                  size={50}
                  shape="square"
                />
                <div style={{ flexGrow: 1 }}>
                  <div style={{ fontWeight: 500 }}>{selectedProductToAdd.name}</div>
                  <div style={{ color: '#666' }}>السعر: ${selectedProductToAdd.price}</div>
                  {selectedProductToAdd.stock && (
                    <div style={{ color: '#666', fontSize: 12 }}>المخزون: {selectedProductToAdd.stock}</div>
                  )}
                </div>
              </div>
            </Card>
          )}

          {/* Quantity Selection */}
          {selectedProductToAdd && (
            <div>
              <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>الكمية:</label>
              <InputNumber
                min={1}
                max={selectedProductToAdd.stock || 999}
                value={addProductForm.quantity}
                onChange={(value) => setAddProductForm(prev => ({ ...prev, quantity: value }))}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {/* Product Options */}
          {selectedProductToAdd && loadingProductDetails && (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div>جاري تحميل خيارات المنتج...</div>
            </div>
          )}

          {selectedProductToAdd && productDetails?.options && (
            <div style={{ border: '1px solid #d9d9d9', borderRadius: 6, padding: 16 }}>
              <h4 style={{ margin: '0 0 12px 0' }}>خيارات المنتج:</h4>
              {(() => {
                try {
                  const adminOptions = typeof productDetails.options === 'string' 
                    ? JSON.parse(productDetails.options) 
                    : productDetails.options;
                  
                  if (!Array.isArray(adminOptions) || adminOptions.length === 0) {
                    return <div style={{ color: '#999' }}>لا توجد خيارات متاحة</div>;
                  }

                  return adminOptions.map((option, index) => (
                    <div key={index} style={{ marginBottom: 12 }}>
                      <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>
                        {option.name}:
                      </label>
                      <Select
                        placeholder={`اختر ${option.name}`}
                        value={addProductForm.selectedOptions[option.name] || undefined}
                        onChange={(value) => handleAddOptionChange(option.name, value)}
                        style={{ width: '100%' }}
                        allowClear
                      >
                        {option.values?.map((value) => (
                          <Option key={value} value={value}>
                            {value}
                          </Option>
                        ))}
                      </Select>
                    </div>
                  ));
                } catch (error) {
                  console.error("Error parsing admin options:", error);
                  return <div style={{ color: '#ff4d4f' }}>خطأ في تحميل الخيارات</div>;
                }
              })()}
            </div>
          )}

          {/* Notes */}
          {selectedProductToAdd && (
            <div>
              <label style={{ fontWeight: 500, marginBottom: 8, display: 'block' }}>ملاحظات:</label>
              <TextArea
                value={addProductForm.notes}
                onChange={(e) => setAddProductForm(prev => ({ ...prev, notes: e.target.value }))}
                rows={2}
                placeholder="ملاحظات إضافية..."
              />
            </div>
          )}

          {/* Selected Options Preview */}
          {Object.keys(addProductForm.selectedOptions).length > 0 && (
            <div style={{ backgroundColor: '#f6f6f6', padding: 12, borderRadius: 6 }}>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>الخيارات المحددة:</div>
              <div>
                {Object.entries(addProductForm.selectedOptions).map(([key, value]) => (
                  <Tag key={key} color="green" style={{ marginBottom: 4 }}>
                    {key}: {value}
                  </Tag>
                ))}
              </div>
            </div>
          )}
        </div>
      </Modal>
    </>
  );
};
