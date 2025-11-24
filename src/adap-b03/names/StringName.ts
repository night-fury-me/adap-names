import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

/**
 * Name implementation that stores the underlying representation as a single
 * machine-readable string where components are separated by DEFAULT_DELIMITER
 * and special characters are escaped with ESCAPE_CHARACTER.
 */
export class StringName extends AbstractName {

    protected name: string = "";
    protected noComponents: number = 0;

    constructor(source: string, delimiter?: string) {
        super(delimiter ?? DEFAULT_DELIMITER);

        if (source === null || source === undefined) {
            this.name = "";
            this.noComponents = 0;
        } else {
            this.name = source;
            this.noComponents = this.countComponentsFromDataString(this.name);
        }
    }

    public clone(): Name {
        return new StringName(this.name, this.delimiter);
    }

    public asString(delimiter: string = this.delimiter): string {
        return super.asString(delimiter);
    }

    public asDataString(): string {
        // The internal representation already is the machine readable form.
        return this.name;
    }

    public isEqual(other: Object): boolean {
        return super.isEqual(other);
    }

    public getHashCode(): number {
        return super.getHashCode();
    }

    public isEmpty(): boolean {
        return this.noComponents === 0;
    }

    public getDelimiterCharacter(): string {
        return super.getDelimiterCharacter();
    }

    public getNoComponents(): number {
        return this.noComponents;
    }

    public getComponent(i: number): string {
        if (this.noComponents === 0) {
            throw new RangeError("Name has no components");
        }
        this.assertIndexInRange(i, 0, this.noComponents - 1);

        const components = this.parseComponents();
        return components[i];
    }

    public setComponent(i: number, c: string): void {
        this.assertIndexInRange(i, 0, this.noComponents - 1);
        const components = this.parseComponents();
        components[i] = c;
        this.updateFromComponents(components);
    }

    public insert(i: number, c: string): void {
        this.assertIndexInRange(i, 0, this.noComponents, true);
        const components = this.parseComponents();
        components.splice(i, 0, c);
        this.updateFromComponents(components);
    }

    public append(c: string): void {
        this.insert(this.noComponents, c);
    }

    public remove(i: number): void {
        this.assertIndexInRange(i, 0, this.noComponents - 1);
        const components = this.parseComponents();
        components.splice(i, 1);
        this.updateFromComponents(components);
    }

    public concat(other: Name): void {
        super.concat(other);
    }

    // ---------------------------------------------------------------------
    // Internal helpers
    // ---------------------------------------------------------------------

    /**
     * Parses the internal machine-readable string into its masked components.
     */
    private parseComponents(): string[] {
        const result: string[] = [];

        if (this.name.length === 0) {
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
                current += ch; // keep the escape in the masked representation
                escaping = true;
            } else if (ch === DEFAULT_DELIMITER) {
                result.push(current);
                current = "";
            } else {
                current += ch;
            }
        }
        // push last component
        result.push(current);

        return result;
    }

    /**
     * Rebuilds the internal string and component count from an array of
     * masked components.
     */
    private updateFromComponents(components: string[]): void {
        if (components.length === 0) {
            this.name = "";
            this.noComponents = 0;
        } else {
            this.name = components.join(DEFAULT_DELIMITER);
            this.noComponents = components.length;
        }
    }

    /**
     * Counts components in a data string, respecting escaped delimiter
     * characters.
     */
    private countComponentsFromDataString(source: string): number {
        if (source.length === 0) {
            return 0;
        }

        let count = 1; // at least one component if string not empty
        let escaping = false;

        for (let i = 0; i < source.length; i++) {
            const ch = source.charAt(i);

            if (escaping) {
                escaping = false;
            } else if (ch === ESCAPE_CHARACTER) {
                escaping = true;
            } else if (ch === DEFAULT_DELIMITER) {
                count++;
            }
        }

        if (escaping) {
            throw new RangeError("Invalid escaped data string: " + source);
        }

        return count;
    }

    private assertIndexInRange(
        index: number,
        minInclusive: number,
        maxInclusive: number,
        allowEqualMaxPlusOne: boolean = false
    ): void {
        const upper = allowEqualMaxPlusOne ? maxInclusive + 1 : maxInclusive;
        if (index < minInclusive || index > upper) {
            throw new RangeError(`Index ${index} out of range [${minInclusive}, ${upper}]`);
        }
    }
}
