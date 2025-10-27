import React, { Children, useState } from "react";
import { useNavigate } from "react-router-dom";
import AntLayout from "../components/AntLayout";

import ProductsScreen from "./Screens/ProductsScreen";
import OrdersScreen from "./Screens/orders/OrdersScreen";
import CategoriesScreen from "./Screens/CategoriesScreen";
import UsersScreen from "./Screens/UsersScreen";
import VouchersScreen from "./Screens/vouchers/VouchersScreen";
import BannersScreen from "./Screens/banner/BannersScreen";

function Dashboard({ Children }) {
  const navigate = useNavigate();
  const [activeSection, setActiveSection] = useState("products");

  const handleStatusChange = async (id, newStatus, record, hookMethods) => {
    try {
      await hookMethods.patch(id, { status: newStatus });
      console.log("Status changed:", { id, newStatus, record });
    } catch (error) {
      console.error("Status change failed:", error);
    }
  };

  const handleActiveToggle = async (id, checked, hookMethods) => {
    try {
      await hookMethods.patch(id, { active: checked });
      console.log("Active toggled:", { id, checked });
    } catch (error) {
      console.error("Active toggle failed:", error);
    }
  };

  const handleEdit = (record) => {
    console.log("Edit:", record);
  };

  const handleDelete = async (record, hookMethods) => {
    try {
      await hookMethods.remove(record.id);
    } catch (error) {
      console.error("Delete failed:", error);
    }
  };

  const handleView = (record) => {
    if (activeSection === "orders") {
      navigate(`/order/${record.id}`);
    } else if (activeSection === "products") {
      navigate(`/product/${record.id}`);
    } else {
      console.log("View:", record);
    }
  };

  const handleMenuClick = (key) => {
    setActiveSection(key);
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    window.location.href = "/";
  };

  const renderCurrentScreen = () => {
    const commonProps = {
      onEdit: handleEdit,
      onDelete: handleDelete,
      onView: handleView,
    };

    switch (activeSection) {
      // case 'products':
      //   return (
      //     <ProductsScreen
      //       onStatusChange={handleStatusChange}
      //       {...commonProps}
      //     />
      //   );
      // case 'orders':
      //   return (
      //     <OrdersScreen
      //       onActiveToggle={handleActiveToggle}
      //       {...commonProps}
      //     />
      //   );
      // case 'categories':
      //   return <CategoriesScreen {...commonProps} />;
      // case 'users':
      //   return <UsersScreen {...commonProps} />;
      // case 'vouchers':
      //   return <VouchersScreen {...commonProps} />;
      case "banners":
        return (
          <BannersScreen onActiveToggle={handleActiveToggle} {...commonProps} />
        );
      default:
        return null;
    }

    return (
      <AntLayout
        activeKey={activeSection}
        onMenuClick={handleMenuClick}
        onLogout={handleLogout}
      >
        {Children}
      </AntLayout>
    );
  };
}
export default Dashboard;
