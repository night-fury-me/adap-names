import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { MethodFailedException } from "../common/MethodFailedException";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter);
        IllegalArgumentException.assert(source != null, "Source string cannot be null");

        this.name = source;
        this.noComponents = this.countComponentsFromDataString(this.name);

        this.checkClassInvariant();
    }

    public clone(): Name {
        return new StringName(this.name, this.delimiter);
    }

    public asDataString(): string {
        return this.name;
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(i: number): string {
        this.assertIndexInRange(i, 0, this.noComponents - 1);

        const components = this.parseComponents();
        return components[i];
    }

    public setComponent(i: number, c: string): void {
        this.assertIndexInRange(i, 0, this.noComponents - 1);
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const components = this.parseComponents();
        components[i] = c;
        this.updateFromComponents(components);

        this.checkClassInvariant();
    }

    public insert(i: number, c: string): void {
        this.assertIndexInRange(i, 0, this.noComponents, true); // Allow insertion at end
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const oldNoComponents = this.noComponents;
        const components = this.parseComponents();
        components.splice(i, 0, c);
        this.updateFromComponents(components);

        // Postcondition: Count must increase by 1
        MethodFailedException.assert(this.noComponents === oldNoComponents + 1, "Postcondition: Component count did not increment");
        this.checkClassInvariant();
    }

    public append(c: string): void {
        this.insert(this.noComponents, c);
    }

    public remove(i: number): void {
        this.assertIndexInRange(i, 0, this.noComponents - 1);

        const oldNoComponents = this.noComponents;
        const components = this.parseComponents();
        components.splice(i, 1);
        this.updateFromComponents(components);

        // Postcondition: Count must decrease by 1
        MethodFailedException.assert(this.noComponents === oldNoComponents - 1, "Postcondition: Component count did not decrement");
        this.checkClassInvariant();
    }

    // ---------------------------------------------------------------------
    // Contract Helper
    // ---------------------------------------------------------------------

    protected checkClassInvariant(): void {
        super.checkClassInvariant();
        // Check that the cached count matches the actual parsed count
        const calculatedCount = this.countComponentsFromDataString(this.name);
        InvalidStateException.assert(this.noComponents === calculatedCount, "Class Invariant: Component count mismatch");
    }

    // ---------------------------------------------------------------------
    // Internal helpers (Adapted from B03)
    // ---------------------------------------------------------------------

    private parseComponents(): string[] {
        const result: string[] = [];
        if (this.name.length === 0 && this.noComponents === 0) {
            return result;
        }

        let current = "";
        let escaping = false;

        for (let i = 0; i < this.name.length; i++) {
            const ch = this.name.charAt(i);
            if (escaping) {
                current += ch;
                escaping = false;
            } else if (ch === ESCAPE_CHARACTER) {
                current += ch;
                escaping = true;
            } else if (ch === this.delimiter) {
                result.push(current);
                current = "";
            } else {
                current += ch;
            }
        }
        result.push(current);
        return result;
    }

    private updateFromComponents(components: string[]): void {
        if (components.length === 0) {
            this.name = "";
            this.noComponents = 0;
        } else {
            this.name = components.join(this.delimiter);
            this.noComponents = components.length;
        }
    }

    private countComponentsFromDataString(source: string): number {
        if (source.length === 0) {
            return 0;
        }

        let count = 1;
        let escaping = false;

        for (let i = 0; i < source.length; i++) {
            const ch = source.charAt(i);
            if (escaping) {
                escaping = false;
            } else if (ch === ESCAPE_CHARACTER) {
                escaping = true;
            } else if (ch === this.delimiter) {
                count++;
            }
        }
        
        // Invariant: Data string must not end with a dangling escape
        InvalidStateException.assert(!escaping, "Invalid data string: dangling escape character");

        return count;
    }
}