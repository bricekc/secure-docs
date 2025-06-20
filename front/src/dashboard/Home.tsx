"use client"
import { useState, useEffect } from "react"
import {
  FileText,
  Users,
  Shield,
  TrendingUp,
  Plus,
  Eye,
  X,
  Search,
  Filter,
  Link,
  ImageIcon,
  Video,
  Music,
  Download,
  ExternalLink,
} from "lucide-react"

interface Document {
  id: number
  title: string
  type: string
  lastModified: string
  isShared: boolean
  description: string
  size: string
  author: string
  userId: string
  url?: string
  createdAt: string
  fileData?: string // Base64 data for files
  fileName?: string
}

interface StatCardProps {
  title: string
  value: number
  icon: any
  trend: string
  trendUp: boolean
}

function AnimatedCounter({ value, duration = 2000 }: { value: number; duration?: number }) {
  const [count, setCount] = useState(0)

  useEffect(() => {
    let startTime: number
    let animationFrame: number

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime
      const progress = Math.min((currentTime - startTime) / duration, 1)

      setCount(Math.floor(progress * value))

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate)
      }
    }

    animationFrame = requestAnimationFrame(animate)

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame)
      }
    }
  }, [value, duration])

  return <span>{count}</span>
}

function StatCard({ title, value, icon: Icon, trend, trendUp }: StatCardProps) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <h3 className="stat-title">{title}</h3>
        <Icon className="stat-icon" />
      </div>
      <div className="stat-value">
        <AnimatedCounter value={value} />
      </div>
      <p className={`stat-trend ${trendUp ? "trend-up" : "trend-down"}`}>{trend} par rapport au mois dernier</p>
    </div>
  )
}

