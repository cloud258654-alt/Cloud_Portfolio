export type ProjectBible = {
  id: string;
  projectId: string;
  brandBible: string;
  characterBible: string;
  vehicleBible: string;
  environmentBible: string;
  cameraBible: string;
  lightingBible: string;
  colorBible: string;
  audioBible: string;
  motionBible: string;
  emotionBible: string;
  negativePromptBible: string;
  createdAt: string;
  updatedAt: string;
};

export type CharacterBibleEntry = {
  id: string;
  projectId: string;
  name: string;
  role: string;
  visualRules: string;
  continuityNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type VehicleBibleEntry = {
  id: string;
  projectId: string;
  name: string;
  model: string;
  visualRules: string;
  continuityNotes: string;
  createdAt: string;
  updatedAt: string;
};

export type EnvironmentBibleEntry = {
  id: string;
  projectId: string;
  name: string;
  locationType: string;
  visualRules: string;
  continuityNotes: string;
  createdAt: string;
  updatedAt: string;
};
