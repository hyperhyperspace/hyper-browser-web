import * as React from 'react';
import { IconButton, List, ListItem, Paper, Typography } from '@mui/material';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { useObjectState } from '@hyper-hyper-space/react';

import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import ContactSelectorDialog from '../../home/components/ContactSelectorDialog';
import { Identity } from '@hyper-hyper-space/core';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
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
      await editFlagsState?.getValue()?.add(WikiSpace.OpenlyEditableFlag, author);
      await editFlagsState?.getValue()?.save()
      console.log('wiki permissions set', [...editFlagsState?.getValue()?.values()!])
    } else {
      await editFlagsState?.getValue()?.delete(WikiSpace.OpenlyEditableFlag, author);
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
        {editFlagsState?.getValue()?.has(WikiSpace.OpenlyEditableFlag) ? 'Anyone can edit' : 'Only some people can edit'}
      </Typography>
    </div>
  );
}

function EditorsList() {
  const {spaceContext, wiki} = useOutletContext<WikiContext>();
  const editorsState = useObjectState(wiki.editors)
  const owners = wiki.owners!

  return <List>
    {[...owners?.values()!].map(x => <ListItem>{x.info.name}</ListItem>)}
    {[...editorsState?.value?.values()!].map(x =>
    <ListItem>
      {x.info.name}
      <IconButton onClick={() => {
        editorsState?.value?.delete(x, spaceContext.home?.getAuthor())
        editorsState?.value?.save()
      }}><PersonRemoveIcon/></IconButton>
    </ListItem>)}
  </List>
}

export default function WikiSpacePermissionSettings() {
  const {spaceContext, wiki} = useOutletContext<WikiContext>();
  const { home, homeResources } = spaceContext;
  const editorsState = useObjectState(wiki.editors)
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
      <ContactSelectorDialog handleSelect={async (x: any, y: any) => {
        console.log('selected', x)
        const identity = await homeResources?.store.load(x.hash!)! as Identity
        editorsState?.value?.add(identity, home?.getAuthor()!)
        editorsState?.value?.save()
      }}/>
      <EditorsList/>
    </Paper>
  );
}
