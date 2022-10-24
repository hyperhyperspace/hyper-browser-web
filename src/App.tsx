import './App.css';
import { Fragment } from 'react';
import { Navigate, Outlet, Route, Routes, useParams } from 'react-router';

import { CssBaseline, ThemeProvider, Typography } from '@mui/material';
import { lightTheme } from './themes';

import { Hash, MutableSet, Store }     from '@hyper-hyper-space/core';
import { ObjectState, useObjectState } from '@hyper-hyper-space/react';

import StartPage         from './pages/start/StartPage';
import LookupSpaceDialog from './pages/start/components/LookupSpaceDialog';
import CreateHomeDialog  from './pages/start/components/CreateHomeDialog';
import LinkDeviceDialog  from './pages/start/components/CreateLinkDeviceOfferDialog';

import HomeSpace           from './pages/home/HomeSpace';
import ManageDevicesDialog from './pages/home/components/ManageDevicesDialog';
import ViewFolderDialog    from './pages/home/components/ViewFolderDialog';

import SpaceFrame, { SpaceComponent } from './pages/space/SpaceFrame';

import HyperBrowserEnv from './context/HyperBrowserContext';
import StorageDialog from './pages/home/components/StorageDialog';
import EditProfileDialog from './pages/home/components/EditProfileDialog';
import ContactsDialog from './pages/home/components/ContactsDialog';
import ShareProfileDialog from './pages/home/components/ShareProfileDialog';
import ViewProfileDialog from './pages/home/components/ViewProfileDialog';
import AddContactDialog from './pages/home/components/AddContactDialog';
import NoHomeDialog from './pages/start/components/NoHomeDialog';
import ViewProfileAnonDialog from './pages/start/components/ViewProfileAnonDialog';
import ViewAuthorDialog from './pages/space/ViewAuthorDialog';
import AllChatsDialog from './pages/home/components/AllChatsDialog';


function RedirectContactLink(props: {homes: ObjectState<MutableSet<Hash>>}) {
  const params = useParams();
  const { profile } = params;

  if (props.homes?.value === undefined) {
    return <Typography>Loading...</Typography>
  } else if (props.homes?.value?.size() === 0) {
    if (profile === undefined) {
      return <Navigate replace to="/start" />;
    } else {
      return <Navigate replace to={'/start/no-home/' + encodeURIComponent('add-contact/' + encodeURIComponent(profile))} />;
    }
  } else {
    if (profile === undefined) {
      return <Navigate replace to={'/home/' + encodeURIComponent(props.homes.value.values().next().value) + '/add-contact'} />
    } else {
      return <Navigate replace to={'/home/' + encodeURIComponent(props.homes.value.values().next().value) + '/add-contact/' + encodeURIComponent(profile)} />
    }
    
  }
  


};

function App(props: {homes: MutableSet<Hash>, config: Store}) {

  const homes = useObjectState(props.homes) as ObjectState<MutableSet<Hash>>;

  const confReady = props.config && homes && homes.value;

  const params = useParams();

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
            <Route path="add-contact/:profile" element={<RedirectContactLink homes={homes}/>}/>
            <Route path="start" element={<StartPage homes={props.homes} config={props.config}/>}>
              <Route path="lookup/:words" element={<LookupSpaceDialog />} />
              <Route path="create-home" element={<CreateHomeDialog />} />
              <Route path="create-home/:next" element={<CreateHomeDialog />} />
              <Route path="link-device" element={<LinkDeviceDialog />} />
              <Route path="link-device/:next" element={<LinkDeviceDialog />} />
              <Route path="no-home/:next" element={<NoHomeDialog />} />
              <Route path="view-profile/:profileHash" element={<ViewProfileAnonDialog />} />
            </Route>
            <Route path="home/:hash" element={<HomeSpace />}>
              <Route path="devices" element={<ManageDevicesDialog />} />
              <Route path="edit-profile" element={<EditProfileDialog />} />
              <Route path="share-profile" element={<ShareProfileDialog />} />
              <Route path="contacts" element={<ContactsDialog />} />
              <Route path="storage" element={<StorageDialog />} />
              <Route path="folder/:path" element={<ViewFolderDialog />} />
              <Route path="view-profile/:profileHash" element={<ViewProfileDialog />} />
              <Route path="add-contact" element={<AddContactDialog />} />
              <Route path="add-contact/:profile" element={<AddContactDialog />} />
              <Route path="chats" element={<AllChatsDialog />} />
              <Route path="chats/:identityHash" element={<AllChatsDialog />} />
            </Route>
            <Route path="space/:hash" element={<SpaceFrame homes={props.homes}/>}>
              <Route path="" element={<SpaceComponent />}/>
              <Route path="view-author" element={<ViewAuthorDialog />} />
              <Route path="*" element={<SpaceComponent />}/>
            </Route>
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
