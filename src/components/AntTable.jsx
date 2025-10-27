import React from 'react';
import { Table, Button, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const AntTable = ({
  columns,
  data,
  onEdit,
  onDelete,
  onView,
  showActions = true,
  showDefaultActions = true,
  loading = false,
  actionColumnWidth = 120,
  customActionColumn = null
}) => {
  // Use custom action column if provided, otherwise use default
  const actionColumn = customActionColumn || {
    title: 'الإجراءات',
    key: 'actions',
    fixed: 'right',
    width: actionColumnWidth,
    render: (_, record) => (
      <Space size="small">
        {onView && (
          <Button 
            icon={<EyeOutlined />} 
            size="small"
            onClick={() => onView(record)}
          />
        )}
        <Button 
          type="primary" 
          icon={<EditOutlined />} 
          size="small"
          onClick={() => onEdit?.(record)}
        />
        <Popconfirm
          title="هل أنت متأكد من حذف هذا العنصر؟"
          onConfirm={() => onDelete?.(record)}
          okText="نعم"
          cancelText="لا"
        >
          <Button 
            danger 
            icon={<DeleteOutlined />} 
            size="small"
          />
        </Popconfirm>
      </Space>
    ),
  };

  // Add actions column if needed
  const tableColumns = showActions ? [...columns, actionColumn] : columns;

  return (
    <Table
      columns={tableColumns}
      dataSource={data}
      loading={loading}
      rowKey="id"
      size="middle"
      pagination={{
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total, range) => `${range[0]}-${range[1]} من ${total} عنصر`,
        pageSize: 10,
      }}
      locale={{
        emptyText: 'لا توجد بيانات'
      }}
      style={{ 
        background: 'white', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)'
      }}
    />
  );
};

export default AntTable;