import { DEFAULT_DELIMITER } from "../common/Printable";
import { Name } from "./Name";
import { AbstractName } from "./AbstractName";
import { IllegalArgumentException } from "../common/IllegalArgumentException";

export class StringArrayName extends AbstractName {

    protected components: string[] = [];

    constructor(source: string[], delimiter: string = DEFAULT_DELIMITER) {
        super(delimiter);
        // Precondition: Source array must not be null
        IllegalArgumentException.assert(source != null, "Source components array cannot be null");
        // Defensive copy to ensure immutability from the start
        this.components = source.slice(); 
    }

    public clone(): Name {
        return new StringArrayName(this.components, this.delimiter);
    }

    public getNoComponents(): number {
        return this.components.length;
    }

    public getComponent(i: number): string {
        this.assertIndexInRange(i, 0, this.components.length - 1);
        return this.components[i];
    }

    public setComponent(i: number, c: string): Name {
        this.assertIndexInRange(i, 0, this.components.length - 1);
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        // Creating a copy to maintain immutability
        const newComponents = this.components.slice();
        newComponents[i] = c;

        return new StringArrayName(newComponents, this.delimiter);
    }

    public insert(i: number, c: string): Name {
        this.assertIndexInRange(i, 0, this.components.length, true); 
        IllegalArgumentException.assert(c != null, "Component cannot be null");

        const newComponents = this.components.slice();
        newComponents.splice(i, 0, c);

        return new StringArrayName(newComponents, this.delimiter);
    }

    public append(c: string): Name {
        return this.insert(this.components.length, c);
    }

    public remove(i: number): Name {
        this.assertIndexInRange(i, 0, this.components.length - 1);

        const newComponents = this.components.slice();
        newComponents.splice(i, 1);

        return new StringArrayName(newComponents, this.delimiter);
    }
}