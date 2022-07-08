
import React, { useState } from 'react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

function InfoDialog(props: {onClose?: () => void, title: string, content: string | JSX.Element, open: boolean }) {

    const [open, setOpen] = useState(true);

    const onClose = () => {
        setOpen(false);
        if (props.onClose !== undefined) {
            props.onClose();
        }
    }

    return (<Dialog
        open={open}
        onClose={onClose}
      >
    
        <DialogTitle>
            <Stack direction="row" spacing={2}><InfoIcon color="info" /> <Typography>{props.title}</Typography></Stack>
        </DialogTitle>
    
    
        <DialogContent>
            { typeof props.content === 'string' && 
                <Typography>{props.content}</Typography>
            }
            { typeof props.content !== 'string' &&
                props.content
            }
            
        </DialogContent>
        <DialogActions>
            <Button onClick={onClose}  style={{margin: 'auto'}} autoFocus>
                Close
            </Button>
        </DialogActions>
    </Dialog>);
}

export default InfoDialog;
