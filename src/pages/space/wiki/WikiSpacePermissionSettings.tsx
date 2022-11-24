import * as React from 'react';
import { Box, FormControl, IconButton, InputLabel, List, ListItem, MenuItem, Paper, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { useObjectState } from '@hyper-hyper-space/react';

import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import { PermFlag, PermFlagEveryone, PermFlagMembers } from '@hyper-hyper-space/wiki-collab';
import ContactSelectorDialog from '../../home/components/ContactSelectorDialog';
import { CausalSet, Identity } from '@hyper-hyper-space/core';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { Contact, ProfileUtils } from '../../../model/ProfileUtils';
import ContactListDisplay from '../../home/components/ContactListDisplay';

function PermFlagToggle(props: { flag: CausalSet<PermFlag>, name: String }) {
  const { spaceContext } = useOutletContext<WikiContext>();
  const flagState = useObjectState(props.flag);
  const author = spaceContext?.home?.getAuthor();

  const handleChange = async (
    event: SelectChangeEvent,
  ) => {
    const flag = event.target.value;
    if (flag === PermFlagEveryone) {
      await flagState?.getValue()?.add(PermFlagEveryone, author);
      await flagState?.getValue()?.save()
      console.log('wiki permissions set', props.name, [...flagState?.getValue()?.values()!])
    } else {
      await flagState?.getValue()?.delete(PermFlagEveryone, author);
      await flagState?.getValue()?.save()
      console.log('wiki permissions set', props.name, [...flagState?.getValue()?.values()!])
    }
  };
  const flagStateEverybody = flagState?.getValue()?.has(PermFlagEveryone)
  const statusText = `Who can ${props.name}:`
  return (
    <>
      <Typography>
        { statusText }
      </Typography>
      <FormControl fullWidth>
        <Select
          value={flagStateEverybody ? PermFlagEveryone : PermFlagMembers}
          onChange={handleChange}
        >
          <MenuItem value={PermFlagEveryone}>Everybody</MenuItem>
          <MenuItem value={PermFlagMembers}>Members</MenuItem>
        </Select>
      </FormControl>
      { flagStateEverybody ? <PublicIcon/> : <PeopleIcon/> }
    </>
  );
}

function MemberList() {
  const { spaceContext, wiki } = useOutletContext<WikiContext>();
  const membersState = useObjectState(wiki.members)
  const owners = wiki.owners!

  return <>
    <h4>Members:</h4>
    <Box>
      <List>
        {[...owners.values()!].map(id =>
          <ListItem key={id.getLastHash()!}>
            <ContactListDisplay contact={ProfileUtils.createContact(id)!} />
          </ListItem>)}
        {[...membersState?.value?.values()!].map(id =>
          <ListItem key={id.getLastHash()!}>
            <ContactListDisplay contact={ProfileUtils.createContact(id)!} />
            <IconButton onClick={() => {
              membersState?.value?.delete(id, spaceContext.home?.getAuthor())
              membersState?.value?.save()
            }}><PersonRemoveIcon /></IconButton>
          </ListItem>)}
      </List>
    </Box>
  </>
}

export default function WikiSpacePermissionSettings() {
  const { spaceContext, wiki } = useOutletContext<WikiContext>();
  const { home, homeResources, resources } = spaceContext;
  const membersState = useObjectState(wiki.members)
  const owners = wiki.owners!

  return (
    <Paper style={{ width: '100%' }} sx={{ p: 3 }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content auto', alignItems: "center", gap: "1em" }}>
        <PermFlagToggle flag={wiki.readConfig!} name='read' />
        <PermFlagToggle flag={wiki.writeConfig!} name='write' />
      </div>
      <MemberList />
      <ContactSelectorDialog
        home={home!}
        resourcesForDiscovery={resources!}
        selectedHashes={[...membersState?.getValue()?.values()!, ...owners.values()!].map(id => id.getLastHash())}
        handleSelect={async (contact: Contact | Identity) => {
          console.log('attempting to select', contact)
          const identity = contact instanceof Identity ?
            contact :
            await homeResources?.store.load(contact.hash)! as Identity
          membersState?.value?.add(identity, home?.getAuthor()!)
          membersState?.value?.save()
        }}
      />
    </Paper>
  );
}
