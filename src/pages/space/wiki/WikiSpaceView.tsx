import { useObjectState } from '@hyper-hyper-space/react';
import { Paper, Typography } from '@mui/material';
import { useEffect, useState } from 'react';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import WikiSpacePage from './WikiSpacePage';

function WikiSpaceView(props: { entryPoint: WikiSpace, currentPageName: String }) {

    const [initialized, setInitialized] = useState(false);
    const wikiSpace = useObjectState(props.entryPoint);
    
    // surely there's a more efficient way
    const currentPage = [...(wikiSpace?.getValue()?.pages?.values() || [])].find(
        page => page.name === props.currentPageName
    )

    useEffect(() => {
        props.entryPoint.startSync().then(() => {
            setInitialized(true);
        });
    }, [props.entryPoint]);


    return <Paper style={{ paddingTop: '40px', height: '100%' }}>
        {!initialized &&
            <Typography>Loading...</Typography>
        }
        {initialized &&
            <WikiSpacePage page={currentPage!}></WikiSpacePage>
        }

    </Paper>;
}

export default WikiSpaceView;