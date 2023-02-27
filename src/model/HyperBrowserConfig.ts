import { HashedObject, MutableSet, Hash, ClassRegistry, RSAKeyPair, Identity, WorkerSafeIdbBackend, Resources, WebWorkerMeshProxy, Mesh, Store, Backend, MemoryBackend, IdbBackend, MemoryBackendHost } from '@hyper-hyper-space/core';
import { Device, Home, SpaceLink } from '@hyper-hyper-space/home';

//yadda yadda import / no - webpack - loader - syntax

/* eslint-disable-next-line  */
//import WebWorker from '../mesh.worker';

//const x = WebWorker;

class HyperBrowserConfig extends HashedObject {

    static className = 'hyper-browser-web/HyperBrowserConfig';
    static id = 'there can be only one';

    homes?: MutableSet<Hash>;

    constructor() {
        super();

        this.setId(HyperBrowserConfig.id);
        this.addDerivedField('homes', new MutableSet());

    }

    getClassName(): string {
        return HyperBrowserConfig.className;
    }
    init(): void {
        
    }
    
    async validate(_references: Map<string, HashedObject>): Promise<boolean> {

        return this.getId() === HyperBrowserConfig.id && this.checkDerivedField('homes');
    }

    static async createHome(ownerInfo: any, deviceName: string, homes: MutableSet<Hash>, kp?: RSAKeyPair): Promise<Home> {

        if (kp === undefined) {
            kp = await RSAKeyPair.generate(2048);
        }

        const owner = Identity.fromKeyPair(ownerInfo, kp);

        console.log('owner hash is ')
        console.log(owner.hash())

        const home = new Home(owner);

        home.contacts?.profileIsPublic?.setValue(true);

        console.log('home hash is')
        console.log(home.hash())
    
        const deviceKp: RSAKeyPair = await RSAKeyPair.generate(2048);
        const device = new Device(owner, deviceKp.makePublicKey());

        await device.name?.setValue(deviceName);

        const backend = new WorkerSafeIdbBackend(HyperBrowserConfig.backendNameForHome(home.hash()));
        let dbBackendError: (string|undefined) = undefined;

        try {
            console.log('Initializing storage backend for starter page...');
            await backend.ready();
            console.log('Storage backend for starter page ready');
        } catch (e: any) {
            dbBackendError = e.toString();
        }
  

        const store = new Store(backend);
        await store.save(kp);
        
        await store.save(home);

        await store.save(deviceKp);
        await store.save(device);

        await home.addDevice(device, true);

        home.forgetResources();

        await store.close();


        await homes.add(home.hash());
        await homes.saveQueuedOps();
        
        return home;

    }

    static async initHomeStore(homeHash: Hash, setLoadError: (err: string) => void): Promise<Store> {
        const backend = new WorkerSafeIdbBackend(HyperBrowserConfig.backendNameForHome(homeHash));
    
        try {
            console.log('Initializing storage backend for home space ' + homeHash + '...');
            await backend.ready();
            console.log('Storage backend for home space ready');
        } catch (e: any) {
            console.log('Error initializing storage backend for starter page');
            setLoadError('Error initializing storage backend: ' + e.toString());
        }

        return new Store(backend);
    }

    static async initHomeResources(homeHash: Hash, setLoadError: (err: string) => void, mode:('worker'|'normal')='normal'): Promise<Resources> {

        const store = await this.initHomeStore(homeHash, setLoadError);

        let mesh: Mesh;

        if (mode === 'worker') {
            //const url    = new URL('../mesh.worker', import.meta.url);

            //console.log(import.meta.url);
            //console.log(url);
            
            const worker = new Worker(new URL('../mesh.worker', import.meta.url));

            const webWorkerMesh = new WebWorkerMeshProxy(worker);
    
            await webWorkerMesh.ready; // The MeshHost in the web worker will send a message once it is fully
                                       // operational. We don't want to send any control messages before that,
                                       // so we'll wait here until we get the 'go' message from the MeshHost.

            mesh = webWorkerMesh.getMesh();
        } else {
            mesh = new Mesh();
        }
    
        const resources = await Resources.create({mesh: mesh, store: store});

        store.setResources(resources);
    
        return resources;
    }

    static backendNameForHome(homeHash: Hash): string {
        return 'home-' + homeHash;
    }

    static backendNameForSpace(homeHash: Hash, spaceHash: Hash) {
        return 'space-' + spaceHash + '-in-' + homeHash;
    }

    static backendNameForTransientSpace(spaceHash: Hash) {
        return 'transient-space-' + spaceHash;
    }

