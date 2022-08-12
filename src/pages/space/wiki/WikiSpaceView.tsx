import { useObjectState } from '@hyper-hyper-space/react';
import { IconButton, Paper, TextField, Typography, InputAdornment } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';
import ExploreIcon from '@mui/icons-material/Explore';
import { useNavigate, useOutletContext, useParams } from 'react-router';


function WikiSpaceView(props: { entryPoint: WikiSpace, path?: string }) {

    const [initialized, setInitialized] = useState(false);
    // const [currentPageName, setCurrentPageName] = useState('/');
    const { path } = useParams();
    const [currentPage, setCurrentPage] = useState<Page>();
    const wikiSpace = useObjectState(props.entryPoint);
    const spaceFrameContext = useOutletContext();
    console.log(spaceFrameContext)

    useEffect(() => {
        props.entryPoint.startSync().then(() => {
            setInitialized(true);
        });
    }, [props.entryPoint]);

    useEffect(() => {
        const nextPath = path || ''
        setInitialized(false)
        wikiSpace?.value?.navigateTo(nextPath).then(setCurrentPage).then(() => setInitialized(true))
        if (navigationRef.current) {
            console.log('setting path to', nextPath)
            navigationRef.current.value = nextPath
        };
    }, [path, wikiSpace])

    const navigationRef = useRef<HTMLInputElement>()

    const navigator = useNavigate()
    const navigate = () => {
        navigator('../' + (navigationRef.current?.value || ''))
    }

    const onNavigationUpdate = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate()
        }
    }

    return <Paper style={{ padding: '60px 1rem', height: '100%' }}>
        <TextField
            defaultValue={path}
            placeholder={path}
            // value={pate}
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
            <WikiSpacePage page={currentPage!}></WikiSpacePage>
        }

    </Paper>;
}

export default WikiSpaceView;