import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next';
import PageLayout from '@/components/pageLayout'
import { Input, Space, Table, Tag } from 'antd';
import type { ColumnsType } from 'antd/es/table';

import { AppstoreOutlined } from '@ant-design/icons';
import './index.less'
import { getBusiGroups, getOverview } from '@/services/common';
import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

interface BusiGroup {
    id: number;
    name: string;
    label_value: string;
    GroupMetrics: number;
}

interface Overview {
    GroupId: number;
    Emergency: number;
    Warning: number;
    Notice: number;
    GroupTargets: number;
}

enum Health {
    normal = 0,
    warning = 1,
    error = 2
}

export default function () {
    const { t } = useTranslation();
    const [busiGroups, setBusiGroups] = useState<BusiGroup[]>([]);
    const [overview, setOverview] = useState<Overview[]>([]);
    const { Search } = Input

    const fetchMetrics = async (groups) => {
        for (const group of groups) {
            const res = await request(`/api/n9e/prometheus/api/v1/series?match[]={busigroup="${group.label_value}"}`, {
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
        let overviewData, busiGroupData
        getOverview().then((res) => {
            overviewData = res.dat || [];
            return getBusiGroups("")
        }).then((res) => {
            busiGroupData = res.dat || [];
            setOverview(overviewData)
            return fetchMetrics(busiGroupData)
        }).then(data => {
            setBusiGroups(data)
        })
    }, [])



    const columns: ColumnsType<BusiGroup> = [
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
            dataIndex: "id",
            key: "targets",
            render: ((value) => {
                const bg = overview.find(v => v.GroupId === value)
                return bg?.GroupTargets || 0

            })
        },
        {
            title: "指标数量",
            dataIndex: "GroupMetrics",
            key: "metrics",
        },
        {
            title: '一级告警',
            dataIndex: 'id',
            key: 'Emergency',
            render: ((value) => {
                const bg = overview.find(v => v.GroupId === value)
                return bg?.Emergency || 0

            })
        },
        {
            title: '二级告警',
            dataIndex: 'id',
            key: 'Warning',
            render: ((value) => {
                const bg = overview.find(v => v.GroupId === value)
                return bg?.Warning || 0
            })
        },
        {
            title: '三级告警',
            dataIndex: 'id',
            key: 'Notice',
            render: ((value) => {
                const bg = overview.find(v => v.GroupId === value)
                return bg?.Notice || 0
            })
        }
    ];

    return (
        <PageLayout title={t('监控总览')} icon={<AppstoreOutlined />}>
            <div className='home-container'>
                <div className='home-toolbar'>
                    <Search placeholder='请输入关键字' style={{ width: 300 }}></Search>
                </div>
                <div className='home-content'>
                    <Table columns={columns} dataSource={busiGroups} pagination={{ position: ['bottomCenter'] }}></Table>
                </div>
            </div>
        </PageLayout>
    )
}