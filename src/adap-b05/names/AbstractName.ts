import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        // Precondition / Invariant check during construction
        IllegalArgumentException.assert(delimiter.length == 1, "Delimiter must be a single character");
        this.delimiter = delimiter;
    }

    public abstract clone(): Name;

    public asString(delimiter: string = this.delimiter): string {
        // Precondition: delimiter must be valid for printing
        IllegalArgumentException.assert(delimiter.length == 1, "Delimiter must be a single character");
        
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
        // Precondition: check if other is null/undefined
        if (other === null || other === undefined) {
            return false;
        }

        // Structural check
        const otherName = other as any;
        if (typeof otherName.getNoComponents !== "function" ||
            typeof otherName.getComponent !== "function" ||
            typeof otherName.getDelimiterCharacter !== "function") {
            return false;
        }

        const otherTyped = other as Name;

        if (this.getDelimiterCharacter() !== otherTyped.getDelimiterCharacter()) {
            return false;
        }

        const n = this.getNoComponents();
        if (n !== otherTyped.getNoComponents()) {
            return false;
        }

        for (let i = 0; i < n; i++) {
            if (this.getComponent(i) !== otherTyped.getComponent(i)) {
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

    public concat(other: Name): void {
        // Precondition: other cannot be null
        IllegalArgumentException.assert(other != null, "Cannot concatenate null Name");

        const n = other.getNoComponents();
        for (let i = 0; i < n; i++) {
            this.append(other.getComponent(i));
        }
    }

    // ---------------------------------------------------------------------
    // Contract Utilities
    // ---------------------------------------------------------------------

    /**
     * Checks the class invariant.
     */
    protected checkClassInvariant(): void {
        InvalidStateException.assert(this.delimiter.length === 1, "Class Invariant Violation: Delimiter must be a single character");
    }

    /**
     * Helper to enforce index bounds preconditions in subclasses.
     */
    protected assertIndexInRange(
        index: number,
        minInclusive: number,
        maxInclusive: number,
        allowEqualMaxPlusOne: boolean = false
    ): void {
        const upper = allowEqualMaxPlusOne ? maxInclusive + 1 : maxInclusive;
        const condition = index >= minInclusive && index <= upper;
        IllegalArgumentException.assert(condition, `Index ${index} out of range [${minInclusive}, ${upper}]`);
    }

    // ---------------------------------------------------------------------
    // Helper utilities
    // ---------------------------------------------------------------------

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

        // Integrity check: escaping must be false at end
        IllegalArgumentException.assert(!escaping, "Invalid escaped component: dangling escape character");

        return result;
    }

    private mixHash(current: number, value: number): number {
        let h = current;
        h = (h * 31 + value) | 0; 
        return h;
    }
}