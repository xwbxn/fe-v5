import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout'
import { Input, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { AppstoreOutlined } from '@ant-design/icons';
import './index.less'
import { getOverview } from '@/services/common';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';
import Overview from '../login/overview';

interface Overview {
    id: number;
    name: string;
    label: string;
    metrics: number;
    targets: number;
    emergency: number;
    warning: number;
    notice: number;
}

enum Health {
    normal = 0,
    warning = 1,
    error = 2
}

export default function () {
    const { t } = useTranslation();
    const [overview, setOverview] = useState<Overview[]>([]);
    const { Search } = Input

    const fetchMetrics = async (groups) => {
        for (const group of groups) {
            const res = await request(`/api/n9e/prometheus/api/v1/series?match[]={busigroup="${group.label}"}`, {
                method: RequestMethod.Get,
            })
            if (res.status === "success") {
                group.GroupMetrics = res.data.length
            } else {
                group.GroupMetrics = 0
            }
        }
        return groups
    }

    useEffect(() => {
        let overviewData
        getOverview().then((res) => {
            overviewData = res.dat || [];
            return fetchMetrics(overviewData)
        }).then(data => {
            setOverview(data)
        })
    }, [])



    const columns: ColumnsType<Overview> = [
        {
            title: '业务组',
            dataIndex: 'id',
            key: 'id',
            render: (_, record) => <a>{record.name}</a>,
        },
        {
            title: '健康状态',
            dataIndex: 'health',
            key: 'health',
            render(value, record, index) {
                let color = 'success'
                let content = '正常'
                if (value === Health.error) {
                    color = 'error'
                    content = '异常'
                }
                return (
                    <Tag color={color}>{content}</Tag>
                )
            },
        },
        {
            title: "探针数量",
            dataIndex: "targets",
            key: "targets"
        },
        {
            title: "指标数量",
            dataIndex: "metrics",
            key: "metrics",
        },
        {
            title: '一级告警',
            dataIndex: 'emergency',
            key: 'Emergency'
        },
        {
            title: '二级告警',
            dataIndex: 'warning',
            key: 'Warning'
        },
        {
            title: '三级告警',
            dataIndex: 'notice',
            key: 'Notice'
        }
    ];

    return (
        <PageLayout title={t('监控总览')} icon={<AppstoreOutlined />}>
            <div className='home-container'>
                <div className='home-toolbar'>
                    <Search placeholder='请输入关键字' style={{ width: 300 }}></Search>
                </div>
                <div className='home-content'>
                    <Table columns={columns} dataSource={overview} pagination={{ position: ['bottomCenter'] }}></Table>
                </div>
            </div>
        </PageLayout>
    )
}