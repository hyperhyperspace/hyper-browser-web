import { Identity } from "@hyper-hyper-space/core";
import { Contacts } from "@hyper-hyper-space/home";
import { Box, Button, Stack, TextField, Typography } from "@mui/material";
import { Component, Fragment, ReactElement, useEffect, useState } from "react";
import { useParams } from "react-router";

type ImportExportedProfileProps = {
    renderIdentity?: (id?: Identity) => ReactElement
}

export default function ImportExportedProfile({ renderIdentity }: ImportExportedProfileProps) {
    const params = useParams();
    const urlProfile = params.profile;
    const [exportedIdentity, setExportedIdentity] = useState<string>(urlProfile || '');

    const [importedIdentity, setImportedIdentity] = useState<Identity>();
    const [importError, setImportError] = useState<boolean>(false);

    const exportedProfileOnChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;

        setExportedIdentity(newValue);
    };

    useEffect(() => {

        const doImport = async () => {
            try {
                const id = await Contacts.importIdentity(JSON.parse(exportedIdentity));
                setImportError(false);
                setImportedIdentity(id);
            } catch (e) {
                console.log(e);
                setImportError(true);
                setImportedIdentity(undefined);
            }

        }

        if (exportedIdentity.length > 0) {
            doImport();
        } else {
            setImportedIdentity(undefined);
            setImportError(false);
        }


    }, [exportedIdentity]);
    return (<Box style={{ padding: '1rem' }}>
        <TextField
            label="Paste exported profile here"
            value={exportedIdentity}
            maxRows={4}
            minRows={4}
            multiline
            fullWidth
            onChange={exportedProfileOnChange}
        />
        {importError &&
            <Box style={{ marginTop: '2rem' }}>
                <Typography>Cannot import: entered an invalid export.</Typography>
            </Box>
        }
        {importedIdentity !== undefined &&
            <Stack style={{ justifyContent: 'space-between', marginTop: '2rem' }} direction="row" spacing={2}>
                <Typography style={{ alignSelf: 'center' }}>
                    <span style={{ background: 'orange', color: 'white' }}>{importedIdentity.info?.type || 'Identity'}</span> named <Fragment>{importedIdentity.info?.name}</Fragment>
                </Typography>
                {renderIdentity && renderIdentity(importedIdentity)}
            </Stack>
        }
    </Box>)
}