import {
  ApolloClient,
  InMemoryCache,
  createHttpLink,
  from,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { onError } from "@apollo/client/link/error";

// Configuration du lien HTTP
const httpLink = createHttpLink({
  uri: `${import.meta.env.VITE_BACK_URL}/graphql`, // Votre endpoint GraphQL
});

// Middleware pour ajouter le token d'authentification
const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem("token");

  return {
    headers: {
      ...headers,
      ...(token && { authorization: `Bearer ${token}` }),
    },
  };
});

// Gestion des erreurs
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  }

  if (networkError) {
    console.error(`[Network error]: ${networkError}`);

    // Redirection vers login si erreur 401
    if ("statusCode" in networkError && networkError.statusCode === 401) {
      localStorage.removeItem("token");
      window.location.href = "/login";
    }
  }
});

// Création du client Apollo
export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: {
      errorPolicy: "all",
    },
    query: {
      errorPolicy: "all",
    },
  },
});

export const resetApolloClient = async () => {
  await apolloClient.resetStore();
};