    /*static async createSpaceStore(homeHash: Hash, entryPoint: HashedObject): Promise<Store> {
        const spaceHash = entryPoint.hash();

        const backend = new WorkerSafeIdbBackend(HyperBrowserConfig.backendNameForSpace(homeHash, spaceHash));

        await backend.ready();

        const store = new Store(backend);

        await store.save(entryPoint);

        return store;
    }*/

    //static async initSpaceResources(homeHash: Hash, spaceHash: Hash) {
    //    let backend = new WorkerSafeIdbBackend(HyperBrowserConfig.backendNameForSpace(homeHash, spaceHash));
    //}

    static async savedSpaceStoreExists(homeHash: Hash, spaceEntryPointHash: Hash) {

        const backendName = HyperBrowserConfig.backendNameForSpace(homeHash, spaceEntryPointHash);

        return IdbBackend.exists(backendName);
    }

    static async initSavedSpaceMesh(homeHash: Hash, spaceHash: Hash): Promise<Mesh> {
        const worker = new Worker(new URL('../mesh.worker', import.meta.url));

        const webWorkerMesh = new WebWorkerMeshProxy(worker);
    
        await webWorkerMesh.ready; // The MeshHost in the web worker will send a message once it is fully
                                   // operational. We don't want to send any control messages before that,
                                   // so we'll wait here until we get the 'go' message from the MeshHost.

        const mesh = webWorkerMesh.getMesh();

        return mesh;
    }

    static async initSavedSpaceStore(home: Home|Hash, spaceEntryPoint: HashedObject|Hash): Promise<Store> {

        const homeHash            = home instanceof Home? home.getLastHash() : home;
        const spaceEntryPointHash = spaceEntryPoint instanceof HashedObject? spaceEntryPoint.getLastHash() : spaceEntryPoint

        const backend = new WorkerSafeIdbBackend(HyperBrowserConfig.backendNameForSpace(homeHash, spaceEntryPointHash));
        const store = new Store(backend);

        if (spaceEntryPoint instanceof HashedObject) {
            await store.save(spaceEntryPoint)
        }

        if (home instanceof Home) {
            await store.save((home.getAuthor() as Identity).getKeyPair())
        }

        return store;
    }

    static async initSavedSpaceResources(home: Home|Hash, spaceEntryPoint: HashedObject|Hash): Promise<Resources> {

        const homeHash            = home instanceof Home? home.getLastHash() : home;
        const spaceEntryPointHash = spaceEntryPoint instanceof HashedObject? spaceEntryPoint.getLastHash() : spaceEntryPoint


        const mesh  = await HyperBrowserConfig.initSavedSpaceMesh(homeHash, spaceEntryPointHash);
        const store = await HyperBrowserConfig.initSavedSpaceStore(home, spaceEntryPoint);
    
        const resources = await Resources.create({mesh: mesh, store: store});

        store.setResources(resources);
    
        return resources;
    }

    static async initTransientSpaceResources(spaceHash: Hash, entryPoint?: HashedObject): Promise<Resources> {

        const backend = new MemoryBackendHost(HyperBrowserConfig.backendNameForTransientSpace(spaceHash));

        //const backend = new MemoryBackend(HyperBrowserConfig.backendNameForTransientSpace(spaceHash));

        const store = new Store(backend.getProxy());
            
        const worker = new Worker(new URL('../mesh.worker', import.meta.url));

        const webWorkerMesh = new WebWorkerMeshProxy(worker);

        await webWorkerMesh.ready; // The MeshHost in the web worker will send a message once it is fully
                                    // operational. We don't want to send any control messages before that,
                                    // so we'll wait here until we get the 'go' message from the MeshHost.

        const mesh = webWorkerMesh.getMesh();
        
        const resources = await Resources.create({mesh: mesh, store: store});

        store.setResources(resources);
    
        return resources;
    }


    

    static async initStarterResources() {
        const backend = new WorkerSafeIdbBackend('start-page');
        let dbBackendError: (string|undefined) = undefined;
    
    
        try {
            console.log('Initializing storage backend for starter page...');
            await backend.ready();
            console.log('Storage backend for starter page ready');
        } catch (e: any) {
            dbBackendError = e.toString();
            console.log('Error initializing storage backend for starter page');
            throw new Error(dbBackendError);
        }
      
    
        const store = new Store(backend);
        const mesh = new Mesh();
    
        const resources = await Resources.create({mesh: mesh, store: store});
    
        return resources;
    }

}

ClassRegistry.register(HyperBrowserConfig.className, HyperBrowserConfig);

export { HyperBrowserConfig }