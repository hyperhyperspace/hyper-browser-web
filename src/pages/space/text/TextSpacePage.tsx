import { HashedObject } from '@hyper-hyper-space/core';
import { useStateObject } from '@hyper-hyper-space/react';
import { Button, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useState, Fragment } from 'react';
import { TextSpace } from '../../../model/text/TextSpace';
import { styled } from '@mui/material';

const FullHeightTextField = styled(TextField)`
    .MuiInputBase-multiline {
        height: 100%;
    }
`;

function TextSpacePage(props: {entryPoint: TextSpace}) {

    const [initialized, setInitialized] = useState(false);
    const [text, setText] = useState('');
    

    const author = props.entryPoint.getAuthor();
    const canEdit = author === undefined || author.hasKeyPair();

    const textState = useStateObject(props.entryPoint.content);

    const handleTextChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        setText(event.target.value);
    };

    const saveText = () => {
        const content = props.entryPoint.content;

        if (content !== undefined) {
            content.setValue(text).then(() => {
                content.saveQueuedOps();
                console.log('SAVED')
            });
            
        }
    };

    useEffect(() => {
        props.entryPoint.startSync().then(() => {
            setInitialized(true);
        });
    }, [props.entryPoint]);

    useEffect(() => {
        const newText = textState?.value?._value;

        console.log('got new value for the text: ' + newText)

        if (newText !== undefined) {
            setText(newText);
        }
    }, [textState])



    return <Paper style={{paddingTop: '40px', height: '100%'}}>
        { !initialized &&
            <Typography>Loading...</Typography>
        }
        { initialized &&
            <Stack direction="column" style={{height:'100%'}} padding={1}>
                <FullHeightTextField disabled={!canEdit} value={text} onChange={handleTextChange} multiline fullWidth style={{height:'100%', padding: '1rem'}} inputProps={{style: {height: '100%'}}}></FullHeightTextField>
                <Stack direction="row" style={{justifyContent: 'center', padding: 2}}>
                    {canEdit && <Button disabled={!initialized} variant="contained" size="large" onClick={saveText}>Save</Button>}
                    {(!canEdit && author!==undefined) && <Typography style={{color:'grey'}}>Only {author.info?.name || 'its owner'} can edit this file.</Typography>}
                </Stack>
            </Stack>
        }
        
    </Paper>;
}

export default TextSpacePage;