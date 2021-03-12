import { EditorState, Extension } from "@codemirror/next/state";
import { Diagnostic } from "@codemirror/next/lint";
import { EditorView } from "@codemirror/next/view";
import { Mapping } from "@underlay/apg";
export interface UpdateProps {
    errors: number;
    state: EditorState;
    mapping: Mapping.Mapping;
    namespaces: Record<string, string>;
}
export declare function lintView(view: EditorView): UpdateProps & {
    diagnostics: Diagnostic[];
};
export declare const makeLinter: (onChange?: ((props: UpdateProps) => void) | undefined) => Extension;
