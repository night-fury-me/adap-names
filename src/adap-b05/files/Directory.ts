import { Node } from "./Node";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";
import { InvalidStateException } from "../common/InvalidStateException";

export class Directory extends Node {

    protected childNodes: Set<Node> = new Set<Node>();

    constructor(bn: string, pn: Directory) {
        super(bn, pn);
        this.assertClassInvariant();
    }

    public hasChildNode(cn: Node): boolean {
        // Precondition: Child node cannot be null
        IllegalArgumentException.assert(cn != null, "Child node cannot be null");
        
        return this.childNodes.has(cn);
    }

    public addChildNode(cn: Node): void {
        // Precondition: Child node to add cannot be null
        IllegalArgumentException.assert(cn != null, "Child node to add cannot be null");
        
        this.childNodes.add(cn);
        
        // Postcondition: Child must be in the set
        MethodFailedException.assert(this.hasChildNode(cn), "Postcondition: Child node was not added");
        this.assertClassInvariant();
    }

    public removeChildNode(cn: Node): void {
        // Precondition: Child node to remove cannot be null
        IllegalArgumentException.assert(cn != null, "Child node to remove cannot be null");
        // Precondition: Cannot remove a child that does not exist
        IllegalArgumentException.assert(this.hasChildNode(cn), "Precondition: Cannot remove a child that does not exist");

        this.childNodes.delete(cn); 

        // Postcondition: Child must not be in the set
        MethodFailedException.assert(!this.hasChildNode(cn), "Postcondition: Child node was not removed");
        this.assertClassInvariant();
    }

    /**
     * Returns all nodes in the tree that match bn
     * @param bn basename of node being searched for
     */
    public findNodes(bn: string): Set<Node> {
        const result: Set<Node> = super.findNodes(bn);

        for (const child of this.childNodes) {
            const childResults = child.findNodes(bn);
            childResults.forEach(node => result.add(node));
        }

        return result;
    }

    protected assertClassInvariant(): void {
        super.assertClassInvariant();
        // Class Invariant: childNodes set cannot be null
        InvalidStateException.assert(this.childNodes != null, "Class Invariant: childNodes set cannot be null");
    }

}