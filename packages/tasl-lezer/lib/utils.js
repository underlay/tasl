export class LintError extends Error {
    constructor(from, to, value, message) {
        super(message);
        this.from = from;
        this.to = to;
        this.value = value;
    }
}
export const uriPattern = /^[a-z]+:[a-zA-Z0-9-/_.:#]+$/;
export const namespacePattern = /[#/]$/;
export function parseURI(state, node) {
    const value = state.slice(node);
    const index = value.indexOf(":");
    if (index === -1) {
        const { from, to } = node;
        const message = `Invalid URI: URIs must be of the form [namespace]:[path]`;
        throw new LintError(from, to, value, message);
    }
    const prefix = value.slice(0, index);
    if (prefix in state.namespaces) {
        return state.namespaces[prefix] + value.slice(index + 1);
    }
    else {
        const { from, to } = node;
        const message = `Invalid URI: namespace ${prefix} is not defined`;
        throw new LintError(from, to, value, message);
    }
}
export function printSyntax(node, prefix = "") {
    console.log(`${prefix}- ${node.type.name} ${node.from} ${node.to}`);
    for (let child = node.firstChild; child !== null; child = child.nextSibling) {
        printSyntax(child, prefix + "  ");
    }
}
