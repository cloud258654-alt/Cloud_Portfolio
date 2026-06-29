export type ExportFormat = "markdown" | "json" | "srt";

export type ExportJob = {
  id: string;
  projectId: string;
  format: ExportFormat;
  fileName: string;
  content: string;
  createdAt: string;
};
