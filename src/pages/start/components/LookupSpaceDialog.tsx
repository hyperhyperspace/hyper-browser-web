import { Accordion, AccordionDetails, AccordionSummary, Button, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Stack, Typography } from '@mui/material';

import CircularProgress from '@mui/material/CircularProgress';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Box } from '@mui/system';

import { useObjectDiscovery } from '@hyper-hyper-space/react';
import { ObjectDiscoveryReply } from '@hyper-hyper-space/core';
import { Fragment, useState, useEffect } from 'react';
import { supportedSpaceNames, supportedSpaceColors } from '../../../model/SupportedSpaces';
import { useNavigate, useParams } from 'react-router';

function LookupSpaceDialog() {

    const navigate = useNavigate();
    const params = useParams();

    const discovered = useObjectDiscovery(params.words, 'en', 10, true);

    const wait = discovered === undefined || discovered.size === 0;

    const errors = discovered? Array.from(discovered.values()).filter((r: ObjectDiscoveryReply) => (r.object === undefined || supportedSpaceNames.get(r.object.getClassName()) === undefined)) : [];
    const results = discovered? Array.from(discovered.values()).filter((r: ObjectDiscoveryReply) => r.object !== undefined && supportedSpaceNames.get(r.object.getClassName()) !== undefined) : [];

    const closeLookupDialog = () => {
        navigate('/start');
    }

    return (
        <Dialog open={true} scroll='paper' onClose={closeLookupDialog}>
            <DialogTitle>Looking up {params.words}</DialogTitle>
            <DialogContent style={{}} dividers>
                {wait &&
                <Box sx={{display: 'flex', minHeight: '300px'}}>
                    <CircularProgress style={{margin: 'auto'}}/>
                </Box>
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
                                                <Stack key={r.object?.getLastHash()} style={{justifyContent: 'space-between'}} direction="row">
                                                    <Typography style={{alignSelf: 'center'}}>
                                                        Found a <span style={{background: supportedSpaceColors.get(r.object?.getClassName() as string)}}>{supportedSpaceNames.get(r.object?.getClassName() as string)}</span>{r.object?.getAuthor()?.info?.name && <Fragment>  by r.object?.getAuthor()?.info?.name</Fragment> }
                                                    </Typography>  
                                                    <Button variant="contained">Open</Button>
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