import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";

import { Name } from "../names/Name";
import { Directory } from "./Directory";

export class Node {

    protected baseName: string = "";
    protected parentNode: Directory;

    constructor(bn: string, pn: Directory) {
        this.doSetBaseName(bn);
        this.parentNode = pn; 
        this.initialize(pn);
    }

    protected initialize(pn: Directory): void {
        this.parentNode = pn;
        this.parentNode.addChildNode(this);
    }

    public move(to: Directory): void {
        // Precondition: Target directory cannot be null
        IllegalArgumentException.assert(to != null, "Target directory cannot be null");

        // Case: Cycle Detection
        // Ensures 'to' is not 'this' or a descendant of 'this'
        let current: Directory = to;
        while (current != null) {
            if (current === (this as any)) {
                IllegalArgumentException.assert(false, "Precondition: Cannot move a node into itself or its descendants");
            }
            const parent = current.getParentNode();
            if (current === parent) {
                break;
            }
            current = parent;
        }

        this.parentNode.removeChildNode(this);
        to.addChildNode(this);
        this.parentNode = to;

        this.assertClassInvariant();
    }

    public getFullName(): Name {
        const result: Name = this.parentNode.getFullName();
        result.append(this.getBaseName());
        return result;
    }

    public getBaseName(): string {
        const bn = this.doGetBaseName();
        // Invariant Check: Ensure state is still valid after retrieval
        this.assertClassInvariant(); 
        return bn;
    }

    protected doGetBaseName(): string {
        return this.baseName;
    }

    public rename(bn: string): void {
        // Precondition: New name cannot be null or empty
        IllegalArgumentException.assert(bn != null && bn !== "", "New base name cannot be null or empty");

        this.doSetBaseName(bn);

        this.assertClassInvariant();
    }

    protected doSetBaseName(bn: string): void {
        this.baseName = bn;
    }

    public getParentNode(): Directory {
        return this.parentNode;
    }

    /**
     * Returns all nodes in the tree that match bn
     * @param bn basename of node being searched for
     */
    public findNodes(bn: string): Set<Node> {
        // Precondition: Search basename cannot be null or empty
        IllegalArgumentException.assert(bn != null && bn !== "", "Search basename cannot be null or empty");

        const result: Set<Node> = new Set<Node>();

        if (this.getBaseName() === bn) {
            result.add(this);
        }

        return result;
    }

    protected assertClassInvariant(): void {
        // Class Invariant: Node must have a parent (except Root) and a valid name
        InvalidStateException.assert(this.parentNode != undefined, "Class Invariant: Node must have a parent");
        InvalidStateException.assert(this.baseName != null, "Class Invariant: Base name must not be null");
        
        // RootNode Check: Root is the only node where parentNode === this.
        // All other nodes must have a non-empty baseName.
        if (!Object.is(this.parentNode, this)) {
            InvalidStateException.assert(this.baseName !== "", "Class Invariant: Base name cannot be empty");
        }
    }

}