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

  // FIXME! #november: the toggle used to be open editing yes/no
  //                   now it needs to be editing: owners / members / everyone

  // for now it works as before, using only the "everyone" setting

  const writeConfigState = useObjectState(wiki.writeConfig);
  const author = spaceContext?.home?.getAuthor();

  const handleToggle = async (
    event: React.MouseEvent<HTMLElement>,
    openlyEditable: boolean,
  ) => {
    // console.log('toggling editability for', wiki, editFlagsState?.getValue())
    if (openlyEditable) {
      await writeConfigState?.getValue()?.add('everyone', author);
      await writeConfigState?.getValue()?.save()
      console.log('wiki permissions set', [...writeConfigState?.getValue()?.values()!])
    } else {
      await writeConfigState?.getValue()?.delete('everyone', author);
      await writeConfigState?.getValue()?.save()
      console.log('wiki permissions set', [...writeConfigState?.getValue()?.values()!])
    } 
  };

  return (
    <div style={{display: 'grid', gridTemplateColumns: 'min-content auto', alignItems: "center", gap: "1em"}}>
      <ToggleButtonGroup
        value={writeConfigState?.getValue()?.has('everyone')}
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
        {writeConfigState?.getValue()?.has('everyone') ? 'Anyone can edit' : 'Only some people can edit'}
      </Typography>
    </div>
  );
}

function EditorsList() {
  const {spaceContext, wiki} = useOutletContext<WikiContext>();
  const membersState = useObjectState(wiki.members)
  const owners = wiki.owners!

  return <List>
    {[...owners?.values()!].map(x => <ListItem>{x.info.name}</ListItem>)}
    {[...membersState?.value?.values()!].map(x =>
    <ListItem>
      {x.info.name}
      <IconButton onClick={() => {
        membersState?.value?.delete(x, spaceContext.home?.getAuthor())
        membersState?.value?.save()
      }}><PersonRemoveIcon/></IconButton>
    </ListItem>)}
  </List>
}

export default function WikiSpacePermissionSettings() {
  const {spaceContext, wiki} = useOutletContext<WikiContext>();
  const { home, homeResources } = spaceContext;
  const membersState = useObjectState(wiki.members);
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
        membersState?.value?.add(identity, home?.getAuthor()!)
        membersState?.value?.save()
      }}/>
      <EditorsList/>
    </Paper>
  );
}
