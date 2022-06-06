import { Hash, HashedObject, MutableSet, Resources } from '@hyper-hyper-space/core';
import { Home, SpaceLink } from '@hyper-hyper-space/home';
import { useObjectDiscoveryIfNecessary, useObjectState } from '@hyper-hyper-space/react';
import { useEffect, useState, Fragment } from 'react';
import { useParams } from 'react-router';

import { HyperBrowserConfig } from '../../model/HyperBrowserConfig';

import { TextSpace } from '../../model/text/TextSpace';


import SpaceFrameToolbar from './SpaceFrameToolbar';
import TextSpacePage from './text/TextSpacePage';

type InitParams = {hash?: Hash, resourcesForDiscovery?: Resources, knownEntryPoint?: HashedObject};

function SpaceFrame(props: {homes: MutableSet<Hash>}) {

    const params = useParams();

    const localHomesState = useObjectState(props.homes);
    
    const [homeResources, setHomeResources] = useState<Resources|undefined>(undefined);
    const [home, setHome] = useState<Home|undefined>(undefined);
    
    const homeState = useObjectState(home);

    const [initParams, setInitParams] = useState<InitParams|undefined>(undefined);

    const initResult = useObjectDiscoveryIfNecessary(initParams?.resourcesForDiscovery, initParams?.hash, initParams?.knownEntryPoint);

    const spaceEntryPointHash = decodeURIComponent(params.hash as Hash) as Hash;

    const [spaceEntryPoint, setSpaceEntryPoint] = useState<HashedObject|undefined>(undefined);
    const [spaceResources, setSpaceResources]   = useState<Resources|undefined>(undefined);

    //const [spaceComponent, setSpaceComponent] = useState<JSX.Element|undefined>(undefined);

    useEffect(() => {

        const init = async () => {

                let isSaved = false;

                if (localHomesState !== undefined && localHomesState.value !== undefined) {

                    if (localHomesState.value.size() > 0) {

                        const homeHash = localHomesState.getValue()?.values().next().value;
                        console.log('ok got home hash:' + homeHash);
                        
                        const homeResources = await HyperBrowserConfig.initHomeResources(homeHash, (e) => { console.log('ERROR'); console.log(e);}, 'worker');
                        setHomeResources(homeResources);
                        console.log('ok got home resources');
                        
                        const home = await homeResources.store.loadAndWatchForChanges(homeHash) as Home;     
                        setHome(home);
                        console.log('ok got home:')
                        console.log(home);
                        
                        if (home !== undefined) {

                            console.log('desktop:');
                            console.log(home.desktop);

                            console.log('desktop spaces:');
                            console.log(Array.from(home.desktop?._currentSpaces.values() || []));

                            console.log('entry point: ' + spaceEntryPointHash);

                            console.log('has current item:');
                            console.log(home?.desktop?.hasCurrentItemByHash(spaceEntryPointHash));

                            isSaved = home.desktop !== undefined && 
                                      home.desktop?.hasCurrentSpaceByHash(spaceEntryPointHash);
                                
                            if (isSaved) {
                                console.log(home.desktop?.currentLinksForSpace(spaceEntryPointHash));
                                const spaceLink = home.desktop?.currentLinksForSpace(spaceEntryPointHash)[0] as SpaceLink;
                                const savedSpaceResources = await HyperBrowserConfig.initSavedSpaceResources(home, spaceLink.spaceEntryPoint as HashedObject);
                                const knownEntryPoint = await savedSpaceResources.store.load(spaceEntryPointHash);
                                if (knownEntryPoint !== undefined) {
                                    setSpaceResources(savedSpaceResources);
                                    setInitParams({knownEntryPoint: knownEntryPoint});
                                } else {
                                    isSaved = false; // oooops;
                                    console.log('Space was saved, but it is missing in the corresponding store!')
                                }
                            }
                        }
                    }
                }
                            
                console.log('is saved: ' + isSaved);

                if (!isSaved) {
                    setSpaceResources(await HyperBrowserConfig.initTransientSpaceResources(spaceEntryPointHash));
                    setInitParams({hash: spaceEntryPointHash, resourcesForDiscovery: await HyperBrowserConfig.initStarterResources()});
                }

            }

        init();
    }, [localHomesState]);

    useEffect(() => {

        console.log('checking...')

        console.log(spaceResources)
        console.log(initResult)

        if (spaceResources !== undefined && initResult !== undefined) {
            console.log('initializing...');
            console.log(initResult);
            initResult?.setResources(spaceResources);
            setSpaceEntryPoint(initResult);    
        }

    }, [spaceResources, initResult]);

    /*useEffect(() => {
        if (initResult !== undefined) {

            console.log('looking up a component to show retrieved entry point')
            const spaceComponentLookup = spaceComponents.get(initResult.getClassName());

            if (spaceComponentLookup !== undefined) {
                console.log('found a component to show retrieved entry point')
                setSpaceComponent(spaceComponentLookup({entryPoint: initResult}));
            } else {
                alert('This web-based hyper browser does not support displaying spaces of type ' + initResult.getClassName());
            }

        }
    }, [initResult]);*/

    return <Fragment>
        { initResult === undefined && 
            <p>Initializing space...</p>
        }
        { initResult !== undefined &&

            <SpaceFrameToolbar home={home} spaceEntryPointHash={spaceEntryPointHash} spaceEntryPoint={spaceEntryPoint}/>
            
        }

        { spaceEntryPoint instanceof TextSpace &&
            
            <TextSpacePage entryPoint={spaceEntryPoint} />
        }
        
    </Fragment>;

}

export default SpaceFrame;