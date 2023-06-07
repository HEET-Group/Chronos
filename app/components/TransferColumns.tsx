import React, { useState, useContext, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { QueryContext } from '../context/QueryContext';
import { HealthContext } from '../context/HealthContext';
import { EventContext } from '../context/EventContext';
import { DataGrid } from '@material-ui/data-grid';
import * as DashboardContext from '../context/DashboardContext';
import lightAndDark from './Styling';
import { Button } from '@material-ui/core';

interface Params {
  service: string;
}

const TransferColumns = React.memo(() => {
  const [targetKeys, setTargetKeys] = useState<any[]>([]);
  const [metricsPool, setMetricsPool] = useState<any[]>([]);
  const [healthMetricsReady, setHealthMetricsReady] = useState(false);
  const [healthMetrics, setHealthMetrics] = useState<any[]>([]);
  const [eventMetricsReady, setEventMetricsReady] = useState(false);
  const [eventMetrics, setEventMetrics] = useState<any[]>([]);
  const [disabled, setDisabled] = useState(false);
  const [showSearch, setShowSearch] = useState(true);
  const { setSelectedMetrics } = useContext(QueryContext);
  const { healthData } = useContext(HealthContext);
  const { eventData } = useContext(EventContext);
  const { service } = useParams<keyof Params>() as Params;
  const { mode } = useContext(DashboardContext.DashboardContext);

  const eventDataList = eventData.eventDataList;
  const healthDataObject = healthData;

  const currentMode = mode === 'light' ? lightAndDark.lightModeText : lightAndDark.darkModeText;

  console.log('healthMetrics: ', healthMetrics);
  console.log('metricsPool: ', metricsPool);
  console.log('targetKeys: ', targetKeys);
  console.log('eventData: ', eventData);
  console.log('eventDataList: ', eventDataList);

  useEffect(() => {
    if (healthDataObject) {
      setHealthMetricsReady(true);
    }
  }, [healthDataObject]);

  useEffect(() => {
    if (eventDataList && eventDataList.length > 0) {
      setEventMetricsReady(true);
    }
  }, [eventDataList]);

  useEffect(() => {
    setHealthMetrics(getMetrics('health', healthDataObject));
  }, [healthMetricsReady]);

  useEffect(() => {
    setEventMetrics(getMetrics('event', eventDataList));
  }, [eventMetricsReady]);

  useEffect(() => {
    if (service === '') {
      return;
    }
    if (service === 'kafkametrics') {
      if (eventDataList && eventDataList.length > 0) {
        setMetricsPool(getMetrics('event', eventDataList));
      } else if (eventMetricsReady) {
        setMetricsPool(eventMetrics);
      }
    }
    // JJ-ADDITION (CAN ALSO JUST ADD OR OPERATOR TO ABOVE CONDITIONAL)
    else if (service === 'kubernetesmetrics') {
      if (healthDataObject) {
        setMetricsPool(getMetrics('health', healthDataObject));
      } else if (healthMetricsReady) {
        setMetricsPool(healthMetrics);
      }
    } else if (!service.includes('kafkametrics')) {
      if (healthDataObject) {
        setMetricsPool(getMetrics('health', healthDataObject));
      } else if (healthMetricsReady) {
        setMetricsPool(healthMetrics);
      }
    } else {
      if (healthDataObject && eventDataList && eventDataList.length > 0) {
        setMetricsPool(
          getMetrics('event', eventDataList).concat(getMetrics('health', healthDataObject))
        );
      } else if (healthMetricsReady && eventMetricsReady) {
        setMetricsPool(eventMetrics.concat(healthMetrics));
      }
    }
  }, [service, eventData, healthData]);

  // responsible for parsing data and updating state via setMetricsPool
  const getMetrics = (type, datalist) => {
    let pool: any[] = [];
    if (type === 'event') {
      datalist.forEach(metric => {
        const temp = {};
        const metricName: string = Object.keys(metric)[0];
        const key = 'Event | ' + metricName;
        temp['key'] = key;
        temp['title'] = key;
        temp['tag'] = 'Event';
        pool.push(temp);
      });
    } else {
      // iterate throught the healthData object to populate the `Metrics Query` tab with metrics options
      // The pool array wants an object with a specific format in order to populate the selection table
      for (const service in healthData) {
        const categoryObjects = healthData[service];
        for (const category in categoryObjects) {
          const metricsObjects = categoryObjects[category];
          for (const metric in metricsObjects) {
            const key = category + ' | ' + metric;
            pool.push({
              key: key,
              title: key,
              tag: category,
            });
          }
        }
      }
    }
    return pool;
  };

  // Justin's alternative to  getCharts (b/c getCharts is just saving the user-selected metrics into QueryContext)
  // getCharts takes data that already exists in state as an array of strings, and makes it into an array of objects, just to save it to QueryContext state
  // the selectedMetrics from QueryContext is used in TransferColumns, EventContainer, GraphsContainer, and HealthContainer
  // const saveSelectedMetrics = () => {
  //   // iterate over the targetKeys array
  // }

  const getCharts = () => {
    const temp: any[] = [];
    const categorySet = new Set();
    console.log('targetKeys is: ', targetKeys);
    for (let i = 0; i < targetKeys.length; i++) {
      const str: string = targetKeys[i];
      const strArr: string[] = str.split(' | ');
      const categoryName = strArr[0];
      const metricName = strArr[1];
      if (categorySet.has(categoryName)) {
        temp.forEach(element => {
          if (Object.keys(element)[0] === categoryName) {
            const metricsList: any[] = element[categoryName];
            metricsList.push(metricName);
          }
        });
      } else {
        categorySet.add(categoryName);
        const newCategory = {};
        newCategory[categoryName] = [metricName];
        temp.push(newCategory);
      }
    }
    console.log('temp array with requested graphs is: ', temp);
    setSelectedMetrics(temp);
  };

  // makes the column titles for the selection grid
  const columns = [
    { field: 'id', headerName: 'ID', width: 100 },
    {
      field: 'tag',
      headerName: 'Category',
      flex: 1,
      editable: true,
    },
    {
      field: 'title',
      headerName: 'Metric',
      flex: 3,
      editable: true,
    },
  ];

  // makes the rows needed for the selection grid
  const rows: any[] = [];
  metricsPool.forEach((el, index) => {
    const row = {};
    row['id'] = index;
    row['tag'] = el.tag;
    row['title'] = el.title.split(' | ')[1].replace('kubernetes-cadvisor/docker-desktop/', ''); // gets rid of the full path
    rows.push(row);
  });

  // makes the Printed list of 'currently selected rows' on the page using targetKeys array
  const selectedRows: any[] = [];
  targetKeys.forEach(el => {
    selectedRows.push(
      <li style={{ marginLeft: '30px', marginTop: '5px', color: currentMode.color }}>{el}</li>
    );
  });

  //! BZ: creates metrics query page in Chronos

  return (
    <>
      <div id="getChartsContainer">
        <Button id="getCharts" onClick={getCharts} variant="contained" color="primary">
          Get Charts
        </Button>
      </div>
      <div id="transferTest">
        <div style={{ height: '500px', width: '100%' }}>
          <DataGrid
            style={currentMode}
            rows={rows}
            columns={columns}
            pageSize={10}
            checkboxSelection
            disableSelectionOnClick
            onSelectionModelChange={metricIndeces => {
              const metrics: any[] = [];
              metricIndeces.forEach(el => {
                metrics.push(metricsPool[el].key);
              });
              setTargetKeys(metrics);
            }}
          />
        </div>
        {selectedRows.length > 0 && (
          <h3 style={{ marginTop: '20px', color: currentMode.color }}>Selected Rows:</h3>
        )}
        <ol id="selectedRows">{selectedRows}</ol>
      </div>
    </>
  );
});

export default TransferColumns;
