import { HashedObject, MutableSet, Hash, ClassRegistry, RSAKeyPair, Identity, IdbBackend, Store, RSAPublicKey } from "@hyper-hyper-space/core";
import { Device, Home } from "@hyper-hyper-space/home";


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

    static async create(ownerName: string, deviceName: string, homes: MutableSet<Hash>): Promise<Home> {

        const kp: RSAKeyPair = await RSAKeyPair.generate(2048);

        const owner = Identity.fromKeyPair({name: ownerName, type: 'person'}, kp);

        const home = new Home(owner);
    
        const deviceKp: RSAKeyPair = await RSAKeyPair.generate(2048);
        const device = new Device(owner, deviceKp);

        const backend = new IdbBackend(HyperBrowserConfig.backendNameForHomeHash(home.hash()));
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

        await home.addDevice(device, true);

        await store.close();

        await homes.add(home.hash());
        await homes.saveQueuedOps();
        
        return home;

    }

    static backendNameForHomeHash(homeHash: Hash): string {
        return 'home-root-' + homeHash;
    }

}

ClassRegistry.register(HyperBrowserConfig.className, HyperBrowserConfig);

export { HyperBrowserConfig }