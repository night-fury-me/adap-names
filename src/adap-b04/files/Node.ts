import { Name } from "../names/Name";
import { Directory } from "./Directory";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";

export class Node {

    protected baseName: string = "";
    protected parentNode: Directory;

    constructor(bn: string, pn: Directory) {
        // Precondition: Parent cannot be null 
        IllegalArgumentException.assert(pn != null, "Parent node cannot be null");
        IllegalArgumentException.assert(bn != null, "Base name cannot be null");

        this.doSetBaseName(bn);
        this.parentNode = pn; 
        this.initialize(pn);

        this.assertClassInvariant();
    }

    protected initialize(pn: Directory): void {
        this.parentNode = pn;
        this.parentNode.addChildNode(this);
    }

    public move(to: Directory): void {
        IllegalArgumentException.assert(to != null, "Target directory cannot be null");

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
        return this.doGetBaseName();
    }

    protected doGetBaseName(): string {
        return this.baseName;
    }

    public rename(bn: string): void {
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

    protected assertClassInvariant(): void {
        InvalidStateException.assert(this.parentNode != null, "Class Invariant: Node must have a parent");
        InvalidStateException.assert(this.baseName != null, "Class Invariant: Base name must not be null");
    }

}