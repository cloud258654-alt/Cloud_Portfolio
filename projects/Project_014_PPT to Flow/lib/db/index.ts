import Dexie, { type Table } from "dexie";
import type { FlowDirectorSchema } from "@/lib/db/schema";
import { dbVersion, stores } from "@/lib/db/schema";

class FlowDirectorDatabase extends Dexie {
  workspaces!: Table<FlowDirectorSchema["workspaces"], string>;
  projects!: Table<FlowDirectorSchema["projects"], string>;
  scenes!: Table<FlowDirectorSchema["scenes"], string>;
  flowProjects!: Table<FlowDirectorSchema["flowProjects"], string>;
  flowStoryboards!: Table<FlowDirectorSchema["flowStoryboards"], string>;
  flowScenes!: Table<FlowDirectorSchema["flowScenes"], string>;
  projectBibles!: Table<FlowDirectorSchema["projectBibles"], string>;
  promptPackages!: Table<FlowDirectorSchema["promptPackages"], string>;
  flowExportPackages!: Table<FlowDirectorSchema["flowExportPackages"], string>;
  exportJobs!: Table<FlowDirectorSchema["exportJobs"], string>;

  constructor() {
    super("google-flow-director-os");
    this.version(dbVersion).stores(stores);
  }
}

export const db = new FlowDirectorDatabase();
