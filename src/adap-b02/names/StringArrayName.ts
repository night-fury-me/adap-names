import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

/** Escape a component with respect to a delimiter for data strings. */
// @methodtype helper-method
function escapeForDelimiter(s: string, delimiter: string): string {
    let out = "";
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === ESCAPE_CHARACTER || ch === delimiter) {
            out += ESCAPE_CHARACTER;
        }
        out += ch;
    }
    return out;
}

/** Parse a data string using DEFAULT_DELIMITER + ESCAPE rules. */
// @methodtype helper-method
function parseDataString(data: string): string[] {
    const comps: string[] = [];
    let cur = "";
    for (let i = 0; i < data.length; i++) {
        const ch = data[i];
        if (ch === ESCAPE_CHARACTER) {
            if (i + 1 < data.length) {
                cur += data[i + 1];
                i++;
            } else {
                // Trailing escape: keep literally
                cur += ESCAPE_CHARACTER;
            }
        } else if (ch === DEFAULT_DELIMITER) {
            comps.push(cur);
            cur = "";
        } else {
            cur += ch;
        }
    }
    comps.push(cur);
    return comps;
}

export class StringArrayName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER;
    protected components: string[] = [];

    /**
     * Construct from an array of components (unescaped/human form).
     * Delimiter controls only human-readable `asString` output.
     */
    // @methodtype constructor
    constructor(source: string[], delimiter?: string) {
        if (delimiter !== undefined) {
            if (delimiter.length !== 1) {
                throw new Error("Delimiter must be a single character");
            }
            this.delimiter = delimiter;
        }
        this.components = [...source]; // store unescaped components
    }

    /** Human-readable string (no escaping) using provided delimiter (default: this.delimiter). */
    // @methodtype to-string-method
    public asString(delimiter: string = this.delimiter): string {
        if (delimiter.length !== 1) {
            throw new Error("Delimiter must be a single character");
        }
        return this.components.join(delimiter);
    }

    /** Machine-readable data string using DEFAULT control characters. */
    // @methodtype to-string-method
    public asDataString(): string {
        const masked = this.components.map(c => escapeForDelimiter(c, DEFAULT_DELIMITER));
        return masked.join(DEFAULT_DELIMITER);
    }

    // @methodtype get-method
    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    // @methodtype check-method
    public isEmpty(): boolean {
        return this.components.length === 0;
    }

    // @methodtype get-method
    public getNoComponents(): number {
        return this.components.length;
    }

    // @methodtype get-method
    public getComponent(i: number): string {
        if (i < 0 || i >= this.components.length) {
            throw new RangeError("Index out of bounds");
        }
        return this.components[i];
    }

    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        if (i < 0 || i >= this.components.length) {
            throw new RangeError("Index out of bounds");
        }
        this.components[i] = c;
    }

    // @methodtype insert-method
    public insert(i: number, c: string): void {
        if (i < 0 || i > this.components.length) {
            throw new RangeError("Index out of bounds");
        }
        this.components.splice(i, 0, c);
    }

    // @methodtype append-method
    public append(c: string): void {
        this.components.push(c);
    }

    // @methodtype remove-method
    public remove(i: number): void {
        if (i < 0 || i >= this.components.length) {
            throw new RangeError("Index out of bounds");
        }
        this.components.splice(i, 1);
    }

    // @methodtype concat-method
    public concat(other: Name): void {
        const otherComps = parseDataString(other.asDataString());
        this.components.push(...otherComps);
    }

}