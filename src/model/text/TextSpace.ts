import { ClassRegistry, HashedObject, Identity, MutableReference, MeshNode, Resources, SpaceEntryPoint, Types } from '@hyper-hyper-space/core';


class TextSpace extends HashedObject implements SpaceEntryPoint 
{
    
    static className = 'hhs-web/v0/Text';
    static version   = '0.0.1';

    content?: MutableReference<string>;
    name?: MutableReference<string>;
    version?: string;

    _node?: MeshNode;

    constructor() {
        super();

        this.setRandomId();

        const content = new MutableReference<string>({acceptedTypes: ['string']});
        this.addDerivedField('content', content);

        const name = new MutableReference<string>({acceptedTypes: ['string']});
        this.addDerivedField('name', name);

        this.version = TextSpace.version;
    }
    
    getClassName(): string {
        return TextSpace.className;
    }

    init(): void {
        
    }

    setAuthor(author: Identity) {
        super.setAuthor(author);
        this.content?.addWriter(author);
        this.name?.addWriter(author);
    }

    async validate(_references: Map<string, HashedObject>): Promise<boolean> {
        
        if (!(this.content instanceof MutableReference)) {
            return false;
        }

        if (this.content.hasAuthor()) {
            return false;
        }

        if (this.getAuthor() === undefined) {
            if (this.content.hasSingleWriter()) {
                return false;
            }
        } else {
            if (!this.content.hasSingleWriter() || !this.getAuthor()?.equals(this.content.getSingleWriter())) {
                return false;
            }
        }

        if (!this.content.validateAcceptedTypes(['string'])) {
            return false;
        }

        if (!this.checkDerivedField('content')) {
            return false;
        }



        if (!(this.name instanceof MutableReference)) {
            return false;
        }

        if (this.name.hasAuthor()) {
            return false;
        }

        if (this.getAuthor() === undefined) {
            if (this.name.hasSingleWriter()) {
                return false;
            }
        } else {
            if (!this.name.hasSingleWriter() || !this.getAuthor()?.equals(this.name.getSingleWriter())) {
                return false;
            }
        }

        if (!this.name.validateAcceptedTypes(['string'])) {
            return false;
        }

        if (!this.checkDerivedField('name')) {
            return false;
        }

        if (typeof(this.version) !== 'string') {
            return false;
        }

        
        return true;
    }

    getContent(): string {
        return (this.content as MutableReference<string>).getValue() as string;
    }

    setContent(content: string): void {
        (this.content as MutableReference<string>).setValue(content);
    }

    async startSync(): Promise<void> {

        await this.loadAndWatchForChanges();

        this._node = new MeshNode(this.getResources() as Resources);
        
        this._node.broadcast(this);
        this._node.sync(this);

        
    }

    async stopSync(): Promise<void> {
        this._node?.stopBroadcast(this);
        this._node?.stopSync(this);
    }

    getName() {
        return this.name;
    }

    getVersion(): string {
        return this.version as string;
    }
}

ClassRegistry.register(TextSpace.className, TextSpace);

export { TextSpace };