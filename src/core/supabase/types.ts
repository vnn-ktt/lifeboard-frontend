export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export interface SupabaseTableDefinition {
  Row: Record<string, unknown>;
  Insert: Record<string, unknown>;
  Update: Record<string, unknown>;
  Relationships: unknown[];
}

export interface SupabaseSchemaDefinition {
  Tables: Record<string, SupabaseTableDefinition>;
  Views: Record<string, SupabaseTableDefinition>;
  Functions: Record<string, unknown>;
  Enums: Record<string, string>;
  CompositeTypes: Record<string, unknown>;
}

export interface Database {
  public: SupabaseSchemaDefinition;
}

export type PublicSchema = Database['public'];
export type PublicTables = PublicSchema['Tables'];
export type PublicTableName = keyof PublicTables;

export type TableRow<TableName extends PublicTableName> = PublicTables[TableName]['Row'];

export type TableInsert<TableName extends PublicTableName> = PublicTables[TableName]['Insert'];

export type TableUpdate<TableName extends PublicTableName> = PublicTables[TableName]['Update'];

export interface TimestampedEntity {
  createdAt: string;
  updatedAt: string;
}

export interface OwnedEntity {
  ownerId: string;
}
