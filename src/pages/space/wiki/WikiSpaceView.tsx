import { useObjectState } from '@hyper-hyper-space/react';
import { IconButton, Paper, TextField, Typography, InputAdornment } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';
import ExploreIcon from '@mui/icons-material/Explore';
import { isEmpty } from 'lodash-es';


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
        let nextPageName = navigationRef.current?.value
        if (isEmpty(nextPageName)) {
            nextPageName = '/'
        }

        if (nextPageName) {
            setCurrentPageName(nextPageName);
        }
    }

    const onNavigationUpdate = (e: React.KeyboardEvent<HTMLInputElement> ) => {
        if (e.key === 'Enter') {
            navigate()
        }
    }

    return <Paper style={{ padding: '60px 1rem', height: '100%' }}>
        <TextField
            defaultValue={currentPageName}
            placeholder='/'
            onKeyPress={onNavigationUpdate}
            inputRef={navigationRef}
            InputProps={{
                endAdornment:
                <InputAdornment position="end">
                  <IconButton
                    onClick={navigate}
                    aria-label="navigate to wiki page"
                    ><ExploreIcon></ExploreIcon></IconButton>
                </InputAdornment>
            }}
        ></TextField>
        {!initialized &&
            <Typography>Loading...</Typography>
        }
        {initialized &&
            <WikiSpacePage page={currentPage!} resources={resources!}></WikiSpacePage>
        }

    </Paper>;
}

export default WikiSpaceView;