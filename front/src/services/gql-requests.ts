import { gql } from "@apollo/client";

export const CREATE_USER = gql`
  mutation createUser($email: String!, $name: String!, $password: String!) {
    createUser(input: { email: $email, name: $name, password: $password }) {
      id
      email
      name
      role
    }
  }
`;

export const LOGIN = gql`
  mutation login($email: String!, $password: String!) {
    login(input: { email: $email, password: $password }) {
      access_token
      user {
        id
        email
        name
        role
      }
    }
  }
`;

export const GET_DOCUMENTS = gql`
  query listFilesInFolder {
    listFilesInFolder {
      id
      name
      status
      url
      user {
        name
      }
      types
    }
  }
`;

export const CREATE_DOCUMENTS = gql`
  mutation createDocument($file: Upload!) {
    createDocument(file: $file)
  }
`;

export const DELETE_FILE_IN_FOLDER = gql`
  mutation deleteFileInFolder($input: DeleteFileInput!) {
    deleteFileInFolder(input: $input)
  }
`;

export const UPDATE_DOCUMENT = gql`
  mutation updateDocument($id: Int!, $file: Upload!) {
    updateDocument(input: { id: $id, file: $file })
  }
`;

export const GET_DOCUMENT_CONTENT = gql`
  query getDocumentContent($id: Float!) {
    getDocumentContent(id: $id)
  }
`;

export const UPDATE_DOCUMENT_CONTENT = gql`
  mutation updateDocumentContent(
    $id: Int!
    $content: String!
    $filename: String!
  ) {
    updateDocumentContent(
      input: { id: $id, content: $content, filename: $filename }
    )
  }
`;

export const GET_CURRENT_USER = gql`
  query {
    getCurrentUser {
      email
      id
      name
      role
    }
  }
`;
