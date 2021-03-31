import { Extension, StateField } from "@codemirror/next/state";
import { Diagnostic } from "@codemirror/next/lint";
import { EditorView } from "@codemirror/next/view";
import { Mapping } from "@underlay/apg";
export interface MappingProps {
    errorCount: number;
    mapping: Mapping.Mapping;
    namespaces: Record<string, string>;
}
export declare function lintView(view: EditorView): MappingProps & {
    diagnostics: Diagnostic[];
};
export declare const MappingState: StateField<Readonly<MappingProps>>;
export declare const linter: Extension;
