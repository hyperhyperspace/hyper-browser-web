import { useTheme, useMediaQuery, Stack, Paper, Typography } from '@mui/material';
import { useEffect, Fragment } from 'react';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';
import { Outlet, Route, Routes, useNavigate, useOutletContext } from 'react-router';
import NewPage from './NewPage';
import WikiSpaceNavigation from './WikiSpaceNavigation';
import { SpaceContext } from '../SpaceFrame';
import { WebrtcProvider } from 'y-webrtc'
import { Doc } from 'yjs';
import { memoize } from 'lodash-es';

type WikiNav = {
    goToPage: (pageName: string) => void,
    goToAddPage: () => void,
    goToIndex: () => void
}

type WikiContext = {
    wiki : WikiSpace,
    nav  : WikiNav,
    spaceContext : SpaceContext,
    yjsProvider : WebrtcProvider,
    ydoc: Doc
}

const getYdoc = memoize(id => new Doc())
const getYjsProvider = memoize(id => new WebrtcProvider(id, getYdoc(id)))

function WikiSpaceView(props: { entryPoint: WikiSpace, path?: string }) {


    const spaceContext = useOutletContext<SpaceContext>();
    console.log(spaceContext)

    const wiki = props.entryPoint;

    useEffect(() => {
        wiki.startSync();
        wiki.title?.loadAndWatchForChanges();

        return () => {
            wiki.stopSync();
            wiki.title?.dontWatchForChanges();
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
        navigate('/space/' + encodeURIComponent(wiki.getLastHash()) + '/index');
    }

    const context: WikiContext = {
        wiki: wiki,
        nav: {
            goToPage: goToPage,
            goToAddPage: goToAddPage,
            goToIndex: goToIndex
        },
        spaceContext: spaceContext,
        yjsProvider: getYjsProvider(wiki.getId()),
        ydoc: getYdoc(wiki.getId())
    }

    const theme = useTheme();
    const tablet   = useMediaQuery(theme.breakpoints.down('md'));
    const noNavigation    = useMediaQuery(theme.breakpoints.down('md'));

    const navigationWidth = noNavigation? '100%' : (tablet? '20' : '22%');
    const contentWidth    = noNavigation? '100%' : (tablet? '80%' : '78%');

    return  <Routes>
            <Route path="" element={
                <Fragment>
                    
                <Outlet context={context}/>
                {/*showNewPageDialog && <NewPageDialog wiki={wiki} open={showNewPageDialog} onClose={closeNewPageDialog} goToPage={goToPage}/>*/}
            </Fragment>}>
                
                <Route path="" element={
                            <div style={{ padding: '90px 1rem', height: '100%', display: 'flex', justifyContent: 'center' }}>
                                <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='0.1rem' sx={{maxWidth: 'lg'}}>
                                    <WikiSpaceNavigation width={navigationWidth} redirect/>
                                    <Paper style={{width: contentWidth}}>
                                        <Typography>Fetching wiki contents...</Typography>
                                    </Paper>
                                </Stack>
                            </div>} />
                <Route path="index" element={
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
    
}

export type { WikiContext };

export default WikiSpaceView;