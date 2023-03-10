import React from 'react';
import { Input, Button, Dropdown, Modal, Space, message } from 'antd';
import { SearchOutlined, DownOutlined } from '@ant-design/icons';
import RefreshIcon from '@/components/RefreshIcon';
import { createFolder, getFolder } from '@/services/grafana';

interface IProps {
  busiGroup: string;
  refreshList: () => void;
  searchVal: string;
  onSearchChange: (val) => void;
}

export default function Header(props: IProps) {
  const { busiGroup, refreshList, searchVal, onSearchChange } = props;

  const checkOrCreateFolder = async (busiGroup: string) => {
    let res = await getFolder(busiGroup)
    if (!res.success && res.dat.status == 404) {
      res = await createFolder({ uid: busiGroup, title: busiGroup })
      if (!res.success) {
        message.error('创建目录失败')
        return false
      }
    }
    return true
  }

  const newGrafana = async (busiGroup: string) => {
    if (await checkOrCreateFolder(busiGroup)) {
      window.open(`/grafana/dashboard/new?folderUid=${busiGroup}`, "_blank")
    }
  }

  const importGrafana = async (busiGroup: string) => {
    if (await checkOrCreateFolder(busiGroup)) {
      window.open(`/grafana/dashboard/import?folderUid=${busiGroup}`, "_blank")
    }
  }

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
        <Space>
          <div className='table-handle-buttons'>
            <Button
              type='primary'
              onClick={() => {
                newGrafana(busiGroup)
              }}
              ghost
            >
              新建大盘
            </Button>
          </div>
          <div className='table-handle-buttons'>
            <Button
              type='primary'
              onClick={() => {
                importGrafana(busiGroup)
              }}
              ghost
            >
              导入大盘
            </Button>
          </div>
        </Space>
      </div>
    </>
  );
}
