import { AppBar, Button, Container, Link, Stack, TextField, Toolbar, Typography } from '@mui/material';
import { Box } from '@mui/system';
import { Fragment } from 'react';


function StartPage() {

    return (
    <Fragment>
        <AppBar position="relative" color="default">
            <Toolbar sx={{display: 'flex', flexDirection: 'row-reverse'}}>
                { /*<CameraIcon sx={{ mr: 2 }} /> */}
                <Button variant="contained" color="inherit" sx={{m:1}} style={{whiteSpace: 'nowrap'}}>Link Existing</Button>
                <Button variant="contained" sx={{m:1}} style={{whiteSpace: 'nowrap'}}>Create New</Button>
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
                    {/*<Typography
                        component="h3"
                        variant="h3"
                        align="center"
                        color="text.primary"
                        gutterBottom
                    >*/}
                        {/*<img src="logo.png" style={{width: "3rem", height: "3rem", marginBottom: '-12px'}}/> Welcome to Hyper Hyper Space!*/}
                        <Container sx={{width:{xs: '100%', sm:'100%', md: '95%', lg:'85%'}}}>
                            <h3><img src="logo.png" style={{width: '100%'}}/></h3>
                        </Container>
                    <Typography variant="h6" align="center" color="text.secondary" paragraph sx={{display: {xs:'none', sm: 'block', md: 'block'}}}>
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
                        <TextField variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}}></TextField>
                        <TextField variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}}></TextField>
                        <TextField variant="outlined" sx={{width: {xs: '100%', sm: '10rem', lg: '11rem'}}}></TextField>
                        <Button variant="contained">Lookup Space</Button>
                    </Stack>
                    <Box sx={{pt: 2, display: {xs: 'none', sm: 'none', md: 'block'}}}>
                        <Typography align="center" paragraph gutterBottom>Spaces are looked up using 3-word codes, that you can enter above.</Typography>
                    </Box>
                </Container>

                {/*<Container maxWidth="lg">
                <Stack
                        sx={{ pt: 5 }}
                        direction={{xs:'column',  sm:'row'}}
                        spacing={2}
                        justifyContent="center"
                        
                    >

                
                    <Typography>Lost? Start here:</Typography>
                        {[{icon:'🗒', iconTitle: 'feed', iconColor: 'yellow', text:'New spaces', title: 'puma kicker backlog'},
                        {icon:'💬', iconTitle: 'feed', iconColor: 'green', text:'Welcome chat and Q&A', title: 'ambar lemon tack'},
                        {icon:'🗒', iconTitle: 'feed', iconColor: 'red', text:'About Hyper Hyper Space', title: 'tandem sticker bag'}].map((e) => 
                            <Container style={{paddingLeft:0, paddingRight: 0}} sx={{textAlign:{xs: 'left', sm:'center'}, marginLeft: {xs: 1, sm: 'center'}, display: {xs:'block', sm:'block', md: 'inline'}, pt: {xs:'0.5rem', sm: '0.5rem', md: 0}}}><a href="#" title={e.title}><span style={{backgroundColor:e.iconColor, padding:2, borderRadius: 3}} title={e.iconTitle}>{e.icon}</span>&nbsp;{e.text}</a></Container> 
                        )} 
                        <Button component={Link} variant="outlined" size="medium" color="success">Create your own</Button>
                      
                </Stack>
                </Container>*/}

                <Container maxWidth="lg" sx={{pt: {xs: 6, sm: 8}}} >
                    <Typography align="center" style={{lineHeight: 2}}>Lost? Start here: 
                        {[{icon:'📗', iconTitle: 'feed', iconColor: 'lightblue', text:'About Hyper Hyper Space', title: 'tandem sticker bag'},
                        {icon:'💬', iconTitle: 'feed', iconColor: 'green', text:'Welcome chat and Q&A', title: 'ambar lemon tack'},
                        {icon:'🗒', iconTitle: 'feed', iconColor: 'yellow', text:'New spaces', title: 'puma kicker backlog'}].map((e) => 
                            <Container style={{paddingLeft:0, paddingRight: 0}} sx={{textAlign:{xs: 'center', sm:'center'}, marginLeft: {xs: 1, sm: 'center'}, display: {xs:'block', sm:'block', md: 'inline'}, pt: {xs:'0rem', sm: '0rem', md: 0}}}><a href="#" title={e.title}><span style={{backgroundColor:e.iconColor, padding:2, borderRadius: 3}} title={e.iconTitle}>{e.icon}</span>&nbsp;{e.text}</a></Container> 
                        )} 
                        <Container style={{paddingLeft:0, paddingRight: 0}} sx={{textAlign:{xs: 'center', sm:'center'}, marginLeft: {xs: 1, sm: 'center'}, display: {xs:'block', sm:'block', md: 'inline'}, pt: {xs:'0.5rem', sm: '0.5rem', md: '0.5rem'}}}><Button component={Link} variant="contained" size="medium" color="success">Create your own</Button></Container>
                    </Typography> 
                </Container>

                
                {/*<Container maxWidth="md" sx={{pt: 8}} style={{lineHeight: 1.5}}>
                    <Typography>Visited: <a href="#" title="ambar lemon tack"><span style={{backgroundColor:'yellow', padding:2, borderRadius: 3}} title="blog">🗒</span>&nbsp;Santi's little corner</a> <a href="#" title="ambar lemon tack"><span style={{backgroundColor:'green', color:'white', padding:2, borderRadius: 3}} title="chat room">💬</span>&nbsp;HHS chit-chat</a></Typography>
                    <Typography>Browse: <a href="#">culture</a> <a href="#">technology</a> <a href="#">fiction</a> <a href="#">personal</a> <a href="#">nature</a> <a href="#">history</a> <a href="#">art</a> <a href="#">all</a></Typography>
                    <Typography>New:<a href="#" title="ambar lemon tack"><span style={{backgroundColor:'yellow', padding:2, borderRadius: 3}}>blog</span>&nbsp;Santi's little corner</a> <a href="#" title="ambar lemon tack"><span style={{backgroundColor:'green', color:'white', padding:2, borderRadius: 3}}>chat</span>&nbsp;HHS chit-chat</a></Typography>
                </Container>
                */}
            </Box>
        </main>
    </Fragment>
    );

}

export default StartPage;