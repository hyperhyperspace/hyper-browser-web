import { useObjectState } from '@hyper-hyper-space/react';
import { IconButton, Paper, TextField, Typography } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';
import ExploreIcon from '@mui/icons-material/Explore';

function WikiSpaceView(props: { entryPoint: WikiSpace}) {

    const [initialized, setInitialized] = useState(false);
    const [currentPageName, setCurrentPageName] = useState('/');
    const [currentPage, setCurrentPage] = useState<Page>();
    const wikiSpace = useObjectState(props.entryPoint);

    const resources = props.entryPoint.getResources()!;

    useEffect(() => {
        props.entryPoint.startSync().then(() => {
            setInitialized(true);
        });
    }, [props.entryPoint]);
        
    useEffect(() => {
        wikiSpace?.value?.navigateTo(currentPageName).then(setCurrentPage);
    }, [currentPageName, wikiSpace])

    const navigationRef = useRef<HTMLInputElement>()
    
    const navigate = () => {
        const nextPageName = navigationRef.current?.value
        if (nextPageName) {
            setCurrentPageName(nextPageName);
        }
    }

    const onEnter = (e: React.KeyboardEvent<HTMLInputElement> ) => {
        if (e.key === 'Enter') {
            navigate()
        }
    }

    return <Paper style={{ paddingTop: '40px', height: '100%' }}>
        {!initialized &&
            <Typography>Loading...</Typography>
        }
        <TextField
            defaultValue={currentPageName}
            placeholder='/'
            onKeyPress={onEnter}
            inputRef={navigationRef}
        ></TextField>
        <IconButton onClick={navigate}><ExploreIcon></ExploreIcon></IconButton>
        {initialized &&
            <WikiSpacePage page={currentPage!} resources={resources!}></WikiSpacePage>
        }

    </Paper>;
}

export default WikiSpaceView;