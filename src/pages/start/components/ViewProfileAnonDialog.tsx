import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { Dialog, useTheme, useMediaQuery } from '@mui/material';
import ViewProfile from '../../../components/profile/ViewProfile';
import { Resources } from '@hyper-hyper-space/core';
import { HyperBrowserConfig } from '../../../model/HyperBrowserConfig';

function ViewProfileAnonDialog() {

    const params = useParams();
    const navigate = useNavigate();

    const [open, setOpen] = useState(true);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const close = () => {
        setOpen(false);
        navigate('..');
    };

    const identityHash = decodeURIComponent( params.profileHash as string);

    const [resourcesForDiscovery, setResourcesForDiscovery] = useState<Resources|undefined>(undefined);

    useEffect(() => {
        HyperBrowserConfig.initStarterResources().then((r: Resources) => {
            setResourcesForDiscovery(r);
        },
        (reason: any) => {
            alert('Error initializing discovery resources: ' + reason);
        })
    }, []);

    return (
        <Dialog open={open} scroll='paper' onClose={close} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='sm' PaperProps={{sx: {minHeight: '60%'}}}>
            <ViewProfile identityHash={identityHash} close={close} home={undefined} resources={undefined} resourcesForDiscovery={resourcesForDiscovery} anonMode={true}/>
        </Dialog>
    );

}

export default ViewProfileAnonDialog;