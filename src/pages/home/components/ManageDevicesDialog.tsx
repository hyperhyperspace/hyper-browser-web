import { Hash, MutableReference, MutableSet } from '@hyper-hyper-space/core';
import { Device, Home } from '@hyper-hyper-space/home';
import { useStateObject } from '@hyper-hyper-space/react';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid, List, Stack, Typography } from '@mui/material';
import { Fragment, useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { HomeContext } from '../HomeSpace';
import ReceiveLinkOffer from './ReceiveLinkOffer';

function ManageDevicesDialog() {

    const navigate = useNavigate();

    const close = () => {
        navigate('..');
    }

    const { home, localDevice } = useOutletContext<HomeContext>();

    const homeState = useStateObject(home);

    let [showReceiveDialog, setShowReceiveDialog] = useState<boolean>(false);

    const linkAnotherDevice = () => {
        setShowReceiveDialog(true);
    };

    const cancelLinkAnotherDevice = () => {

        setShowReceiveDialog(false);
    }

    useEffect(() => {
        console.log('devices');
        console.log((homeState?.value as Home)?.devices)
    });

    return (
        <Fragment>
            <Dialog open={true} scroll='paper' onClose={close}>
                <DialogTitle>Linked Devices</DialogTitle>
                <DialogContent>


               { homeState !== undefined && homeState.value !== undefined &&

                                
                            
                    Array.from(((homeState?.value as Home)?.devices)?.values() as IterableIterator<Device>).map((device: Device) => (


                                <Fragment key={device?.getLastHash()}>
                                    {device &&
                                        <Stack
                                            key={device.getLastHash()}
                                            direction='row'
                                            spacing={0}
                                            style={{flexWrap: 'wrap', alignItems: 'center'}}
                                        >
                                    
                                            <div style={{flexGrow: 1, padding: 5}}>
                                                <Typography>
                                                    {device.name?.getValue()}
                                                </Typography>
                                            </div>
                                            <div style={{padding: 5}}>
                                    {/*<Button>Unlink</Button>*/}
                                                {device.equals(localDevice) && <Typography style={{textTransform: 'uppercase', background: 'yellow'}} variant="body2">This Device</Typography>}
                                            </div>
                                        </Stack>
                                    }
                                </Fragment>
                            )                         
                        )
                    }

                        {/*{devicesState !== undefined && devicesState.current !== undefined &&

                                
                            
                                Array.from((devicesState.current as MutableSet<Device>)?.valueHashes()).map((deviceHash: Hash) => {

                                
                                    const deviceRow = (deviceProxy?: StateProxy) => {

                                        const device = deviceProxy?.current as Device;
                                        const deviceName = deviceProxy?.fields['name']?.current as MutableReference<string>;

                                        return (
                                            <Fragment key={device?.getLastHash()}>
                                                {device &&
                                                    <Stack
                                                        key={device.getLastHash()}
                                                        direction='row'
                                                        spacing={0}
                                                        style={{flexWrap: 'wrap', alignItems: 'center'}}
                                                    >
                                                
                                                        <div style={{flexGrow: 1, padding: 5}}>
                                                            <Typography>
                                                                {deviceName?.getValue()}
                                                            </Typography>
                                                        </div>
                                                        <div style={{padding: 5}}>
                                                {/ *<Button>Unlink</Button>* /}
                                                            {device.equals(localDevice) && <Typography style={{textTransform: 'uppercase', background: 'yellow'}} variant="body2">This Device</Typography>}
                                                        </div>
                                                    </Stack>
                                                }
                                            </Fragment>
                                        );
                                    };
                                    
                                    return deviceRow(devicesState.contents[deviceHash] as StateProxy)
                                }
                            )
                            
                        }*/}
                </DialogContent>
                <DialogActions>
                    <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="contained" color="success" onClick={linkAnotherDevice}>Add device</Button><Button onClick={close}>Close</Button></Stack>
                </DialogActions>
            </Dialog>
            {showReceiveDialog &&
                <ReceiveLinkOffer close={cancelLinkAnotherDevice} />
            }
            {/*<Stack>
                            {Array.from(devices.value?.values()).map((device: Device) => 
                                <Stack key={device.getLastHash()} style={{justifyContent: 'space-between'}} direction="row">
                                    <Box><Typography>
                                        {device.name?.getValue() || ''}
                                    </Typography></Box>
                                    <Button variant="contained">Unlink</Button>
                                </Stack>
                            )}
                            </Stack>*/}
        </Fragment>
    );
}

export default ManageDevicesDialog;