import { HashedObject, MutableSet, Hash, ClassRegistry, RSAKeyPair, Identity, Store, WorkerSafeIdbBackend, Resources, WebWorkerMeshProxy, Mesh } from '@hyper-hyper-space/core';
import { Device, Home } from '@hyper-hyper-space/home';

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

    static async create(ownerInfo: any, deviceName: string, homes: MutableSet<Hash>, kp?: RSAKeyPair): Promise<Home> {

        if (kp === undefined) {
            kp = await RSAKeyPair.generate(2048);
        }

        const owner = Identity.fromKeyPair(ownerInfo, kp);

        console.log('owner hash is ')
        console.log(owner.hash())

        const home = new Home(owner);

        console.log('home hash is')
        console.log(home.hash())
    
        const deviceKp: RSAKeyPair = await RSAKeyPair.generate(2048);
        const device = new Device(owner, deviceKp.makePublicKey());

        await device.name?.setValue(deviceName);

        const backend = new WorkerSafeIdbBackend(HyperBrowserConfig.backendNameForHomeHash(home.hash()));
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

    static backendNameForHomeHash(homeHash: Hash): string {
        return 'home-root-' + homeHash;
    }

    static async initHomeResources(homeHash: Hash, setLoadError: (err: string) => void, mode:('worker'|'normal')='normal') {
        const backend = new WorkerSafeIdbBackend(HyperBrowserConfig.backendNameForHomeHash(homeHash));
    
        try {
            console.log('Initializing storage backend for home space ' + homeHash + '...');
            await backend.ready();
            console.log('Storage backend for home space ready');
        } catch (e: any) {
            console.log('Error initializing storage backend for starter page');
            setLoadError('Error initializing storage backend: ' + e.toString());
        }

        //const worker = new WebWorker();

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

    
        const store = new Store(backend);
        //const mesh = new Mesh();
    
        const resources = await Resources.create({mesh: mesh, store: store});

        store.setResources(resources);
    
        return resources;
    }

}

ClassRegistry.register(HyperBrowserConfig.className, HyperBrowserConfig);

export { HyperBrowserConfig }