import { Extension, StateField } from "@codemirror/next/state";
import { Diagnostic } from "@codemirror/next/lint";
import { EditorView } from "@codemirror/next/view";
import { Schema } from "@underlay/apg";
export interface SchemaProps {
    errorCount: number;
    schema: Schema.Schema;
    namespaces: Record<string, string>;
}
export declare function lintView({ state, }: EditorView): SchemaProps & {
    diagnostics: Diagnostic[];
};
export declare const SchemaState: StateField<Readonly<SchemaProps>>;
export declare const linter: Extension;
