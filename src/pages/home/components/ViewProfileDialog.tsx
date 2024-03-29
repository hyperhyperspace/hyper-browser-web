import { useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { Dialog, useTheme, useMediaQuery } from '@mui/material';
import { HomeContext } from '../HomeSpace';
import ViewProfile from '../../../components/profile/ViewProfile';
import { Conversation } from '@hyper-hyper-space/home';
import { Identity } from '@hyper-hyper-space/core';

function ViewProfileDialog() {

    const params = useParams();
    const navigate = useNavigate();

    const [open, setOpen] = useState(true);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const close = () => {
        setOpen(false);
        navigate('..');
    };

    const { home, resources, resourcesForDiscovery } = useOutletContext<HomeContext>();

    const identityHash = decodeURIComponent( params.profileHash as string);

    const startChat = (id: Identity) => {
        setOpen(false);
        navigate('../chats/' + encodeURIComponent(id.hash()))
    }

    return (
        <Dialog open={open} scroll='paper' onClose={close} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='sm' PaperProps={{sx: {minHeight: '60%'}}}>
            <ViewProfile identityHash={identityHash} startChat={startChat} close={close} home={home} resources={resources} resourcesForDiscovery={resourcesForDiscovery}/>
        </Dialog>
    );

}

export default ViewProfileDialog;