import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/system';

import { useObjectDiscovery } from '@hyper-hyper-space/react';
import { Hash, ObjectDiscoveryReply } from '@hyper-hyper-space/core';
import { Fragment, useState, useEffect } from 'react';
import { SpaceDisplayInfo, supportedSpaces } from '../../../model/SupportedSpaces';
import { useNavigate, useParams } from 'react-router';

function LookupSpaceDialog() {

    const navigate = useNavigate();
    const params = useParams();

    const discovered = useObjectDiscovery(params.words, 'en', 10, true);

    const wait = discovered === undefined || discovered.size === 0;

    const errors = discovered? Array.from(discovered.values()).filter((r: ObjectDiscoveryReply) => (r.object === undefined || supportedSpaces.get(r.object.getClassName()) === undefined)) : [];
    const results = discovered? Array.from(discovered.values()).filter((r: ObjectDiscoveryReply) => r.object !== undefined && supportedSpaces.get(r.object.getClassName()) !== undefined) : [];

    const closeLookupDialog = () => {
        navigate('/start');
    }

    const openSpace = (entryPointHash: Hash) => {
        window.open('./#/space/' + encodeURIComponent(entryPointHash), '_blank');
    }

    const [discoveryTimeout, setDiscoveryTimeout] = useState<number|undefined>(undefined);

    const [showTimeoutMessage, setShowTimeoutMessage] = useState(false);

    const discoveryTimeoutCallback = () => {
        setShowTimeoutMessage(true);
        setDiscoveryTimeout(undefined);
    }

    useEffect(() => {
        setDiscoveryTimeout(window.setTimeout(discoveryTimeoutCallback, 8000));
        return () => {
            if (discoveryTimeout !== undefined) {
                window.clearTimeout(discoveryTimeout);
                setDiscoveryTimeout(undefined);
            }
        };
    }, []);

    return (
        <Dialog open={true} scroll='paper' onClose={closeLookupDialog}>
            <DialogTitle>Looking up {params.words}</DialogTitle>
            <DialogContent style={{}} dividers>

                {wait &&
                    <Fragment>
                    { showTimeoutMessage && 
                    <Box sx={{display: 'flex', marginTop: '1rem'}}>
                        <Typography>This is taking longer than expected. Are your 3-words correct? Poke someone to open this space then.</Typography>
                    </Box>
                    }
                    <Box sx={{display: 'flex', minHeight: '300px'}}>
                        <CircularProgress style={{margin: 'auto'}}/>
                    </Box>
                    </Fragment>
                }
                {!wait &&
                <Fragment>
                {errors.length > 0 && 
                    <Accordion sx={{background: 'pink'}}>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="lookup errors"
                            id="lookup-errors"
                            sx={{bgColor: 'red'}}>
                            
                            <Typography>{errors.length} {'error' + (errors.length > 1? 's' : '') + ' during look-up'}</Typography>
                            
                        </AccordionSummary>
                        <AccordionDetails>
                        <Stack>
                            {errors.map((r:ObjectDiscoveryReply, idx: number) => 
                            <Typography key={idx}><span style={{color: 'red'}}>{r.object !== undefined? ('Class ' + r.object.getClassName() + ' is not a supported Space type.') : r.error }</span></Typography>)}

                        </Stack>
    
                        </AccordionDetails>
                    </Accordion>
                }
                {results.length > 0 &&
                    <Stack divider={<Divider orientation="horizontal" flexItem />}>
                        {results.map((r: ObjectDiscoveryReply) => 
                                                <Stack key={r.object?.getLastHash()} style={{justifyContent: 'space-between'}} direction="row"  spacing={2}>
                                                    <Typography style={{alignSelf: 'center'}}>
                                                        Found a <span style={{background: (supportedSpaces.get(r.object?.getClassName() as string) as SpaceDisplayInfo).color, color: 'white'}}>{(supportedSpaces.get(r.object?.getClassName() as string) as SpaceDisplayInfo).name}</span>{r.object?.getAuthor()?.info?.name && <Fragment> space by {r.object?.getAuthor()?.info?.name}</Fragment> }
                                                    </Typography>  
                                                    <Button variant="contained" onClick={() => { openSpace(r.object?.getLastHash() as Hash); }}>Open</Button>
                                                </Stack>
                        )}

                        
                    </Stack>
                }
                </Fragment>
                }
            </DialogContent>
            <DialogActions>
                <Button style={{margin: 'auto'}} onClick={closeLookupDialog}>Cancel</Button>
            </DialogActions>

        </Dialog>
    );
}

export default LookupSpaceDialog;