// Configuration de base pour les appels API
const API_BASE_URL = "http://localhost:3000/api" // 👈 MODIFIER L'URL DE VOTRE BACKEND

// Fonction utilitaire pour les appels API avec gestion du token
async function apiCall(endpoint: string, options: RequestInit = {}) {
  const token = localStorage.getItem("token")

  const config: RequestInit = {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: "Erreur réseau" }))
    throw new Error(error.message || `Erreur ${response.status}`)
  }

  return response.json()
}

// 🔐 SERVICES D'AUTHENTIFICATION
export const authService = {
  // 👈 CONNECTER À VOTRE ENDPOINT DE LOGIN
  async login(email: string, password: string) {
    return apiCall("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    })
    // Réponse attendue: { access_token: string, user: User }
  },

  // 👈 CONNECTER À VOTRE ENDPOINT DE REGISTER
  async register(userData: { email: string; password: string; firstName: string; lastName: string }) {
    return apiCall("/auth/register", {
      method: "POST",
      body: JSON.stringify(userData),
    })
    // Réponse attendue: { access_token: string, user: User }
  },

  // 👈 CONNECTER À VOTRE ENDPOINT DE PROFIL
  async getProfile() {
    return apiCall("/auth/profile")
    // Réponse attendue: User
  },
}

// 📄 SERVICES DE DOCUMENTS
export const documentService = {
  // 👈 CONNECTER À VOTRE ENDPOINT GET /documents
  async getDocuments() {
    return apiCall("/documents")
    // Réponse attendue: Document[]
  },

  // 👈 CONNECTER À VOTRE ENDPOINT POST /documents
  async createDocument(documentData: { title: string; description: string; type: string }) {
    return apiCall("/documents", {
      method: "POST",
      body: JSON.stringify(documentData),
    })
    // Réponse attendue: Document
  },

  // 👈 CONNECTER À VOTRE ENDPOINT DELETE /documents/:id
  async deleteDocument(id: string) {
    return apiCall(`/documents/${id}`, {
      method: "DELETE",
    })
    // Réponse attendue: { success: boolean }
  },

  // 👈 CONNECTER À VOTRE ENDPOINT GET /documents/shared
  async getSharedDocuments() {
    return apiCall("/documents/shared")
    // Réponse attendue: SharedDocument[]
  },

  // 👈 CONNECTER À VOTRE ENDPOINT POST /documents/:id/share
  async shareDocument(id: string, userIds: string[]) {
    return apiCall(`/documents/${id}/share`, {
      method: "POST",
      body: JSON.stringify({ userIds }),
    })
    // Réponse attendue: { success: boolean }
  },
}

// 👤 SERVICES UTILISATEUR
export const userService = {
  // 👈 CONNECTER À VOTRE ENDPOINT PUT /users/profile
  async updateProfile(userData: { firstName?: string; lastName?: string; email?: string }) {
    return apiCall("/users/profile", {
      method: "PUT",
      body: JSON.stringify(userData),
    })
    // Réponse attendue: User
  },

  // 👈 CONNECTER À VOTRE ENDPOINT PUT /users/password
  async changePassword(passwordData: { currentPassword: string; newPassword: string }) {
    return apiCall("/users/password", {
      method: "PUT",
      body: JSON.stringify(passwordData),
    })
    // Réponse attendue: { success: boolean }
  },
}
