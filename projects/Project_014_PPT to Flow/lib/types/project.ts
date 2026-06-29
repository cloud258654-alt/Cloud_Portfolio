export type Project = {
  id: string;
  name: string;
  description: string;
  brandName: string;
  targetDurationSec: number;
  status: "draft" | "in_progress" | "review" | "completed";
  createdAt: string;
  updatedAt: string;
};
