import * as React from 'react';
import { Box, Chip, Divider, FormControl, IconButton, InputLabel, List, ListItem, ListItemButton, MenuItem, Paper, Select, SelectChangeEvent, Typography } from '@mui/material';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { useObjectState } from '@hyper-hyper-space/react';

import { PermFlag, PermFlagEveryone, PermFlagMembers, PermFlagModerators, PermFlagOwners } from '@hyper-hyper-space/wiki-collab';
import ContactSelectorDialog from '../../home/components/ContactSelectorDialog';
import { CausalSet, Identity } from '@hyper-hyper-space/core';
import { Contact, ProfileUtils } from '../../../model/ProfileUtils';
import ContactListDisplay from '../../home/components/ContactListDisplay';
import { AdminPanelSettings, SupervisedUserCircle, LockPerson, Public } from '@mui/icons-material';
import Menu from '@mui/material/Menu';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { size, sortBy } from 'lodash-es';


const ITEM_HEIGHT = 48;
const ADD_TO_MODERATORS = 'Add to moderators';
const REMOVE_FROM_MODERATORS = 'Remove from moderators';
const REMOVE_FROM_MEMBERS = 'Remove from members';

export function MemberActionMenu(props: {memberId: Identity}) {
  const {memberId} = props
  const { spaceContext, wiki } = useOutletContext<WikiContext>();
  const author = spaceContext?.home?.getAuthor();
  const membersState = useObjectState(wiki?.permissionLogic?.members)
  const moderatorsState = useObjectState(wiki?.permissionLogic?.moderators)
  const owners = wiki.owners!

  const generateMemberActions = async () => {
    const actions: { [key: string]: Function } = {};

    const canAddToModerators =
      (await moderatorsState?.getValue()?.canAdd(memberId, author)) &&
      !moderatorsState?.value?.has(memberId);

    if (canAddToModerators) {
      actions[ADD_TO_MODERATORS] = () => {
        moderatorsState?.getValue()?.add(memberId, author);
        moderatorsState?.getValue()?.save();
      };
    }

    const canRemoveFromModerators =
      (await moderatorsState?.getValue()?.canDelete(memberId, author)) &&
      moderatorsState?.value?.has(memberId);

    if (canRemoveFromModerators) {
      actions[REMOVE_FROM_MODERATORS] = () => {
        moderatorsState?.getValue()?.delete(memberId, author);
        moderatorsState?.getValue()?.save();
      };
    }

    const canRemoveFromMembers = await membersState?.value?.canDelete(memberId, author);

    if (canRemoveFromMembers) {
      actions[REMOVE_FROM_MEMBERS] = () => {
        membersState?.getValue()?.delete(memberId, author);
        membersState?.getValue()?.save();
        moderatorsState?.getValue()?.delete(memberId, author);
        moderatorsState?.getValue()?.save();
      };
    }

    return actions;
  };

  const [actions, setActions] = React.useState<{[key: string]: Function | null}>({})
  React.useEffect(() => {
    generateMemberActions().then(memberActions => setActions(memberActions))
  }, [moderatorsState])

  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {size(actions) > 0 && <IconButton
        aria-label="more"
        id="member-action-button"
        aria-controls={open ? 'member-actions' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>}
      <Menu
        id="member-actions"
        MenuListProps={{
          'aria-labelledby': 'member-action-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
          },
        }}
      >
        {Object.entries(actions).map(([action, handler]) => (
          <MenuItem key={action} onClick={() => {
            handler && handler()
            handleClose()
          }}>
            {action}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}

function PermFlagToggle(props: { flag: CausalSet<PermFlag>, name: String }) {
  const { spaceContext } = useOutletContext<WikiContext>();
  const flagState = useObjectState(props.flag);
  const author = spaceContext?.home?.getAuthor();

  const handleChange = async (
    event: SelectChangeEvent,
  ) => {
    const flag = event.target.value;
    // could be nice if there was a better way to do this!
    if (flag === PermFlagEveryone) {
      await flagState?.getValue()?.add(PermFlagEveryone, author);
      await flagState?.getValue()?.delete(PermFlagMembers, author);
      await flagState?.getValue()?.delete(PermFlagModerators, author);
      await flagState?.getValue()?.save()
      // console.log('wiki permissions set', props.name, [...flagState?.getValue()?.values()!])
    } else if (flag === PermFlagMembers) {
      await flagState?.getValue()?.delete(PermFlagEveryone, author);
      await flagState?.getValue()?.add(PermFlagMembers, author);
      await flagState?.getValue()?.delete(PermFlagModerators, author);
      await flagState?.getValue()?.save()
      // console.log('wiki permissions set', props.name, [...flagState?.getValue()?.values()!])
    } else if (flag === PermFlagModerators) {
      await flagState?.getValue()?.delete(PermFlagEveryone, author);
      await flagState?.getValue()?.delete(PermFlagMembers, author);
      await flagState?.getValue()?.add(PermFlagModerators, author);
      await flagState?.getValue()?.save()
      // console.log('wiki permissions set', props.name, [...flagState?.getValue()?.values()!])
    } else if (flag === PermFlagOwners) {
      await flagState?.getValue()?.delete(PermFlagEveryone, author);
      await flagState?.getValue()?.delete(PermFlagMembers, author);
      await flagState?.getValue()?.delete(PermFlagModerators, author);
      await flagState?.getValue()?.save()
      // console.log('wiki permissions set', props.name, [...flagState?.getValue()?.values()!])
    }
  };
  const flag =
    flagState?.getValue()?.has(PermFlagEveryone) ? PermFlagEveryone :
    flagState?.getValue()?.has(PermFlagMembers) ? PermFlagMembers :
    flagState?.getValue()?.has(PermFlagModerators) ? PermFlagModerators :
    PermFlagOwners

  const statusText = `Who can ${props.name}:`
  return (
    <>
      <Typography>
        { statusText }
      </Typography>
      <FormControl fullWidth>
        <Select
          value={flag}
          onChange={handleChange}
        >
          <MenuItem value={PermFlagEveryone}>Everybody</MenuItem>
          <MenuItem value={PermFlagMembers}>Members</MenuItem>
          <MenuItem value={PermFlagModerators}>Moderators</MenuItem>
          <MenuItem value={PermFlagOwners}>Owners</MenuItem>
        </Select>
      </FormControl>
      { flag === PermFlagEveryone ? <Public/> :
        flag === PermFlagMembers ? <SupervisedUserCircle/> : 
        flag === PermFlagModerators ? <AdminPanelSettings/> : 
        flag === PermFlagOwners ? <LockPerson/> : 
        <LockPerson/> 
      }
    </>
  );
}

function MemberList() {
  const { wiki } = useOutletContext<WikiContext>();
  const membersState = useObjectState(wiki?.permissionLogic?.members)
  const moderatorsState = useObjectState(wiki?.permissionLogic?.moderators)
  const owners = wiki.owners!

  return <Box>
    <Typography variant="overline">Members</Typography>
    <Divider/>
    <Box>
      <List>
        {[...owners.values()!].map(id =>
          <ListItem key={id.getLastHash()!}>
            <ContactListDisplay contact={ProfileUtils.createContact(id)!} chips={[
              <Chip size="small" label="Owner" color="primary" icon={<LockPerson/>}/>
            ]}/>
          </ListItem>)}
        {sortBy([...membersState?.value?.values()!], [
          // id => moderatorsState?.value?.has(id) ? -1 : 1,
          id => ProfileUtils.createContact(id).name,
        ]).map(id => {
          return <ListItemButton disableRipple={true} key={id.getLastHash()!}>
            <ContactListDisplay contact={ProfileUtils.createContact(id)!} chips={
              moderatorsState?.value?.has(id) ? [
              <Chip size="small" label="Moderator" color="secondary" icon={<AdminPanelSettings/>}/>
            ] : []}/>
            <MemberActionMenu memberId={id}/>
          </ListItemButton>
        }
          )}
      </List>
    </Box>
  </Box>
}

export default function WikiSpacePermissionSettings() {
  const { spaceContext, wiki } = useOutletContext<WikiContext>();
  const { home, homeResources, resources } = spaceContext;
  const membersState = useObjectState(wiki?.permissionLogic?.members)
  const owners = wiki.owners!

  return (
    <Box sx={{ p: 3 }}>
    {/* <Typography variant="overline">Permissions</Typography>
    <Divider/> */}
      <Box sx={{ m: 1 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'max-content max-content auto', alignItems: "center", gap: "1em" }}>
          <PermFlagToggle flag={wiki.permissionLogic?.readConfig!} name='read' />
          <PermFlagToggle flag={wiki.permissionLogic?.writeConfig!} name='write' />
        </div>
      </Box>
      <MemberList />
      <ContactSelectorDialog
        home={home!}
        resourcesForDiscovery={resources!}
        selectedHashes={[...membersState?.getValue()?.values()!, ...owners.values()!].map(id => id.getLastHash())}
        handleSelect={async (contact: Contact | Identity) => {
          // console.log('attempting to select', contact)
          const identity = contact instanceof Identity ?
            contact :
            await homeResources?.store.load(contact.hash)! as Identity
          membersState?.value?.add(identity, home?.getAuthor()!)
          membersState?.value?.save()
        }}
      />
    </Box>
  );
}
