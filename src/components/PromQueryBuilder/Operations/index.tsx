import React from 'react';
import { Cascader, Button } from 'antd';
import _ from 'lodash';
import { arrayMoveImmutable } from 'array-move';
import { SortableContainer } from 'react-sortable-hoc';
import { getOperationDefinitions } from './utils';
import { PromVisualQuery } from '../types';
import Operation from './Operation';

interface IProps {
  metric?: string;
  datasourceValue: string;
  params: {
    start: number;
    end: number;
  };
  query: PromVisualQuery;
  value?: any[];
  onChange: (query: PromVisualQuery) => void;
}

const SortableBody = SortableContainer(({ children }) => <div className='prom-query-builder-operations'>{children}</div>);

export default function index(props: IProps) {
  const { query, onChange } = props;
  const { operations } = query;
  const addOperationOptions = getOperationDefinitions();
  const categories = _.groupBy(addOperationOptions, 'category');

  return (
    <div className='prom-query-builder-operations-container'>
      <div className='prom-query-builder-operations'>
        {!_.isEmpty(operations) && (
          <SortableBody
            useDragHandle
            axis='x'
            helperClass='row-dragging'
            onSortEnd={({ oldIndex, newIndex }) => {
              const newOperations = arrayMoveImmutable(operations, oldIndex, newIndex);
              onChange({
                ...query,
                operations: newOperations,
              });
            }}
          >
            {_.map(operations, (operation, index) => {
              return <Operation {...props} operation={operation} index={index} key={`${operation.id}_${index}`} />;
            })}
          </SortableBody>
        )}
        <Cascader
          value={[]}
          options={_.map(categories, (options, key) => {
            return {
              value: key,
              label: key,
              children: _.map(options, (option) => {
                return {
                  value: option.id,
                  label: option.name,
                };
              }),
            };
          })}
          onChange={(val) => {
            const id = _.last(val);
            const operationDef = _.find(addOperationOptions, { id });
            if (!operationDef) {
              return;
            }
            const firstOperationDef = _.find(addOperationOptions, { id: query.operations[0]?.id });
            onChange(operationDef.addOperationHandler(operationDef, query, firstOperationDef));
          }}
        >
          <Button>添加操作</Button>
        </Cascader>
      </div>
    </div>
  );
}
