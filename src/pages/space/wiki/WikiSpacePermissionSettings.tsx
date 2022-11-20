import * as React from 'react';
import { Box, IconButton, List, ListItem, Paper, Typography } from '@mui/material';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { useObjectState } from '@hyper-hyper-space/react';

import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { PermFlag, PermFlagEveryone } from '@hyper-hyper-space/wiki-collab';
import ContactSelectorDialog from '../../home/components/ContactSelectorDialog';
import { CausalSet, Identity } from '@hyper-hyper-space/core';
import PersonRemoveIcon from '@mui/icons-material/PersonRemove';
import { memoize } from 'lodash-es';
import { Contact, ProfileUtils } from '../../../model/ProfileUtils';
import { Profile } from '@hyper-hyper-space/home';
import ContactListDisplay from '../../home/components/ContactListDisplay';
import { profile } from 'console';

function PermFlagToggle(props: { flag: CausalSet<PermFlag>, name: String }) {
  const { wiki, spaceContext } = useOutletContext<WikiContext>();
  const { resources } = spaceContext;
  const flagState = useObjectState(props.flag);
  const author = spaceContext?.home?.getAuthor();

  const handleToggle = async (
    event: React.MouseEvent<HTMLElement>,
    openlyEditable: boolean,
  ) => {
    if (openlyEditable) {
      await flagState?.getValue()?.add(PermFlagEveryone, author);
      await flagState?.getValue()?.save()
      console.log('wiki permissions set', props.name, [...flagState?.getValue()?.values()!])
    } else {
      await flagState?.getValue()?.delete(PermFlagEveryone, author);
      await flagState?.getValue()?.save()
      console.log('wiki permissions set', props.name, [...flagState?.getValue()?.values()!])
    }
  };

  const statusTextEverybody = `Everybody can ${props.name}`
  const statusTextMembers = `Only members can ${props.name}`
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'min-content auto', alignItems: "center", gap: "1em" }}>
      <ToggleButtonGroup
        value={flagState?.getValue()?.has(PermFlagEveryone)}
        exclusive
        onChange={handleToggle}
        aria-label={`Toggle ${props.name} permission`}
        disabled={!wiki.owners?.has(author!)}
      >
        <ToggleButton value={true} aria-label={statusTextEverybody}>
          <PublicIcon />
          {/* Open */}
        </ToggleButton>
        <ToggleButton value={false} aria-label={statusTextMembers}>
          <PeopleIcon />
          {/* Restricted */}
        </ToggleButton>
      </ToggleButtonGroup>
      <Typography>
        {flagState?.getValue()?.has(PermFlagEveryone) ? statusTextEverybody : statusTextMembers}
      </Typography>
    </div>
  );
}

function MemberList() {
  const { spaceContext, wiki } = useOutletContext<WikiContext>();
  const { homeResources } = spaceContext;
  const membersState = useObjectState(wiki.members)
  const [ownersProfiles, setOwnersProfiles] = React.useState<Profile[]>([])
  const [membersProfiles, setMembersProfiles] = React.useState<Profile[]>([])
  const owners = wiki.owners!

  const profileForIdentity =
    React.useRef(
      memoize(
        async (id: Identity) => {
          const profile = await homeResources?.store.load(new Profile(id).getLastHash(), true, true) as Profile;
          // console.log('getting profile for id', id, id.hash(), profile)
          return profile
        }
        , (id: Identity) => id.getLastHash())
    )

  const contactForProfile =
    React.useRef(
      memoize(
        (profile: Profile) => {
          return ProfileUtils.createContact(profile)
        }, (profile: Profile) => profile.getLastHash())
    )

  React.useEffect(() => {
    const members = [...membersState?.getValue()?.values()!]
    Promise.all([...owners.values()!].map(
      profileForIdentity.current
    )).then(profiles => {
      setOwnersProfiles(profiles)
      // console.log(profiles)
    })
    Promise.all(members.map(
      profileForIdentity.current
    )).then(profiles => {
      setMembersProfiles(profiles)
      // console.log(profiles)
    })
  }, [membersState])


  return <>
    <h4>Members:</h4>
    <Box>
      <List>
        {ownersProfiles.map(profile =>
          <ListItem>
            <ContactListDisplay contact={contactForProfile.current(profile!)} />
          </ListItem>)}
        {membersProfiles.map(profile =>
          <ListItem>
            <ContactListDisplay contact={contactForProfile.current(profile!)} />
            <IconButton onClick={() => {
              membersState?.value?.delete(profile.owner!, spaceContext.home?.getAuthor())
              membersState?.value?.save()
            }}><PersonRemoveIcon /></IconButton>
          </ListItem>)}
      </List>
    </Box>
  </>
}

export default function WikiSpacePermissionSettings() {
  const { spaceContext, wiki } = useOutletContext<WikiContext>();
  const { home, homeResources } = spaceContext;
  const membersState = useObjectState(wiki.members)
  const owners = wiki.owners!

  return (
    <Paper style={{ width: '100%' }} sx={{ p: 3 }}>
      <PermFlagToggle flag={wiki.readConfig!} name='read' />
      <PermFlagToggle flag={wiki.writeConfig!} name='write' />
      <MemberList />
      <ContactSelectorDialog
        preFilter={(c) => {
          const includedHashes = [...membersState?.getValue()?.values()!, ...owners.values()!].map(id => id.getLastHash())
          console.log('filtering over', c.hash, includedHashes, 'from', [...membersState?.getValue()?.values()!],[...owners.values()]);
          return !includedHashes.includes(c.hash)
        }}
        handleSelect={async (contact: Contact) => {
          console.log('attempting to select', contact)
          const identity = await homeResources?.store.load(contact.hash)! as Identity
          // console.log('selected', id, identity)
          membersState?.value?.add(identity, home?.getAuthor()!)
          membersState?.value?.save()
        }}
      />
    </Paper>
  );
}
