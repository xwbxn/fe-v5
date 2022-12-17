/*
 * Copyright 2022 Nightingale Team
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */
import React, { useState, ReactNode } from 'react';
import './index.less';
import { useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import Icon, { RollbackOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import { RootState as AccountRootState, accountStoreState } from '@/store/accountInterface';
import { RootState as CommonRootState } from '@/store/common';
import { CommonStoreState } from '@/store/commonInterface';
import { Menu, Dropdown, Button } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { Logout } from '@/services/login';
import AdvancedWrap from '@/components/AdvancedWrap';
import License from '@/pages/warning/strategy/license';
interface IPageLayoutProps {
  icon?: ReactNode;
  title?: String | JSX.Element;
  children?: ReactNode;
  introIcon?: ReactNode;
  rightArea?: ReactNode;
  customArea?: ReactNode;
  showBack?: Boolean;
  backPath?: string;
  hideCluster?: Boolean;
  onChangeCluster?: (string) => void;
  docFn?: Function;
}

const PageLayout: React.FC<IPageLayoutProps> = ({ icon, title, rightArea, introIcon, children, customArea, showBack, backPath, onChangeCluster, hideCluster = true, docFn }) => {
  const { t, i18n } = useTranslation();
  const history = useHistory();
  const dispatch = useDispatch();
  let { profile } = useSelector<AccountRootState, accountStoreState>((state) => state.account);
  const { clusters } = useSelector<CommonRootState, CommonStoreState>((state) => state.common);
  const localCluster = localStorage.getItem('curCluster');
  const [curCluster, setCurCluster] = useState<string>(localCluster || clusters[0]);
  if (!localCluster && clusters.length > 0) {
    setCurCluster(clusters[0]);
    localStorage.setItem('curCluster', clusters[0]);
    dispatch({
      type: 'common/saveData',
      prop: 'curCluster',
      data: clusters[0],
    });
  }

  const menu = (
    <Menu>
      <Menu.Item
        onClick={() => {
          history.push('/account/profile/info');
        }}
      >
        {t('个人信息')}
      </Menu.Item>
      <Menu.Item
        onClick={() => {
          Logout().then((res) => {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            dispatch({
              type: 'common/saveData',
              prop: 'clusters',
              data: [],
            });
            dispatch({
              type: 'common/saveData',
              prop: 'busiGroups',
              data: [],
            });
            history.push('/login');
          });
        }}
      >
        {t('退出')}
      </Menu.Item>
    </Menu>
  );

  const clusterMenu = (
    <Menu selectedKeys={[curCluster]}>
      {clusters.map((cluster) => (
        <Menu.Item
          key={cluster}
          onClick={(_) => {
            setCurCluster(cluster);
            onChangeCluster && onChangeCluster(cluster);
            localStorage.setItem('curCluster', cluster);
            dispatch({
              type: 'common/saveData',
              prop: 'curCluster',
              data: cluster,
            });
          }}
        >
          {cluster}
        </Menu.Item>
      ))}
    </Menu>
  );

  return (
    <div className={'page-wrapper'}>
      {customArea ? (
        <div className={'page-top-header'}>{customArea}</div>
      ) : (
        <div className={'page-top-header'}>
          <div className={'page-header-content'}>
            <div className={'page-header-title'}>
              {showBack && (
                <RollbackOutlined
                  onClick={() => {
                    if (backPath) {
                      history.push({
                        pathname: backPath,
                      });
                    } else {
                      history.goBack();
                    }
                  }}
                  style={{
                    marginRight: '5px',
                  }}
                />
              )}
              {icon}
              {title}
            </div>

            {/* <div className={'page-header-right-area'}>{rightArea}</div> */}
            <div className={'page-header-right-area'}>
              {introIcon}
              {docFn && (
                <a onClick={() => docFn()} style={{ marginRight: 20 }}>
                  文档
                </a>
              )}
              {/* 整合版本关闭文档链接 */}
              {import.meta.env.VITE_IS_COMMON_DS !== 'true' && (
                <div style={{ marginRight: 32, position: 'relative' }}>
                  <a target='_blank' href='http://n9e.flashcat.cloud'>
                    文档
                  </a>
                  <Icon
                    style={{ fontSize: 16, position: 'absolute', top: -16, right: -28 }}
                    component={() => {
                      return (
                        <svg viewBox='0 0 1024 1024' version='1.1' xmlns='http://www.w3.org/2000/svg' p-id='2548' width='32' height='32' fill='red'>
                          <path
                            d='M829.866667 313.6a64 64 0 0 1 64 64v213.333333a64 64 0 0 1-64 64H262.058667L168.32 746.666667v-106.666667h0.213333V377.6a64 64 0 0 1 64-64h597.333334z m-117.333334 78.293333H661.333333l-23.466666 138.56-19.2-136.533333h-51.2l34.133333 174.677333h68.266667l19.2-116.458666 17.066666 116.458666h68.266667l34.133333-174.677333h-51.2l-17.066666 138.538667-27.733334-140.544z m-151.466666 0h-125.866667v174.698667h125.866667v-36.138667h-78.933334v-38.165333h68.266667v-32.106667h-68.266667v-34.133333h78.933334v-34.133333z m-217.6 0h-70.4v174.698667H320v-128.512l32 128.512h70.4V391.893333h-46.933333v134.506667l-32-134.506667z'
                            p-id='2549'
                          ></path>
                        </svg>
                      );
                    }}
                  />
                </div>
              )}

              {!hideCluster && (
                <div style={{ marginRight: 20 }}>
                  集群：
                  <Dropdown overlay={clusterMenu}>
                    <Button>
                      {curCluster} <DownOutlined />
                    </Button>
                  </Dropdown>
                </div>
              )}
              <AdvancedWrap var='VITE_IS_ALERT_AI,VITE_IS_ALERT_ES_DS'>
                <License />
              </AdvancedWrap>

              {/* 文案完善了再打开 */}
              {/* <span
                className='language'
                onClick={() => {
                  let language = i18n.language == 'en' ? 'zh' : 'en';
                  i18n.changeLanguage(language);
                  localStorage.setItem('language', language);
                }}
              >
                {i18n.language == 'zh' ? 'En' : '中'}
              </span> */}
              <Dropdown overlay={menu} trigger={['click']}>
                <span className='avator'>
                  <img src={profile.portrait || '/image/avatar1.png'} alt='' />
                  <span className='display-name'>{profile.nickname || profile.username}</span>
                  <DownOutlined />
                </span>
              </Dropdown>
            </div>
          </div>
        </div>
      )}
      {children && children}
    </div>
  );
};

export default PageLayout;
