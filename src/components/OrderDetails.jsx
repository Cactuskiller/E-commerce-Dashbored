import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Button, 
  Tag, 
  Descriptions, 
  Space, 
  message, 
  Table, 
  Switch, 
  Divider,
  Select,
  Input,
  Form,
  Modal,
  Avatar,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  ArrowLeftOutlined, 
  EditOutlined, 
  PhoneOutlined, 
  EnvironmentOutlined, 
  UserOutlined,
  ShoppingCartOutlined,
  DollarOutlined,
  CalendarOutlined,
  TruckOutlined,
  SaveOutlined,
  GiftOutlined
} from '@ant-design/icons';

const { Option } = Select;
const { TextArea } = Input;

const OrderDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();

  // Sample orders data matching your database structure
  const sampleOrders = [
    { 
      id: 1, 
      user_id: 1,
      items: [
        { 
          id: 8, 
          title: 'Nike Air Jordan Retro High OG', 
          price: 122.00, 
          quantity: 1,
          image: 'https://via.placeholder.com/80x80?text=Nike+Jordan',
          description: 'حذاء كرة السلة الكلاسيكي'
        },
        { 
          id: 15, 
          title: 'Nike Air Max 270', 
          price: 95.00, 
          quantity: 2,
          image: 'https://via.placeholder.com/80x80?text=Air+Max',
          description: 'حذاء رياضي للجري'
        }
      ],
      phone: '+1234567890', 
      address: '123 Main Street, Downtown Area',
      status: 'Preparing',
      created_at: '2025-09-14T10:30:00Z',
      active: true,
      voucher_info: { 
        id: 1,
        name: 'Summer Sale',
        code: 'SUMMER20', 
        discount: 20,
        type: 'per'
      },
      delivery_cost: 15.5,
      voucher_id: 1,
      // Customer info (from user_id lookup)
      customer: {
        id: 1,
        name: 'أحمد محمد علي',
        username: 'ahmed123',
        email: 'ahmed@example.com',
        avatar: 'https://via.placeholder.com/100x100?text=أحمد'
      }
    },
    { 
      id: 3, 
      user_id: 1,
      items: [
        { 
          id: 12, 
          title: 'Adidas Hoodie Premium', 
          price: 65.00, 
          quantity: 1,
          image: 'https://via.placeholder.com/80x80?text=Adidas+Hoodie',
          description: 'هودي قطني فاخر'
        }
      ],
      phone: '+9876543210', 
      address: '456 Oak Avenue, Suburb Area',
      status: 'Created',
      created_at: '2025-09-14T14:15:00Z',
      active: true,
      voucher_info: null,
      delivery_cost: 10.0,
      voucher_id: null,
      customer: {
        id: 1,
        name: 'فاطمة أحمد',
        username: 'fatima456',
        email: 'fatima@example.com',
        avatar: 'https://via.placeholder.com/100x100?text=فاطمة'
      }
    }
  ];

  useEffect(() => {
    // Simulate API call
    setTimeout(() => {
      const foundOrder = sampleOrders.find(o => o.id === parseInt(id));
      if (foundOrder) {
        setOrder(foundOrder);
        // Populate form with current order data
        form.setFieldsValue({
          status: foundOrder.status,
          phone: foundOrder.phone,
          address: foundOrder.address,
          delivery_cost: foundOrder.delivery_cost,
          active: foundOrder.active
        });
      } else {
        message.error('الطلب غير موجود');
        navigate('/');
      }
      setLoading(false);
    }, 500);
  }, [id, navigate, form]);

  // Calculate totals
  const calculateTotals = (order) => {
    const subtotal = order.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    let discount = 0;
    
    if (order.voucher_info) {
      if (order.voucher_info.type === 'per') {
        discount = subtotal * (order.voucher_info.discount / 100);
      } else {
        discount = order.voucher_info.discount;
      }
    }
    
    const total = subtotal - discount + order.delivery_cost;
    
    return { subtotal, discount, total };
  };

  const handleStatusChange = (newStatus) => {
    setOrder(prev => ({ ...prev, status: newStatus }));
    form.setFieldValue('status', newStatus);
    message.success(`تم تغيير حالة الطلب إلى: ${newStatus}`);
  };

  const handleSaveChanges = (values) => {
    setOrder(prev => ({
      ...prev,
      status: values.status,
      phone: values.phone,
      address: values.address,
      delivery_cost: values.delivery_cost,
      active: values.active
    }));
    setEditModalVisible(false);
    message.success('تم حفظ التغييرات بنجاح');
  };

  // Items table columns
  const itemsColumns = [
    {
      title: 'المنتج',
      key: 'product',
      render: (_, item) => (
        <Space size={12}>
          <Avatar 
            src={item.image} 
            shape="square"
            size={60}
            style={{ borderRadius: '8px' }}
          />
          <div>
            <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{item.title}</div>
            <div style={{ color: '#666', fontSize: '12px' }}>{item.description}</div>
            <div style={{ color: '#999', fontSize: '11px' }}>المعرف: #{item.id}</div>
          </div>
        </Space>
      ),
    },
    {
      title: 'الكمية',
      dataIndex: 'quantity',
      key: 'quantity',
      width: 80,
      align: 'center',
      render: (quantity) => (
        <Tag color="blue" style={{ fontSize: '12px', padding: '4px 8px' }}>
          {quantity}
        </Tag>
      ),
    },
    {
      title: 'السعر',
      dataIndex: 'price',
      key: 'price',
      width: 100,
      align: 'right',
      render: (price) => (
        <span style={{ fontWeight: 'bold' }}>${price.toFixed(2)}</span>
      ),
    },
    {
      title: 'المجموع',
      key: 'total',
      width: 120,
      align: 'right',
      render: (_, item) => (
        <span style={{ fontWeight: 'bold', color: '#52c41a', fontSize: '14px' }}>
          ${(item.quantity * item.price).toFixed(2)}
        </span>
      ),
    },
  ];

  const getStatusColor = (status) => {
    switch(status) {
      case 'Preparing': return 'orange';
      case 'Created': return 'blue';
      case 'Shipped': return 'purple';
      case 'Delivered': return 'green';
      case 'Cancelled': return 'red';
      default: return 'default';
    }
  };

  const getStatusLabel = (status) => {
    switch(status) {
      case 'Preparing': return 'قيد التحضير';
      case 'Created': return 'تم الإنشاء';
      case 'Shipped': return 'تم الشحن';
      case 'Delivered': return 'تم التسليم';
      case 'Cancelled': return 'ملغي';
      default: return status;
    }
  };

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>جاري التحميل...</div>
      </div>
    );
  }

  if (!order) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', minHeight: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div>الطلب غير موجود</div>
      </div>
    );
  }

  const totals = calculateTotals(order);

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto', backgroundColor: '#f5f5f5', minHeight: '100vh' }}>
      {/* Header */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Space size={16}>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={() => navigate('/')}
              size="large"
            >
              العودة للوحة التحكم
            </Button>
            <div>
              <h1 style={{ margin: 0, fontSize: '24px', color: '#262626' }}>تفاصيل الطلب #{order.id}</h1>
              <span style={{ color: '#666', fontSize: '14px' }}>
                <CalendarOutlined /> {new Date(order.created_at).toLocaleString('ar-SA')}
              </span>
            </div>
          </Space>
          <Space>
            <Tag color={getStatusColor(order.status)} style={{ fontSize: '14px', padding: '6px 12px', borderRadius: '20px' }}>
              {getStatusLabel(order.status)}
            </Tag>
            <Button 
              type="primary" 
              icon={<EditOutlined />}
              onClick={() => setEditModalVisible(true)}
              size="large"
            >
              تعديل الطلب
            </Button>
          </Space>
        </div>
      </Card>

      {/* Statistics Row */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Statistic
              title="إجمالي المنتجات"
              value={order.items.length}
              prefix={<ShoppingCartOutlined style={{ color: '#1890ff' }} />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Statistic
              title="المجموع الفرعي"
              value={totals.subtotal}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              precision={2}
              valueStyle={{ color: '#52c41a' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Statistic
              title="تكلفة الشحن"
              value={order.delivery_cost}
              prefix={<TruckOutlined style={{ color: '#fa8c16' }} />}
              precision={2}
              valueStyle={{ color: '#fa8c16' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={6}>
          <Card style={{ borderRadius: '12px', textAlign: 'center' }}>
            <Statistic
              title="المجموع النهائي"
              value={totals.total}
              prefix={<DollarOutlined style={{ color: '#52c41a' }} />}
              precision={2}
              valueStyle={{ color: '#52c41a', fontWeight: 'bold' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[24, 24]}>
        {/* Left Column */}
        <Col xs={24} lg={16}>
          {/* Order Items */}
          <Card 
            title={<><ShoppingCartOutlined /> منتجات الطلب</>} 
            style={{ marginBottom: '24px', borderRadius: '12px' }}
          >
            <Table
              columns={itemsColumns}
              dataSource={order.items}
              pagination={false}
              rowKey="id"
              size="middle"
              style={{ marginBottom: '20px' }}
            />
            
            {/* Order Summary */}
            <div style={{ 
              backgroundColor: '#fafafa', 
              padding: '20px', 
              borderRadius: '8px',
              maxWidth: '400px',
              marginLeft: 'auto'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <span>المجموع الفرعي:</span>
                <span style={{ fontWeight: 'bold' }}>${totals.subtotal.toFixed(2)}</span>
              </div>
              
              {order.voucher_info && (
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <Space>
                    <GiftOutlined style={{ color: '#722ed1' }} />
                    <span>خصم ({order.voucher_info.code}):</span>
                  </Space>
                  <span style={{ color: '#52c41a', fontWeight: 'bold' }}>
                    -${totals.discount.toFixed(2)}
                  </span>
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <Space>
                  <TruckOutlined />
                  <span>تكلفة الشحن:</span>
                </Space>
                <span>${order.delivery_cost.toFixed(2)}</span>
              </div>
              
              <Divider style={{ margin: '16px 0' }} />
              
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                fontSize: '18px', 
                fontWeight: 'bold' 
              }}>
                <span>المجموع النهائي:</span>
                <span style={{ color: '#52c41a' }}>${totals.total.toFixed(2)}</span>
              </div>
            </div>
          </Card>
        </Col>

        {/* Right Column - Sidebar */}
        <Col xs={24} lg={8}>
          {/* Customer Info */}
          <Card 
            title={<><UserOutlined /> معلومات العميل</>}
            style={{ marginBottom: '24px', borderRadius: '12px' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <Avatar 
                src={order.customer.avatar} 
                size={80}
                style={{ marginBottom: '12px' }}
              />
              <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{order.customer.name}</div>
              <div style={{ color: '#666', fontSize: '14px' }}>@{order.customer.username}</div>
              <div style={{ color: '#666', fontSize: '12px' }}>{order.customer.email}</div>
            </div>
            
            <Descriptions column={1} size="small">
              <Descriptions.Item label="رقم الهاتف">
                <Space>
                  <PhoneOutlined />
                  <strong>{order.phone}</strong>
                </Space>
              </Descriptions.Item>
              <Descriptions.Item label="العنوان">
                <Space>
                  <EnvironmentOutlined />
                  <span>{order.address}</span>
                </Space>
              </Descriptions.Item>
            </Descriptions>
          </Card>

          {/* Order Status Control */}
          <Card 
            title="إدارة حالة الطلب"
            style={{ marginBottom: '24px', borderRadius: '12px' }}
          >
            <Space direction="vertical" style={{ width: '100%' }} size={16}>
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  حالة الطلب الحالية:
                </label>
                <Tag color={getStatusColor(order.status)} style={{ fontSize: '14px', padding: '6px 12px' }}>
                  {getStatusLabel(order.status)}
                </Tag>
              </div>
              
              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  تغيير الحالة:
                </label>
                <Select
                  value={order.status}
                  style={{ width: '100%' }}
                  onChange={handleStatusChange}
                >
                  <Option value="Created">تم الإنشاء</Option>
                  <Option value="Preparing">قيد التحضير</Option>
                  <Option value="Shipped">تم الشحن</Option>
                  <Option value="Delivered">تم التسليم</Option>
                  <Option value="Cancelled">ملغي</Option>
                </Select>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
                  حالة النشاط:
                </label>
                <Switch
                  checked={order.active}
                  onChange={(checked) => setOrder(prev => ({ ...prev, active: checked }))}
                  checkedChildren="نشط"
                  unCheckedChildren="غير نشط"
                />
              </div>
            </Space>
          </Card>

          {/* Voucher Info */}
          {order.voucher_info && (
            <Card 
              title={<><GiftOutlined /> كوبون الخصم</>}
              style={{ borderRadius: '12px' }}
            >
              <div style={{ textAlign: 'center' }}>
                <Tag color="purple" style={{ fontSize: '16px', padding: '8px 16px', marginBottom: '12px' }}>
                  {order.voucher_info.code}
                </Tag>
                <div style={{ fontSize: '14px', color: '#666' }}>{order.voucher_info.name}</div>
                <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#52c41a', marginTop: '8px' }}>
                  خصم {order.voucher_info.discount}
                  {order.voucher_info.type === 'per' ? '%' : '$'}
                </div>
              </div>
            </Card>
          )}
        </Col>
      </Row>

      {/* Edit Modal */}
      <Modal
        title="تعديل تفاصيل الطلب"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveChanges}
        >
          <Form.Item
            label="حالة الطلب"
            name="status"
            rules={[{ required: true, message: 'يرجى اختيار حالة الطلب' }]}
          >
            <Select>
              <Option value="Created">تم الإنشاء</Option>
              <Option value="Preparing">قيد التحضير</Option>
              <Option value="Shipped">تم الشحن</Option>
              <Option value="Delivered">تم التسليم</Option>
              <Option value="Cancelled">ملغي</Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="رقم الهاتف"
            name="phone"
            rules={[{ required: true, message: 'يرجى إدخال رقم الهاتف' }]}
          >
            <Input prefix={<PhoneOutlined />} />
          </Form.Item>

          <Form.Item
            label="العنوان"
            name="address"
            rules={[{ required: true, message: 'يرجى إدخال العنوان' }]}
          >
            <TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="تكلفة الشحن"
            name="delivery_cost"
            rules={[{ required: true, message: 'يرجى إدخال تكلفة الشحن' }]}
          >
            <Input type="number" step="0.01" prefix={<DollarOutlined />} />
          </Form.Item>

          <Form.Item name="active" valuePropName="checked">
            <Space>
              <Switch />
              <span>الطلب نشط</span>
            </Space>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                حفظ التغييرات
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                إلغاء
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default OrderDetails;