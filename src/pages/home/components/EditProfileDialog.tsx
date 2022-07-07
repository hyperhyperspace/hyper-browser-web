

import { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate, useOutletContext } from 'react-router';
import { Button, Card, CardContent, Dialog, DialogActions, DialogContent, DialogTitle, Stack,
         TextField, Typography, useMediaQuery, useTheme } from '@mui/material';

import { useObjectState } from '@hyper-hyper-space/react';

import { Profile } from '@hyper-hyper-space/home';

import { HomeContext } from '../HomeSpace';

import { Hash, HashedObject, Space } from '@hyper-hyper-space/core';
import { Box } from '@mui/system';


function EditProfileDialog() {

    const navigate = useNavigate();

    const [open, setOpen] = useState(true);

    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const pictureInputRef = useRef<HTMLInputElement>(null);

    const close = () => {
        setOpen(false);
        navigate('..');
    };

    const { owner, resources } = useOutletContext<HomeContext>();

    const [profile, setProfile] = useState<Profile>();
    const profileState = useObjectState(profile);
    
    const [about, setAbout] = useState<string>();
    const [picDataUrl, setPicDataUrl] = useState<string>();
    const [base64PicData, setBase64PicData] = useState<string>();
    const [picMIMEType, setPicMIMEType] = useState<string>();

    // data:image/png;base64,

    useEffect(() => {

        if (owner !== undefined && resources !== undefined) {
            const profileHash = new Profile(owner).hash();
            resources.store?.load(profileHash).then((loaded?: HashedObject) => {

                const p = loaded as (Profile | undefined);

                if (p === undefined) {
                    throw new Error('Could not load profile for this home account!');
                } else {
                    setProfile(p);
                    setAbout(p.about?._value);
                    if (p.picture?._value !== undefined && p.pictureMIMEType?._value !== undefined) {
                        setBase64PicData(p.picture?._value);
                        setPicMIMEType(p.pictureMIMEType?._value);
                    }
                }
            });
        }
        

    }, [owner, resources]);

    const handleAboutChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setAbout(event.target.value);
    };

    const handleAboutKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            //e.preventDefault();
            //
        } else {
            //
        }
    };

    const dirty = () => {
        if (profile !== undefined && 
            (profile?.about?._value !== about || 
             profile?.picture?._value !== base64PicData ||
             profile?.pictureMIMEType?._value !== picMIMEType)) {

          return true;
      } else {
          return false;
      }
    }

    const doSave = async () => {

        if (base64PicData !== undefined) {
            try {
                await profileState?.value?.picture?.setValue(base64PicData);            
            } catch (e: any) {
                alert('Could not fully save your profile, there was a problem setting your picture: ' + e);
                throw e;
            }
        }
        if (picMIMEType !== undefined) {
            await profileState?.value?.pictureMIMEType?.setValue(picMIMEType);
        }
        try {
            await profileState?.value?.about?.setValue(about || '');
        } catch (e: any) {
            alert('Could not fully save your profile, there was a problem setting your "about" text: ' + e);
            throw e;
        }
        
        await profileState?.value?.save();
    }

    const save = async () => {
        await doSave();
        close();
    }

    const cancel = () => {
        if (dirty()) {
            setNextAction('close');
        } else {
            close();
        }
    }

    const changePicture = () => {
        pictureInputRef.current?.click();
    }

    const onNewPicture: React.ChangeEventHandler<HTMLInputElement> = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files !== null) {
            console.log('got a file:')
            console.log(e.target.files[0]);

            const fileReader = new FileReader();

            fileReader.onload = () => {

                const dataUrl = fileReader.result?.toString();

                if (dataUrl !== undefined) {
                    //setPicDataUrl(dataUrl);

                    const dataAndMIMEType = dataUrl?.slice(5);
                    const mimeTypeLength = dataAndMIMEType?.indexOf(';')
                    const mimeType = dataAndMIMEType.slice(0, mimeTypeLength);
                    const data     = decodeURIComponent(dataAndMIMEType.slice(mimeTypeLength+1+7));

                    setPicMIMEType(mimeType);
                    setBase64PicData(data);
    
                    console.log('actual value is:')
                    console.log('mime: ' + mimeType)
                    console.log('bytes: ' + data)
                    console.log(fileReader.result?.toString());
    
                }
            };



            fileReader.readAsDataURL(e.target.files[0]);
        }
    }

    useEffect(() => {
        // data:image/png;base64,
        if (picMIMEType !== undefined && base64PicData !== undefined) {
            setPicDataUrl('data:' + picMIMEType + ';base64,' + base64PicData);
        }
    }, [picMIMEType, base64PicData]);

    const [nextAction, setNextAction] = useState<string>('');

    const share = () => {
        if (dirty()) {
            setNextAction('share');
        } else {
            navigate('../share-profile');
        }
    };

    const next = () => {
        if (nextAction === 'close') {
            close();
        } else if (nextAction === 'share') {
            navigate('../share-profile');
        }
    }

    const yes = async () => {
        await doSave();
        next();
    }

    const no = () => {
        next();
    }

    return (
        <Fragment>
            { nextAction !== '' &&
                <Dialog open={nextAction!==''}>
                    <DialogTitle>Save changes to your profile?</DialogTitle>
                    <DialogActions><Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="outlined" onClick={yes}>Yes</Button><Button onClick={no}>No</Button></Stack></DialogActions>
                </Dialog>

            }
            <Dialog open={open} scroll='paper' onClose={close} fullScreen={fullScreen} fullWidth={!fullScreen} maxWidth='sm' PaperProps={{sx: {minHeight: '60%'}}}>
                <DialogTitle><Stack direction="row" style={{justifyContent: 'space-between'}}><div>Edit Your Profile</div><Button color="success" onClick={share}>Share</Button></Stack></DialogTitle>
                
                
                <DialogContent>
                    <input type="file" id="pictureInput" style={{display: 'none'}} ref={pictureInputRef} accept="image/*" onChange={onNewPicture}/>

                    <Stack direction={{ xs: 'column', sm: 'row' }} style={{width: '100%'}}>

                    { picDataUrl === undefined &&
                        <div style={{minWidth: '180px', minHeight: '180px', backgroundColor:'#ccc', display:'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}>
                            <div style={{flexGrow: 5, height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center'}}> <Typography style={{verticalAlign:'middle'}}>No picture</Typography> </div>
                            
                            <div style={{position: 'relative', top: '-10px' }}><Button size="small" variant="contained" onClick={changePicture}>Change</Button></div>
                        </div>
                    }

                    { picDataUrl !== undefined &&
                        <Box sx={{width: {xs: '100%'}, maxWidth: {xs: 'none', sm: '180px'}}} style={{position: 'relative'}}>
                            <Box sx={{position: 'absolute', bottom: {xs: '20px', sm: '12px'}, left: 'calc(50% - 2rem)'}}><Button size="small" variant="contained" onClick={changePicture}>Change</Button></Box>
                            <img style={{minWidth:'180px', minHeight: '180px', width: '100%', height: '100%'}} src={picDataUrl} />
                        </Box>
                    }
                    

                    <Card variant="outlined" style={{width: '100%'}}>
                        <CardContent>
                            <Typography>
                                {owner?.info !== undefined &&
                                    <Fragment>
                                        {Object.entries(owner.info).map((entry:[string, any]) => {
                                                return <span key={'prop-'+entry[0]}>{entry[0]}: <b>{entry[1]}</b><br /></span>;
                                            })
                                        }
                                        <span>code: <span style={{backgroundColor: 'yellow'}}>{Space.getWordCodingForHash(owner.getLastHash() as Hash).join(' ')}</span></span>
                                    </Fragment>
                                }
                            </Typography>
                        </CardContent>
                    </Card>


                    </Stack>
                    <TextField 
                        style={{marginTop: '1.5rem'}}
                        label="About"
                        value={about||''}
                        onChange={handleAboutChange} 
                        onKeyPress={handleAboutKeyPress} 
                        maxRows={5}
                        minRows={5}
                        multiline
                        inputProps={{maxLength: 500}}
                        autoFocus
                        disabled={profileState === undefined}
                        fullWidth
                    />
                    
                </DialogContent>

                <DialogActions>
                    <Stack direction="row" style={{margin: 'auto', paddingBottom: '1rem'}} spacing={2}><Button variant="outlined" onClick={save} disabled={profileState?.value===undefined}>Save</Button><Button onClick={cancel}>Cancel</Button></Stack>
                </DialogActions>
            </Dialog>

        </Fragment>
    );

}

export default EditProfileDialog;