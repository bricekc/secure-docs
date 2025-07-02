"use client";
import { useState, useEffect } from "react";
import type React from "react";

import { ExternalLink, Edit, Trash2, Save, X, FileText } from "lucide-react";

interface Document {
  id: number;
  name: string;
  status: string;
  url: string;
  type: string;
  user: { name: string };
}

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [documentName, setDocumentName] = useState("");
  const [editUrl, setEditUrl] = useState("");
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null);
  const [showModal, setShowModal] = useState(false);

  // Tous les types ouvrent le modal de détails
  const handleView = (doc: Document, event?: React.MouseEvent) => {
    if (event) {
      event.preventDefault();
      event.stopPropagation();
    }

    // Ouvrir le modal pour TOUS les types de documents (y compris les URLs)
    setSelectedDoc(doc);
    setShowModal(true);
  };

  // Fonction pour commencer l'édition
  const handleEditStart = (doc: Document) => {
    setEditingId(doc.id);
    setDocumentName(doc.name);
    setEditUrl(doc.url || "");
  };

  // Fonction pour sauvegarder les modifications
  const handleEditSave = (id: number) => {
    setDocuments((docs) =>
      docs.map((doc) =>
        doc.id === id
          ? {
              ...doc,
              title: documentName,
              url: doc.type.toLowerCase() === "url" ? editUrl : doc.url,
              lastModified: "À l'instant",
            }
          : doc
      )
    );

    // Mettre à jour le document sélectionné si c'est le même
    if (selectedDoc && selectedDoc.id === id) {
      setSelectedDoc({
        ...selectedDoc,
        name: documentName,
        url:
          selectedDoc.type.toLowerCase() === "url" ? editUrl : selectedDoc.url,
      });
    }

    setEditingId(null);
    setDocumentName("");
    setEditUrl("");
  };

  // Fonction pour annuler l'édition
  const handleEditCancel = () => {
    setEditingId(null);
    setDocumentName("");
    setEditUrl("");
  };

  // Fonction pour supprimer un document
  const handleDelete = (id: number) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      setDocuments((docs) => docs.filter((doc) => doc.id !== id));
      if (selectedDoc && selectedDoc.id === id) {
        setShowModal(false);
        setSelectedDoc(null);
      }
    }
  };

  // useEffect pour charger les documents (normalement depuis l'API)
  useEffect(() => {
    const loadDocuments = async () => {
      const mockApiResponse = [
        {
          id: Date.now() + Math.random(),
          name: "document name",
          status: "status",
          user: { name: "user name" },
          url: "https://images-ext-1.discordapp.net/external/WeCIZx0ativLTw5rRdanuTwUzyHsG9bAKRK0y0MMNTw/%3Fsv%3D2025-05-05%26st%3D2025-07-02T11%253A52%253A39Z%26se%3D2025-07-03T11%253A52%253A39Z%26sr%3Db%26sp%3Dr%26sig%3Dt6XFJMx9YzwZC6p7EMwtg%252F6I3r98GQceb%252FdsX%252F%252BphKc%253D/https/securedocsm1.blob.core.windows.net/uploadfile/exemple%2540domaine.com/Capture%2520d%25E2%2580%2599e%25CC%2581cran%25202025-05-23%2520a%25CC%2580%252011.45.57.png?format=webp&quality=lossless&width=834&height=878",
          type: "png",
        },
      ];

      setDocuments(mockApiResponse);
    };

    loadDocuments();
  }, []);

  const filteredDocuments = documents
    .filter((doc) => {
      const searchTermLower = searchTerm.toLowerCase();
      const nameLower = doc.name.toLowerCase();
      return nameLower.includes(searchTermLower);
    })
    .filter(
      (doc) => filterType === "all" || doc.type.toLowerCase() === filterType
    );

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-semibold mb-6">Documents</h1>

      {/* Search and Filter Section */}
      <div className="flex justify-between items-center mb-4">
        <input
          type="text"
          placeholder="Rechercher un document..."
          className="shadow appearance-none border rounded w-1/3 py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          className="shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
        >
          <option value="all">Tous les types</option>
          <option value="pdf">PDF</option>
          <option value="docx">DOCX</option>
          <option value="xlsx">XLSX</option>
          <option value="pptx">PPTX</option>
          <option value="jpg">JPG</option>
          <option value="mp3">MP3</option>
          <option value="url">URL</option>
        </select>
      </div>

      {/* Documents List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredDocuments.map((doc) => (
          <div key={doc.id} className="bg-white shadow rounded-lg p-4">
            <h2 className="text-xl font-semibold mb-2">{doc.name}</h2>
            <p className="text-gray-600">Type: {doc.type}</p>
            {doc.type.toLowerCase() === "url" && (
              <p className="text-blue-600 text-sm truncate">URL: {doc.url}</p>
            )}
            <div className="mt-4 flex justify-end">
              <button
                onClick={(e) => handleView(doc, e)}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
              >
                Voir détails
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Document Details Modal */}
      {showModal && selectedDoc && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div
              className="fixed inset-0 transition-opacity"
              aria-hidden="true"
            >
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>

            <span
              className="hidden sm:inline-block sm:align-middle sm:h-screen"
              aria-hidden="true"
            >
              &#8203;
            </span>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-start mb-4">
                  <h3
                    className="text-lg leading-6 font-medium text-gray-900"
                    id="modal-title"
                  >
                    {selectedDoc.name}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Mode édition */}
                {editingId === selectedDoc.id ? (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Titre
                      </label>
                      <input
                        type="text"
                        value={documentName}
                        onChange={(e) => setDocumentName(e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>
                    {selectedDoc.type.toLowerCase() === "url" && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700">
                          URL
                        </label>
                        <input
                          type="url"
                          value={editUrl}
                          onChange={(e) => setEditUrl(e.target.value)}
                          className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                          placeholder="https://example.com"
                        />
                      </div>
                    )}
                  </div>
                ) : (
                  /* Mode affichage */
                  <div className="space-y-2">
                    <p className="text-sm text-gray-500">
                      {/* <strong>Type:</strong> {selectedDoc.type}
                      <br /> */}
                      <strong>Auteur:</strong> {selectedDoc.user.name}
                      <br />
                      {selectedDoc.url && (
                        <>
                          <br />
                          <strong>URL:</strong>{" "}
                          <span className="text-blue-600 break-all">
                            {selectedDoc.url}
                          </span>
                        </>
                      )}
                    </p>
                  </div>
                )}

                {/* Section de visualisation du fichier (seulement en mode affichage) */}
                {/* {editingId !== selectedDoc.id && (
                  <div className="mt-4">
                    {selectedDoc.fileData &&
                      selectedDoc.type.toLowerCase() === "pdf" && (
                        <div className="file-viewer">
                          <h4 className="text-md font-medium mb-2">
                            Aperçu PDF
                          </h4>
                          <iframe
                            src={selectedDoc.url}
                            width="100%"
                            height="400px"
                            title={selectedDoc.name}
                            className="w-full border rounded"
                          />
                        </div>
                      )}

                    {selectedDoc.fileData &&
                      (selectedDoc.type.toLowerCase() === "jpg" ||
                        selectedDoc.type.toLowerCase() === "png" ||
                        selectedDoc.type.toLowerCase() === "jpeg") && (
                        <div className="file-viewer">
                          <h4 className="text-md font-medium mb-2">
                            Aperçu Image
                          </h4>
                          <img
                            src={selectedDoc.fileData || "/placeholder.svg"}
                            alt={selectedDoc.fileName || selectedDoc.name}
                            className="w-full max-h-96 object-contain border rounded"
                            onError={(e) => {
                              e.currentTarget.src =
                                "/placeholder.svg?height=200&width=300";
                            }}
                          />
                        </div>
                      )}

                    {selectedDoc.fileData &&
                      selectedDoc.type.toLowerCase() === "docx" && (
                        <div className="file-viewer">
                          <h4 className="text-md font-medium mb-2">
                            Document Word
                          </h4>
                          <div className="docx-viewer bg-gray-100 p-8 rounded border text-center">
                            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">
                              <strong>Fichier Word détecté</strong>
                              <br />
                              Les fichiers DOCX ne peuvent pas être
                              prévisualisés directement dans le navigateur.
                            </p>
                            <div className="bg-blue-50 p-4 rounded border">
                              <p className="text-sm text-blue-800">
                                <strong>💡 Pour consulter ce document :</strong>
                                <br />• Cliquez sur "Télécharger" pour ouvrir le
                                fichier dans Microsoft Word
                                <br />• Ou utilisez un éditeur de texte
                                compatible
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {selectedDoc.fileData &&
                      (selectedDoc.type.toLowerCase() === "xlsx" ||
                        selectedDoc.type.toLowerCase() === "pptx") && (
                        <div className="file-viewer">
                          <h4 className="text-md font-medium mb-2">
                            Aperçu {selectedDoc.type}
                          </h4>
                          <div className="office-viewer">
                            <iframe
                              src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                selectedDoc.fileData
                              )}`}
                              width="100%"
                              height="500px"
                              title={selectedDoc.name}
                              className="w-full border rounded"
                              onError={() => {
                                console.error(
                                  "Erreur chargement Office Online"
                                );
                              }}
                            />
                            <div className="mt-2 p-3 bg-blue-50 rounded border">
                              <p className="text-sm text-blue-800">
                                <strong>💡 Astuce :</strong> Si l'aperçu ne
                                s'affiche pas, utilisez le bouton "Télécharger"
                                pour ouvrir le fichier.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                    {selectedDoc.type.toLowerCase() === "mp3" &&
                      selectedDoc.fileData && (
                        <div className="file-viewer">
                          <h4 className="text-md font-medium mb-2">
                            Aperçu Audio
                          </h4>
                          <audio controls className="w-full">
                            <source
                              src={selectedDoc.fileData}
                              type="audio/mpeg"
                            />
                            Votre navigateur ne supporte pas l'élément audio.
                          </audio>
                        </div>
                      )}

                    {selectedDoc.type.toLowerCase() === "url" &&
                      selectedDoc.url && (
                        <div className="file-viewer">
                          <h4 className="text-md font-medium mb-2">
                            🔗 Aperçu du lien
                          </h4>
                          <div className="bg-blue-50 p-4 rounded border">
                            <div className="flex justify-between items-center">
                              <div>
                                <p className="text-sm">
                                  <strong>URL:</strong> {selectedDoc.url}
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                  {selectedDoc.description}
                                </p>
                              </div>
                              <button
                                onClick={() =>
                                  window.open(selectedDoc.url, "_blank")
                                }
                                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                              >
                                <ExternalLink className="w-4 h-4" />
                                Ouvrir
                              </button>
                            </div>
                          </div>
                        </div>
                      )}
                  </div>
                )} */}
              </div>

              {/* Footer avec boutons d'action */}
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse gap-2">
                {editingId === selectedDoc.id ? (
                  /* Boutons en mode édition */
                  <>
                    <button
                      onClick={() => handleEditSave(selectedDoc.id)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                      <Save className="w-4 h-4" />
                      Sauvegarder
                    </button>
                    <button
                      onClick={handleEditCancel}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Annuler
                    </button>
                  </>
                ) : (
                  /* Boutons en mode affichage */
                  <>
                    <button
                      onClick={() => handleDelete(selectedDoc.id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Supprimer
                    </button>
                    <button
                      onClick={() => handleEditStart(selectedDoc)}
                      className="bg-yellow-500 hover:bg-yellow-700 text-white font-bold py-2 px-4 rounded flex items-center gap-2"
                    >
                      <Edit className="w-4 h-4" />
                      Modifier
                    </button>
                    <button
                      onClick={() => setShowModal(false)}
                      className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
                    >
                      Fermer
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
