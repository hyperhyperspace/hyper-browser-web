import { Hash, Identity } from '@hyper-hyper-space/core';
import { Conversation } from '@hyper-hyper-space/home';
import { useObjectDiscoveryIfNecessary, useObjectState } from '@hyper-hyper-space/react';
import { Dialog, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import AllChats, { AllChatsNav } from '../../../components/chat/AllChats';
import { HomeContext } from '../HomeSpace';


function AllChatsDialog(props: {onClose?: () => void}) {

    const [open, setOpen] = useState(true);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const noSummary    = useMediaQuery(theme.breakpoints.down('sm'));

    const { identityHash } = useParams();
    const navigate = useNavigate();

    const { home, chats, owner, resources, resourcesForDiscovery } = useOutletContext<HomeContext>();
    
    const  close = () => {
        setOpen(false);
        if (props.onClose !== undefined) {
            props.onClose();
        }
        navigate('..');
    }

    const allChatsNav: AllChatsNav = {
        editProfile: () => { navigate('/home/' + encodeURIComponent(home?.getLastHash() as string) + '/edit-profile'); },
        viewProfile: (id: Hash) => { navigate('/home/' + encodeURIComponent(home?.getLastHash() as string) + '/view-profile/' + encodeURIComponent(id)); },
        viewConversation: (id: Hash) => { navigate('/home/' + encodeURIComponent(home?.getLastHash() as string) + '/chats/' + encodeURIComponent(id)); },
        viewChatSummary: () => { navigate('/home/' + encodeURIComponent(home?.getLastHash() as string) + '/chats'); },
        viewContacts: () => { navigate('/home/' + encodeURIComponent(home?.getLastHash() as string) + '/contacts'); }
    }

    return <Dialog open={open} onClose={close} style={{height: '100%'}} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='lg' PaperProps={{sx: {minHeight: '70%', height: (fullScreen? '100%' : '85%')}}}>
            
            { chats !== undefined && owner !== undefined &&  resources !== undefined && resourcesForDiscovery !== undefined &&
                <AllChats 
                    chats={chats}
                    localId={owner}
                    remoteIdHash={identityHash} 
                    resources={resources}
                    resourcesForDiscovery={resourcesForDiscovery}
                    onClose={close}
                    noSummary={noSummary}
                    narrowChat={fullScreen}
                    nav={allChatsNav}
                />
            }

            { !(chats !== undefined && owner !== undefined &&  resources !== undefined && resourcesForDiscovery !== undefined) &&
                <Typography>Loading...</Typography>
            }
            
    </Dialog>
    
}

export default AllChatsDialog;