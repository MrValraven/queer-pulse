// Barrel: this module was split into one-file-per-component under
// src/features/studio/. It re-exports every name it originally exported so
// existing importers keep working without changing their import paths.
export { DropZone } from "./StudioUploadDropZone";
export { FileList } from "./StudioUploadFileList";
export { CoverArt } from "./StudioUploadCoverArt";
export { SplitsTable } from "./StudioUploadSplitsTable";
export { UploadSidebar } from "./StudioUploadSidebar";
export { UploadMainCol } from "./StudioUploadMainCol";
