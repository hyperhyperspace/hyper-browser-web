import { Hash, HashedObject, IdbBackend, Identity, MutableSet, Resources, SpaceEntryPoint } from '@hyper-hyper-space/core';
import { Home, SpaceLink } from '@hyper-hyper-space/home';
import { useObjectDiscoveryIfNecessary, useObjectState } from '@hyper-hyper-space/react';
import { WikiSpace } from '@hyper-hyper-space/wiki-collab';
import { useEffect, useState, Fragment } from 'react';
import { Outlet, useOutletContext, useParams } from 'react-router';
import { start } from 'repl';

import { HyperBrowserConfig } from '../../model/HyperBrowserConfig';

import { TextSpace } from '../../model/text/TextSpace';


import SpaceFrameToolbar from './SpaceFrameToolbar';
import TextSpacePage from './text/TextSpacePage';
import WikiSpaceView from './wiki/WikiSpaceView';

type InitParams = {hash?: Hash, resourcesForDiscovery?: Resources, knownEntryPoint?: HashedObject & SpaceEntryPoint};

type SpaceContext = {
    entryPoint?: HashedObject;
    resources?: Resources;
    home?:  Home;
    homeResources?: Resources;
};

function SpaceFrame(props: {homes: MutableSet<Hash>}) {

    const params = useParams();

    //const localHomesState = useObjectState(props.homes);
    
    const [foundLocalCopy, setFoundLocalCopy] = useState<boolean>(false);
    const [homeHash, setHomeHash] = useState<Hash>();
    const [home, setHome] = useState<Home|undefined>(undefined);

    const [initParams, setInitParams] = useState<InitParams|undefined>(undefined);

    const initResult = useObjectDiscoveryIfNecessary<HashedObject & SpaceEntryPoint>(initParams?.resourcesForDiscovery, initParams?.hash, initParams?.knownEntryPoint);

    const spaceEntryPointHash = decodeURIComponent(params.hash as Hash) as Hash;

    const [spaceEntryPoint, setSpaceEntryPoint] = useState<HashedObject & SpaceEntryPoint|undefined>(undefined);
    const [spaceResources, setSpaceResources]   = useState<Resources|undefined>(undefined);
    const [homeResources, setHomeResources]   = useState<Resources|undefined>(undefined);

    //const [spaceComponent, setSpaceComponent] = useState<JSX.Element|undefined>(undefined);

    useEffect(() => {

        let isSaved = false;

        let homeResources: Resources|undefined;
        let home: Home|undefined;

        let savedSpaceResources: Resources|undefined;

        let transientSpaceResources: Resources|undefined;
        let starterResources: Resources|undefined;

        const init = async () => {

            if (props.homes.size() > 0) {

                const homeHash = props.homes.values().next().value as string;
                setHomeHash(homeHash);
                console.log('ok got home hash:' + homeHash);
                
                const homeStore = await HyperBrowserConfig.initHomeStore(homeHash, (err: string) => console.log('Error initializing home store from SpaceFrame: ', err));
                setHome(await homeStore.load(homeHash, false));
                homeStore.close();

                homeResources = await HyperBrowserConfig.initHomeResources(homeHash, (e) => { console.log('ERROR'); console.log(e);}, 'worker');
                setHomeResources(homeResources);
                console.log('ok got home resources');
                
                home = await homeResources.store.loadAndWatchForChanges(homeHash) as Home;     
                setHome(home);

                isSaved = await HyperBrowserConfig.savedSpaceStoreExists(homeHash, spaceEntryPointHash);

                if (isSaved) {
                    savedSpaceResources = await HyperBrowserConfig.initSavedSpaceResources(homeHash, spaceEntryPointHash);
                    const knownEntryPoint = await savedSpaceResources.store.load<HashedObject & SpaceEntryPoint>(spaceEntryPointHash, false);
                    if (knownEntryPoint !== undefined) {
                        setSpaceResources(savedSpaceResources);
                        setInitParams({knownEntryPoint: knownEntryPoint});
                    } else {
                        isSaved = false; // oooops;
                        console.log('Space was saved, but it is missing in the corresponding store!')
                    }
                }
            }
        
                
            setFoundLocalCopy(isSaved);
            console.log('is saved: ' + isSaved);

            if (!isSaved) {

                transientSpaceResources = await HyperBrowserConfig.initTransientSpaceResources(spaceEntryPointHash)
                setSpaceResources(transientSpaceResources);

                starterResources = await HyperBrowserConfig.initStarterResources();
                setInitParams({hash: spaceEntryPointHash, resourcesForDiscovery: starterResources});
            }

        }

        init();

        return () => {
            homeResources?.mesh.shutdown();
            homeResources?.store.close();

            home?.dontWatchForChanges();

            savedSpaceResources?.mesh.shutdown();
            savedSpaceResources?.store.close();

            transientSpaceResources?.mesh.shutdown();
            transientSpaceResources?.store.close();

            starterResources?.mesh.shutdown();
            starterResources?.store.close();
        }
    }, []);

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

    const spaceContext: SpaceContext = {
        entryPoint: spaceEntryPoint,
        resources: spaceResources,
        home: home,
        homeResources: homeResources
    }

    return <Fragment>
        { initResult === undefined && 
            <p>Initializing space...</p>
        }
        { initResult !== undefined &&

            <SpaceFrameToolbar home={home || homeHash} spaceEntryPointHash={spaceEntryPointHash} spaceEntryPoint={spaceEntryPoint} foundLocalCopy={foundLocalCopy}/>
            
        }
        
        <Outlet context={spaceContext} />

    </Fragment>;

}

export const SpaceComponent = () => {
        const {entryPoint} = useOutletContext() as SpaceContext;
        if (entryPoint instanceof TextSpace) {
            return <TextSpacePage entryPoint={entryPoint} />
        } else if ( entryPoint instanceof WikiSpace ){
            return <WikiSpaceView entryPoint={entryPoint}/>
        } else {
            return <Fragment/>
        }
    }

export type { SpaceContext };

export default SpaceFrame;