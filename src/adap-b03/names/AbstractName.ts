import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

/**
 * Common functionality shared by all Name implementations.
 *
 * Subclasses only have to implement component level access/mutation methods:
 *   - getNoComponents
 *   - getComponent / setComponent
 *   - insert / append / remove
 *
 * The abstract class then provides all higher–level behaviour such as
 * pretty printing, data serialisation, equality and hashing.
 */
export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        this.assertValidDelimiter(delimiter);
        this.delimiter = delimiter;
    }

    /**
     * Subclasses are expected to implement a proper clone that returns an
     * instance of their own concrete type. Keeping this method here avoids
     * having to change the Name interface.
     */
    public abstract clone(): Name;

    /**
     * Human-readable representation. Uses the instance's delimiter by default
     * but can be overridden by the caller.
     *
     * Control characters are NOT escaped.
     */
    public asString(delimiter: string = this.delimiter): string {
        const n = this.getNoComponents();
        if (n === 0) {
            return "";
        }

        const parts: string[] = [];
        for (let i = 0; i < n; i++) {
            const masked = this.getComponent(i);
            parts.push(this.unescapeComponent(masked));
        }
        return parts.join(delimiter);
    }

    public toString(): string {
        return this.asDataString();
    }

    /**
     * Machine-readable representation.
     *
     * Uses the DEFAULT_DELIMITER and keeps control characters escaped so that
     * the resulting string can be parsed back into a Name instance.
     */
    public asDataString(): string {
        const n = this.getNoComponents();
        if (n === 0) {
            return "";
        }

        const parts: string[] = [];
        for (let i = 0; i < n; i++) {
            parts.push(this.getComponent(i)); // components are stored masked
        }
        return parts.join(DEFAULT_DELIMITER);
    }

    public isEqual(other: Object): boolean {
        if (other === null || other === undefined) {
            return false;
        }

        // Perform a structural check first
        const otherName = other as Name;
        if (typeof (otherName as any).getNoComponents !== "function" ||
            typeof (otherName as any).getComponent !== "function" ||
            typeof (otherName as any).getDelimiterCharacter !== "function") {
            return false;
        }

        if (this.getDelimiterCharacter() !== otherName.getDelimiterCharacter()) {
            return false;
        }

        const n = this.getNoComponents();
        if (n !== otherName.getNoComponents()) {
            return false;
        }

        for (let i = 0; i < n; i++) {
            if (this.getComponent(i) !== otherName.getComponent(i)) {
                return false;
            }
        }
        return true;
    }

    public getHashCode(): number {
        let hash = 17;
        hash = this.mixHash(hash, this.delimiter.charCodeAt(0));

        const n = this.getNoComponents();
        for (let i = 0; i < n; i++) {
            const comp = this.getComponent(i);
            for (let j = 0; j < comp.length; j++) {
                hash = this.mixHash(hash, comp.charCodeAt(j));
            }
        }

        return hash;
    }

    public isEmpty(): boolean {
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): void;

    abstract insert(i: number, c: string): void;
    abstract append(c: string): void;
    abstract remove(i: number): void;

    /**
     * Concatenates the components of another Name to this one.
     * The other Name is not modified.
     */
    public concat(other: Name): void {
        const n = other.getNoComponents();
        for (let i = 0; i < n; i++) {
            // Components of Name are expected to be already masked
            this.append(other.getComponent(i));
        }
    }

    // ---------------------------------------------------------------------
    // Helper utilities for subclasses
    // ---------------------------------------------------------------------

    protected assertValidDelimiter(delim: string): void {
        if (delim.length !== 1) {
            throw new RangeError("Delimiter must be a single character");
        }
    }

    /**
     * Unescapes a single component from its machine-readable (masked) form
     * into human-readable form.
     */
    protected unescapeComponent(masked: string): string {
        let result = "";
        let escaping = false;

        for (let i = 0; i < masked.length; i++) {
            const ch = masked.charAt(i);

            if (escaping) {
                result += ch;
                escaping = false;
            } else if (ch === ESCAPE_CHARACTER) {
                escaping = true;
            } else {
                result += ch;
            }
        }

        if (escaping) {
            // dangling escape at end of string is considered invalid
            throw new RangeError("Invalid escaped component: " + masked);
        }

        return result;
    }

    /**
     * Simple 32-bit mixing function used for hashing.
     */
    private mixHash(current: number, value: number): number {
        let h = current;
        h = (h * 31 + value) | 0; // keep in 32-bit integer range
        return h;
    }

}
