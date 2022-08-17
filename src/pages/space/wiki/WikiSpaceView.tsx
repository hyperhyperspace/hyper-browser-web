import { useObjectState } from '@hyper-hyper-space/react';
import { IconButton, Paper, TextField, Typography, InputAdornment, MenuItem, useTheme, useMediaQuery, Stack } from '@mui/material';
import { useEffect, useState, useRef } from 'react';
import { Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';
import ExploreIcon from '@mui/icons-material/Explore';
import { useNavigate, useOutletContext, useParams } from 'react-router';
import { MutableObject } from '@hyper-hyper-space/core';
import { Box } from '@mui/system';


function WikiSpaceView(props: { entryPoint: WikiSpace, path?: string }) {

    //const [initialized, setInitialized] = useState(false);
    const { path } = useParams();
    const [pageName, setPageName]                     = useState<string>();
    const [currentPage, setCurrentPage]               = useState<Page>();
    const [currentPageIsSaved, setCurrentPageIsSaved] = useState<boolean>();
    const spaceFrameContext = useOutletContext();

    const [targetPageName, setTargetPageName]         = useState<string>('');

   // console.log(spaceFrameContext);

    const wiki = props.entryPoint;
    const wikiState = useObjectState(wiki);

    useEffect(() => {
        wiki.startSync();

        return () => {
            wiki.stopSync();
        };
    }, [wiki]);

    useEffect(() => {
        setPageName(path || '');
        setTargetPageName(path || '');
        console.log('NAVIGATED TO "' + (path || '') + '"')
    }, [path]);

    useEffect(() => {

        if (pageName !== undefined && wikiState?.getValue() !== undefined) {
            const updateCurrentPage = async () => {

                console.log('PAGE IS "' + pageName + '"')

                if (currentPage?.name === pageName) {
                    if (!currentPageIsSaved && wikiState?.getValue()?.hasPage(pageName)) {
                        await currentPage?.save();
                        const page = wikiState?.getValue()?.getPage(pageName);
                        if (page !== undefined) {
                            setCurrentPage(page);
                            setCurrentPageIsSaved(true);
                            console.log('FOUND PAGE "' + page + '", USING SAVED VERSION INSTEAD')
                        }
                    }
                } else {
                    const existingPage = wikiState?.getValue()?.getPage(pageName);

                    if (existingPage !== undefined) {
                        setCurrentPage(existingPage);
                        setCurrentPageIsSaved(true);
                        console.log('NAVIGATING TO EXISTING PAGE "' + pageName + '"')
                    } else {
                        setCurrentPage(wikiState?.getValue()?.createPage(pageName));
                        setCurrentPageIsSaved(false);
                        console.log('NAVIGATING TO NEW PAGE "' + pageName + '"')
                    }
                }
            }

            updateCurrentPage();
        }
    }, [pageName, wikiState])

    //const navigationRef = useRef<HTMLInputElement>()

    const navigator = useNavigate()
    const navigate = () => {
        navigator('../' + targetPageName)
    }

    const onNavigationUpdate = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            navigate()
        }
    }

    const onTargetPageNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setTargetPageName(newValue);
    }
    
    const theme = useTheme();
    const fullScreen   = useMediaQuery(theme.breakpoints.down('md'));
    const noSummary    = useMediaQuery(theme.breakpoints.down('sm'));

    const summaryWidth = noSummary? '100%' : (fullScreen? '25%' : '20%');
    const chatWidth    = noSummary? '100%' : (fullScreen? '75%' : '80%');

    return <div style={{ padding: '60px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                <Stack direction="row" style={{height: '100%'}} spacing='1rem' sx={{maxWidth: 'md'}}>
        {(!noSummary || path === undefined) &&
                    <Box style={{width: summaryWidth, height: '100%'}}>
                        <Typography variant="h4">{wiki.title?.getValue() || 'No title yet'}</Typography>
                    </Box>
        }
        {(!noSummary || path !== undefined) && 
            <Box style={{width: chatWidth, height: '100%'}}>
                <TextField
            value={targetPageName}
            // value={pate}
            onKeyPress={onNavigationUpdate}
            //inputRef={navigationRef}
            onChange={onTargetPageNameChange}
            InputProps={{
                style:{fontSize: 25, fontWeight: 'bold'},
                endAdornment:
                    <InputAdornment position="end">
                        <IconButton
                            onClick={navigate}
                            aria-label="navigate to wiki page"
                        ><ExploreIcon></ExploreIcon></IconButton>
                    </InputAdornment>
            }}
        ></TextField>
        {currentPage === undefined &&
            <Typography>Loading...</Typography>
        }
        {currentPage !== undefined &&
            <WikiSpacePage page={currentPage}></WikiSpacePage>
        }
            </Box>
        }

    </Stack></div>
    
    
    {/* <Paper style={{ padding: '60px 1rem', height: '100%' }}>
        <TextField
            value={targetPageName}
            // value={pate}
            onKeyPress={onNavigationUpdate}
            //inputRef={navigationRef}
            onChange={onTargetPageNameChange}
            InputProps={{
                style:{fontSize: 25, fontWeight: 'bold'},
                endAdornment:
                    <InputAdornment position="end">
                        <IconButton
                            onClick={navigate}
                            aria-label="navigate to wiki page"
                        ><ExploreIcon></ExploreIcon></IconButton>
                    </InputAdornment>
            }}
        ></TextField>
        {currentPage === undefined &&
            <Typography>Loading...</Typography>
        }
        {currentPage !== undefined &&
            <WikiSpacePage page={currentPage}></WikiSpacePage>
        }

    </Paper>*/};
}

export default WikiSpaceView;