import { DEFAULT_DELIMITER, ESCAPE_CHARACTER } from "../common/Printable";
import { Name } from "./Name";

/** Parse a string using the given delimiter and ESCAPE rules. */
// @methodtype helper-method
function parseEscaped(data: string, delimiter: string): string[] {
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
        } else if (ch === delimiter) {
            comps.push(cur);
            cur = "";
        } else {
            cur += ch;
        }
    }
    comps.push(cur);
    return comps;
}

/** Escape a component for DEFAULT_DELIMITER to build canonical data strings. */
// @methodtype helper-method
function escapeForDefault(s: string): string {
    let out = "";
    for (let i = 0; i < s.length; i++) {
        const ch = s[i];
        if (ch === ESCAPE_CHARACTER || ch === DEFAULT_DELIMITER) {
            out += ESCAPE_CHARACTER;
        }
        out += ch;
    }
    return out;
}

/** Parse a machine-readable data string using DEFAULT_DELIMITER + ESCAPE rules. */
// @methodtype helper-method
function parseDataString(data: string): string[] {
    return parseEscaped(data, DEFAULT_DELIMITER);
}

// @methodtype helper-method
function joinAsDataString(components: string[]): string {
    return components.map(escapeForDefault).join(DEFAULT_DELIMITER);
}

export class StringName implements Name {

    protected delimiter: string = DEFAULT_DELIMITER; 
    protected name: string = "";                     
    protected noComponents: number = 0;

    /**
     * Construct from a HUMAN-READABLE source string using the provided delimiter.
     * Internally we canonicalize to DEFAULT_DELIMITER ('.') with proper escaping.
     */
    // @methodtype constructor
    constructor(source: string, delimiter?: string) {
        if (delimiter !== undefined) {
            if (delimiter.length !== 1) {
                throw new Error("Delimiter must be a single character");
            }
            this.delimiter = delimiter;
        }
        const comps = parseEscaped(source, this.delimiter);
        this.name = joinAsDataString(comps);
        this.noComponents = comps.length;
    }

    // @methodtype get-method
    public getDelimiterCharacter(): string {
        return this.delimiter;
    }

    // @methodtype to-string-method
    public asString(delimiter: string = this.delimiter): string {
        if (delimiter.length !== 1) {
            throw new Error("Delimiter must be a single character");
        }
        const comps = parseDataString(this.name);
        return comps.join(delimiter);
    }

    // @methodtype to-string-method
    public asDataString(): string {
        return this.name;
    }

    // @methodtype check-method
    public isEmpty(): boolean {
        return this.noComponents === 0;
    }

    // @methodtype get-method
    public getNoComponents(): number {
        return this.noComponents;
    }

    // @methodtype get-method
    public getComponent(i: number): string {
        const comps = parseDataString(this.name);
        if (i < 0 || i >= comps.length) {
            throw new RangeError("Index out of bounds");
        }
        return comps[i];
    }

    // @methodtype helper-method
    private setComponents(comps: string[]): void {
        this.name = joinAsDataString(comps);
        this.noComponents = comps.length;
    }

    // @methodtype set-method
    public setComponent(i: number, c: string): void {
        const comps = parseDataString(this.name);
        if (i < 0 || i >= comps.length) {
            throw new RangeError("Index out of bounds");
        }
        comps[i] = c;
        this.setComponents(comps);
    }

    // @methodtype insert-method
    public insert(i: number, c: string): void {
        const comps = parseDataString(this.name);
        if (i < 0 || i > comps.length) {
            throw new RangeError("Index out of bounds");
        }
        comps.splice(i, 0, c);
        this.setComponents(comps);
    }

    // @methodtype append-method
    public append(c: string): void {
        const comps = parseDataString(this.name);
        comps.push(c);
        this.setComponents(comps);
    }

    // @methodtype remove-method
    public remove(n: number): void {
        const comps = parseDataString(this.name);
        if (n < 0 || n >= comps.length) {
            throw new RangeError("Index out of bounds");
        }
        comps.splice(n, 1);
        this.setComponents(comps);
    }

    // @methodtype concat-method
    public concat(other: Name): void {
        const comps = parseDataString(this.name);
        const otherComps = parseDataString(other.asDataString());
        this.setComponents(comps.concat(otherComps));
    }
}
