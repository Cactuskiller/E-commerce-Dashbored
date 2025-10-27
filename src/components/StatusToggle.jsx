import React from 'react';
import { Switch } from 'antd';

const StatusToggle = ({ 
  checked, 
  onChange, 
  record,
  activeValue = 'نشط',
  inactiveValue = 'غير نشط',
  size = 'small'
}) => {
  const handleChange = (newChecked) => {
    const newStatus = newChecked ? activeValue : inactiveValue;
    onChange?.(record.id, newStatus, record);
  };

  return (
    <Switch 
      checked={checked}
      size={size}
      onChange={handleChange}
    />
  );
};

export default StatusToggle;