import { useTheme, useMediaQuery, Stack } from '@mui/material';
import { useEffect, Fragment } from 'react';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';
import { Outlet, Route, Routes, useNavigate, useOutletContext } from 'react-router';
import NewPage from './NewPage';
import WikiSpaceNavigation from './WikiSpaceNavigation';
import { SpaceContext } from '../SpaceFrame';

type WikiNav = {
    goToPage: (pageName: string) => void,
    goToAddPage: () => void,
    goToIndex: () => void
}

type WikiContext = {
    wiki : WikiSpace,
    nav  : WikiNav,
    spaceContext : SpaceContext
}

function WikiSpaceView(props: { entryPoint: WikiSpace, path?: string }) {


    const spaceContext = useOutletContext<SpaceContext>();

    const wiki = props.entryPoint;

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

    const goToIndex = () => {
        navigate('/space/' + encodeURIComponent(wiki.getLastHash()));
    }

    const context: WikiContext = {
        wiki: wiki,
        nav: {
            goToPage: goToPage,
            goToAddPage: goToAddPage,
            goToIndex: goToIndex
        },
        spaceContext: spaceContext
    }

    const theme = useTheme();
    const tablet   = useMediaQuery(theme.breakpoints.down('md'));
    const noNavigation    = useMediaQuery(theme.breakpoints.down('sm'));

    const navigationWidth = noNavigation? '100%' : (tablet? '30%' : '22%');
    const contentWidth    = noNavigation? '100%' : (tablet? '70%' : '78%');

    return  <Routes>
            <Route path="" element={
                <Fragment>
                    
                <Outlet context={context}/>
                {/*showNewPageDialog && <NewPageDialog wiki={wiki} open={showNewPageDialog} onClose={closeNewPageDialog} goToPage={goToPage}/>*/}
            </Fragment>}>
                
                <Route path="" element={
                            <div style={{ padding: '90px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='0.1rem' sx={{maxWidth: 'lg'}}>
                                    <WikiSpaceNavigation width="100%"/>
                                </Stack>
                            </div>} />
                <Route path="contents/:pageName" element={<WikiSpacePage noNavigation={noNavigation} navigationWidth={navigationWidth} contentWidth={contentWidth}/>} />
                <Route path="add-page" element={
                            <div style={{ padding: '90px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='0.1rem' sx={{maxWidth: 'lg'}}>
                                    {!noNavigation && <WikiSpaceNavigation width={navigationWidth} />}
                                    
                                    <NewPage noNavigation={noNavigation} contentWidth={contentWidth}/>
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