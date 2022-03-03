import FolderIcon from '@mui/icons-material/Folder';
import ContactPageIcon from '@mui/icons-material/ContactPage';
import { AppBar, Badge, Button, ButtonGroup, Container, IconButton, InputAdornment, Link, Stack, TextField, Toolbar, Tooltip, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Fragment } from 'react';
import HomeItem from '../components/HomeItem';
import HomeCommand from '../components/HomeCommand';


function HomeSpace() {

    return (
    <Fragment>
        <AppBar position="fixed" color="default">
        <Toolbar sx={{display: 'flex', justifyContent: 'space-between'}}>
                <img src="isologo.png" style={{height: 34, paddingRight: '0.75rem'}} />
                <Typography style={{textAlign: 'center', flexGrow: 1}} variant="h6" noWrap>
                    🏠 Santi Bazerque's Home Space
                </Typography>
                <Container style={{paddingRight: 0, width: 'auto'}} sx={{paddingLeft: {xs: 0, sm: '2rem', md: '4rem'}}}>
                    <IconButton>⚙️</IconButton>
                </Container>
            </Toolbar>
        </AppBar>
        <main style={{height: "100%"}}>
            <Box
                sx={{
                    bgcolor: 'background.paper',
                    pt: {xs: 10, sm: 12},
                    pb: 6,
                    height: "100%"
                }}
            >

                <Stack sx={{ justifyContent: 'space-between', height: "100%"}}>
                    <Container maxWidth="xl">
                        <Stack
                            sx={{ justifyContent: 'space-between', pt: {xs: 2, sm: 3}, pl: {xs: 0, sm: '1rem', md: '4rem'}, pr: {xs: 0, sm: '1rem', md: '4rem'}}}
                            direction='row'
                            spacing={2}
                        >
                            <Stack
                                direction='row'
                                spacing={0}
                                style={{flexWrap: 'wrap'}}
                            >
                                <HomeItem icon="streamline-icon-folder-empty@48x48.png" name="Public Folder"></HomeItem>
                                <HomeItem icon="streamline-icon-common-file-empty@48x48.png" name="Personal Page"></HomeItem>
                                <HomeItem icon="streamline-icon-pencil-write-1@48x48.png" name="Notes"></HomeItem>
                                <HomeItem icon="streamline-icon-add-circle-bold@48x48.png" name=" "></HomeItem>

                                {/*<HomeItem icon="📂" name="Public Folder"></HomeItem>
                                <HomeItem icon="📄" name="Personal Page"></HomeItem>
                                <HomeItem icon="✍️" name="Notes"></HomeItem>
            <HomeItem icon="➕" name=" "></HomeItem>*/}


                                
                            
                            </Stack>
                            <Stack
                                direction='row'
                                spacing={2}
                            >
                                <HomeItem icon="streamline-icon-archive@48x48.png" name="Archived" badge={4}></HomeItem>
                            </Stack>
                            

                        </Stack>
                    </Container>
                <Stack>
                    <Container maxWidth="md" sx={{pt: 2}}>
                        <Container sx={{width:{xs: '65%', sm:'55%', md: '52%', lg:'50%'}}}>
                            <h3><img src="logo.png" style={{width: '100%'}}/></h3>
                        </Container>
                    </Container>
                    <Container maxWidth="lg">
                        <Stack
                            sx={{ pt: {xs: 2, sm: 3} }}
                            direction={{xs:'column',  sm:'row'}}
                            spacing={2}
                            justifyContent="center"
                        >
                            <TextField 
                                variant="outlined" 
                                sx={{width: {xs: '100%', sm: '70%', md: '60%', lg: '50%'}}}
                                InputProps={{
                                    startAdornment: (
                                    <InputAdornment position="start">
                                        <Typography fontSize="1.7rem">🔎</Typography>
                                    </InputAdornment>
                                    ),
                                }}
                                label="3-words for lookup or keywords to search your home"
                            >

                            </TextField>
                        </Stack>
                    </Container>
                </Stack>

                <Container maxWidth="lg" sx={{pt:12, pl:0, pr:0}}>
                    <div style={{textAlign: 'center'}}>
                    <ButtonGroup style={{flexWrap: 'wrap'}} variant="contained" color="inherit">
                        <HomeCommand icon="streamline-icon-single-neutral-profile-picture@48x48.png" title="Profile"></HomeCommand>
                        <HomeCommand icon="streamline-icon-book-address@48x48.png" title="Contacts"></HomeCommand>
                        <HomeCommand icon="streamline-icon-conversation-chat-2@48x48.png" title="Chat" badge={4}></HomeCommand>
                        <HomeCommand icon="streamline-icon-satellite-1@48x48.png" title="Spaces"></HomeCommand>
                        <HomeCommand icon="streamline-icon-cog-1@48x48.png" title="Config"></HomeCommand>
                        {/*<HomeCommand icon="🙂" title="Profile"></HomeCommand>
                        <HomeCommand icon="📒" title="Contacts"></HomeCommand>
                        <HomeCommand icon="💬" title="Chat" badge={4}></HomeCommand>
                        <HomeCommand icon="🛸" title="Spaces"></HomeCommand>
                        <HomeCommand icon="⚙️" title="Config"></HomeCommand>*/}
                    </ButtonGroup>
                    </div>
                </Container>

                </Stack>
            </Box>
        </main>
    </Fragment>
    );

}

export default HomeSpace;