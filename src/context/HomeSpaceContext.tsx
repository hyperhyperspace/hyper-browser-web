import { Hash, MutableSet, Resources, Store } from '@hyper-hyper-space/core';
import { Home } from '@hyper-hyper-space/home';
import { StateObject } from '@hyper-hyper-space/react';
import { createContext, useContext, ReactNode } from 'react';


type HomeSpaceContextParams = {
    resources: Resources;
    home: StateObject<Home>;
}

const HomeSpaceContext = createContext<HomeSpaceContextParams>(undefined as any as HomeSpaceContextParams);


function HomeSpaceEnv(props: {resources: Resources, home: StateObject<Home>, children: ReactNode}) {
    return (
        <HomeSpaceContext.Provider value={{resources: props.resources, home: props.home}}>
            {props.children}
        </HomeSpaceContext.Provider>
    );
}

const useHomeSpaceEnv: () => HomeSpaceContextParams = () => {
    return useContext(HomeSpaceContext);
}

export default HomeSpaceEnv;
export { useHomeSpaceEnv }