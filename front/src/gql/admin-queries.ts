import { gql } from "@apollo/client";

export const GET_USERS = gql`
  query getUsers {
    getUsers {
      id
      email
      name
      role
    }
  }
`;

export const GET_LOGS = gql`
  mutation logs($input: GetLogsInput!) {
    logs(input: $input) {
      id
      message
      timestamp
      type
    }
  }
`;
