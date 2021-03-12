import { Mapping } from "@underlay/apg";
import { SyntaxNode } from "lezer";
import { ParseState } from "./utils.js";
interface parseState extends ParseState {
    mapping: Record<string, Mapping.Map>;
    exprs: Record<string, Mapping.Expression[]>;
}
export interface ParseResult {
    mapping: Mapping.Mapping;
    namespaces: Record<string, string>;
}
export declare function parse(input: string): ParseResult;
export declare const parseExprs: (state: parseState, nodes: SyntaxNode[]) => Mapping.Expression[];
export declare function parseExpr(state: parseState, node: SyntaxNode): Mapping.Expression[];
export {};
