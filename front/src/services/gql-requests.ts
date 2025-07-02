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
