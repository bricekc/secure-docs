import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import {
  GET_DOCUMENT_CONTENT,
  UPDATE_DOCUMENT_CONTENT,
} from "../services/gql-requests";
import { Button } from "./ui/Button";
import toast from "react-hot-toast";

interface Document {
  id: number;
  name: string;
  types: string;
  url: string;
}

interface TextFileEditorProps {
  document: Document;
}

export default function TextFileEditor({ document }: TextFileEditorProps) {
  const { loading, error, data } = useQuery<{ getDocumentContent: string }>(
    GET_DOCUMENT_CONTENT,
    {
      variables: { id: document.id },
    }
  );

  const [content, setContent] = useState<string>("");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [updateDocumentContent] = useMutation(UPDATE_DOCUMENT_CONTENT);

  useEffect(() => {
    if (data?.getDocumentContent) {
      setContent(data.getDocumentContent);
    }
  }, [data]);

  const handleSave = async () => {
    try {
      await updateDocumentContent({
        variables: {
          id: document.id,
          content: content,
          filename: document.name,
        },
      });
      toast.success("Document saved successfully!", {
        style: { backgroundColor: "#2563eb", color: "#ffffff" },
        iconTheme: {
          primary: "#ffffff",
          secondary: "#2563eb",
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving document:", err);
      toast.error("Failed to save document.");
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (data?.getDocumentContent) {
      setContent(data.getDocumentContent);
    }
  };

  if (loading)
    return (
      <div className="text-editor-container">
        <div className="editor-loading">
          <div className="spinner"></div>
          Chargement du contenu...
        </div>
      </div>
    );

  if (error)
    return (
      <div className="text-editor-container">
        <div className="editor-error">
          Erreur lors du chargement : {error.message}
        </div>
      </div>
    );

  return (
    <div className="text-editor-container">
      <div className="editor-header">
        <h3 className="editor-title">Éditeur de fichier : {document.name}</h3>
      </div>
      <div className="editor-actions">
        {!isEditing ? (
          <Button onClick={handleEdit} className="primary-button">
            <svg
              className="button-icon"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
              />
            </svg>
            Modifier le contenu
          </Button>
        ) : (
          <>
            <Button onClick={handleSave} className="primary-button">
              <svg
                className="button-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              Sauvegarder
            </Button>
            <Button
              onClick={handleCancel}
              variant="outline"
              className="secondary-button"
            >
              <svg
                className="button-icon"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
              Annuler
            </Button>
          </>
        )}
      </div>
      <textarea
        className={`text-editor-textarea ${isEditing ? "editing" : "readonly"}`}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        readOnly={!isEditing}
        placeholder={
          isEditing ? "Tapez votre contenu ici..." : "Contenu en lecture seule"
        }
      />
    </div>
  );
}
