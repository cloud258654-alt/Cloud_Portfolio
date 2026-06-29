export type Workspace = {
  id: string;
  name: string;
  description: string;
  ownerName?: string;
  defaultLanguage: "zh-TW" | "en" | "ja";
  createdAt: string;
  updatedAt: string;
};
