export const DEFAULT_DELIMITER: string = '.';
export const ESCAPE_CHARACTER = '\\';

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 * 
 * Homogenous name examples
 * 
 * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\.\.\." is a name with one component, if the delimiter character is '.'.
 */
export class Name {

    private delimiter: string = DEFAULT_DELIMITER;
    private components: string[] = [];

    /** Expects that all Name components are properly masked */
    constructor(other: string[], delimiter?: string) {
        if (!Array.isArray(other)) {
            throw new Error('Name constructor expects an array of components');
        }
        this.delimiter = delimiter ?? DEFAULT_DELIMITER;
        // store components as given
        this.components = [...other];
    }

    /**
     * Returns a human-readable representation of the Name instance using user-set control characters
     * Control characters are not escaped (creating a human-readable string)
     * Users can vary the delimiter character to be used
     */
    public asString(delimiter: string = this.delimiter): string {
        const raw = this.components.map((c) =>
            Name.unmaskForDelimiter(c, this.delimiter)
        );
        // Human-readable: join raw components with chosen delimiter (no escaping)
        return raw.join(delimiter);
    }

    /** 
     * Returns a machine-readable representation of Name instance using default control characters
     * Machine-readable means that from a data string, a Name can be parsed back in
     * The control characters in the data string are the default characters
     */
    public asDataString(): string {
        // Convert stored (masked for this.delimiter) → raw → re-mask for DEFAULT_DELIMITER
        const raw = this.components.map((c) =>
            Name.unmaskForDelimiter(c, this.delimiter)
        );
        const maskedForDefault = raw.map((r) =>
            Name.maskForDelimiter(r, DEFAULT_DELIMITER)
        );
        return maskedForDefault.join(DEFAULT_DELIMITER);
    }


    public getComponent(i: number): string {
        this.assertIndexInRange(i);
        // API contract: components are stored masked; return as stored
        return this.components[i];
    }

    /** Expects that new Name component c is properly masked */
    public setComponent(i: number, c: string): void {
        this.assertIndexInRange(i);
        this.assertIsString(c);
        this.components[i] = c;
    }

    /** Returns number of components in Name instance */
    public getNoComponents(): number {
        return this.components.length;
    }

    /** Expects that new Name component c is properly masked */
    public insert(i: number, c: string): void {
        if (i < 0 || i > this.components.length) {
            throw new RangeError(`insert index out of range: ${i}`);
        }
        this.assertIsString(c);
        this.components.splice(i, 0, c);
    }

    /** Expects that new Name component c is properly masked */
    public append(c: string): void {
        this.assertIsString(c);
        this.components.push(c);
    }

    public remove(i: number): void {
        this.assertIndexInRange(i);
        this.components.splice(i, 1);
    }

    /**
     * Escape a raw component for a specific delimiter:
     *  - ESCAPE_CHARACTER is doubled (escaped)
     *  - the delimiter is escaped
     */
    private static maskForDelimiter(raw: string, delimiter: string): string {
        let out = '';
        for (const ch of raw) {
            if (ch === ESCAPE_CHARACTER || ch === delimiter) {
                out += ESCAPE_CHARACTER;
            }
            out += ch;
        }
        return out;
    }

    /**
     * Unescape a masked component that was escaped for a specific delimiter.
     * Treats ESCAPE_CHARACTER + (delimiter|ESCAPE_CHARACTER|other) as the literal next char.
     */
    private static unmaskForDelimiter(masked: string, delimiter: string): string {
        let out = '';
        for (let i = 0; i < masked.length; i++) {
            const ch = masked[i];
            if (ch === ESCAPE_CHARACTER) {
                // consume next char literally if present
                i++;
                if (i < masked.length) {
                    out += masked[i];
                } else {
                // dangling backslash → keep a single backslash
                    out += ESCAPE_CHARACTER;
                }
            } else {
                out += ch;
            }
        }
        return out;
    }

    /**
     * Ensure the provided index is within [0, components.length-1], otherwise throw.
     */
    private assertIndexInRange(i: number): void {
        if (!Number.isInteger(i) || i < 0 || i >= this.components.length) {
            throw new RangeError(`index ${i} out of range (0..${Math.max(0, this.components.length - 1)})`);
        }
    }

    /**
     * Ensure the provided value is a string, otherwise throw.
     */
    private assertIsString(value: unknown): void {
        if (typeof value !== 'string') {
            throw new TypeError('expected a string');
        }
    }
}