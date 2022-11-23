import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ContactSelector from './ContactSelector';
import { Contact } from '../../../model/ProfileUtils';
import { Hash, Resources } from '@hyper-hyper-space/core';
import { Tab, Tabs } from '@mui/material';
import ContactSelectorSomeoneNew from './ContactSelectorSomeoneNew';
import { Home } from '@hyper-hyper-space/home';

type ContactSelectorDialogProps = {
  handleSelect?: Function
  preFilter?: (c: Contact) => boolean,
  excludedHashes?: Hash[],
  selectedHashes?: Hash[],
  home: Home,
  resourcesForDiscovery: Resources
}

const ContactsTab = 'contacts';
const SomeoneNewTab = 'someone new';

const ContactSelectorDialog = (props: ContactSelectorDialogProps) => {
  const [open, setOpen] = React.useState(false);
  const { handleSelect, resourcesForDiscovery, home } = props;

  type ContactSource = 'contacts' | 'someone new'
  const [contactSource, setContactSource] = React.useState<ContactSource>(ContactsTab)

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
            <Tab value={ContactsTab} label="From contacts" />
            <Tab value={SomeoneNewTab} label="Someone new" />
          </Tabs>
          {contactSource === ContactsTab &&
            <ContactSelector home={home!} resourcesForDiscovery={resourcesForDiscovery!} handleSelect={handleSelect} preFilter={props.preFilter} excludedHashes={props.excludedHashes} selectedHashes={props.selectedHashes} />
          }
          {contactSource === SomeoneNewTab &&
            <ContactSelectorSomeoneNew resourcesForDiscovery={resourcesForDiscovery} />
          }
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
