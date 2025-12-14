import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

export abstract class AbstractName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    
    // Cache for the hash code. 0 indicates it hasn't been computed yet.
    protected hashCodeCache: number = 0;

    constructor(delimiter: string = DEFAULT_DELIMITER) {
        // Precondition: Delimiter must be a single character
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
        if (other === null || other === undefined) {
            return false;
        }

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

    /**
     * HashCode for Value Objects (Using asDataString + Caching)
     */
    public getHashCode(): number {
        // Return cached value if available
        if (this.hashCodeCache !== 0) {
            return this.hashCodeCache;
        }

        let hashCode: number = 0;
        const s: string = this.asDataString();
        
        for (let i: number = 0; i < s.length; i++) {
            let c: number = s.charCodeAt(i);
            hashCode = (hashCode << 5) - hashCode + c;
            hashCode |= 0; // Convert to 32bit integer
        }

        // Cache the result
        this.hashCodeCache = hashCode;
        return hashCode;
    }

    public isEmpty(): boolean {
        return this.getNoComponents() === 0;
    }

    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    abstract getNoComponents(): number;

    abstract getComponent(i: number): string;
    abstract setComponent(i: number, c: string): Name;
    abstract insert(i: number, c: string): Name;
    abstract append(c: string): Name;
    abstract remove(i: number): Name;

    public concat(other: Name): Name {
        IllegalArgumentException.assert(other != null, "Cannot concatenate null Name");

        let result: Name = this;
        const n = other.getNoComponents();
        for (let i = 0; i < n; i++) {
            result = result.append(other.getComponent(i));
        }
        return result;
    }

    protected assertIndexInRange(index: number, minInclusive: number, maxInclusive: number, allowEqualMaxPlusOne: boolean = false): void {
        const upper = allowEqualMaxPlusOne ? maxInclusive + 1 : maxInclusive;
        const condition = index >= minInclusive && index <= upper;
        IllegalArgumentException.assert(condition, `Index ${index} out of range [${minInclusive}, ${upper}]`);
    }

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
        IllegalArgumentException.assert(!escaping, "Invalid escaped component: dangling escape character");
        return result;
    }
}