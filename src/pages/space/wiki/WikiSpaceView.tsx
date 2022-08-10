import { useObjectState } from '@hyper-hyper-space/react';
import { Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';

function WikiSpaceView(props: { entryPoint: WikiSpace}) {

    const [initialized, setInitialized] = useState(false);
    const [currentPageName, setCurrentPageName] = useState('/');
    const wikiSpace = useObjectState(props.entryPoint);
    
    // surely there's a more efficient way

    useEffect(() => {
        props.entryPoint.startSync().then(() => {
            setInitialized(true);
        });
    }, [props.entryPoint]);
        
    const onEnter = (e: React.KeyboardEvent<HTMLInputElement> ) => {
        if (e.key === 'Enter') {
            setCurrentPageName((e.target as HTMLInputElement).value);
        }
    }

    return <Paper style={{ paddingTop: '40px', height: '100%' }}>
        {!initialized &&
            <Typography>Loading...</Typography>
        }
        <TextField defaultValue={currentPageName} placeholder='/' onKeyPress={onEnter}></TextField>
        {initialized &&
            <WikiSpacePage page={wikiSpace?.value?.navigateTo(currentPageName)!}></WikiSpacePage>
        }

    </Paper>;
}

export default WikiSpaceView;