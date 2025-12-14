import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";

export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);
        // Precondition: Source string cannot be null
        IllegalArgumentException.assert(source != null, "Source string cannot be null");

        this.name = source;
        this.noComponents = this.countComponentsFromDataString(this.name);
    }

    public clone(): Name {
        return new StringName(this.name, this.delimiter);
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(i: number): string {
        this.assertIndexInRange(i, 0, this.noComponents - 1);
        const components = this.parseComponents();
        return components[i];
    }

    public setComponent(i: number, c: string): Name {
        this.assertIndexInRange(i, 0, this.noComponents - 1);
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const components = this.parseComponents();
        components[i] = c;
        
        return this.createNameFromComponents(components);
    }

    public insert(i: number, c: string): Name {
        this.assertIndexInRange(i, 0, this.noComponents, true); // Allow index == noComponents for append
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const components = this.parseComponents();
        components.splice(i, 0, c);

        return this.createNameFromComponents(components);
    }

    public append(c: string): Name {
        return this.insert(this.noComponents, c);
    }

    public remove(i: number): Name {
        this.assertIndexInRange(i, 0, this.noComponents - 1);

        const components = this.parseComponents();
        components.splice(i, 1);

        return this.createNameFromComponents(components);
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    private createNameFromComponents(components: string[]): StringName {
        let newNameString = "";
        if (components.length > 0) {
            newNameString = components.join(this.delimiter);
        }
        return new StringName(newNameString, this.delimiter);
    }

    private parseComponents(): string[] {
        const result: string[] = [];
        // Handle empty name case
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