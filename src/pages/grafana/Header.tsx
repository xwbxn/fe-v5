import React from 'react';
import { Input, Button, Dropdown, Modal, Space, message } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { removeDashboards } from '@/services/grafanaDashboard';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import RefreshIcon from '@/components/RefreshIcon';
import FormCpt from './Form';

interface IProps {
  busiId: number;
  selectRowKeys: any[];
  refreshList: () => void;
  searchVal: string;
  onSearchChange: (val) => void;
}

export default function Header(props: IProps) {
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const { busiId, selectRowKeys, refreshList, searchVal, onSearchChange } = props;

  return (
    <>
      <div className='table-handle' style={{ padding: 0 }}>
        <Space>
          <RefreshIcon
            onClick={() => {
              refreshList();
            }}
          />
          <div className='table-handle-search'>
            <Input
              className={'searchInput'}
              value={searchVal}
              onChange={(e) => {
                onSearchChange(e.target.value);
              }}
              prefix={<SearchOutlined />}
              placeholder='大盘名称、分类标签'
            />
          </div>
        </Space>
        <div className='table-handle-buttons'>
          <Button
            type='primary'
            onClick={() => {
              FormCpt({
                mode: 'create',
                busiId,
                refreshList,
                clusters,
              });
            }}
            ghost
          >
            新建大盘
          </Button>
          <div className={'table-more-options'}>
            <Dropdown
              overlay={
                <ul className='ant-dropdown-menu'>
                  <li
                    className='ant-dropdown-menu-item'
                    onClick={() => {
                      if (selectRowKeys.length) {
                        Modal.confirm({
                          title: '是否批量删除大盘?',
                          onOk: async () => {
                            removeDashboards(selectRowKeys).then(() => {
                              message.success('批量删除大盘成功');
                            });
                            // TODO: 删除完后立马刷新数据有时候不是实时的，这里暂时间隔0.5s后再刷新列表
                            setTimeout(() => {
                              refreshList();
                            }, 500);
                          },
                        });
                      } else {
                        message.warning('未选择任何大盘');
                      }
                    }}
                  >
                    <span>批量删除大盘</span>
                  </li>
                </ul>
              }
              trigger={['click']}
            >
              <Button onClick={(e) => e.stopPropagation()}>
                更多操作
                <DownOutlined
                  style={{
                    marginLeft: 2,
                  }}
                />
              </Button>
            </Dropdown>
          </div>
        </div>
      </div>
    </>
  );
}
