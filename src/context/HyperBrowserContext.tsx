import { Hash, MutableSet, Store } from '@hyper-hyper-space/core';
import { ObjectState } from '@hyper-hyper-space/react';
import { createContext, useContext, ReactNode } from 'react';


type HyperBrowserContextParams = {
    config: Store;
    homes: ObjectState<MutableSet<Hash>>;
}

const HyperBrowserContext = createContext<HyperBrowserContextParams>(undefined as any as HyperBrowserContextParams);


function HyperBrowserEnv(props: {config: Store, homes: ObjectState<MutableSet<Hash>>, children: ReactNode}) {
    return (
        <HyperBrowserContext.Provider value={{config: props.config, homes: props.homes}}>
            {props.children}
        </HyperBrowserContext.Provider>
    );
}

const useHyperBrowserEnv: () => HyperBrowserContextParams = () => {
    return useContext(HyperBrowserContext);
}

export default HyperBrowserEnv;
export { useHyperBrowserEnv }