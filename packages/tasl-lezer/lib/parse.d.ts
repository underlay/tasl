import { SyntaxNode } from "lezer";
import { Schema } from "@underlay/apg";
import { ParseState } from "./utils.js";
interface parseState extends ParseState {
    schema: Record<string, Schema.Type>;
    types: Record<string, Schema.Type>;
    references: {
        from: number;
        to: number;
        key: string;
    }[];
}
export interface ParseResult {
    schema: Schema.Schema;
    namespaces: Record<string, string>;
}
export declare function parse(input: string): ParseResult;
export declare function parseType(state: parseState, node: SyntaxNode): Schema.Type;
export {};
