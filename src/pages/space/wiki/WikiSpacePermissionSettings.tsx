import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Box, Icon, IconButton, Paper, Typography } from '@mui/material';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { useObjectState } from '@hyper-hyper-space/react';

import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import ContactSelectorDialog from '../../home/components/ContactSelectorDialog';
// import ContactSelector from '../../home/components/ContactSelector';
// import { HyperBrowserConfig } from '../../../model/HyperBrowserConfig';
// import { Home } from '@hyper-hyper-space/home';
// import ContactsDialog from '../../home/components/ContactsDialog';

function EditFlagsToggle() {
  const {wiki, spaceContext} = useOutletContext<WikiContext>();
  const editFlagsState = useObjectState(wiki.editFlags);
  const author = spaceContext?.home?.getAuthor();

  const handleToggle = async (
    event: React.MouseEvent<HTMLElement>,
    openlyEditable: boolean,
  ) => {
    // console.log('toggling editability for', wiki, editFlagsState?.getValue())
    if (openlyEditable) {
      await editFlagsState?.getValue()?.add(WikiSpace.OpenlyEditableFlag);
      await editFlagsState?.getValue()?.save()
      console.log('wiki permissions set', [...editFlagsState?.getValue()?.values()!])
    } else {
      await editFlagsState?.getValue()?.delete(WikiSpace.OpenlyEditableFlag);
      await editFlagsState?.getValue()?.save()
      console.log('wiki permissions set', [...editFlagsState?.getValue()?.values()!])
    } 
  };

  return (
    <div style={{display: 'grid', gridTemplateColumns: 'min-content auto', alignItems: "center", gap: "1em"}}>
      <ToggleButtonGroup
        value={editFlagsState?.getValue()?.has(WikiSpace.OpenlyEditableFlag)}
        exclusive
        onChange={handleToggle}
        aria-label="wiki permissions"
        disabled={!wiki.owners?.has(author!)}
      >
        <ToggleButton value={true} aria-label="openly editable">
          <PublicIcon/>
          {/* Open */}
        </ToggleButton>
        <ToggleButton value={false} aria-label="editable only by designated editors">
          <PeopleIcon />
          {/* Restricted */}
        </ToggleButton>
      </ToggleButtonGroup>
      <Typography>
        {editFlagsState?.getValue()?.has(WikiSpace.OpenlyEditableFlag) ? 'Anyone can edit' : 'Only some people are allowed to edit'}
      </Typography>
    </div>
  );
}

export default function WikiSpacePermissionSettings() {
  // const {spaceContext} = useOutletContext<WikiContext>();
  // const { home, homeResources } = spaceContext;
  // React.useEffect(() => {
  //   // console.log('LOADING HOME...')
  //   const loadHomeResources = async () => {
  //     // const homeResources = await HyperBrowserConfig.initHomeResources(home?.hash! as string, (e) => { console.log('Error while initializing home in SpaceFrameToolbar'); console.log(e);}, 'worker');
  //     const loaded = await homeResources?.store.loadAndWatchForChanges(home?.getLastHash() as string) as Home; 
  //   }
  //   loadHomeResources()
  // })
  return (
    <Paper style={{width: '100%'}} sx={{ p: 3 }}>
      <EditFlagsToggle/>
      <ContactSelectorDialog/>
      {/* <ContactsDialog home={home}/> */}
    </Paper>
  );
}
