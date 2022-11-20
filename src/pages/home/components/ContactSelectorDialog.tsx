import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogContentText from '@mui/material/DialogContentText';
import DialogTitle from '@mui/material/DialogTitle';
import ContactSelector from './ContactSelector';
import { Contact } from '../../../model/ProfileUtils';
import { Hash } from '@hyper-hyper-space/core';

type ContactSelectorDialogProps = {
    handleSelect?: Function
    preFilter?: (c: Contact) => boolean,
    excludedHashes?: Hash[]
}

const ContactSelectorDialog = (props: ContactSelectorDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const {handleSelect} = props;

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <div>
      <Button variant="outlined" onClick={handleClickOpen}>
        Add member
      </Button>
      <Dialog
        open={open}
        onClose={handleClose}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">
          {"Add members"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
          Add members from your contacts:
          </DialogContentText>
          <ContactSelector handleSelect={handleSelect} preFilter={props.preFilter} excludedHashes={props.excludedHashes} />
        </DialogContent>
        <DialogActions>
          {/* <Button onClick={handleClose}>Disagree</Button>
          <Button onClick={handleClose} autoFocus>
            Agree
          </Button> */}
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ContactSelectorDialog
