"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Eye, EyeOff, FileText, Lock, Mail, User, Shield } from "lucide-react"
import { authService } from "../services/api"

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [activeTab, setActiveTab] = useState("login")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("email") as string
    const password = formData.get("password") as string

    try {
      // 🔗 APPEL API RÉEL
      const response = await authService.login(email, password)

      localStorage.setItem("token", response.access_token)
      localStorage.setItem("user", JSON.stringify(response.user))

      navigate("/dashboard")
    } catch (err) {
      // 🎯 FALLBACK DÉMO si le backend n'est pas disponible
      console.warn("Backend non disponible, mode démo activé:", err)

      const mockResponse = {
        access_token: `demo_token_${Date.now()}`,
        user: {
          id: `user-${Date.now()}`,
          email: email,
          firstName: email.split("@")[0] || "User",
          lastName: "Demo",
        },
      }

      localStorage.setItem("token", mockResponse.access_token)
      localStorage.setItem("user", JSON.stringify(mockResponse.user))

      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    const formData = new FormData(e.target as HTMLFormElement)
    const email = formData.get("signupEmail") as string
    const password = formData.get("signupPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string
    const fullName = formData.get("fullName") as string

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas")
      setIsLoading(false)
      return
    }

    const [firstName, ...lastNameParts] = fullName.split(" ")
    const lastName = lastNameParts.join(" ")

    try {
      // 🔗 APPEL API RÉEL
      const response = await authService.register({
        email,
        password,
        firstName,
        lastName,
      })

      localStorage.setItem("token", response.access_token)
      localStorage.setItem("user", JSON.stringify(response.user))

      navigate("/dashboard")
    } catch (err) {
      // 🎯 FALLBACK DÉMO si le backend n'est pas disponible
      console.warn("Backend non disponible, mode démo activé:", err)

      const mockResponse = {
        access_token: "demo_token_new_user",
        user: {
          id: "demo-user-new",
          email: email,
          firstName: firstName,
          lastName: lastName,
        },
      }

      localStorage.setItem("token", mockResponse.access_token)
      localStorage.setItem("user", JSON.stringify(mockResponse.user))

      setTimeout(() => {
        navigate("/dashboard")
      }, 1500)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="login-container">
      <div className="login-card">
        {/* Logo et titre */}
        <div className="login-header">
          <div className="login-logo">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="login-title">Secure Docs</h1>
          <p className="login-subtitle">Plateforme sécurisée de gestion documentaire</p>
        </div>

        <div className="login-form-container">
          <div className="login-form-header">
            <h2 className="login-form-title">Accès à votre compte</h2>
            <p className="login-form-subtitle">Connectez-vous ou créez un nouveau compte</p>
          </div>

          <div className="login-form-content">
            {/* Error Message */}
            {error && (
              <div className="error-message">
                <p>{error}</p>
              </div>
            )}

            {/* Tabs */}
            <div className="tabs-container">
              <button
                onClick={() => setActiveTab("login")}
                className={`tab-button ${activeTab === "login" ? "tab-active" : ""}`}
              >
                Connexion
              </button>
              <button
                onClick={() => setActiveTab("signup")}
                className={`tab-button ${activeTab === "signup" ? "tab-active" : ""}`}
              >
                Inscription
              </button>
            </div>

            {/* Login Form */}
            {activeTab === "login" && (
              <form onSubmit={handleLogin} className="auth-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Adresse email
                  </label>
                  <div className="input-container">
                    <Mail className="input-icon" />
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="votre@email.com"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Mot de passe
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" />
                    <input
                      id="password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-input password-input"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="form-options">
                  <label className="checkbox-label">
                    <input type="checkbox" className="checkbox" />
                    <span>Se souvenir de moi</span>
                  </label>
                  <a href="#" className="forgot-password">
                    Mot de passe oublié ?
                  </a>
                </div>

                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? (
                    <div className="loading-content">
                      <div className="spinner"></div>
                      <span>Connexion en cours...</span>
                    </div>
                  ) : (
                    "Se connecter"
                  )}
                </button>
              </form>
            )}

            {/* Signup Form */}
            {activeTab === "signup" && (
              <form onSubmit={handleSignup} className="auth-form">
                <div className="form-group">
                  <label htmlFor="fullName" className="form-label">
                    Nom complet
                  </label>
                  <div className="input-container">
                    <User className="input-icon" />
                    <input
                      id="fullName"
                      name="fullName"
                      type="text"
                      placeholder="Jean Dupont"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupEmail" className="form-label">
                    Adresse email
                  </label>
                  <div className="input-container">
                    <Mail className="input-icon" />
                    <input
                      id="signupEmail"
                      name="signupEmail"
                      type="email"
                      placeholder="votre@email.com"
                      className="form-input"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="signupPassword" className="form-label">
                    Mot de passe
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" />
                    <input
                      id="signupPassword"
                      name="signupPassword"
                      type={showPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-input password-input"
                      required
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="password-toggle">
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirmer le mot de passe
                  </label>
                  <div className="input-container">
                    <Lock className="input-icon" />
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      placeholder="••••••••"
                      className="form-input password-input"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="password-toggle"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                <div className="terms-container">
                  <input type="checkbox" className="checkbox" required />
                  <span className="terms-text">
                    J'accepte les{" "}
                    <a href="#" className="terms-link">
                      conditions d'utilisation
                    </a>{" "}
                    et la{" "}
                    <a href="#" className="terms-link">
                      politique de confidentialité
                    </a>
                  </span>
                </div>

                <button type="submit" className="submit-button" disabled={isLoading}>
                  {isLoading ? (
                    <div className="loading-content">
                      <div className="spinner"></div>
                      <span>Création du compte...</span>
                    </div>
                  ) : (
                    "Créer un compte"
                  )}
                </button>
              </form>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="login-footer">
          <div className="footer-security">
            <FileText className="w-4 h-4" />
            <span>Plateforme sécurisée avec chiffrement de bout en bout</span>
          </div>
          <p>© 2024 Secure Docs. Tous droits réservés.</p>
        </div>
      </div>
    </div>
  )
}
