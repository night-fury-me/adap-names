import { Name } from "../names/Name";
import { StringName } from "../names/StringName";
import { Directory } from "./Directory";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

export class RootNode extends Directory {

    protected static ROOT_NODE: RootNode = new RootNode();

    public static getRootNode() {
        return this.ROOT_NODE;
    }

    constructor() {
        super("", new Object as Directory);
    }

    protected initialize(pn: Directory): void {
        // Root is its own parent
        this.parentNode = this;
    }

    public getFullName(): Name {
        return new StringName("", '/');
    }

    public move(to: Directory): void {
        // Precondition: Root cannot be moved
        IllegalArgumentException.assert(false, "Root node cannot be moved");
    }

    protected doSetBaseName(bn: string): void {
        // Precondition: Root cannot be renamed 
        IllegalArgumentException.assert(bn === "", "Root node cannot be renamed");
    }

}