import { Node } from "./Node";
import { Directory } from "./Directory";
import { MethodFailedException } from "../common/MethodFailedException";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";

enum FileState {
    OPEN,
    CLOSED,
    DELETED        
};

export class File extends Node {

    protected state: FileState = FileState.CLOSED;

    constructor(baseName: string, parent: Directory) {
        super(baseName, parent);
    }

    public open(): void {
        // Precondition: Must not be open already
        IllegalArgumentException.assert(this.state !== FileState.OPEN, "Precondition: Cannot open an already open file");
        // Precondition: Must not be deleted
        IllegalArgumentException.assert(this.state !== FileState.DELETED, "Precondition: Cannot open a deleted file");

        this.state = FileState.OPEN;

        // Postcondition: State must be OPEN
        MethodFailedException.assert(this.state === FileState.OPEN, "Postcondition: File state is not OPEN");
    }

    public read(noBytes: number): Int8Array {
        // Precondition: Must be open
        IllegalArgumentException.assert(this.state === FileState.OPEN, "Precondition: Cannot read from a closed or deleted file");
        // Precondition: noBytes must be valid
        IllegalArgumentException.assert(noBytes > 0, "Precondition: noBytes must be greater than 0");

        // Mock reading
        const result = new Int8Array(noBytes);

        return result;
    }

    public close(): void {
        // Precondition: Must be open to close it
        IllegalArgumentException.assert(this.state === FileState.OPEN, "Precondition: Cannot close a file that is not open");
        
        this.state = FileState.CLOSED;

        // Postcondition: State must be CLOSED
        MethodFailedException.assert(this.state === FileState.CLOSED, "Postcondition: File state is not CLOSED");
    }

    /**
     * Deletes the file.
     * Implements the contract 
     */
    public delete(): void {
        // Precondition: Cannot delete if already deleted
        IllegalArgumentException.assert(this.state !== FileState.DELETED, "Precondition: Cannot delete an already deleted file");

        this.state = FileState.DELETED;
        
        // Postcondition: State must be DELETED
        MethodFailedException.assert(this.state === FileState.DELETED, "Postcondition: File state is not DELETED");
    }

    protected doGetFileState(): FileState {
        return this.state;
    }

}