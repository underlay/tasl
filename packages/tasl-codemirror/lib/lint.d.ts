import { EditorState, Extension } from "@codemirror/next/state";
import { Diagnostic } from "@codemirror/next/lint";
import { EditorView } from "@codemirror/next/view";
import { Schema } from "@underlay/apg";
export interface UpdateProps {
    errors: number;
    state: EditorState;
    schema: Schema.Schema;
    namespaces: Record<string, string>;
}
export declare function lintView({ state, }: EditorView): UpdateProps & {
    diagnostics: Diagnostic[];
};
export declare const makeLinter: (onChange?: ((props: UpdateProps) => void) | undefined) => Extension;
