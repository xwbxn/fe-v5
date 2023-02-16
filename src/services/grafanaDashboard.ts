import request from '@/utils/request';
import { RequestMethod } from '@/store/common';

// 大盘列表
export const getDashboards = function (id: number | string) {
    return request(`/api/n9e/busi-group/${id}/grafana-boards`, {
        method: RequestMethod.Get,
    }).then((res) => {
        return res.dat;
    });
};

interface Dashboard {
    name: string;
    ident?: string;
    tags: string;
    configs?: string;
    grafanaId?: number;
    grafanaUrl?: string;
}
// 创建大盘
export const createDashboard = function (id: number, data: Dashboard) {
    return request(`/api/n9e/busi-group/${id}/grafana-boards`, {
        method: RequestMethod.Post,
        data,
    }).then((res) => {
        return res.dat;
    });
};


// 删除大盘
export const removeDashboards = function (ids: number[]) {
    return request(`/api/n9e/grafana-board`, {
        method: RequestMethod.Delete,
        data: {
            ids,
        },
    });
};

// 获取大盘详情
export const getDashboard = function (id: string | number) {
    return request(`/api/n9e/grafana-board/${id}`, {
        method: RequestMethod.Get,
    }).then((res) => {
        return res.dat;
    });
};

// 更新大盘 - 只能更新 name 和 tags
export const updateDashboard = function (id: string | number, data: { name: string; ident?: string; tags: string, grafana_id: number | string, grafana_url: string }) {
    return request(`/api/n9e/grafana-board/${id}`, {
        method: RequestMethod.Put,
        data,
    }).then((res) => res.dat);
};

// 一下是非大盘相关的接口
// 告警策略 or 大盘 内置模版
export const getTemplate = function (type: 'alert_rule' | 'dashboard') {
    return request(`/api/n9e/tpl/list?tpl_type=${type}`, {
        method: RequestMethod.Get,
    });
};

export const getTemplateContent = function (type: 'alert_rule' | 'dashboard', name: string) {
    return request(`/api/n9e/tpl/content?tpl_type=${type}&tpl_name=${name}`, {
        method: RequestMethod.Get,
    });
};

export const getLabelNames = function (data) {
    return request(`/api/n9e/prometheus/api/v1/labels`, {
        method: RequestMethod.Get,
        params: { ...data },
    });
};

export const getLabelValues = function (label, data) {
    return request(`/api/n9e/prometheus/api/v1/label/${label}/values`, {
        method: RequestMethod.Get,
        params: { ...data },
    });
};

export const getMetricSeries = function (data) {
    return request(`/api/n9e/prometheus/api/v1/series`, {
        method: RequestMethod.Get,
        params: { ...data },
    });
};

export const getMetric = function (data = {}) {
    return request(`/api/n9e/prometheus/api/v1/label/__name__/values`, {
        method: RequestMethod.Get,
        params: { ...data },
    });
};

export const getQueryResult = function (data) {
    return request(`/api/n9e/prometheus/api/v1/query`, {
        method: RequestMethod.Get,
        params: { ...data },
    });
};

export const getBuiltinDashboards = function () {
    return request('/api/n9e/dashboards/builtin/list', {
        method: RequestMethod.Get,
    }).then((res) => {
        return res.dat;
    });
};

export const getBuiltinDashboard = function (name: string) {
    return request(`/api/n9e/builtin-board/${name}`, {
        method: RequestMethod.Get,
    }).then((res) => {
        return res.dat;
    });
};

export const getDashboardPure = function (id: string) {
    return request(`/api/n9e/board/${id}/pure`, {
        method: RequestMethod.Get,
    }).then((res) => {
        return res.dat;
    });
};
