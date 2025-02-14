import React, { useEffect } from 'react';
import _ from 'lodash';
import { Form, Modal, Input, Select, message } from 'antd';
import ModalHOC, { ModalWrapProps } from '@/components/ModalHOC';
import { updateDashboard, createDashboard, getDashboard } from '@/services/grafanaDashboard';
import { JSONParse } from './utils';

interface IProps {
  mode: 'create' | 'edit';
  initialValues?: any;
  busiId: number;
  refreshList: () => void;
  clusters: string[];
}

const layout = {
  labelCol: {
    span: 4,
  },
  wrapperCol: {
    span: 16,
  },
};
const titleMap = {
  create: '创建新监控大盘',
  edit: '编辑监控大盘',
};

function FormCpt(props: IProps & ModalWrapProps) {
  const { mode, initialValues = {}, visible, busiId, refreshList, destroy, clusters } = props;
  const [form] = Form.useForm();
  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      let result;

      if (mode === 'edit') {
        result = await updateDashboard(initialValues.id, {
          name: values.name,
          ident: values.ident,
          tags: _.join(values.tags, ' '),
          grafana_id: values.grafana_id,
          grafana_url: values.grafana_url
        });
        message.success('编辑大盘成功');
      } else if (mode === 'create') {
        result = await createDashboard(busiId, {
          name: values.name,
          ident: values.ident,
          tags: _.join(values.tags, ' '),
          configs: JSON.stringify({
            var: [],
            panels: [],
            version: '2.0.0',
          }),
        });
        message.success('新建大盘成功');
      }
      refreshList();
      destroy();
    } catch (error) {
      message.error('操作失败');
    }
  };

  useEffect(() => {
    if (initialValues.id) {
      getDashboard(initialValues.id).then((res) => {
        const configs = JSONParse(res.configs);
        form.setFieldsValue({
          datasourceValue: configs.datasourceValue,
        });
      });
    }
  }, [initialValues.id]);

  return (
    <Modal
      title={titleMap[mode]}
      visible={visible}
      onOk={handleOk}
      onCancel={() => {
        destroy();
      }}
      destroyOnClose
    >
      <Form {...layout} form={form} preserve={false} initialValues={initialValues}>
        <Form.Item
          label='大盘名称'
          name='name'
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          rules={[
            {
              required: true,
              message: '请输入大盘名称',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          label='英文标识'
          name='ident'
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          rules={[
            {
              pattern: /^[a-zA-Z0-9\-]*$/,
              message: '请输入英文字母、数字、中划线',
            },
          ]}
        >
          <Input />
        </Form.Item>
        <Form.Item
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}
          label='分类标签'
          name='tags'
        >
          <Select
            mode='tags'
            dropdownStyle={{
              display: 'none',
            }}
            placeholder={'请输入分类标签(请用回车分割)'}
          />
        </Form.Item>
        <Form.Item name='id' hidden>
          <Input />
        </Form.Item>
        <Form.Item name="grafana_id" hidden>
          <Input></Input>
        </Form.Item>
        <Form.Item name="grafana_url" label='看板链接'
          labelCol={{
            span: 5,
          }}
          wrapperCol={{
            span: 24,
          }}>
          <Input></Input>
        </Form.Item>
      </Form>
    </Modal>
  );
}

export default ModalHOC(FormCpt);
