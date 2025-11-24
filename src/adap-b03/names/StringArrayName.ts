import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    /**
     * Constructs a Name from an array of already masked components.
     * The array is defensively copied.
     */
    constructor(source: string[], delimiter?: string) {
        super(delimiter ?? DEFAULT_DELIMITER);

        if (source) {
            this.components = source.slice();
        } else {
            this.components = [];
        }
    }

    public clone(): Name {
        // Deep copy of the component array; delimiter stays the same.
        return new StringArrayName(this.components.slice(), this.delimiter);
    }

    public asString(delimiter: string = this.delimiter): string {
        return super.asString(delimiter);
    }

    public asDataString(): string {
        return super.asDataString();
    }

    public isEqual(other: Object): boolean {
        return super.isEqual(other);
    }

    public getHashCode(): number {
        return super.getHashCode();
    }

    public isEmpty(): boolean {
        return super.isEmpty();
    }

    public getDelimiterCharacter(): string {
        return super.getDelimiterCharacter();
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        this.assertIndexInRange(i, 0, this.components.length - 1);
        return this.components[i];
    }

    public setComponent(i: number, c: string): void {
        this.assertIndexInRange(i, 0, this.components.length - 1);
        this.components[i] = c;
    }

    public insert(i: number, c: string): void {
        this.assertIndexInRange(i, 0, this.components.length, true);
        this.components.splice(i, 0, c);
    }

    public append(c: string): void {
        this.components.push(c);
    }

    public remove(i: number): void {
        this.assertIndexInRange(i, 0, this.components.length - 1);
        this.components.splice(i, 1);
    }

    public concat(other: Name): void {
        super.concat(other);
    }

    // ---------------------------------------------------------------------
    // Helper
    // ---------------------------------------------------------------------

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
