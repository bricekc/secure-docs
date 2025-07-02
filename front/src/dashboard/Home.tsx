"use client";
import { useState, useEffect } from "react";
import {
  FileText,
  Plus,
  Eye,
  X,
  Search,
  Filter,
  Link,
  ImageIcon,
  Video,
  Music,
  ExternalLink,
  Download,
} from "lucide-react";
import { documentService } from "../services/api";

interface Document {
  id: number;
  name: string;
  type: string;
  url: string;
}

function AnimatedCounter({ value }: { value: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime: number;
    let animationFrame: number;

    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min(
        (currentTime - startTime) / Math.max(300, Math.min(1500, value * 100)),
        1
      );

      setCount(Math.floor(progress * value));

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);

    return () => {
      if (animationFrame) {
        cancelAnimationFrame(animationFrame);
      }
    };
  }, [value]);

  return <span>{count}</span>;
}

export default function DashboardHome() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [name, setName] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: "",
    file: null as File | null,
  });

  useEffect(() => {
    const fetchDocuments = async () => {
      const userDocuments = await documentService.getDocuments();
      setDocuments(userDocuments.listFilesInFolder);
    };
    fetchDocuments();
  }, []);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      doc.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleEditStart = (doc: Document) => {
    setEditingId(doc.id);
    setName(doc.name);
  };

  const handleEditSave = (id: number) => {
    setDocuments((docs) =>
      docs.map((doc) => (doc.id === id ? { ...doc, title: name } : doc))
    );
    setEditingId(null);
    setName("");

    // Mettre à jour le document sélectionné si c'est le même
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc({ ...selectedDoc, name });
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setName("");
  };

  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
      if (selectedDoc && selectedDoc.id === id) {
        setShowModal(false);
        setSelectedDoc(null);
      }
    }
  };

  const handleView = (doc: Document) => {
    // Ouvrir le modal pour TOUS les types de documents (y compris les URLs)
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const handleFileRead = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        console.log("Fichier lu:", result.substring(0, 100) + "..."); // Debug
        resolve(result);
      };
      reader.onerror = (error) => {
        console.error("Erreur lecture fichier:", error);
        reject(error);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleNewDocument = async () => {
    if (newDoc.file) {
      try {
        await documentService.createDocument({ file: newDoc.file });
        const userDocuments = await documentService.getDocuments();
        setDocuments(userDocuments.listFilesInFolder);
      } catch (error) {
        console.error("Erreur lors de la création du document:", error);
        alert("Erreur lors de la création du document");
        return;
      }
    }
    setNewDoc({ title: "", file: null });
    setShowNewDocModal(false);
  };

  const handleDownload = (doc: Document) => {
    if (doc.url) {
      const link = document.createElement("a");
      link.href = doc.url;
      link.download = doc.name;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else if (!doc.url) {
      window.open(doc.url, "_blank");
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "url":
        return Link;
      case "mp4":
        return Video;
      case "jpg":
      case "png":
        return ImageIcon;
      case "mp3":
        return Music;
      default:
        return FileText;
    }
  };

  return (
    <div className="dashboard-home">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes Documents</h1>
          <p className="page-subtitle">
            Gérez vos documents personnels en toute sécurité ({documents.length}{" "}
            documents)
          </p>
        </div>
        <button
          className="primary-button"
          onClick={() => setShowNewDocModal(true)}
        >
          <Plus className="w-4 h-4" />
          <span>Nouveau document</span>
        </button>
      </div>

      {/* Stats Cards avec animations */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-header">
            <h3 className="stat-title">Mes Documents</h3>
            <FileText className="stat-icon" />
          </div>
          <div className="stat-value">
            <AnimatedCounter value={documents.length} />
          </div>
        </div>
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
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="filter-select-large"
          >
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
          const TypeIcon = getTypeIcon(doc.type);
          return (
            <div key={doc.id} className="document-card">
              <div className="document-header">
                <div className="document-icon">
                  <TypeIcon className="w-6 h-6 text-blue-600" />
                </div>
                <div className="document-actions">
                  <button
                    onClick={() => handleView(doc)}
                    className="action-btn"
                    title="Voir"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="document-content">
                <h3 className="document-title">{doc.name}</h3>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && (
        <div className="empty-state">
          <FileText className="w-16 h-16 text-gray-400" />
          <h3>Aucun document trouvé</h3>
          <p>
            Essayez de modifier vos critères de recherche ou ajoutez un nouveau
            document
          </p>
        </div>
      )}

      {/* Modal Nouveau Document */}
      {showNewDocModal && (
        <div
          className="modal-overlay"
          onClick={() => setShowNewDocModal(false)}
        >
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Nouveau Document</h3>
              <button
                onClick={() => setShowNewDocModal(false)}
                className="modal-close"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label className="form-label">Fichier *</label>
                <div className="file-upload-container">
                  <input
                    type="file"
                    onChange={(e) =>
                      setNewDoc({
                        ...newDoc,
                        file: e.target.files?.[0] || null,
                      })
                    }
                    className="form-input"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.mp4,.avi,.mov,.jpg,.jpeg,.png,.gif,.mp3,.wav,.ogg"
                    required
                  />
                  <p
                    style={{
                      color: "#6B7280",
                      fontSize: "0.875rem",
                      marginTop: "0.5rem",
                      marginBottom: "1rem",
                      textAlign: "center",
                      fontStyle: "italic",
                    }}
                  >
                    Glissez-déposez votre fichier ici ou cliquez pour
                    sélectionner
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowNewDocModal(false)}
                className="btn-secondary"
              >
                Annuler
              </button>
              <button
                onClick={handleNewDocument}
                className="primary-button"
                disabled={!newDoc.file}
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
          <div
            className="modal-content-large"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-header">
              <h3>Détails du document</h3>
              <button
                onClick={() => setShowModal(false)}
                className="modal-close"
              >
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
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="form-input"
                      autoFocus
                    />
                  </div>
                </div>
              ) : (
                <div className="document-viewer">
                  {/* Informations du document */}
                  <div className="document-details-full">
                    <div className="detail-row">
                      <strong>Titre:</strong> {selectedDoc.name}
                    </div>
                    <div className="detail-row">
                      <strong>Type:</strong> {selectedDoc.type}
                    </div>
                    {selectedDoc.url && (
                      <div className="detail-row">
                        <strong>URL:</strong>{" "}
                        <a
                          href={selectedDoc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600"
                        >
                          {selectedDoc.url}
                        </a>
                      </div>
                    )}
                  </div>

                  {/* Visualiseur de fichier */}
                  {selectedDoc.url &&
                    selectedDoc.type.toLowerCase() === "pdf" && (
                      <div className="pdf-viewer">
                        <iframe
                          src={selectedDoc.url}
                          width="100%"
                          height="500px"
                          title={selectedDoc.name}
                          className="pdf-frame border rounded"
                          onError={() => console.error("Erreur chargement PDF")}
                        />
                      </div>
                    )}

                  {selectedDoc.url &&
                    (selectedDoc.type.toLowerCase() === "docx" ||
                      selectedDoc.type.toLowerCase() === "xlsx" ||
                      selectedDoc.type.toLowerCase() === "pptx") && (
                      <div className="office-viewer">
                        <h4 className="viewer-title">
                          Document {selectedDoc.type}
                        </h4>
                        <div className="office-preview bg-gray-100 p-8 rounded border text-center">
                          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                          <p className="text-gray-600 mb-4">
                            <strong>Fichier Microsoft Office détecté</strong>
                            <br />
                            Les fichiers {selectedDoc.type} ne peuvent pas être
                            prévisualisés dans le navigateur.
                          </p>
                          <div className="bg-blue-50 p-4 rounded border">
                            <p className="text-sm text-blue-800">
                              <strong>💡 Pour consulter ce document :</strong>
                              <br />• Cliquez sur "Télécharger" pour ouvrir le
                              fichier dans l'application appropriée
                              <br />• Microsoft Word, Excel ou PowerPoint selon
                              le type de fichier
                            </p>
                          </div>
                        </div>
                      </div>
                    )}

                  {selectedDoc.type.toLowerCase() === "mp4" && (
                    <div className="video-viewer">
                      <video
                        src={selectedDoc.url}
                        controls
                        width="100%"
                        height="400px"
                        className="preview-video"
                      />
                    </div>
                  )}
                  {selectedDoc.type.toLowerCase() === "mp3" && (
                    <div className="audio-viewer">
                      <audio
                        src={selectedDoc.url}
                        controls
                        className="preview-audio"
                      />
                    </div>
                  )}
                  {(selectedDoc.type.toLowerCase() === "jpg" ||
                    selectedDoc.type.toLowerCase() === "png") && (
                    <div className="image-viewer">
                      <img
                        src={selectedDoc.url || "/placeholder.svg"}
                        alt={selectedDoc.name}
                        className="preview-image max-w-full max-h-96 object-contain mx-auto border rounded"
                        onLoad={() => console.log("Image chargée avec succès")}
                        onError={(e) => {
                          console.error("Erreur chargement image");
                          e.currentTarget.src =
                            "/placeholder.svg?height=200&width=300";
                        }}
                      />
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
                  <button
                    onClick={() => handleEditSave(selectedDoc.id)}
                    className="primary-button"
                  >
                    Sauvegarder
                  </button>
                </>
              ) : (
                <>
                  {(selectedDoc.url || selectedDoc.url) && (
                    <button
                      onClick={() => handleDownload(selectedDoc)}
                      className="btn-download"
                    >
                      <Download className="w-4 h-4" />
                      Télécharger
                    </button>
                  )}
                  {selectedDoc.url && (
                    <button
                      onClick={() => window.open(selectedDoc.url, "_blank")}
                      className="btn-external"
                    >
                      <ExternalLink className="w-4 h-4" />
                      Ouvrir
                    </button>
                  )}
                  <button
                    onClick={() => handleEditStart(selectedDoc)}
                    className="btn-secondary"
                  >
                    Modifier
                  </button>
                  <button
                    onClick={() => handleDelete(selectedDoc.id)}
                    className="btn-danger"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
