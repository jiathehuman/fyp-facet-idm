/**
 * This file defines all the interfaces used in tsx components and ts functions in frontend.
 */
export interface Detail {
  id: string;
  created_at: string;
  current_value: string | Date | File | null;
  date_value: string | null;
  file_value: string | null;
  image_value: string | null;
  string_value: string | null;
  key: string;
  value_type: "String" | "Date" | "File" | "Image";
  user: string;
}

export interface Persona {
  id: string;
  key: string;
  created_at: string;
}

export interface PersonaDetail {}

export interface APIKey {
  id: string;
  api_key: string;
  prefix: string;
  created_at: string;
  description: string;
  persona: Persona;
}

export interface RenderValueInputProps {
  detailValueType: "String" | "Date" | "File" | "Image" | "";
  detailString: string;
  setDetailString: (value: string) => void;
  detailDate: string;
  setDetailDate: (value: string) => void;
  detailFile: File | null;
  setDetailFile: (file: File | null) => void;
  detailImage: File | null;
  setDetailImage: (file: File | null) => void;
}

// Interface for the data returned after user registration/login
export interface UserData {
  access: string;
  refresh: string;
}
