import { MutableReference, MutableSet } from '@hyper-hyper-space/core';
import { Device } from '@hyper-hyper-space/home';
import { StateObject, useStateObject } from '@hyper-hyper-space/react';
import { Button, Dialog, DialogContent, DialogTitle, List, Stack, Typography } from '@mui/material';
import { useState, useEffect, Fragment } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { HomeContext } from '../pages/HomeSpace';

function ManageDevicesDialog() {

    const navigate = useNavigate();

    const close = () => {
        navigate('/');
    }

    const { devices } = useOutletContext<HomeContext>();


    //const devices = Array.from(devicesObj.value?.values() || []);

    return (
        <Fragment>
            <Dialog open={true} scroll='paper' onClose={close}>
                <DialogTitle>Linked Devices</DialogTitle>
                <DialogContent>
                    <List>
                        {devices !== undefined && devices.value !== undefined &&
                            <Stack>
                            {Array.from(devices.value?.values()).map((device: Device) => {
                                <Stack key={device.getLastHash()} style={{justifyContent: 'space-between'}} direction="row">
                                    <Typography>
                                        {device.name?.getValue() || ''}
                                    </Typography>
                                    <Button variant="contained">Unlink</Button>
                                </Stack>
                            })}
                            </Stack>
                        }
                    </List>
                </DialogContent>
            </Dialog>
        </Fragment>
    );
}

export default ManageDevicesDialog;