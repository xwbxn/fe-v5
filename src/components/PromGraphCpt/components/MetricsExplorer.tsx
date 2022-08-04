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
import React, { useEffect, useState } from 'react';
import { SearchOutlined } from '@ant-design/icons';
import { Input, Modal } from 'antd';
import { getPromData } from '../services';

interface MetricsExplorer {
  url: string;
  datasourceId?: number;
  datasourceIdRequired?: boolean;
  show: boolean;
  updateShow(show: boolean): void;
  insertAtCursor(query: string): void;
}

const MetricsExplorer: React.FC<MetricsExplorer> = ({ url, datasourceId, datasourceIdRequired, show, updateShow, insertAtCursor }) => {
  const [metrics, setMetrics] = useState<string[]>([]);
  const [filteredMetrics, setFilteredMetrics] = useState<string[]>(metrics);

  function checkMetric(value: string) {
    insertAtCursor(value);
    updateShow(false);
  }

  useEffect(() => {
    if (show) {
      getPromData(`${url}/api/v1/label/__name__/values`, {}, datasourceIdRequired ? { 'X-Data-Source-Id': datasourceId } : {}).then((res) => {
        setMetrics(res);
        setFilteredMetrics(res);
      });
    }
  }, [show]);

  return (
    <Modal className='prom-graph-metrics-explorer-modal' width={540} visible={show} title='Metrics Explorer' footer={null} onCancel={() => updateShow(false)} getContainer={false}>
      <Input
        prefix={<SearchOutlined />}
        onPressEnter={(e) => {
          e.preventDefault();
          const value = e.currentTarget.value;
          setFilteredMetrics(metrics.filter((metric) => metric.includes(value)));
        }}
      />
      <div className='prom-graph-metrics-explorer-list' onClick={(e) => checkMetric((e.target as HTMLElement).innerText)}>
        {filteredMetrics.map((metric) => (
          <div className='prom-graph-metrics-explorer-list-item' key={metric}>
            {metric}
          </div>
        ))}
      </div>
    </Modal>
  );
};

export default MetricsExplorer;
