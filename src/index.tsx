import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom';
import './index.css';
import App from './App';

import { EventRelay, HeaderBasedSyncAgent, HistorySynchronizer, LogLevel } from '@hyper-hyper-space/core';

import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';

import { Hash, MutableSet, Store, WorkerSafeIdbBackend } from '@hyper-hyper-space/core';
import { HyperBrowserConfig } from './model/HyperBrowserConfig';


EventRelay.logger.level = LogLevel.INFO;
HeaderBasedSyncAgent.controlLog.level = LogLevel.DEBUG;
HistorySynchronizer.controlLog.level = LogLevel.DEBUG;


const main = async () => {
  const configBackend = new WorkerSafeIdbBackend('hyper-browser-config');
  let configBackendError: (string|undefined) = undefined;
  
  
  try {
    console.log('Initializing configuration storage backend...');
    await configBackend.ready();
    console.log('Configuration storage backend ready');
  } catch (e: any) {
    console.log(e);
    configBackendError = e.toString();
  }
  
  const configStore = new Store(configBackend);

  let config = new HyperBrowserConfig();
  await configStore.save(config);
  await config.homes?.loadAndWatchForChanges();

  ReactDOM.render(
    <React.StrictMode>
      <HashRouter>
        <App homes={config.homes as MutableSet<Hash>} config={configStore}/>
      </HashRouter>
    </React.StrictMode>,
    document.getElementById('root')
  );
  
  // If you want to start measuring performance in your app, pass a function
  // to log results (for example: reportWebVitals(console.log))
  // or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
  //reportWebVitals();
}

main();
