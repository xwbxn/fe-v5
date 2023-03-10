import React, { useState, useEffect, useRef } from 'react';
import { useHistory, Link, useLocation } from 'react-router-dom';
import { Table, Tag, Modal, Switch, message } from 'antd';
import { FundViewOutlined } from '@ant-design/icons';
import _ from 'lodash';
import { useSelector } from 'react-redux';
import { Dashboard as DashboardType } from '@/store/grafanaInterface';
import { removeDashboards } from '@/services/grafanaDashboard';
import { getFolder, getDashboards, deleteDashboard } from '@/services/grafana';
import PageLayout from '@/components/pageLayout';
import LeftTree from '@/components/LeftTree';
import BlankBusinessPlaceholder from '@/components/BlankBusinessPlaceholder';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import Header from './Header';
import FormCpt from './Form';
import './style.less';

const DASHBOARD_PAGESIZE_KEY = 'dashboard-pagesize';

export default function index(props) {
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const history = useHistory();
  const location = useLocation();
  const [busiGroup, setBusiGroup] = useState<string>();
  const [list, setList] = useState([]);
  const [selectRowKeys, setSelectRowKeys] = useState<number[]>([]);
  const [refreshKey, setRefreshKey] = useState(_.uniqueId('refreshKey_'));
  const [searchVal, setsearchVal] = useState<string>('');
  const [pageSize, setPageSize] = useState<number>(_.toNumber(localStorage.getItem(DASHBOARD_PAGESIZE_KEY)) || 10);

  useEffect(() => {
    if (props.match.params.busiGroup) {
      setBusiGroup(props.match.params.busiGroup)
    }

    if (busiGroup) {
      getFolder(busiGroup).then(res => {
        if (res.success) {
          return getDashboards(res.dat.id)
        } else {
          setList([])
        }
      }).then((res) => {
        setList(res.dat)
      })
    }
  }, [busiGroup, refreshKey]);

  const data = _.filter(list, (item) => {
    if (searchVal) {
      return _.includes(item.title.toLowerCase(), searchVal.toLowerCase()) || item.tags.join().toLowerCase().includes(searchVal.toLowerCase());
    }
    return true;
  });

  return (
    <PageLayout title='监控大盘' icon={<FundViewOutlined />} hideCluster={true}>
      <div style={{ display: 'flex' }}>
        <LeftTree busiGroup={{ onChange: (id, item) => setBusiGroup(item.label_value) }}></LeftTree>
        {busiGroup ? (
          <div className='dashboards-v2'>
            <Header
              busiGroup={busiGroup}
              refreshList={() => {
                setRefreshKey(_.uniqueId('refreshKey_'));
              }}
              searchVal={searchVal}
              onSearchChange={setsearchVal}
            />
            <Table
              dataSource={data}
              columns={[
                {
                  title: '大盘名称',
                  dataIndex: 'title',
                  className: 'name-column',
                  render: (text: string, record: DashboardType) => {
                    return (
                      <Link target="_blank" to={`${record.url}`}>{text}</Link>
                    );
                  },
                },
                {
                  title: '分类标签',
                  dataIndex: 'tags',
                  className: 'tags-column',
                  render: (text: string[]) => (
                    <>
                      {_.map(_.split(text, ' '), (tag, index) => {
                        return tag ? (
                          <Tag
                            color='blue'
                            key={index}
                            style={{
                              cursor: 'pointer',
                            }}
                            onClick={() => {
                              const queryItem = searchVal.length > 0 ? searchVal.split(' ') : [];
                              if (queryItem.includes(tag)) return;
                              setsearchVal((searchVal) => {
                                if (searchVal) {
                                  return searchVal + ' ' + tag;
                                }
                                return tag;
                              });
                            }}
                          >
                            {tag}
                          </Tag>
                        ) : null;
                      })}
                    </>
                  ),
                },
                {
                  title: '操作',
                  width: 120,
                  render: (text: string, record: DashboardType) => (
                    <div className='table-operator-area'>
                      <div
                        className='table-operator-area-warning'
                        onClick={async () => {
                          Modal.confirm({
                            title: `是否删除大盘：${record.title}?`,
                            onOk: async () => {
                              const res = await deleteDashboard(record.uid);
                              if (res.success) {
                                message.success('删除大盘成功');
                                setRefreshKey(_.uniqueId('refreshKey_'));
                              } else {
                                message.error('删除失败:' + res.dat)
                              }
                            },

                            onCancel() { },
                          });
                        }}
                      >
                        删除
                      </div>
                    </div>
                  ),
                },
              ]}
              rowKey='id'
              rowSelection={{
                selectedRowKeys: selectRowKeys,
                onChange: (selectedRowKeys: number[]) => {
                  setSelectRowKeys(selectedRowKeys);
                },
              }}
              pagination={{
                showSizeChanger: true,
                pageSize,
                pageSizeOptions: ['10', '20', '50', '100'],
                onShowSizeChange: (_current, size) => {
                  setPageSize(size);
                  localStorage.setItem(DASHBOARD_PAGESIZE_KEY, size.toString());
                },
              }}
            />
          </div>
        ) : (
          <BlankBusinessPlaceholder text='监控大盘' />
        )}
      </div>
    </PageLayout>
  );
}
