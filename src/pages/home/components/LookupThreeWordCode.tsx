import { Identity, ObjectDiscoveryReply, Resources, WordCode } from "@hyper-hyper-space/core";
import { useObjectDiscoveryWithResources } from "@hyper-hyper-space/react";
import { CircularProgress, Divider, TextField, Typography } from "@mui/material";
import { Box, Stack } from "@mui/system";
import { Fragment, ReactElement, useEffect, useRef, useState } from "react";

type LookupThreeWordCodeProps = {
    resourcesForDiscovery: Resources,
    renderIdentity?: (id?: Identity) => ReactElement
}

export default function LookupThreeWordCode({ resourcesForDiscovery, renderIdentity }: LookupThreeWordCodeProps) {
    const [wordsForDiscovery, setWordsForDiscovery] = useState<string | undefined>(undefined);
    const discovered = useObjectDiscoveryWithResources(resourcesForDiscovery, wordsForDiscovery, 'en', 10, false);
    const discoveredIds = discovered ? Array.from(discovered.values()).filter((r: ObjectDiscoveryReply) => r.object !== undefined && r.object.getClassName() === Identity.className).map((r: ObjectDiscoveryReply) => (r.object as Identity)) : [];

    const [discoveryTrigger, setDiscoveryTrigger] = useState<number | undefined>(undefined);

    const [word1, setWord1] = useState<string>('');
    const [word2, setWord2] = useState<string>('');
    const [word3, setWord3] = useState<string>('');

    const word2Ref = useRef<HTMLInputElement>(null);
    const word3Ref = useRef<HTMLInputElement>(null);

    const [word1Error, setWord1Error] = useState<boolean>(false);
    const [word2Error, setWord2Error] = useState<boolean>(false);
    const [word3Error, setWord3Error] = useState<boolean>(false);

    const onChangeWord1 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWord1(event.target.value);
    };

    const onChangeWord2 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWord2(event.target.value);
    };

    const onChangeWord3 = (event: React.ChangeEvent<HTMLInputElement>) => {
        setWord3(event.target.value);
    };

    const onKeypressWord1 = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word2Ref.current?.focus();
        }
    }

    const onKeypressWord2 = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            word3Ref.current?.focus();
        }
    }

    useEffect(() => {
        if (discoveryTrigger !== undefined) {
            window.clearTimeout(discoveryTrigger);
        }

        const word1OK = WordCode.english.check(word1);
        const word2OK = WordCode.english.check(word2);
        const word3OK = WordCode.english.check(word3);

        setWord1Error(word1.length > 0 && !word1OK);
        setWord2Error(word2.length > 0 && !word2OK);
        setWord3Error(word3.length > 0 && !word3OK);

        if (word1OK && word2OK && word3OK) {
            setWordsForDiscovery(word1 + '-' + word2 + '-' + word3);
        } else {
            setWordsForDiscovery(undefined);
        }
    }, [word1, word2, word3]);

    // const cancel = () => {
    //     close();
    // };
    return (
        <Box style={{ padding: '1rem' }}>
            <Stack direction="row" spacing={1} style={{ alignItems: 'baseline' }}>
                <Typography >
                    Code:
                </Typography>
                <TextField value={word1} onChange={onChangeWord1} onKeyPress={onKeypressWord1} error={word1Error} inputProps={{ size: 12 }} size='small' autoFocus />
                <TextField value={word2} onChange={onChangeWord2} onKeyPress={onKeypressWord2} error={word2Error} inputProps={{ size: 12 }} inputRef={word2Ref} size='small' />
                <TextField value={word3} onChange={onChangeWord3} error={word3Error} inputProps={{ size: 12 }} inputRef={word3Ref} size='small' />
            </Stack>
            {wordsForDiscovery !== undefined && discoveredIds.length === 0 &&
                <Box style={{ marginTop: '2rem' }}>
                    {false &&
                        <Box sx={{ display: 'flex', marginBottom: '1rem' }}>
                            <Typography>This is taking longer than expected. Are your 3-words correct? Poke someone to open this space then.</Typography>
                        </Box>
                    }
                    <Box sx={{ display: 'flex' }}>
                        <CircularProgress style={{ margin: 'auto' }} />
                    </Box>
                </Box>
            }
            {wordsForDiscovery !== undefined && discoveredIds.length > 0 &&

                <Stack divider={<Divider orientation="horizontal" flexItem />} style={{ marginTop: '1rem' }} >
                    {discoveredIds.map((id: Identity) => (
                        <Stack key={id.getLastHash()} style={{ justifyContent: 'space-between', marginTop: '1rem' }} direction="row" spacing={2}>
                            <Typography style={{ alignSelf: 'center' }}>
                                <span style={{ background: 'orange', color: 'white' }}>{id.info?.type || 'Identity'}</span> named <Fragment>{id.info?.name}</Fragment>
                            </Typography>
                            {renderIdentity!(id)}
                        </Stack>
                    ))}
                </Stack>
            }
        </Box>
    )
}