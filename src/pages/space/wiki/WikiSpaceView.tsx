import { useObjectState } from '@hyper-hyper-space/react';
import { IconButton, Paper, TextField, Typography, InputAdornment, MenuItem, useTheme, useMediaQuery, Stack, List, ListItem, Button } from '@mui/material';
import { useEffect, useState, useRef, Fragment } from 'react';
import { Page, WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';
import ExploreIcon from '@mui/icons-material/Explore';
import { Outlet, Route, Routes, useNavigate, useOutletContext, useParams } from 'react-router';
import { MutableObject } from '@hyper-hyper-space/core';
import { Box } from '@mui/system';
import NewPage from './NewPage';
import WikiSpaceNavigation from './WikiSpaceNavigation';
import { SpaceContext } from '../SpaceFrame';

type WikiNav = {
    goToPage: (pageName: string) => void,
    goToAddPage: () => void
}

type WikiContext = {
    wiki : WikiSpace,
    nav  : WikiNav,
    spaceContext : SpaceContext
}

function WikiSpaceView(props: { entryPoint: WikiSpace, path?: string }) {


    const spaceContext = useOutletContext<SpaceContext>();

    const wiki = props.entryPoint;
    const wikiState = useObjectState(wiki);

    useEffect(() => {
        wiki.startSync();

        return () => {
            wiki.stopSync();
        };
    }, [wiki]);

    const navigate = useNavigate();

    const goToPage = (pageName: string) => {
        navigate('/space/' + encodeURIComponent(wiki.getLastHash()) + '/contents/' + encodeURIComponent(pageName));
    }

    const goToAddPage = () => {
        navigate('/space/' + encodeURIComponent(wiki.getLastHash()) + '/add-page')
    }

    const context: WikiContext = {
        wiki: wiki,
        nav: {
            goToPage: goToPage,
            goToAddPage: goToAddPage
        },
        spaceContext: spaceContext
    }

    return  <Routes>
            <Route path="" element={
                <Fragment>
                    
                <Outlet context={context}/>
                {/*showNewPageDialog && <NewPageDialog wiki={wiki} open={showNewPageDialog} onClose={closeNewPageDialog} goToPage={goToPage}/>*/}
            </Fragment>}>
                
                <Route path="" element={
                            <div style={{ padding: '60px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='1rem' sx={{maxWidth: 'md'}}>
                                    <WikiSpaceNavigation width="100%"/>
                                </Stack>
                            </div>} />
                <Route path="contents/:pageName" element={<WikiSpacePage />} />
                <Route path="add-page" element={
                            <div style={{ padding: '60px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='1rem' sx={{maxWidth: 'md'}}>
                                    <WikiSpaceNavigation width="40%" />  
                                    <NewPage />
                                </Stack>
                            </div>} />
            </Route>
    </Routes>
    
    
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

export type { WikiContext };

export default WikiSpaceView;