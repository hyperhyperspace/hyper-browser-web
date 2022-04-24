import { Mesh, Resources, Store, WordCode, WorkerSafeIdbBackend } from '@hyper-hyper-space/core';
import { PeerComponent } from '@hyper-hyper-space/react';
import { AppBar, Button, Container, Link, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Fragment, useRef, useState, useEffect } from 'react';
import { useNavigate, Outlet } from 'react-router';


function StartPage() {

    const navigate = useNavigate();
    const [starterResources, setStarterResources] = useState<Resources|undefined>(undefined);

    useEffect(() => {
                initStarterResources().then((r: Resources) => {
                    setStarterResources(r);
                });
    }, []);

    const word1Input = useRef<HTMLInputElement>(null);
    const word2Input = useRef<HTMLInputElement>(null);
    const word3Input = useRef<HTMLInputElement>(null);

    const [currentWord1, setCurrentWord1] = useState('');
    const [currentWord2, setCurrentWord2] = useState('');
    const [currentWord3, setCurrentWord3] = useState('');

    const [word1Error, setWord1Error] = useState(false);
    const [word2Error, setWord2Error] = useState(false);
    const [word3Error, setWord3Error] = useState(false);

    /*useEffect(() => {

        if (!showLookupDialog) {
            word1Input.current?.focus();
        }

        if (showLookupDialog) {
            setShowLookupDialog(false);
            navigate('/start/lookup/' + currentWord1 + '-' + currentWord2 + '-' + currentWord3)
        }

    }, [showLookupDialog, currentWord1, currentWord2, currentWord3]);*/

    const showLookupDialog = () => {

        const words = currentWord1 + '-' + currentWord2 + '-' + currentWord3;
        setCurrentWord1('');
        setCurrentWord2('');
        setCurrentWord3('');
        word1Input.current?.focus();
        navigate('/start/lookup/' + words);
    };

    const showCreateHomeDialog = () => {
        word1Input.current?.focus();
        navigate('/start/create-home');
    };

    const showLinkDeviceDialog = () => {
        word1Input.current?.focus();
        navigate('/start/link-device');
    }

    const handleWord1Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWord1(event.target.value);
    };

    const checkWord1Change = () => {

        if (currentWord1 !== '') {
            setWord1Error(!WordCode.english.check(currentWord1));
        }
    }

    const handleWord1KeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word2Input.current?.focus();
        }
    }

    const handleWord2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWord2(event.target.value);
    };

    const checkWord2Change = () => {
        if (currentWord2 !== '') {
            setWord2Error(!WordCode.english.check(currentWord2));
        }
    }

    const handleWord2KeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word3Input.current?.focus();
        }
    }

    const handleWord3Change = (event: React.ChangeEvent<HTMLInputElement>) => {
        setCurrentWord3(event.target.value);
    };

    const checkWord3Change = () => {
        if (currentWord3 !== '') {
            setWord3Error(!WordCode.english.check(currentWord3));
        }
    }

    const handleWord3KeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleLookup();
        }
    }

    const handleLookup = () => {

        const e1 = !WordCode.english.check(currentWord1);
        const e2 = !WordCode.english.check(currentWord2);
        const e3 = !WordCode.english.check(currentWord3);

        setWord1Error(e1);
        setWord2Error(e2);
        setWord3Error(e3);

        if (!(e1 || e2 || e3)) {
            showLookupDialog();
        }
    };

    return (
    
        
    <Fragment>
        { starterResources === undefined && 
            <p>Initializing starter page...</p>
        }
        { starterResources !== undefined && 
        <Fragment>
        <PeerComponent resources={starterResources}>
        <AppBar position="relative" color="default">
            <Toolbar sx={{display: 'flex', flexDirection: 'row-reverse'}}>
                { /*<CameraIcon sx={{ mr: 2 }} /> */}
                <Button variant="contained" color="inherit" sx={{m:1}} style={{whiteSpace: 'nowrap'}} onClick={showLinkDeviceDialog}>Link Existing</Button>
                <Button variant="contained" sx={{m:1}} style={{whiteSpace: 'nowrap'}} onClick={showCreateHomeDialog}>Create New</Button>
                <Typography variant="h6" color="inherit" noWrap>
                    Home Space:
                </Typography>
            </Toolbar>
        </AppBar>
        <main>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    pt: {xs: 6, sm: 8},
                    pb: 6,
                }}
            >
                <Container maxWidth="md">
                        <Container sx={{width:{xs: '90%', sm:'80%', md: '70%', lg:'65%'}}}>
                            <h3><img src="logo.png" style={{width: '100%'}}/></h3>
                        </Container>
                    <Typography variant="body1" align="center" color="text.secondary" paragraph sx={{display: {xs:'none', sm: 'block', md: 'block'}}}>
                        Spaces can hold blogs, chats, wikis, etc. They are are stored on your own computer, like files, 
                        and are synchronized over the network.
                    </Typography>
            
                </Container>
                <Container maxWidth="lg">
                    <Stack
                        sx={{ pt: {xs: 3, sm: 5} }}
                        direction={{xs:'column',  sm:'row'}}
                        spacing={2}
                        justifyContent="center"
                        
                    >
                        <Box sx={{p:0, display: {xs: 'block', sm: 'none', md: 'none'}}}>
                            <Typography style={{marginBottom: 0}} paragraph gutterBottom>Lookup space using 3-word code:</Typography>
                        </Box>
                        <TextField autoFocus inputRef={word1Input} value={currentWord1} onBlur={checkWord1Change} onChange={handleWord1Change} onKeyPress={handleWord1KeyPress} variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}} error={word1Error} helperText={word1Error? 'Please check this word' : undefined}></TextField>
                        <TextField inputRef={word2Input} value={currentWord2} onBlur={checkWord2Change} onChange={handleWord2Change} onKeyPress={handleWord2KeyPress} variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}} error={word2Error} helperText={word2Error? 'Please check this word' : undefined}></TextField>
                        <TextField inputRef={word3Input} value={currentWord3} onBlur={checkWord3Change} onChange={handleWord3Change} onKeyPress={handleWord3KeyPress} variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}} error={word3Error} helperText={word3Error? 'Please check this word' : undefined}></TextField>
                        <Button onClick={handleLookup} variant="contained">Lookup Space</Button>
                    </Stack>
                    <Box sx={{pt: 2, display: {xs: 'none', sm: 'none', md: 'block'}}}>
                        <Typography variant="body1" align="center" paragraph gutterBottom>Spaces are looked up using 3-word codes, that you can enter above.</Typography>
                    </Box>
                </Container>

                <Container maxWidth="lg" sx={{pt: {xs: 6, sm: 8}}} >
                    <span>
                    <Typography align="center" style={{lineHeight: 2}}>Lost? Start here:
                        {[{icon:'📗', iconTitle: 'feed', iconColor: 'lightblue', text:'About Hyper Hyper Space', title: 'tandem sticker bag'},
                        {icon:'💬', iconTitle: 'feed', iconColor: 'green', text:'Welcome chat and Q&A', title: 'ambar lemon tack'},
                        {icon:'🗒', iconTitle: 'feed', iconColor: 'yellow', text:'New spaces', title: 'puma kicker backlog'}].map((e) => 
                            <span key={e.title}> <a href="#" title={e.title}><span style={{backgroundColor:e.iconColor, padding:2, borderRadius: 3}} title={e.iconTitle}>{e.icon}</span>&nbsp;{e.text}</a> </span>
                        )} 
                    </Typography>
                    </span>
                    <Container style={{paddingLeft:0, paddingRight: 0, textAlign: 'center'}} sx={{marginLeft: {xs: 1, sm: 'center'}, pt: {xs:'1rem', sm: '1.5rem', md: '1.5rem'}}}><Button onClick={showCreateHomeDialog} component={Link} variant="contained" size="medium" color="success">Create your own</Button></Container>
                </Container>
            </Box>
        </main>
            

        <Outlet />        
            
        </PeerComponent>
        </Fragment>
        }
    
        
    </Fragment>
    );

}

const initStarterResources = async () => {
    const backend = new WorkerSafeIdbBackend('start-page');
    let dbBackendError: (string|undefined) = undefined;


    try {
        console.log('Initializing storage backend for starter page...');
        await backend.ready();
        console.log('Storage backend for starter page ready');
    } catch (e: any) {
        dbBackendError = e.toString();
        console.log('Error initializing storage backend for starter page');
        throw new Error(dbBackendError);
    }
  

    const store = new Store(backend);
    const mesh = new Mesh();

    const resources = await Resources.create({mesh: mesh, store: store});

    return resources;
}

export default StartPage;