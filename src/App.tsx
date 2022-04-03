import './App.css';
import { useEffect, useState, Fragment } from 'react';
import { CssBaseline, ThemeProvider } from '@mui/material';
import StartPage from './pages/StartPage';
import { lightTheme } from './themes';
import HomeSpace from './pages/HomeSpace';
import { Route, Routes, useLocation, useNavigate } from 'react-router';
import { Hash, MutableSet, Resources, Store } from '@hyper-hyper-space/core';
import { StateObject, useStateObject } from '@hyper-hyper-space/react';
import LookupSpaceDialog from './components/LookupSpaceDialog';
import CreateHomeDialog from './components/CreateHomeDialog';
import LinkDeviceDialog from './components/LinkDeviceDialog';
import { HyperBrowserConfig } from './model/HyperBrowserConfig';
import HyperBrowserEnv from './context/HyperBrowserContext';
import ManageDevicesDialog from './components/ManageDevicesDialog';


function App(props: {homes: MutableSet<Hash>, config: Store}) {

  const navigate = useNavigate();
  const location = useLocation();


  useEffect( () => {
    if (location.pathname === '/') {
      if (props.homes?.size() === 0) {
        navigate('/start');
      } else {
        navigate('/home/' + encodeURIComponent(props.homes.values().next().value));
      }
    }
  }, [location, props.homes]);

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
