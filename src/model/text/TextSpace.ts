import { ClassRegistry, HashedObject, Identity, MutableReference, MeshNode, Resources, SpaceEntryPoint, Types } from '@hyper-hyper-space/core';


class TextSpace extends HashedObject implements SpaceEntryPoint 
{
    
    static className = 'hhs-web/v0/Text';

    content?: MutableReference<string>;

    _node?: MeshNode;

    constructor() {
        super();

        this.setRandomId();

        const content = new MutableReference<string>();
        content.typeConstraints = ['string'];

        this.addDerivedField('content', content);
    }
    
    getClassName(): string {
        return TextSpace.className;
    }

    init(): void {
        
    }

    setAuthor(author: Identity) {
        super.setAuthor(author);
        this.content?.addWriter(author);
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

        if (!Types.checkTypeConstraint(this.content.typeConstraints, ['string'])) {
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

}

ClassRegistry.register(TextSpace.className, TextSpace);

export { TextSpace };