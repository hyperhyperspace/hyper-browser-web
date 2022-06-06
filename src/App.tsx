import './App.css';
import { Fragment } from 'react';
import { Navigate, Route, Routes } from 'react-router';

import { CssBaseline, ThemeProvider } from '@mui/material';
import { lightTheme } from './themes';

import { Hash, MutableSet, Store }     from '@hyper-hyper-space/core';
import { StateObject, useObjectState } from '@hyper-hyper-space/react';

import StartPage         from './pages/start/StartPage';
import LookupSpaceDialog from './pages/start/components/LookupSpaceDialog';
import CreateHomeDialog  from './pages/start/components/CreateHomeDialog';
import LinkDeviceDialog  from './pages/start/components/CreateLinkDeviceOfferDialog';

import HomeSpace           from './pages/home/HomeSpace';
import ManageDevicesDialog from './pages/home/components/ManageDevicesDialog';
import ViewFolderDialog    from './pages/home/components/ViewFolderDialog';

import SpaceFrame from './pages/space/SpaceFrame';

import HyperBrowserEnv from './context/HyperBrowserContext';
import StorageDialog from './pages/home/components/StorageDialog';


function App(props: {homes: MutableSet<Hash>, config: Store}) {

  const homes = useObjectState(props.homes) as StateObject<MutableSet<Hash>>;

  const confReady = props.config && homes && homes.value;

  return (
    <Fragment>
    { confReady &&
      <div style={{height: "100%"}}> 
      <header>
        <CssBaseline />
      </header>
      <ThemeProvider theme={lightTheme}>
        <HyperBrowserEnv homes={homes} config={props.config}>
          <Routes>
            <Route path="/" element=
              {
                props.homes?.size() === 0?
                  <Navigate replace to="/start" />
                : 
                  <Navigate replace to={'/home/' + encodeURIComponent(props.homes.values().next().value)}/>
              }/>
            <Route path="start" element={<StartPage homes={props.homes} config={props.config}/>}>
              <Route path="lookup/:words" element={<LookupSpaceDialog />} />
              <Route path="create-home" element={<CreateHomeDialog />} />
              <Route path="link-device" element={<LinkDeviceDialog />} />
            </Route>
            <Route path="home/:hash" element={<HomeSpace />}>
              <Route path="devices" element={<ManageDevicesDialog />} />
              <Route path="storage" element={<StorageDialog />} />
              <Route path="folder/:path" element={<ViewFolderDialog />} />
            </Route>
            <Route path="space/:hash" element={<SpaceFrame homes={props.homes}/>} />
          </Routes>
        </HyperBrowserEnv>
      </ThemeProvider>
      
    </div>
    }
    { !confReady &&
      <div><p>Loading...</p></div> 
    }
    </Fragment>

  );
}

export default App;
