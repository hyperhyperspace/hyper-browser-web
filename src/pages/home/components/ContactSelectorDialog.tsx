import * as React from 'react';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import ContactSelector from './ContactSelector';
import { Contact } from '../../../model/ProfileUtils';
import { Hash, Resources } from '@hyper-hyper-space/core';
import { Stack, Tab, Tabs, useMediaQuery, useTheme } from '@mui/material';
import ContactSelectorSomeoneNew from './ContactSelectorSomeoneNew';
import { Home } from '@hyper-hyper-space/home';

type ContactSelectorDialogProps = {
  handleSelect?: (...x: any[]) => Promise<any>,
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

  const handleSelectionThenClose = (...x: any[]) => {
    handleSelect!(...x).then(() => setOpen(false))
  }

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

  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

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
        fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='sm'PaperProps={{sx: {minHeight: '70%'}}}
      >
        <DialogTitle id="alert-dialog-title">
          {"Add member"}
        </DialogTitle>
        <DialogContent>
          <Tabs value={contactSource} aria-label="add someone" onChange={handleChangeContactSource}>
            <Tab value={ContactsTab} label="From contacts" aria-label="add someone from your contacts" />
            <Tab value={SomeoneNewTab} label="Someone new" aria-label="add someone new" />
          </Tabs>
          {contactSource === ContactsTab &&
            <ContactSelector home={home!} resourcesForDiscovery={resourcesForDiscovery!} handleSelect={handleSelectionThenClose} preFilter={props.preFilter} excludedHashes={props.excludedHashes} selectedHashes={props.selectedHashes} />
          }
          {contactSource === SomeoneNewTab &&
            <ContactSelectorSomeoneNew resourcesForDiscovery={resourcesForDiscovery} handleSelect={handleSelectionThenClose}/>
          }
        </DialogContent>
        <DialogActions>
          <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}>
            <Button onClick={handleClose}>Close</Button>
          </Stack>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default ContactSelectorDialog
