

import { useState, useEffect } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { Dialog, useTheme, useMediaQuery } from '@mui/material';
import ViewProfile from '../../components/profile/ViewProfile';
import { Resources } from '@hyper-hyper-space/core';
import { HyperBrowserConfig } from '../../model/HyperBrowserConfig';
import { SpaceContext } from './SpaceFrame';

function ViewAuthorDialog() {

    const params = useParams();
    const navigate = useNavigate();

    const [open, setOpen] = useState(true);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const close = () => {
        setOpen(false);
        navigate('..');
    };

    const { entryPoint, home, homeResources } = useOutletContext<SpaceContext>();

    const identityHash = entryPoint?.getAuthor()?.getLastHash();

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
                { identityHash !== undefined &&
                    <ViewProfile identityHash={identityHash} close={close} home={home} resources={homeResources} resourcesForDiscovery={resourcesForDiscovery} anonMode={home === undefined}/>
                }
            </Dialog>
        
    );

}

export default ViewAuthorDialog;