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
import { Tab, Tabs } from '@mui/material';
import { TabPanel } from '@mui/lab';

type ContactSelectorDialogProps = {
    handleSelect?: Function
    preFilter?: (c: Contact) => boolean,
    excludedHashes?: Hash[]
}

const ContactSelectorDialog = (props: ContactSelectorDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const {handleSelect} = props;

  type ContactSource = 'contacts' | 'someone new'
  const [contactSource, setContactSource] = React.useState<ContactSource>('contacts')

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };
  const handleChangeContactSource = (event: React.SyntheticEvent, newValue: ContactSource) => {
    setContactSource(newValue);
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
        <Tabs value={contactSource} aria-label="add a contact..." onChange={handleChangeContactSource}>
          <Tab value="contacts" label="From contacts" />
          <Tab value="someone new" label="Someone new" />
        </Tabs>
        <div hidden={contactSource !== 'contacts'}>
          <ContactSelector handleSelect={handleSelect} preFilter={props.preFilter} excludedHashes={props.excludedHashes} />
        </div>
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
