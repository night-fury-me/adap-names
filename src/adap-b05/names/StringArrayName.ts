import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { MethodFailedException } from "../common/MethodFailedException";
import { InvalidStateException } from "../common/InvalidStateException";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter?: string) {
        super(delimiter);
        // Precondition: Source array must not be null
        IllegalArgumentException.assert(source != null, "Source components array cannot be null");
        
        this.components = source.slice();
        
        this.checkClassInvariant();
    }

    public clone(): Name {
        return new StringArrayName(this.components.slice(), this.delimiter);
    }

    public asDataString(): string {
        return super.asDataString();
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        // Precondition: Index must be in range
        this.assertIndexInRange(i, 0, this.components.length - 1);
        
        return this.components[i];
    }

    public setComponent(i: number, c: string): void {
        // Precondition: Index must be in range
        this.assertIndexInRange(i, 0, this.components.length - 1);
        // Precondition: Component cannot be null
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        this.components[i] = c;
        
        this.checkClassInvariant();
    }

    public insert(i: number, c: string): void {
        // Precondition: Index must be in range (allow appending at the end)
        this.assertIndexInRange(i, 0, this.components.length, true); 
        // Precondition: Component cannot be null
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const oldLength = this.components.length;
        this.components.splice(i, 0, c);

        // Postcondition: Length must increase by 1
        MethodFailedException.assert(this.components.length === oldLength + 1, "Postcondition: Component count did not increment");
        this.checkClassInvariant();
    }

    public append(c: string): void {
        this.insert(this.components.length, c);
    }

    public remove(i: number): void {
        // Precondition: Index must be in range
        this.assertIndexInRange(i, 0, this.components.length - 1);

        const oldLength = this.components.length;
        this.components.splice(i, 1);

        // Postcondition: Length must decrease by 1
        MethodFailedException.assert(this.components.length === oldLength - 1, "Postcondition: Component count did not decrement");
        this.checkClassInvariant();
    }

    public concat(other: Name): void {
        super.concat(other);
    }

    // ---------------------------------------------------------------------
    // Contract Helper
    // ---------------------------------------------------------------------

    protected checkClassInvariant(): void {
        super.checkClassInvariant();
        // Invariant: components array must never be null
        InvalidStateException.assert(this.components != null, "Class Invariant: components array is null");
    }
}