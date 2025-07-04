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
  Download,
} from "lucide-react";
import { documentService } from "../../services/api";
import { io } from "socket.io-client";
import toast from "react-hot-toast";
import TextFileEditor from "../../components/TextFileEditor";

interface Document {
  id: number;
  name: string;
  types: string;
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
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showNewDocModal, setShowNewDocModal] = useState(false);
  const [newDoc, setNewDoc] = useState({
    title: "",
    file: null as File | null,
  });
  const JWTToken: string = localStorage.getItem("token") || "";

  useEffect(() => {
    const fetchDocuments = async () => {
      const userDocuments = await documentService.getDocuments();
      setDocuments(userDocuments.listFilesInFolder);
    };
    fetchDocuments();

    const socket = io(import.meta.env.VITE_WORKER_URL, {
      query: { JWTToken },
    });

    socket.on("connect", () => {
      console.log("Connected to socket server");
    });

    socket.on("document-upload", (data) => {
      console.log("data upload : ", data);
      toast.success(`New document uploaded: ${data.name}`, {
        style: { backgroundColor: "#2563eb", color: "#ffffff" },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#2563eb",
        },
      });
      setDocuments((prevDocs) => [...prevDocs, data]);
    });

    socket.on("document-update", (data) => {
      console.log("data update : ", data[0]);
      toast.success(`Document updated: ${data[0].name}`, {
        style: { backgroundColor: "#2563eb", color: "#ffffff" },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#2563eb",
        },
      });
      setDocuments((prevDocs) =>
        prevDocs.map((doc) => (doc.id === data[0].id ? data[0] : doc))
      );
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from socket server");
    });

    return () => {
      socket.disconnect();
    };
  }, [JWTToken]);

  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesFilter =
      filterType === "all" ||
      doc.types.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleEditStart = (doc: Document) => {
    setEditingId(doc.id);
  };

  const handleEditSave = async (id: number) => {
    if (!selectedDoc || !newDoc.file) {
      alert("Veuillez sélectionner un fichier pour la mise à jour.");
      return;
    }

    try {
      await documentService.updateDocument(id, newDoc.file);
      const userDocuments = await documentService.getDocuments();
      setDocuments(userDocuments.listFilesInFolder);
      setEditingId(null);
      setNewDoc({ title: "", file: null });
      setSelectedDoc(null);
      setShowModal(false);
      alert("Document mis à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour du document:", error);
      alert("Erreur lors de la mise à jour du document.");
    }
  };

  const handleEditCancel = () => {
    setEditingId(null);
  };

  const handleDelete = async (id: number) => {
    const response = await documentService.deleteDocument(
      selectedDoc?.name || "",
      id
    );
    if (response) {
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
      if (selectedDoc && selectedDoc.id === id) {
        setShowModal(false);
        setSelectedDoc(null);
      }
    }
  };

  const handleView = (doc: Document) => {
    setSelectedDoc(doc);
    setShowModal(true);
  };

  const handleNewDocument = async () => {
    if (newDoc.file) {
      try {
        const a = await documentService.createDocument({ file: newDoc.file });
        console.log(a)
        if (a?.errors) {
          toast.error(a.errors[0].message)

        }
        const userDocuments = await documentService.getDocuments();
        setDocuments(userDocuments.listFilesInFolder);
      } catch {
        toast.error("Error lors de la création du document");
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

  const getTypeIcon = (types: string) => {
    switch (types.toLowerCase()) {
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
          const TypeIcon = getTypeIcon(doc.types);
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
                <div className="form-group">
                  <label className="form-label">Fichier *</label>
                  <div className="file-upload-container">
                    <input
                      type="file"
                      onChange={(e) => {
                        const selectedFile = e.target.files?.[0] || null;
                        if (
                          selectedFile &&
                          selectedDoc &&
                          selectedFile.name !== selectedDoc.name
                        ) {
                          alert(
                            "Le nom du fichier doit être le même que le document existant."
                          );
                          e.target.value = "";
                          setNewDoc({ ...newDoc, file: null });
                        } else {
                          setNewDoc({
                            ...newDoc,
                            file: selectedFile,
                          });
                        }
                      }}
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
              ) : (
                <div className="document-viewer">
                  {/* Informations du document */}
                  <div className="document-details-full">
                    <div className="detail-row">
                      <strong>Titre:</strong> {selectedDoc.name}
                    </div>
                    <div className="detail-row">
                      <strong>Type:</strong> {selectedDoc.types}
                    </div>
                  </div>

                  {/* Visualiseur de fichier */}
                  {selectedDoc.url &&
                    selectedDoc.types.toLowerCase() === "pdf" && (
                      <div className="pdf-viewer">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                            selectedDoc.url
                          )}&embedded=true`}
                          width="100%"
                          height="500px"
                          title={selectedDoc.name}
                          className="pdf-frame border rounded"
                          onError={() => console.error("Erreur chargement PDF")}
                        />
                      </div>
                    )}

                  {selectedDoc.url &&
                    selectedDoc.types.toLowerCase() === "txt" && (
                      <TextFileEditor document={selectedDoc} />
                    )}

                  {selectedDoc.url &&
                    (selectedDoc.types.toLowerCase() === "docx" ||
                      selectedDoc.types.toLowerCase() === "xlsx" ||
                      selectedDoc.types.toLowerCase() === "pptx") && (
                      <div className="office-viewer">
                        <iframe
                          src={`https://docs.google.com/viewer?url=${encodeURIComponent(
                            selectedDoc.url
                          )}&embedded=true`}
                          width="100%"
                          height="500px"
                          title={selectedDoc.name}
                          className="office-frame border rounded"
                          onError={() =>
                            console.error("Erreur chargement document Office")
                          }
                        />
                      </div>
                    )}

                  {selectedDoc.types.toLowerCase() === "mp4" && (
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
                  {selectedDoc.types.toLowerCase() === "mp3" && (
                    <div className="audio-viewer">
                      <audio
                        src={selectedDoc.url}
                        controls
                        className="preview-audio"
                      />
                    </div>
                  )}
                  {(selectedDoc.types.toLowerCase() === "jpg" ||
                    selectedDoc.types.toLowerCase() === "png") && (
                    <div className="image-viewer">
                      <img
                        src={selectedDoc.url || "/placeholder.svg"}
                        alt={selectedDoc.name}
                        className="preview-image max-w-full max-h-96 object-contain mx-auto border rounded"
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
