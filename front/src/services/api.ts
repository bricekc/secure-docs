import { ApolloError } from "@apollo/client";
import { apolloClient } from "./apollo-client";
import {
  CREATE_DOCUMENTS,
  CREATE_USER,
  DELETE_FILE_IN_FOLDER,
  GET_DOCUMENT_CONTENT,
  GET_DOCUMENTS,
  LOGIN,
  UPDATE_DOCUMENT,
} from "./gql-requests";

const API_BASE_URL = import.meta.env.VITE_BACK_URL;

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

  async deleteDocument(fileName: string, id: number) {
    const response = await apolloClient.mutate({
      mutation: DELETE_FILE_IN_FOLDER,
      variables: {
        input: { fileName, id },
      },
    });

    return response.data.deleteFileInFolder;
  },

  async updateDocument(id: number, file: File) {
    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        query: UPDATE_DOCUMENT.loc?.source.body,
        variables: {
          id: id,
          file: null,
        },
      })
    );
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    formData.append("0", file);

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

  async getDocumentContent(id: number) {
    try {
      const { data } = await apolloClient.query({
        query: GET_DOCUMENT_CONTENT,
        variables: { id },
      });
      return data.getDocumentContent;
    } catch (error: unknown) {
      if (error instanceof ApolloError) {
        const message =
          error.message ||
          error.graphQLErrors[0]?.message ||
          "Erreur lors de la récupération du contenu du document";
        throw new Error(message);
      } else if (error instanceof Error) {
        throw new Error(error.message);
      } else {
        throw new Error(
          "Erreur lors de la récupération du contenu du document"
        );
      }
    }
  },
};
