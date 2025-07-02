import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@apollo/client";
import { GET_DOCUMENT_CONTENT, UPDATE_DOCUMENT_CONTENT } from "../services/gql-requests";
import { Button } from "./ui/Button";

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
  const { loading, error, data } = useQuery<{ getDocumentContent: string }>(GET_DOCUMENT_CONTENT, {
    variables: { id: document.id },
  });

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
      alert("Document saved successfully!");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving document:", err);
      alert("Failed to save document.");
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

  if (loading) return <p>Loading content...</p>;
  if (error) return <p>Error loading content: {error.message}</p>;

  return (
    <div className="text-editor-container">
      <textarea
        style={{
          width: '100%',
          height: '24rem',
          padding: '1rem',
          border: '1px solid #e2e8f0',
          borderRadius: '0.375rem',
          fontFamily: 'monospace',
          fontSize: '0.875rem',
        }}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        readOnly={!isEditing}
      />
      <div style={{ marginTop: '1rem', display: 'flex', gap: '0.5rem' }}>
        {!isEditing ? (
          <Button onClick={handleEdit}>Modifier le contenu du fichier</Button>
        ) : (
          <>
            <Button onClick={handleSave}>Sauvegarder</Button>
            <Button onClick={handleCancel} variant="outline">Annuler</Button>
          </>
        )}
      </div>
    </div>
  );
}
