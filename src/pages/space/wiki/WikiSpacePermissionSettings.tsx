import * as React from 'react';
import DialogTitle from '@mui/material/DialogTitle';
import Dialog from '@mui/material/Dialog';
import { Icon, IconButton } from '@mui/material';
import { useOutletContext } from 'react-router';
import { WikiContext } from './WikiSpaceView';
import { useObjectState } from '@hyper-hyper-space/react';

import PublicIcon from '@mui/icons-material/Public';
import PeopleIcon from '@mui/icons-material/People';
import ToggleButton from '@mui/material/ToggleButton';
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';

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
    <ToggleButtonGroup
      value={editFlagsState?.getValue()?.has(WikiSpace.OpenlyEditableFlag)}
      exclusive
      onChange={handleToggle}
      aria-label="wiki permissions"
      disabled={!wiki.owners?.has(author!)}
      // label={editFlagsState?.getValue()?.has(WikiSpace.OpenlyEditableFlag) ? 'Openly editable' : 'Restricted editing'}
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
  );
}


export interface PermissionsDialogProps {
  open: boolean;
  selectedValue: string;
  onClose: (value: string) => void;
}

function PermissionsDialog(props: PermissionsDialogProps) {
  const { onClose, selectedValue, open } = props;

  const {wiki, spaceContext} = useOutletContext<WikiContext>();
  const editFlagsState = useObjectState(wiki.editFlags);
  // const author = spaceContext?.home?.getAuthor();

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = (value: string) => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} open={open}>
      <DialogTitle>{editFlagsState?.getValue()?.has(WikiSpace.OpenlyEditableFlag) ? 'Openly editable' : 'Restricted editing'}</DialogTitle>
      <EditFlagsToggle/>
      {/* <List sx={{ pt: 0 }}>
        <ListItem autoFocus button onClick={() => handleListItemClick('addAccount')}>
          <ListItemAvatar>
            <Avatar>
              <AddIcon />
            </Avatar>
          </ListItemAvatar>
          <ListItemText primary="Add account" />
        </ListItem>
      </List> */}
    </Dialog>
  );
}
export default function WikiSpacePermissionSettings() {
  const [open, setOpen] = React.useState(false);
  const [selectedValue, setSelectedValue] = React.useState('');

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = (value: string) => {
    setOpen(false);
    setSelectedValue(value);
  };

  return (
    <div>
      <IconButton onClick={handleClickOpen}>
        <Icon><PeopleIcon/></Icon>
      </IconButton>
      <PermissionsDialog
        selectedValue={selectedValue}
        open={open}
        onClose={handleClose}
      />
    </div>
  );
}
