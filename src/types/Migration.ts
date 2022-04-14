/**
 * Represents the status of a migration.
 */
export type Migration = {
    migration: string;
    batchId: string;
    dateStarted: Date;
    dateFinished: Date;
};

/**
 * Default interface for migration script classes.
 */
export interface IMigration {
    execute(): Promise<void>;
    rollback(): Promise<void>;
}
