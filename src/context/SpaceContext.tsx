import { Hash, HashedObject, Resources } from '@hyper-hyper-space/core';
import { createContext, ReactNode } from 'react';
import { useContext } from 'react-transition-group/node_modules/@types/react';


type SpaceContextParams = {
    hash: Hash;
    entryPoint: HashedObject;
    resources: Resources;
}

const SpaceContext = createContext<SpaceContextParams>(undefined as any as SpaceContextParams);

function SpaceContextEnv(props: {hash: Hash, entryPoint: HashedObject, resources: Resources, children: ReactNode}) {
    return (
        <SpaceContext.Provider value={{hash: props.hash, entryPoint: props.entryPoint, resources: props.resources}}>
            {props.children}
        </SpaceContext.Provider>
    );
}

const useSpaceEnv: () => SpaceContextParams = () => {
    return useContext(SpaceContext);
}

export default SpaceContextEnv;
export { useSpaceEnv };