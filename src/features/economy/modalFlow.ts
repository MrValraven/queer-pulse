/* The submit-flow hook, split out of ModalKit.tsx so that file only exports
 * components (react-refresh/only-export-components). Re-exported from the shared
 * hooks layer so economy modal consumers keep a single colocated import site. */
export { useSubmitFlow, type FlowStatus } from "../../shared/hooks";
