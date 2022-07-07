import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack, Typography } from '@mui/material';
import { useState, useEffect, Fragment } from 'react';
import { useNavigationType, useNavigate } from 'react-router';


function StorageDialog()  {


    const navigate = useNavigate();

    const close = () => {
        navigate('..');
    }
    
    const [bytesUsed, setBytesUsed]           = useState<number|undefined>(undefined);
    const [bytesAvailable, setBytesAvailable] = useState<number|undefined>(undefined);
    
    const [usingPersist, setUsingPersist] = useState<boolean|undefined>(undefined);
    
    const [error, setError] = useState<any|undefined>(undefined);

    const [waitingForPersist, setWaitingForPersist] = useState(false);

    const persistenceSupport = navigator.storage?.persisted !== undefined;

    const ask = () => {
        
        setWaitingForPersist(true);
        navigator.storage.persist().then((granted: boolean) => {
            setWaitingForPersist(false);
            setUsingPersist(granted);
        },
        (reason: any) => {
            setWaitingForPersist(false);
            setError(reason);
        })

    }

    useEffect(() => {
        navigator.storage.estimate().then((est: StorageEstimate) => {
            setBytesAvailable(est.quota);
            setBytesUsed(est.usage);
        }).catch((reason: any) => {
            setError(reason);
        });

        navigator.storage.persisted().then((value: boolean) => {
            setUsingPersist(value);
        }).catch((reason: any) => {
            setError(reason);
        });
    }, []);

    return <Dialog open={true} scroll='paper' onClose={close}>
        <DialogTitle>Browser Storage</DialogTitle>
        <DialogContent>
            <Card variant="outlined">
                <CardContent style={{background: 'lightgray'}}>
                {error !== undefined && 
                    <Typography>There was an error retrieving storage infomration:<br /><br />{error}</Typography>
                }
                {error === undefined && (bytesAvailable === undefined || bytesUsed === undefined || useNavigationType === undefined) &&
                    <Typography>Loading...</Typography>
                }
                {error === undefined && !(bytesAvailable === undefined || bytesUsed === undefined || useNavigationType === undefined) &&
                <Fragment>
                    <Typography>Using {bytesUsed < 1024*1024 && <span>{Math.round(bytesUsed/1024)} kb</span>}{bytesUsed >= 1024*1024 && bytesUsed < 1024*1024*1024 && <span>{Math.round(bytesUsed/(1024*1024))} mb</span>}{bytesUsed >= 1024*1024*1024 && <span>{Math.round(bytesUsed/(1024*1024*1024))} gb</span>} {bytesAvailable>0 && <span>({Math.round(bytesUsed/bytesAvailable*100)}%)</span>} out of a maximum of {bytesAvailable >= 1024*1024*1024 && <span>{Math.round(bytesAvailable/(1024*1024*1024))} gb</span>}{bytesAvailable >= 1024*1024 && bytesAvailable < 1024*1024*1024 && <span>{Math.round(bytesAvailable/(1024*1024))} mb</span>}{bytesAvailable < 1024 && <span>{Math.round(bytesAvailable/(1024))} kb</span>}.</Typography>
                    <br />
                    { persistenceSupport && 
                        <Fragment>
                        {usingPersist &&
                            <Typography>Persistent storage has been enabled.</Typography>
                        }
                        {!usingPersist && !waitingForPersist &&
                            <Typography>Persistent storage has not been enabled (your browser may delete your Home at any time).</Typography>
                        }
                        {!usingPersist && waitingForPersist && 
                            <Typography>Please authorize the use of <b>persistent storage</b> (your browser should be asking for your confirmation now).</Typography>
                        }
                        </Fragment>
                    }
                </Fragment>
                }

                </CardContent>
            </Card>
        </DialogContent>
        <DialogActions>
                <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}>{persistenceSupport && usingPersist !== undefined && !usingPersist && !usingPersist && <Button onClick={ask}>Use Persistent Storage</Button>}<Button onClick={close}>Close</Button></Stack>
        </DialogActions>

    </Dialog>;
}

export default StorageDialog;