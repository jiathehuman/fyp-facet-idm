// @ts-ignore
import { AxiosResponse } from "axios"; // Import Axios types
import { NavigateFunction } from "react-router-dom"; // Import NavigateFunction for router

import api from "../api";

import { Detail, Persona, PersonaDetail, APIKey } from "@/types/types";

// GET /api/details/
export const getDetails = async (): Promise<Detail[]> => {
  try {
    const res: AxiosResponse<Detail[]> = await api.get("/api/details/");
    console.log("In Frontend data.ts getDetails", res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error fetching details:", err);
    throw err;
  }
};

// DELETE /api/details/:id/
export const deleteDetail = async (id: string | number): Promise<void> => {
  try {
    const res: AxiosResponse = await api.delete(`/api/details/${id}/`);
    if (res.status === 204) {
      console.log("Detail deleted!");
    } else {
      console.log("Failed to delete!");
    }
  } catch (err: any) {
    console.error("Error deleting detail:", err);
    throw err;
  }
};

// PATCH /api/details/:id/
export const updateDetail = async (
  id: string | number,
  updatedData: FormData,
): Promise<void> => {
  try {
    const res: AxiosResponse = await api.patch(
      `/api/details/${id}/`,
      updatedData,
    );
    if (res.status === 200) {
      console.log("Detail updated");
    } else {
      console.log("Failed to update!");
    }
  } catch (err: any) {
    console.error("Error updating detail:", err);
    throw err;
  }
};

// POST /api/details/
export const createDetail = async (formData: FormData): Promise<void> => {
  try {
    console.log("In createData in data.ts", formData);
    const res: AxiosResponse = await api.post("/api/details/", formData);

    if (res.status === 201) {
      console.log("Detail created");
    } else {
      console.log("Failed to record the detail");
    }
  } catch (err: any) {
    console.error("Error creating detail:", err);
    if (err.response && err.response.data) {
      console.error("Server error data:", err.response.data);
    }
    throw err;
  }
};

// GET /api/personas/
export const getPersonas = async (): Promise<Persona[]> => {
  try {
    const res: AxiosResponse<Persona[]> = await api.get("/api/personas/");

    console.log("In Frontend data.ts getPersonas", res.data);

    return res.data;
  } catch (err: any) {
    console.error("Error fetching personas:", err);
    throw err;
  }
};

// GET /api/personas/:id/
export const getPersona = async (
  id: string | number,
): Promise<Persona | null> => {
  try {
    const res: AxiosResponse = await api.get(`/api/personas/${id}/`);

    if (res.status === 200) {
      return res.data;
    }

    return null;
  } catch (err: any) {
    console.error("Error deleting persona:", err);
    throw err;
  }
};

// DELETE /api/personas/:id/
export const deletePersona = async (id: string | number): Promise<void> => {
  try {
    const res: AxiosResponse = await api.delete(`/api/personas/${id}/`);

    if (res.status === 204) {
      console.log("Persona deleted!");
    } else {
      console.log("Failed to delete Persona!");
    }
  } catch (err: any) {
    console.error("Error deleting persona:", err);
    throw err;
  }
};

// PATCH /api/personas/:id/
export const updatePersona = async (
  id: string | number,
  updatedData: Partial<Persona>,
): Promise<void> => {
  try {
    const res: AxiosResponse = await api.patch(
      `/api/personas/${id}/`,
      updatedData,
    );

    if (res.status === 200) {
      console.log("Persona updated!");
    } else {
      console.log("Failed to update Persona!");
    }
  } catch (err: any) {
    console.error("Error updating persona:", err);
    throw err;
  }
};

// POST /api/personas/
export const createPersona = async (formData: FormData): Promise<void> => {
  try {
    const res: AxiosResponse = await api.post("/api/personas/", formData);

    if (res.status === 201) {
      console.log("Persona Created");
    } else {
      console.log("Failed to create a Persona");
    }
  } catch (err: any) {
    console.error("Error creating persona:", err);
    throw err;
  }
};

// PERSONA-DETAILS
// GET /api/personas/:id/
export const getPersonaDetails = async (
  id: string | number,
): Promise<PersonaDetail[] | null> => {
  try {
    const res: AxiosResponse = await api.get(`/api/persona-details/${id}/`);
    console.log(res.status);
    if (res.status === 200) {
      return res.data;
    }
    return null;
  } catch (err: any) {
    console.error("Error getting Persona Details", err);
    throw err;
  }
};

// PERSONA DETAILS UNASSIGNNED TO A PERSONA
// GET /api/unassigned-details/:id
export const getUnassignedPersonaDetails = async (
  id: string | number,
): Promise<PersonaDetail[] | null> => {
  try {
    const res: AxiosResponse = await api.get(`/api/unassigned-details/${id}/`);
    if (res.status === 200) {
      return res.data;
    }
    return null;
  } catch (err: any) {
    console.error("Error deleting persona:", err);
    throw err;
  }
};

// POST /api/persona-detail/:id
export const createPersonaDetail = async (
  formData: FormData,
): Promise<void> => {
  try {
    console.log("In createData in data.ts", formData);
    const res: AxiosResponse = await api.post("/api/persona-detail/", formData);
    if (res.status === 201) {
      console.log("Added detail to persona");
    } else {
      console.log("Failed to add detail to persona");
    }
  } catch (err: any) {
    console.error("Error creating detail:", err);
    if (err.response && err.response.data) {
      console.error("Server error data:", err.response.data);
    }
    throw err;
  }
};

// POST /api/personas/:id/generate-api-key/
export const createAPIKey = async (id: string | number): Promise<void> => {
  console.log("createAPIKey received ID:", id, "Type:", typeof id);
  try {
    const res = await api.post(`/api/personas/${id}/generate-api-key/`);
    console.log(res.status);
    console.log(res.data);
    return res.data;
  } catch (err: any) {
    console.error("Error creating detail:", err);
    if (err.response && err.response.data) {
      console.error("Server error data:", err.response.data);
    }
    throw err;
  }
};

// Delete a particular persona detail
export const deletePersonaDetail = async (
    personaId: string | undefined, detailId: string
): Promise<void> => {
  try {
    const res = await api.delete(`/api/persona-details/delete/${personaId}/${detailId}/`);
    console.log("in deletePersona:", res.status);
    if (res.status === 204 || res.status === 204) {
      console.log("Persona Detail deleted");
    } else {
      console.error("Failed to delete Person detail: ", res.status);
    }
  } catch (err: any) {
    console.error("Error deleting persona:", err);
    throw err;
  }
};

// POST /api/persona-detail/:id
export const unassignPersonaDetail = async (
  id: string | number,
): Promise<void> => {
  try {
    // this change
    const res: AxiosResponse = await api.delete(`/api/persona-detail/${id}/`);

    if (res.status === 204) {
      console.log("Detail deleted from persona");
    } else {
      console.log("Failed to detail deleted from persona");
    }
  } catch (err: any) {
    console.error("Error creating detail:", err);
    if (err.response && err.response.data) {
      console.error("Server error data:", err.response.data);
    }
    throw err;
  }
};

export const deleteAPIKey = async (id: string): Promise<void> => {
  console.log("deleteAPIKey:", id);
  try {
    const res = await api.delete(`/api/personas/api-key-delete/${id}/`);

    if (res.status === 204) {
      console.log("Persona Detail deleted");
    } else {
      console.error("Failed to delete Person detail: ", res.status);
    }
  } catch (err: any) {
    console.error("Error deleting persona:", err);
    throw err;
  }
};

// API KEYS
// GET /api/personas/api-keys/:id/
export const getAPIKeys = async (
  id: string | number,
): Promise<APIKey[] | null> => {
  console.log("In getAPIKeys ", id);
  try {
    const res = await api.get(`/api/personas/api-keys/${id}/`);

    console.log("In getAPIKeys ", res.status, res.data);
    if (res.status === 200 || res.status === 204) {
      return res.data;
    }
    else return null;
  } catch (err: any) {
    console.error("Error deleting persona:", err);
    throw err;
  }
};


// LOGOUT
export const handleLogout = (navigate: NavigateFunction): void => {
  console.log("This is called, logout");
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  console.log("accessToken after logout:", localStorage.getItem("accessToken"));
  localStorage.removeItem("user");
  navigate("/login");
};
