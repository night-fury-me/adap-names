import { Node } from "./Node";
import { Directory } from "./Directory";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";

export class Link extends Node {

    protected targetNode: Node | null = null;

    constructor(bn: string, pn: Directory, tn?: Node) {
        super(bn, pn);

        if (tn != undefined) {
            this.targetNode = tn;
        }
        this.assertClassInvariant();
    }

    public getTargetNode(): Node | null {
        return this.targetNode;
    }

    public setTargetNode(target: Node): void {
        // Precondition: Target must not be null
        IllegalArgumentException.assert(target != null, "Target node cannot be null");
        this.targetNode = target;
        
        this.assertClassInvariant();
    }

    public getBaseName(): string {
        const target = this.ensureTargetNode(this.targetNode);
        return target.getBaseName();
    }

    public rename(bn: string): void {
        const target = this.ensureTargetNode(this.targetNode);
        target.rename(bn);
    }

    /**
     * Helper to ensure target is valid before delegating operations
     */
    protected ensureTargetNode(target: Node | null): Node {
        // Contract: Operations requiring a target must fail if the link is broken
        InvalidStateException.assert(target != null, "Invalid State: Link target is not set (broken link)");
        
        return target as Node;
    }

    /**
     * Returns all nodes in the tree that match bn.
     * Based on standard file system behavior `find` usually matches the link name.
     */
    public findNodes(bn: string): Set<Node> {
        return super.findNodes(bn);
    }

    protected assertClassInvariant(): void {
        super.assertClassInvariant();
    }
}