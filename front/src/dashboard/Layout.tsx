"use client"
import { useState } from "react"
import type React from "react"

import { Outlet, Link, useLocation } from "react-router-dom"
import { Shield, Home, LogOut, Menu, X, MessageCircle, ChevronDown } from "lucide-react"
import { useAuth } from "../hooks/useAuth"

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [showChatbot, setShowChatbot] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [chatMessages, setChatMessages] = useState([
    {
      type: "bot",
      message: "Bonjour ! Je suis votre assistant IA intelligent. Comment puis-je vous aider aujourd'hui ?",
    },
  ])
  const [chatInput, setChatInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { user, logout } = useAuth()
  const location = useLocation()

  const navigation = [{ name: "Mes Documents", href: "/dashboard", icon: Home }]

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatInput.trim() || isLoading) return

    const userMessage = chatInput.trim()
    setChatMessages((prev) => [...prev, { type: "user", message: userMessage }])
    setChatInput("")
    setIsLoading(true)

    try {
      // Utilisation de l'API Google Gemini avec votre clé
      const GEMINI_API_KEY = "AIzaSyCpQ3SFlP5tJHhqjZ6fR5nZ1HvFtyBvNAk"

      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: `Tu es un assistant IA professionnel pour une plateforme de gestion documentaire appelée "Secure Docs". Tu aides les utilisateurs avec leurs questions sur la gestion de documents, la sécurité, l'organisation de fichiers, et toute question générale. Réponds en français de manière claire, utile et professionnelle. 

Question de l'utilisateur: ${userMessage}`,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1024,
            },
            safetySettings: [
              {
                category: "HARM_CATEGORY_HARASSMENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_HATE_SPEECH",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
              {
                category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                threshold: "BLOCK_MEDIUM_AND_ABOVE",
              },
            ],
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json()
        console.error("Erreur API Gemini:", errorData)
        throw new Error(`Erreur API: ${response.status} - ${errorData.error?.message || "Erreur inconnue"}`)
      }

      const data = await response.json()
      console.log("Réponse Gemini:", data)

      const aiResponse =
        data.candidates?.[0]?.content?.parts?.[0]?.text ||
        "Désolé, je n'ai pas pu traiter votre demande. Pouvez-vous reformuler votre question ?"

      setChatMessages((prev) => [...prev, { type: "bot", message: aiResponse }])
    } catch (error) {
      console.error("Erreur chatbot:", error)

      // Réponse de fallback plus intelligente
      let fallbackResponse = ""
      const lowerMessage = userMessage.toLowerCase()

      if (
        lowerMessage.includes("bonjour") ||
        lowerMessage.includes("salut") ||
        lowerMessage.includes("hi") ||
        lowerMessage.includes("hello")
      ) {
        fallbackResponse =
          "Bonjour ! Je suis votre assistant pour Secure Docs. Je peux vous aider avec la gestion de vos documents, l'organisation de fichiers, ou répondre à vos questions. Comment puis-je vous assister ?"
      } else if (lowerMessage.includes("document") || lowerMessage.includes("fichier")) {
        fallbackResponse =
          "Je peux vous aider avec la gestion de vos documents ! Vous pouvez créer, organiser, partager et sécuriser vos fichiers sur cette plateforme. Avez-vous une question spécifique ?"
      } else if (lowerMessage.includes("aide") || lowerMessage.includes("help")) {
        fallbackResponse =
          "Je suis là pour vous aider ! Vous pouvez me poser des questions sur : la gestion de documents, l'organisation de fichiers, la sécurité, le partage, ou toute autre question. Que souhaitez-vous savoir ?"
      } else {
        fallbackResponse = `Je rencontre une difficulté technique temporaire avec l'API Gemini. Cependant, concernant "${userMessage}", je peux vous dire que notre plateforme Secure Docs vous permet de gérer vos documents en toute sécurité. Pouvez-vous reformuler votre question ou me dire comment je peux vous aider autrement ?`
      }

      setChatMessages((prev) => [...prev, { type: "bot", message: fallbackResponse }])
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button onClick={() => setSidebarOpen(true)} className="mobile-menu-button md:hidden">
              <Menu className="w-6 h-6" />
            </button>
            <div className="header-logo">
              <div className="logo-icon">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <span className="logo-text">Secure Docs</span>
            </div>
          </div>

          <div className="header-right">
            <div className="user-menu-container">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="user-menu-button"
                onBlur={() => setTimeout(() => setShowUserMenu(false), 150)}
              >
                <div className="user-avatar">
                  <span className="text-white font-semibold">
                    {user?.firstName?.[0]}
                    {user?.lastName?.[0]}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-gray-500" />
              </button>

              {showUserMenu && (
                <div className="user-dropdown">
                  <div className="user-info-dropdown">
                    <div className="user-name">
                      {user?.firstName} {user?.lastName}
                    </div>
                    <div className="user-email">{user?.email}</div>
                  </div>
                  <div className="dropdown-divider"></div>
                  <button onClick={logout} className="logout-dropdown-btn">
                    <LogOut className="w-4 h-4" />
                    <span>Déconnexion</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Sidebar */}
      <aside className="sidebar">
        <nav className="sidebar-nav">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href
            return (
              <Link key={item.name} to={item.href} className={`nav-item ${isActive ? "nav-item-active" : ""}`}>
                <item.icon className="nav-icon" />
                <span className="nav-text">{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </aside>

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="mobile-menu-overlay">
          <div className="mobile-menu-backdrop" onClick={() => setSidebarOpen(false)} />
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div className="mobile-logo">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900">Secure Docs</span>
              </div>
              <button onClick={() => setSidebarOpen(false)} className="mobile-close-button">
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="mobile-nav">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`mobile-nav-item ${isActive ? "mobile-nav-item-active" : ""}`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
            <div className="mobile-menu-footer">
              <button onClick={logout} className="mobile-logout-button">
                <LogOut className="w-5 h-5" />
                <span>Déconnexion</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="main-content">
        <div className="content-wrapper">
          <Outlet />
        </div>
      </main>

      {/* Chatbot intelligent flottant */}
      <div className="chatbot-float">
        {!showChatbot && (
          <button onClick={() => setShowChatbot(true)} className="chat-toggle-btn">
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {showChatbot && (
          <div className="chatbot-container">
            <div className="chatbot-header">
              <h3>Assistant IA Gemini</h3>
              <button onClick={() => setShowChatbot(false)} className="chatbot-close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))}
              {isLoading && (
                <div className="message bot">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <form onSubmit={handleChatSubmit} className="chatbot-input">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Posez votre question..."
                className="chat-input"
                disabled={isLoading}
              />
              <button type="submit" className="chat-send" disabled={isLoading}>
                {isLoading ? "..." : "Envoyer"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
