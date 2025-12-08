import { Node } from "./Node";
import { Directory } from "./Directory";
import { MethodFailedException } from "../common/MethodFailedException";
import { IllegalArgumentException } from "../common/IllegalArgumentException";
import { InvalidStateException } from "../common/InvalidStateException";
import { ServiceFailureException } from "../common/ServiceFailureException";

enum FileState {
    OPEN,
    CLOSED,
    DELETED        
};

export class File extends Node {

    protected state: FileState = FileState.CLOSED;

    constructor(baseName: string, parent: Directory) {
        super(baseName, parent);
        this.assertClassInvariant();
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

        let result: Int8Array = new Int8Array(noBytes);

        for (let i: number = 0; i < noBytes; i++) {
            let tries: number = 0;
            const maxTries: number = 3; // the limit for retries
            let successful: boolean = false;

            // Retry Loop: Try up to maxTries times to read the current byte
            while (!successful && tries < maxTries) {
                try {
                    result[i] = this.readNextByte();
                    successful = true;
                } catch(ex) {
                    tries++;
                    
                    // If we have exhausted all retries, then we escalate
                    if (tries >= maxTries) {
                        if (ex instanceof MethodFailedException) {
                            throw new ServiceFailureException(`Failed to read byte at index ${i} after ${maxTries} attempts`, ex);
                        } else {
                            throw ex;
                        }
                    }
                }
            }
        }

        return result;
    }

    protected readNextByte(): number {
        return 0x1; 
    }

    public close(): void {
        // Precondition: Must be open to close it
        IllegalArgumentException.assert(this.state === FileState.OPEN, "Precondition: Cannot close a file that is not open");
        
        this.state = FileState.CLOSED;

        // Postcondition: State must be CLOSED
        MethodFailedException.assert(this.state === FileState.CLOSED, "Postcondition: File state is not CLOSED");
    }

    protected doGetFileState(): FileState {
        return this.state;
    }

    public delete(): void {
         // Precondition: Cannot delete if already deleted
         IllegalArgumentException.assert(this.state !== FileState.DELETED, "Precondition: Cannot delete an already deleted file");

         this.state = FileState.DELETED;
         
         // Postcondition: State must be DELETED
         MethodFailedException.assert(this.state === FileState.DELETED, "Postcondition: File state is not DELETED");
    }

}