export default function DashboardHome() {
  const [documents, setDocuments] = useState<Document[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [filterType, setFilterType] = useState("all")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [showNewDocModal, setShowNewDocModal] = useState(false)
  const [newDoc, setNewDoc] = useState({
    title: "",
    description: "",
    type: "PDF",
    url: "",
    file: null as File | null,
  })

  // Utilisateur actuel (simulé)
  const currentUser = {
    id: "user-1",
    name: "Demo User",
    email: "demo@securedocs.com",
  }

  const statsData = [
    { title: "Mes Documents", value: 6, icon: FileText, trend: "+2", trendUp: true },
    { title: "Partagés", value: 2, icon: Users, trend: "+1", trendUp: true },
    { title: "Sécurisés", value: 6, icon: Shield, trend: "100%", trendUp: true },
    { title: "Vues ce mois", value: 24, icon: TrendingUp, trend: "+8", trendUp: true },
  ]

  // Documents de l'utilisateur actuel uniquement
  const userDocuments = [
    {
      id: 1,
      title: "Mon Rapport financier Q4 2024",
      type: "PDF",
      lastModified: "Il y a 2 heures",
      isShared: true,
      description: "Analyse détaillée de mes performances financières",
      size: "2.4 MB",
      author: "Demo User",
      userId: "user-1",
      createdAt: "15/01/2024",
    },
    {
      id: 2,
      title: "Ma Présentation projet Alpha",
      type: "PPTX",
      lastModified: "Hier",
      isShared: false,
      description: "Mes slides de présentation pour le projet",
      size: "5.1 MB",
      author: "Demo User",
      userId: "user-1",
      createdAt: "14/01/2024",
    },
    {
      id: 3,
      title: "Mon Contrat partenariat Beta",
      type: "DOCX",
      lastModified: "Il y a 3 jours",
      isShared: true,
      description: "Document contractuel personnel",
      size: "1.8 MB",
      author: "Demo User",
      userId: "user-1",
      createdAt: "12/01/2024",
    },
    {
      id: 4,
      title: "Mon Budget prévisionnel 2025",
      type: "XLSX",
      lastModified: "Il y a 1 semaine",
      isShared: false,
      description: "Mes prévisions budgétaires personnelles",
      size: "3.2 MB",
      author: "Demo User",
      userId: "user-1",
      createdAt: "08/01/2024",
    },
    {
      id: 5,
      title: "Site Web Portfolio",
      type: "URL",
      lastModified: "Il y a 2 semaines",
      isShared: true,
      description: "Mon site web personnel",
      size: "-",
      author: "Demo User",
      userId: "user-1",
      url: "https://monportfolio.com",
      createdAt: "01/01/2024",
    },
    {
      id: 6,
      title: "Vidéo Présentation",
      type: "MP4",
      lastModified: "Il y a 1 mois",
      isShared: false,
      description: "Ma vidéo de présentation personnelle",
      size: "45.2 MB",
      author: "Demo User",
      userId: "user-1",
      createdAt: "20/12/2023",
    },
  ]

  useEffect(() => {
    // Charger seulement les documents de l'utilisateur actuel
    const userDocs = userDocuments.filter((doc) => doc.userId === currentUser.id)
    setDocuments(userDocs)
  }, [])

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = filterType === "all" || doc.type.toLowerCase() === filterType.toLowerCase()
    return matchesSearch && matchesFilter
  })

  const handleEditStart = (doc: Document) => {
    setEditingId(doc.id)
    setEditTitle(doc.title)
    setEditDescription(doc.description)
  }

  const handleEditSave = (id: number) => {
    setDocuments((docs) =>
      docs.map((doc) => (doc.id === id ? { ...doc, title: editTitle, description: editDescription } : doc)),
    )
    setEditingId(null)
    setEditTitle("")
    setEditDescription("")

    // Mettre à jour le document sélectionné si c'est le même
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc({ ...selectedDoc, title: editTitle, description: editDescription })
    }
  }

  const handleEditCancel = () => {
    setEditingId(null)
    setEditTitle("")
    setEditDescription("")
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      setDocuments((docs) => docs.filter((doc) => doc.id !== id))
      if (selectedDoc && selectedDoc.id === id) {
        setShowModal(false)
        setSelectedDoc(null)
      }
    }
  }

  const handleView = (doc: Document) => {
    // Ouvrir le modal pour TOUS les types de documents (y compris les URLs)
    setSelectedDoc(doc)
    setShowModal(true)
  }

  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => {
        const result = reader.result as string
        console.log("Fichier lu:", result.substring(0, 100) + "...") // Debug
        resolve(result)
      }
      reader.onerror = (error) => {
        console.error("Erreur lecture fichier:", error)
        reject(error)
      }
      reader.readAsDataURL(file)
    })
  }

  const handleNewDocument = async () => {
    if (!newDoc.title.trim()) return
    if (newDoc.type === "URL" && !newDoc.url.trim()) return

    let fileData = ""
    let fileName = ""

    if (newDoc.file) {
      try {
        fileData = await handleFileRead(newDoc.file)
        fileName = newDoc.file.name
        console.log("Fichier traité:", fileName, "Taille data:", fileData.length)
      } catch (error) {
        console.error("Erreur lors de la lecture du fichier:", error)
        alert("Erreur lors de la lecture du fichier")
        return
      }
    }

    const newDocument: Document = {
      id: Date.now(),
      title: newDoc.title,
      type: newDoc.type,
      description: newDoc.description,
      author: currentUser.name,
      userId: currentUser.id,
      lastModified: "À l'instant",
      createdAt: new Date().toLocaleDateString("fr-FR"),
      isShared: false,
      size: newDoc.file ? `${(newDoc.file.size / 1024 / 1024).toFixed(1)} MB` : "-",
      url: newDoc.url || undefined,
      fileData: fileData || undefined,
      fileName: fileName || undefined,
    }

    setDocuments((docs) => [newDocument, ...docs])
    setNewDoc({ title: "", description: "", type: "PDF", url: "", file: null })
    setShowNewDocModal(false)
  }

  const handleDownload = (doc: Document) => {
    if (doc.fileData) {
      const link = document.createElement("a")
      link.href = doc.fileData
      link.download = doc.fileName || doc.title
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } else if (doc.url) {
      window.open(doc.url, "_blank")
    }
  }

  const getTypeColor = (type: string) => {
    switch (type.toLowerCase()) {
      case "pdf":
        return "bg-red-100 text-red-800"
      case "docx":
        return "bg-blue-100 text-blue-800"
      case "pptx":
        return "bg-orange-100 text-orange-800"
      case "xlsx":
        return "bg-green-100 text-green-800"
      case "url":
        return "bg-purple-100 text-purple-800"
      case "mp4":
        return "bg-pink-100 text-pink-800"
      case "jpg":
      case "png":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "url":
        return Link
      case "mp4":
        return Video
      case "jpg":
      case "png":
        return ImageIcon
      case "mp3":
        return Music
      default:
        return FileText
    }
  }

  return (
    <div className="dashboard-home">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Documents</h1>
          <p className="page-subtitle">
            Gérez vos documents personnels en toute sécurité ({documents.length} documents)
          </p>
        </div>
        <button className="primary-button" onClick={() => setShowNewDocModal(true)}>
          <Plus className="w-4 h-4" />
          <span>Nouveau document</span>
        </button>
      </div>

      {/* Stats Cards avec animations */}
      <div className="stats-grid">
        {statsData.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Filters - AGRANDIS */}
      <div className="filters-section-large">
        <div className="search-container-large">
          <Search className="search-icon-large" />
          <input
            type="text"
            placeholder="Rechercher dans vos documents..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input-large"
          />
        </div>
        <div className="filter-container-large">
          <Filter className="filter-icon-large" />
          <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="filter-select-large">
            <option value="all">Tous les types</option>
            <option value="pdf">PDF</option>
            <option value="docx">DOCX</option>
            <option value="pptx">PPTX</option>
            <option value="xlsx">XLSX</option>
            <option value="url">URL</option>
            <option value="mp4">Vidéo</option>
          </select>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="documents-grid">
        {filteredDocuments.map((doc) => {
          const TypeIcon = getTypeIcon(doc.type)
          return (
            <div key={doc.id} className="document-card">
              <div className="document-header">
                <div className="document-icon">
                  <TypeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="document-actions">
                  <button onClick={() => handleView(doc)} className="action-btn" title="Voir">
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="document-content">
                <h3 className="document-title">{doc.title}</h3>
              </div>
            </div>
          )
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="empty-state">
          <FileText className="w-16 h-16 text-gray-400" />
          <h3>Aucun document trouvé</h3>
          <p>Essayez de modifier vos critères de recherche ou ajoutez un nouveau document</p>
        </div>
      )}

      {/* Modal Nouveau Document */}
      {showNewDocModal && (
        <div className="modal-overlay" onClick={() => setShowNewDocModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouveau Document</h3>
              <button onClick={() => setShowNewDocModal(false)} className="modal-close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Titre du document *</label>
                <input
                  type="text"
                  value={newDoc.title}
                  onChange={(e) => setNewDoc({ ...newDoc, title: e.target.value })}
                  className="form-input"
                  placeholder="Nom de votre document"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Description</label>
                <textarea
                  value={newDoc.description}
                  onChange={(e) => setNewDoc({ ...newDoc, description: e.target.value })}
                  className="form-textarea"
                  placeholder="Description du document"
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Type de document</label>
                <select
                  value={newDoc.type}
                  onChange={(e) => setNewDoc({ ...newDoc, type: e.target.value })}
                  className="form-select"
                >
                  <option value="PDF">PDF</option>
                  <option value="DOCX">Word Document</option>
                  <option value="PPTX">PowerPoint</option>
                  <option value="XLSX">Excel</option>
                  <option value="URL">Lien Web</option>
                  <option value="MP4">Vidéo</option>
                  <option value="JPG">Image</option>
                  <option value="MP3">Audio</option>
                </select>
              </div>

              {newDoc.type === "URL" ? (
                <div className="form-group">
                  <label className="form-label">URL du lien *</label>
                  <input
                    type="url"
                    value={newDoc.url}
                    onChange={(e) => setNewDoc({ ...newDoc, url: e.target.value })}
                    className="form-input"
                    placeholder="https://example.com"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label className="form-label">Fichier *</label>
                  <input
                    type="file"
                    onChange={(e) => setNewDoc({ ...newDoc, file: e.target.files?.[0] || null })}
                    className="form-input"
                    accept={
                      newDoc.type === "PDF"
                        ? ".pdf"
                        : newDoc.type === "DOCX"
                          ? ".docx,.doc"
                          : newDoc.type === "PPTX"
                            ? ".pptx,.ppt"
                            : newDoc.type === "XLSX"
                              ? ".xlsx,.xls"
                              : newDoc.type === "MP4"
                                ? ".mp4,.avi,.mov"
                                : newDoc.type === "JPG"
                                  ? ".jpg,.jpeg,.png,.gif"
                                  : newDoc.type === "MP3"
                                    ? ".mp3,.wav,.ogg"
                                    : "*"
                    }
                    required
                  />
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button onClick={() => setShowNewDocModal(false)} className="btn-secondary">
                Annuler
              </button>
              <button
                onClick={handleNewDocument}
                className="primary-button"
                disabled={
                  !newDoc.title.trim() ||
                  (newDoc.type === "URL" && !newDoc.url.trim()) ||
                  (newDoc.type !== "URL" && !newDoc.file)
                }
              >
                Créer le document
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails avec visualisation */}
      {showModal && selectedDoc && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Détails du document</h3>
              <button onClick={() => setShowModal(false)} className="modal-close">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body-large">
              {editingId === selectedDoc.id ? (
                <div className="edit-container">
                  <div className="form-group">
                    <label className="form-label">Titre</label>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="form-input"
                      autoFocus
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              ) : (
                <div className="document-viewer">
                  {/* Informations du document */}
                  <div className="document-details-full">
                    <div className="detail-row">
                      <strong>Titre:</strong> {selectedDoc.title}
                    </div>
                    <div className="detail-row">
                      <strong>Type:</strong> {selectedDoc.type}
                    </div>
                    <div className="detail-row">
                      <strong>Taille:</strong> {selectedDoc.size}
                    </div>
                    <div className="detail-row">
                      <strong>Auteur:</strong> {selectedDoc.author}
                    </div>
                    <div className="detail-row">
                      <strong>Créé le:</strong> {selectedDoc.createdAt}
                    </div>
                    <div className="detail-row">
                      <strong>Dernière modification:</strong> {selectedDoc.lastModified}
                    </div>
                    <div className="detail-row">
                      <strong>Description:</strong> {selectedDoc.description}
                    </div>
                    <div className="detail-row">
                      <strong>Statut:</strong> {selectedDoc.isShared ? "Partagé" : "Privé"}
                    </div>
                    {selectedDoc.url && (
                      <div className="detail-row">
                        <strong>URL:</strong>{" "}
                        <a href={selectedDoc.url} target="_blank" rel="noopener noreferrer" className="text-blue-600">
                          {selectedDoc.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Visualiseur de fichier */}
                  {selectedDoc.fileData && selectedDoc.type.toLowerCase() === "pdf" && (
                    <div className="pdf-viewer">
                      <iframe
                        src={selectedDoc.fileData}
                        width="100%"
                        height="500px"
                        title={selectedDoc.title}
                        className="pdf-frame border rounded"
                        onError={() => console.error("Erreur chargement PDF")}
                      />
                    </div>
                  )}

                  {selectedDoc.fileData &&
                    (selectedDoc.type.toLowerCase() === "docx" ||
                      selectedDoc.type.toLowerCase() === "xlsx" ||
                      selectedDoc.type.toLowerCase() === "pptx") && (
                      <div className="office-viewer">
                        <h4 className="viewer-title">Document {selectedDoc.type}</h4>
                        <div className="office-preview bg-gray-100 p-8 rounded border text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">
                            <strong>Fichier Microsoft Office détecté</strong>
                            <br />
                            Les fichiers {selectedDoc.type} ne peuvent pas être prévisualisés dans le navigateur.
                          </p>
                          <div className="bg-blue-50 p-4 rounded border">
                            <p className="text-sm text-blue-800">
                              <strong>💡 Pour consulter ce document :</strong>
                              <br />• Cliquez sur "Télécharger" pour ouvrir le fichier dans l'application appropriée
                              <br />• Microsoft Word, Excel ou PowerPoint selon le type de fichier
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {(selectedDoc.type.toLowerCase() === "jpg" || selectedDoc.type.toLowerCase() === "png") && (
                    <div className="image-viewer">
                      <img
                        src={selectedDoc.fileData || "/placeholder.svg"}
                        alt={selectedDoc.title}
                        className="preview-image max-w-full max-h-96 object-contain mx-auto border rounded"
                        onLoad={() => console.log("Image chargée avec succès")}
                        onError={(e) => {
                          console.error("Erreur chargement image")
                          e.currentTarget.src = "/placeholder.svg?height=200&width=300"
                        }}
                      />
                    </div>
                  )}
                  {selectedDoc.type.toLowerCase() === "mp4" && (
                    <div className="video-viewer">
                      <video
                        src={selectedDoc.fileData}
                        controls
                        width="100%"
                        height="400px"
                        className="preview-video"
                      />
                    </div>
                  )}
                  {selectedDoc.type.toLowerCase() === "mp3" && (
                    <div className="audio-viewer">
                      <audio src={selectedDoc.fileData} controls className="preview-audio" />
                    </div>
                  )}
                </div>
              )}
            </div>
            <div className="modal-footer">
              {editingId === selectedDoc.id ? (
                <>
                  <button onClick={handleEditCancel} className="btn-secondary">
                    Annuler
                  </button>
                  <button onClick={() => handleEditSave(selectedDoc.id)} className="primary-button">
                    Sauvegarder
                  </button>
                </>
              ) : (
                <>
                  {(selectedDoc.fileData || selectedDoc.url) && (
                    <button onClick={() => handleDownload(selectedDoc)} className="btn-download">
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  )}
                  {selectedDoc.url && (
                    <button onClick={() => window.open(selectedDoc.url, "_blank")} className="btn-external">
                      <ExternalLink className="w-4 h-4" />
                      Ouvrir
                    </button>
                  )}
                  <button onClick={() => handleEditStart(selectedDoc)} className="btn-secondary">
                    Modifier
                  </button>
                  <button onClick={() => handleDelete(selectedDoc.id)} className="btn-danger">
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
