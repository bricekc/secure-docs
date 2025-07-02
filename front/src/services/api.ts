import { ApolloError } from "@apollo/client";
import { apolloClient } from "./apollo-client";
import {
  CREATE_DOCUMENTS,
  CREATE_USER,
  GET_DOCUMENTS,
  LOGIN,
} from "./gql-requests";

// Configuration de base pour les appels API
const API_BASE_URL = import.meta.env.VITE_BACK_URL;

// Fonction utilitaire pour les appels API avec gestion du token
async function apiCall(endpoint: string, options: RequestInit = {}) {
  // A SUPPRIMER
  const token = localStorage.getItem("token");

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ message: "Erreur réseau" }));
    throw new Error(error.message || `Erreur ${response.status}`);
  }

  return response.json();
}

export const authService = {
  async login(userData: { email: string; password: string }) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: LOGIN,
        variables: {
          email: userData.email,
          password: userData.password,
        },
      });
      return data;
    } catch (error: unknown) {
      if (error instanceof ApolloError) {
        const message =
          error.message ||
          error.graphQLErrors[0]?.message ||
          "Erreur lors de l'inscription";
        throw new Error(message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erreur lors de l'inscription");
      }
    }
  },

  async register(userData: { email: string; password: string; name: string }) {
    try {
      const { data } = await apolloClient.mutate({
        mutation: CREATE_USER,
        variables: {
          email: userData.email,
          name: userData.name,
          password: userData.password,
        },
      });
      return data;
    } catch (error: unknown) {
      if (error instanceof ApolloError) {
        const message =
          error.message ||
          error.graphQLErrors[0]?.message ||
          "Erreur lors de l'inscription";
        throw new Error(message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erreur lors de l'inscription");
      }
    }
  },
};

export const documentService = {
  async getDocuments() {
    try {
      const { data } = await apolloClient.query({
        query: GET_DOCUMENTS,
      });
      return data;
    } catch (error: unknown) {
      if (error instanceof ApolloError) {
        const message =
          error.message ||
          error.graphQLErrors[0]?.message ||
          "Erreur lors de l'inscription";
        throw new Error(message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error("Erreur lors de l'inscription");
      }
    }
  },

  async createDocument(documentData: { file: File }) {
    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        query: CREATE_DOCUMENTS.loc?.source.body,
        variables: {
          file: null,
        },
      })
    );
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    formData.append("0", documentData.file);

    const token = localStorage.getItem("token");

    const response = await fetch(`${API_BASE_URL}/graphql`, {
      method: "POST",
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      const error = await response
        .json()
        .catch(() => ({ message: "Erreur réseau" }));
      throw new Error(error.message || `Erreur ${response.status}`);
    }

    return response.json();
  },

  // 👈 CONNECTER À VOTRE ENDPOINT DELETE /documents/:id
  async deleteDocument(id: string) {
    return apiCall(`/documents/${id}`, {
      method: "DELETE",
    });
    // Réponse attendue: { success: boolean }
  },

  // 👈 CONNECTER À VOTRE ENDPOINT GET /documents/shared
  async getSharedDocuments() {
    return apiCall("/documents/shared");
    // Réponse attendue: SharedDocument[]
  },

  // 👈 CONNECTER À VOTRE ENDPOINT POST /documents/:id/share
  async shareDocument(id: string, userIds: string[]) {
    return apiCall(`/documents/${id}/share`, {
      method: "POST",
      body: JSON.stringify({ userIds }),
    });
    // Réponse attendue: { success: boolean }
  },
};

// 👤 SERVICES UTILISATEUR
export const userService = {
  // 👈 CONNECTER À VOTRE ENDPOINT PUT /users/profile
  async updateProfile(userData: {
    firstName?: string;
    lastName?: string;
    email?: string;
  }) {
    return apiCall("/users/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    // Réponse attendue: User
  },

  // 👈 CONNECTER À VOTRE ENDPOINT PUT /users/password
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }) {
    return apiCall("/users/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    });
    // Réponse attendue: { success: boolean }
  },
};
