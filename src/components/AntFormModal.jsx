import React, { useEffect } from 'react';
import { Modal, Form, Input, InputNumber, Select, DatePicker, Switch } from 'antd';
import dayjs from 'dayjs';

const { TextArea } = Input;

const AntFormModal = ({
  open,
  onCancel,
  onSubmit,
  title,
  fields = [],
  initialValues = {},
  loading = false
}) => {
  const [form] = Form.useForm();

  useEffect(() => {
    if (open) {
      // Process initial values
      const processedValues = { ...initialValues };
      
      fields.forEach((field) => {
        if (field.type === "date" && initialValues[field.name]) {
          processedValues[field.name] = dayjs(initialValues[field.name]);
        }
      });
      
      form.setFieldsValue(processedValues);
    } else {
      form.resetFields();
    }
  }, [open, initialValues, form, fields]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // Process values before submission
        const processedValues = { ...values };
        
        fields.forEach((field) => {
          if (field.type === "date" && values[field.name]) {
            processedValues[field.name] = values[field.name].toISOString();
          }
        });

        onSubmit(processedValues);
      })
      .catch((info) => console.log('فشل التحقق:', info));
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'number':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules || []}
          >
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        );
        
      case 'select':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules || []}
          >
            <Select 
              options={field.options} 
              placeholder={`اختر ${field.label}`}
            />
          </Form.Item>
        );
        
      case 'date':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules || []}
          >
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        );
        
      case 'textarea':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules || []}
          >
            <TextArea rows={4} />
          </Form.Item>
        );
        
      case 'password':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules || []}
          >
            <Input.Password />
          </Form.Item>
        );
        
      case 'switch':
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
        );
        
      default:
        return (
          <Form.Item
            key={field.name}
            name={field.name}
            label={field.label}
            rules={field.rules || []}
          >
            <Input />
          </Form.Item>
        );
    }
  };

  return (
    <Modal
      title={title}
      open={open}
      onCancel={() => {
        form.resetFields();
        onCancel();
      }}
      onOk={handleOk}
      confirmLoading={loading}
      okText="حفظ"
      cancelText="إلغاء"
    >
      <Form form={form} layout="vertical">
        {fields.map(renderField)}
      </Form>
    </Modal>
  );
};

export default AntFormModal;