import { useTheme, useMediaQuery, Stack, Paper, Typography, Button } from '@mui/material';
import { useEffect, Fragment } from 'react';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';
import { Outlet, Route, Routes, useNavigate, useOutletContext } from 'react-router';
import NewPage from './NewPage';
import WikiSpaceNavigation from './WikiSpaceNavigation';
import { SpaceContext } from '../SpaceFrame';
import './WikiSpaceView.css'
import WikiSpaceSettingsPage from './WikiSpaceSettingsPage';

type WikiNav = {
    goToPage: (pageName: string) => void,
    goToAddPage: () => void,
    goToIndex: () => void
    goToPermissionSettings: () => void
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

    const goToPermissionSettings = () => {
        navigate('/space/' + encodeURIComponent(wiki.getLastHash()) + '/settings/permissions');
    }

    const context: WikiContext = {
        wiki: wiki,
        nav: {
            goToPage: goToPage,
            goToAddPage: goToAddPage,
            goToIndex: goToIndex,
            goToPermissionSettings,
        },
        spaceContext: spaceContext
    }

    const theme = useTheme();
    const tablet   = useMediaQuery(theme.breakpoints.down('md'));
    const noNavigation    = useMediaQuery(theme.breakpoints.down('md'));

    const navigationWidth = noNavigation? '100%' : (tablet? '20' : '22%');
    const contentWidth    = noNavigation? '100%' : (tablet? '80%' : '78%');

    const BackToIndexButton = () => <>
                        <Stack direction="row" spacing="3px" style={{ alignItems: 'center' }}>
                            <a onClick={context.nav.goToIndex} style={{ cursor: 'pointer', paddingTop: '6px', paddingRight: '3px' }}><img src="icons/streamlinehq-arrow-thick-left-arrows-diagrams-48x48.png" style={{ width: '24px', height: '24px', margin: '1px', padding: '2px' }}></img></a>
                            <Button size="small" style={{ textTransform: 'none', textAlign: 'left' }} variant="text" onClick={context.nav.goToIndex}><Typography> Index</Typography></Button>
                        </Stack>
                    </>

    return  <Routes>
            <Route path="" element={
                <Fragment>
                    <Outlet context={context}/>
                
                </Fragment>}>
                
                <Route path="" element={
                            <div className='wiki-container'>
                                <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='0.1rem' sx={{maxWidth: 'lg'}}>
                                    <WikiSpaceNavigation width={navigationWidth} redirect/>
                                    <Paper style={{width: contentWidth}}>
                                        <Typography>Fetching wiki contents...</Typography>
                                    </Paper>
                                </Stack>
                            </div>} />
                <Route path="index" element={
                            <div className='wiki-container'>
                                <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='0.1rem' sx={{maxWidth: 'lg'}}>
                                    <WikiSpaceNavigation width="100%"/>
                                </Stack>
                            </div>} />
                <Route path="contents/:pageName" element={<WikiSpacePage noNavigation={noNavigation} navigationWidth={navigationWidth} contentWidth={contentWidth}/>} />
                <Route path="settings/*" element={
                            <div className='wiki-container'>
                                <Stack style={{height: '100%', width: '100%'}} spacing='0.1rem' sx={{maxWidth: 'lg'}}>
                                    { noNavigation && <BackToIndexButton/>}
                                    <Stack direction="row" style={{height: '100%', width: '100%'}} spacing='0.1rem' sx={{maxWidth: 'lg'}}>
                                        {!noNavigation && <WikiSpaceNavigation width={navigationWidth} />}
                                        
                                        <WikiSpaceSettingsPage/>
                                    </Stack>
                                </Stack>
                            </div>}/>
                <Route path="add-page" element={
                            <div className='wiki-container'>
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