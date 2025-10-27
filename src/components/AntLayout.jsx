import React, { useState } from "react";
import { Layout, Menu, Button } from "antd";
import { useLocation } from "react-router-dom";
import {
  AppstoreOutlined,
  TagsOutlined,
  ShoppingCartOutlined,
  PictureOutlined,
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
  GiftOutlined,
} from "@ant-design/icons";

const { Header, Sider, Content } = Layout;

const AntLayout = ({
  children,
  onMenuClick,
  onLogout,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  
  
  const getCurrentActiveKey = () => {
    const path = location.pathname.substring(1);
    return path || "products";
  };
  
  const activeKey = getCurrentActiveKey();

  const handleMenuClick = (e) => {
    if (e.key === "logout") {
      if (onLogout) {
        onLogout();
      }
    } else {
      if (onMenuClick) {
        onMenuClick(e.key);
      }
    }
  };


  const mainMenuItems = [
    {
      key: "products",
      icon: <AppstoreOutlined />,
      label: "المنتجات",
    },
    {
      key: "categories",
      icon: <TagsOutlined />,
      label: "الفئات",
    },
    {
      key: "orders",
      icon: <ShoppingCartOutlined />,
      label: "الطلبات",
    },
    {
      key: "banners",
      icon: <PictureOutlined />,
      label: "واجه التطبيق",
    },
    {
      key: "users",
      icon: <UserOutlined />,
      label: "المستخدمين",
    },
    {
      key: "vouchers",
      icon: <GiftOutlined />,
      label: "قسائم الشراء",
    },
  ];

  
  const allMenuItems = [...mainMenuItems, {
    key: "logout",
    label: "تسجيل الخروج",
  }];

  return (
    <Layout style={{ minHeight: "100vh", direction: "rtl" }}>
  
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        theme="dark"
        style={{
          position: "fixed",
          height: "100vh",
          right: 0,
          zIndex: 1000,
          top: 0,
        }}
      >
     
        <div style={{ 
          height: "100%", 
          display: "flex", 
          flexDirection: "column" 
        }}>
          
        
          <div
            style={{
              padding: "16px",
              color: "white",
              textAlign: "center",
              fontWeight: "bold",
              fontSize: "18px",
              flexShrink: 0,
            }}
          >
            {collapsed ? "ل" : "لوحة التحكم"}
          </div>

         
          <div style={{ flex: 1, overflow: "auto" }}>
            <Menu
              theme="dark"
              mode="inline"
              selectedKeys={[activeKey]}
              items={mainMenuItems} 
              onClick={handleMenuClick}
              style={{ 
                textAlign: "right",
                border: "none",
                background: "transparent",
              }}
            />
          </div>

        
          <div 
            style={{ 
              padding: "16px 12px", 
              borderTop: "1px solid #434343",
              flexShrink: 0,
            }}
          >
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={() => handleMenuClick({ key: "logout" })}
              style={{
                width: '100%',
                color: '#ff4d4f',
                textAlign: collapsed ? 'center' : 'right',
                height: '40px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: collapsed ? 'center' : 'flex-start',
                gap: '8px',
                border: 'none',
                background: 'transparent',
              }}
            >
              {!collapsed && "تسجيل الخروج"}
            </Button>
          </div>
        </div>
      </Sider>

    
      <Layout style={{ marginRight: collapsed ? 80 : 200 }}>
        {/* Header */}
        <Header
          style={{
            background: "white",
            padding: "0 16px",
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-start", // 🔥 FIXED: space-between for proper alignment
            boxShadow: "0 1px 4px rgba(0,21,41,.08)",
          }}
        >
          {/* Button FIRST (LEFT side) */}
          <Button
            type="text"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
          />

          {/* Title SECOND (RIGHT side) */}
          <h1
            style={{
              fontSize: "20px",
              fontWeight: 600,
              margin: 0,
              color: "#262626",
            }}
          >
            {allMenuItems.find((item) => item.key === activeKey)?.label ||
              "لوحة التحكم"}
          </h1>
        </Header>

        {/* Content */}
        <Content
          style={{
            padding: "24px",
            background: "#f5f5f5",
            minHeight: "calc(100vh - 64px)",
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  );
};

export default AntLayout;
