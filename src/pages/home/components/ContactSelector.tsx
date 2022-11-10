import React, { useState, useEffect, useRef, Fragment } from 'react';
import { useNavigate, useOutletContext } from 'react-router';

import { Stack, Tabs, Tab, Card, CardContent, TextField, InputAdornment, Typography, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Avatar, Divider, Chip } from '@mui/material';
import { Box } from '@mui/system';
import { useObjectState } from '@hyper-hyper-space/react';
import { Hash } from '@hyper-hyper-space/core';
import { Contact, ProfileUtils } from '../../../model/ProfileUtils';
import { WikiContext } from '../../space/wiki/WikiSpaceView';

type LetterIndexEntry = {
    letter: string,
    hash?: Hash
}

type ContactSelectorProps = {
    handleSelect?: Function
}

const ContactSelector = ({ handleSelect }: ContactSelectorProps) => {
    const { spaceContext } = useOutletContext<WikiContext>();
    const { home } = spaceContext;
    const navigate = useNavigate();
    const contactsState = useObjectState(home?.contacts?.current);

    const attemptSelection = (...x: any[]) => {
        try {
            handleSelect!(...x)
        } catch (e) {
            // todo: handle errors such as invalid selection, maybe by showing a warning
            throw(e)
        }
    }

    const handleChangeTab = () => {

    };

    const [searchValue, setSearchValue] = useState('');

    const searchValueChanged = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.currentTarget.value;
        setSearchValue(newValue);
    };

    const searchKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Escape') {
            setSearchValue('');
        }
    }

    const [contacts, setContacts] = useState<Array<Contact>>([]);
    const [letters, setLetters] = useState<Array<LetterIndexEntry>>([]);
    const [currentLetter, setCurrentLetter] = useState<string>();

    const contactElements = useRef({} as any);

    const [scrollTimeout, setScrollTimeout] = useState<number | undefined>(undefined);

    useEffect(() => {

        const load = async () => {
            if (contactsState?.value !== undefined) {

                const keywords = ProfileUtils.normalizeStringForKeywordSearch(searchValue).split(/[ -]+/);

                const contactProfiles = Array.from(contactsState.value?.values());

                const p = home?.profile;

                if (p !== undefined) {
                    contactProfiles.push(p);
                }

                const cs = contactProfiles.map(ProfileUtils.createContact).filter((c: Contact) => ProfileUtils.filterContactForKeywordSearch(c, keywords));

                cs.sort((a: { order: string }, b: { order: string }) => a.order.localeCompare(b.order));

                let letter = '';
                const letterIndexEntries: Array<LetterIndexEntry> = [];

                const possibleLetters = new Set<string>();

                const allLetters: Array<string> = []

                for (let i = 'A'.charCodeAt(0); i <= 'Z'.charCodeAt(0); i++) {
                    allLetters.push(String.fromCharCode(i));
                }

                let nextLetter = 0;

                let firstLetter = 'A';

                for (const c of cs) {
                    const normalizedName = ProfileUtils.normalizeStringForKeywordSearch(c.name);
                    if (normalizedName.length > 0) {
                        const newLetter = normalizedName[0].toUpperCase();
                        if (letter !== newLetter) {

                            if (letter === '') {
                                firstLetter = newLetter;
                            }

                            while (nextLetter < allLetters.length && allLetters[nextLetter].localeCompare(newLetter) < 0) {
                                letterIndexEntries.push({ letter: allLetters[nextLetter] });
                                nextLetter = nextLetter + 1;
                            }

                            if (nextLetter < allLetters.length && allLetters[nextLetter].localeCompare(newLetter) === 0) {
                                nextLetter = nextLetter + 1;
                            }

                            letter = newLetter;
                            possibleLetters.add(letter);
                            letterIndexEntries.push({ letter: letter, hash: c.hash })
                            c.isFirstForLetter = letter;
                        }
                    }
                }

                while (nextLetter < allLetters.length) {
                    letterIndexEntries.push({ letter: allLetters[nextLetter] });
                    nextLetter = nextLetter + 1;
                }

                setContacts(cs);
                setLetters(letterIndexEntries);
                if (currentLetter === undefined || !possibleLetters.has(currentLetter)) {
                    setCurrentLetter(firstLetter);
                }
            }
            const cs = contactsState?.getValue()
        };

        load();

    }, [contactsState, searchValue]);


    //const sx = fullScreen? {} : {maxHeight: '80%'}

    const share = () => {
        navigate('../share-profile');
    };

    const refreshLetterIndex = () => {
        for (const idx of letters) {
            if (idx.hash !== undefined) {
                let elmt = contactElements.current[idx.hash];

                var rect = elmt.getBoundingClientRect();

                if (
                    rect.top >= 0 &&
                    rect.left >= 0 &&
                    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /* or $(window).height() */
                    rect.right <= (window.innerWidth || document.documentElement.clientWidth) /* or $(window).width() */
                ) {
                    setCurrentLetter(idx.letter);
                    break;
                }
            }

        }
    }

    const onScroll = () => {
        if (scrollTimeout === undefined) {
            window.setTimeout(refreshLetterIndex, 200);
        }
    }

    return (
        <Fragment>
            <TextField
                variant="outlined"
                sx={{ width: '100%', marginTop: '6px', marginBottom: '6px' }}
                InputProps={{
                    startAdornment: (
                        <InputAdornment position="start">
                            <Typography fontSize="1.7rem">🔎</Typography>
                        </InputAdornment>
                    ),
                }}

                value={searchValue}
                onChange={searchValueChanged}
                onKeyUp={searchKeyUp}
            />
            <Card style={{ width: '100%', height: 'calc(100% - 80px)' }}>
                <CardContent style={{ width: '100%', height: '100%' }}>

                    <Box sx={{ bgcolor: 'background.paper', display: 'flex', height: { xs: '100%', sm: '100%', md: '450px', lg: '475px', xl: '500px' } }}>
                        <Tabs
                            orientation="vertical"
                            variant="scrollable"
                            onChange={handleChangeTab}
                            aria-label="Contacts alphabetical index"
                            sx={{ borderRight: 1, borderColor: 'divider' }}
                            value={currentLetter}
                        >

                            {letters.map((idx: LetterIndexEntry) => (
                                <Tab key={'idx-' + idx.letter} value={idx.letter} disabled={idx.hash === undefined} label={idx.letter} href={idx.hash ? '#' : ''} onClick={(e: React.MouseEvent<HTMLAnchorElement>) => { e.preventDefault(); setCurrentLetter(idx.letter); if (idx.hash !== undefined) { contactElements.current[idx.hash].scrollIntoView(); } }} />
                            ))}
                        </Tabs>
                        <Box style={{ height: '100%', width: '100%', overflow: 'scroll' }} onScroll={onScroll}>
                            <List style={{ width: '100%' }}>
                                {/* <ListItem disablePadding>
                                    <ListItemButton component="a" onClick={() => { navigate('../add-contact'); }}>
                                        <ListItemIcon>
                                            <Avatar sx={{ bgcolor: 'lightblue' }} alt="Add new contact">+</Avatar>
                                        </ListItemIcon>
                                        <ListItemText primary="Add new contact" primaryTypographyProps={{ style: { textDecoration: 'underline', color: 'blue' } }} />
                                    </ListItemButton>
                                </ListItem> */}
                                <Divider />
                                {contacts.map((c: Contact) => (
                                    <ListItem
                                        disablePadding
                                        key={'contact-' + c.hash}
                                        ref={(instance: HTMLLIElement | null) => { contactElements.current[c.hash] = instance; }}
                                    // secondaryAction={c.hash !== home?.getAuthor()?.getLastHash() ? children : undefined}
                                    >
                                        <ListItemButton component="a" onClick={() => attemptSelection(c)}>
                                            <ListItemIcon>
                                                {c.picture !== undefined &&
                                                    <Avatar alt={c.name} src={c.picture} />
                                                }
                                                {c.picture === undefined &&
                                                    <Avatar alt={c.name}>{c.initials}</Avatar>
                                                }
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={<Stack direction="row" spacing={1}><Typography>{c.name}</Typography>{c.hash === home?.getAuthor()?.getLastHash() && <Chip size="small" label='You' />}</Stack>}
                                                secondary={c.code}
                                            />
                                        </ListItemButton>
                                    </ListItem>
                                ))}
                            </List>
                        </Box>
                    </Box>
                </CardContent>
            </Card>
        </Fragment>
    );
}

export default ContactSelector;
