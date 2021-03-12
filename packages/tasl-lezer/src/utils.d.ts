import { SyntaxNode } from "lezer";
export interface ParseState {
    slice: (node: SyntaxNode) => string;
    error: (node: SyntaxNode, message: string) => LintError;
    namespaces: Record<string, string>;
}
export declare class LintError extends Error {
    readonly from: number;
    readonly to: number;
    readonly value: string;
    constructor(from: number, to: number, value: string, message: string);
}
export declare const uriPattern: RegExp;
export declare const namespacePattern: RegExp;
export declare function parseURI(state: {
    namespaces: Record<string, string>;
    slice: (node: SyntaxNode) => string;
}, node: SyntaxNode): string;
export declare function printSyntax(node: SyntaxNode, prefix?: string): void;
