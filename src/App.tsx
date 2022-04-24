import './App.css';
import { Fragment } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import StartPage from './pages/start/StartPage';
import { lightTheme } from './themes';
import HomeSpace from './pages/home/HomeSpace';
import { Navigate, Route, Routes } from 'react-router';
import { Hash, MutableSet, Store } from '@hyper-hyper-space/core';
import { StateObject, useStateObject } from '@hyper-hyper-space/react';
import LookupSpaceDialog from './pages/start/components/LookupSpaceDialog';
import CreateHomeDialog from './pages/start/components/CreateHomeDialog';
import LinkDeviceDialog from './pages/start/components/CreateLinkDeviceOfferDialog';
import HyperBrowserEnv from './context/HyperBrowserContext';
import ManageDevicesDialog from './pages/home/components/ManageDevicesDialog';


function App(props: {homes: MutableSet<Hash>, config: Store}) {

  const homes = useStateObject(props.homes) as StateObject<MutableSet<Hash>>;

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
                  <Navigate replace to ={'/home/' + encodeURIComponent(props.homes.values().next().value)}/>
              }/>
            <Route path="start" element={<StartPage />}>
              <Route path="lookup/:words" element={<LookupSpaceDialog />} />
              <Route path="create-home" element={<CreateHomeDialog />} />
              <Route path="link-device" element={<LinkDeviceDialog />} />
            </Route>
            <Route path="home/:hash" element={<HomeSpace />}>
              <Route path="devices" element={<ManageDevicesDialog />} />
            </Route>
            <Route path="space/:hash" element={<HomeSpace />} />
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
