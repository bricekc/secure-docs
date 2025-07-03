"use client";
import { useState } from "react";
import type React from "react";
import { gql, useMutation } from "@apollo/client";

import { Outlet, Link, useLocation } from "react-router-dom";
import {
  Shield,
  Home,
  LogOut,
  Menu,
  X,
  MessageCircle,
  ChevronDown,
} from "lucide-react";
import { useAuth } from "../../hooks/useAuth";

const SEND_MESSAGE_MUTATION = gql`
  mutation SendMessage($input: SendMessageInput!) {
    sendMessage(input: $input)
  }
`;

export default function DashboardLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showChatbot, setShowChatbot] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [chatMessages, setChatMessages] = useState([
    {
      type: "bot",
      message:
        "Bonjour ! Je suis votre assistant IA intelligent. Comment puis-je vous aider aujourd'hui ?",
    },
  ]);
  const [chatInput, setChatInput] = useState("");
  const { user, logout } = useAuth();
  const location = useLocation();

  const [sendMessage, { loading: mutationLoading }] = useMutation(
    SEND_MESSAGE_MUTATION
  );

  const navigation = [
    { name: "Mes Documents", href: "/dashboard", icon: Home },
    ...(user?.role === "ADMIN"
      ? [{ name: "Admin", href: "/dashboard/admin", icon: Shield }]
      : []),
  ];

  const handleChatSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || mutationLoading) return;

    const userMessage = chatInput.trim();
    setChatMessages((prev) => [
      ...prev,
      { type: "user", message: userMessage },
    ]);
    setChatInput("");

    try {
      const { data } = await sendMessage({
        variables: {
          input: {
            message: userMessage,
          },
        },
      });

      const aiResponse =
        data?.sendMessage || "Désolé, une erreur est survenue.";

      setChatMessages((prev) => [
        ...prev,
        { type: "bot", message: aiResponse },
      ]);
    } catch (error) {
      console.error("Erreur chatbot:", error);
      setChatMessages((prev) => [
        ...prev,
        {
          type: "bot",
          message:
            "Je ne parviens pas à me connecter à l'assistant pour le moment.",
        },
      ]);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <button
              onClick={() => setSidebarOpen(true)}
              className="mobile-menu-button md:hidden"
            >
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

      {/* Mobile Menu */}
      {sidebarOpen && (
        <div className="mobile-menu-overlay">
          <div
            className="mobile-menu-backdrop"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="mobile-menu">
            <div className="mobile-menu-header">
              <div className="mobile-logo">
                <Shield className="w-6 h-6 text-blue-600" />
                <span className="font-bold text-gray-900">Secure Docs</span>
              </div>
              <button
                onClick={() => setSidebarOpen(false)}
                className="mobile-close-button"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <nav className="mobile-nav">
              {navigation.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={`mobile-nav-item ${
                      isActive ? "mobile-nav-item-active" : ""
                    }`}
                  >
                    <item.icon className="w-5 h-5" />
                    <span>{item.name}</span>
                  </Link>
                );
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
          <button
            onClick={() => setShowChatbot(true)}
            className="chat-toggle-btn"
          >
            <MessageCircle className="w-6 h-6" />
          </button>
        )}

        {showChatbot && (
          <div className="chatbot-container">
            <div className="chatbot-header">
              <h3>Assistant IA Gemini</h3>
              <button
                onClick={() => setShowChatbot(false)}
                className="chatbot-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="chatbot-messages">
              {chatMessages.map((msg, index) => (
                <div key={index} className={`message ${msg.type}`}>
                  <div className="message-content">{msg.message}</div>
                </div>
              ))}
              {mutationLoading && (
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
                disabled={mutationLoading}
              />
              <button
                type="submit"
                className="chat-send"
                disabled={mutationLoading}
              >
                {mutationLoading ? "..." : "Envoyer"}
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
