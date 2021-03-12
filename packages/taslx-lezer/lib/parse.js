import { Mapping } from "@underlay/apg";
import { parser } from "../grammar/taslx.js";
import { LintError, namespacePattern, parseURI, uriPattern, } from "./utils.js";
export function parse(input) {
    const slice = (node) => input.slice(node.from, node.to);
    const error = (node, message) => new LintError(node.from, node.to, slice(node), message);
    const state = {
        slice,
        error,
        namespaces: {},
        exprs: {},
        mapping: {},
    };
    const tree = parser.configure({ strict: true }).parse(input);
    const cursor = tree.cursor();
    if (cursor.name === "Mapping") {
        cursor.firstChild();
    }
    else {
        throw state.error(cursor.node, "Invalid top-level node");
    }
    do {
        if (cursor.type.name === "Namespace") {
            const term = cursor.node.getChild("Term");
            const namespace = state.slice(term);
            if (!uriPattern.test(namespace)) {
                throw state.error(term, `Invalid URI: URIs must match ${uriPattern.source}`);
            }
            else if (!namespacePattern.test(namespace)) {
                throw state.error(term, "Invalid namespace: namespaces must end in / or #");
            }
            const identifier = cursor.node.getChild("Prefix");
            const prefix = state.slice(identifier);
            if (prefix in state.namespaces) {
                throw state.error(identifier, `Duplicate namespace: ${prefix}`);
            }
            else {
                state.namespaces[prefix] = namespace;
            }
        }
        else if (cursor.type.name === "Expr") {
            const identifier = cursor.node.getChild("ExprName");
            const nodes = cursor.node.getChildren("Expression");
            const exprs = parseExprs(state, nodes);
            const name = state.slice(identifier);
            if (name in state.exprs) {
                throw state.error(identifier, `Invalid expression declaration: expression ${name} has already been declared`);
            }
            else {
                state.exprs[name] = exprs;
            }
        }
        else if (cursor.type.name === "Map") {
            const termNodes = cursor.node.getChildren("Term");
            const terms = termNodes.map((node) => parseURI(state, node));
            const key = terms[0];
            const source = terms.length > 1 ? terms[1] : key;
            if (key in state.mapping) {
                throw state.error(termNodes[0], `Invalid map declaration: map ${key} has already been declared`);
            }
            else {
                const expressions = cursor.node.getChildren("Expression");
                state.mapping[key] = Mapping.map(source, parseExprs(state, expressions));
            }
        }
    } while (cursor.nextSibling());
    return {
        mapping: Mapping.mapping(state.mapping),
        namespaces: state.namespaces,
    };
}
export const parseExprs = (state, nodes) => nodes.reduce((exprs, node) => exprs.concat(parseExpr(state, node)), []);
export function parseExpr(state, node) {
    if (node.name === "Variable") {
        const value = state.slice(node);
        if (value in state.exprs) {
            return state.exprs[value];
        }
        else {
            throw state.error(node, `Expression ${value} is not defined`);
        }
    }
    else if (node.name === "Dereference") {
        const term = node.getChild("Term");
        const key = parseURI(state, term);
        return [Mapping.dereference(key)];
    }
    else if (node.name === "Projection") {
        const term = node.getChild("Term");
        const key = parseURI(state, term);
        return [Mapping.projection(key)];
    }
    else if (node.name === "Injection") {
        const term = node.getChild("Term");
        const key = parseURI(state, term);
        return [Mapping.injection(key)];
    }
    else if (node.name === "Identifier") {
        const term = node.getChild("Term");
        const key = parseURI(state, term);
        return [Mapping.identifier(key)];
    }
    else if (node.name === "Constant") {
        const string = node.getChild("String");
        const text = state.slice(string);
        const value = JSON.parse(text);
        if (typeof value !== "string") {
            throw state.error(string, `Invalid constant: ${text}`);
        }
        const term = node.getChild("Term");
        const datatype = parseURI(state, term);
        return [Mapping.constant(value, datatype)];
    }
    else if (node.name === "Tuple") {
        const slots = {};
        for (const slot of node.getChildren("Slot")) {
            const term = slot.getChild("Term");
            const key = parseURI(state, term);
            if (key in slots) {
                throw state.error(term, `Duplicate tuple slot key: ${key}`);
            }
            else {
                const expressions = slot.getChildren("Expressions");
                slots[key] = parseExprs(state, expressions);
            }
        }
        return [Mapping.tuple(slots)];
    }
    else if (node.name === "Match") {
        const cases = {};
        for (const CASE of node.getChildren("Case")) {
            const term = CASE.getChild("Term");
            const key = parseURI(state, term);
            if (key in cases) {
                throw state.error(term, `Duplicate match case key: ${key}`);
            }
            else {
                const expressions = CASE.getChildren("Expressions");
                cases[key] = parseExprs(state, expressions);
            }
        }
        return [Mapping.match(cases)];
    }
    else {
        throw new Error("Unexpected Expression node");
    }
}
