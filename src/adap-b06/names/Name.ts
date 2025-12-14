import { Equality } from "../common/Equality";
import { Cloneable } from "../common/Cloneable";
import { Printable } from "../common/Printable";

/**
 * A name is a sequence of string components separated by a delimiter character.
 * Special characters within the string may need masking, if they are to appear verbatim.
 * There are only two special characters, the delimiter character and the escape character.
 * The escape character can't be set, the delimiter character can.
 * * Homogenous name examples
 * * "oss.cs.fau.de" is a name with four name components and the delimiter character '.'.
 * "///" is a name with four empty components and the delimiter character '/'.
 * "Oh\.\.\." is a name with one component, if the delimiter character is '.'.
 */
export interface Name extends Cloneable, Printable, Equality {

    /**
     * Returns true, if number of components == 0; else false
     */
    isEmpty(): boolean;

    /** * Returns number of components in Name instance
     */
    getNoComponents(): number;

    /**
     * Returns the component at the specified index.
     * @param i index of the component (0-based)
     */
    getComponent(i: number): string;

    /** * Returns a new Name instance with the component at index i replaced.
     * Expects that new Name component c is properly masked.
     * @param i index where to set the component
     * @param c the new component string
     */
    setComponent(i: number, c: string): Name;

    /** * Returns a new Name instance with the component inserted at index i.
     * Expects that new Name component c is properly masked.
     * @param i index where to insert the component
     * @param c the component string to insert
     */
    insert(i: number, c: string): Name;

    /** * Returns a new Name instance with the component appended at the end.
     * Expects that new Name component c is properly masked.
     * @param c the component string to append
     */
    append(c: string): Name;

    /**
     * Returns a new Name instance with the component at index i removed.
     * @param i index of the component to remove
     */
    remove(i: number): Name;
    
    /**
     * Returns a new Name instance resulting from the concatenation of this and other.
     * @param other the Name to concatenate to the end of this Name
     */
    concat(other: Name): Name;
    
}