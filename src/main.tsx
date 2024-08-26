import {
  ApolloClient,
  ApolloProvider,
  HttpLink,
  InMemoryCache,
  createHttpLink,
  from,
  split,
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import "animate.css/animate.min.css";
import { ENV_KEYS } from "constants/env.constant.ts";
import { ThemeProvider } from "contexts/ThemeProvider.tsx";
import { createClient } from "graphql-ws";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "stores/store.ts";
import App from "./App.tsx";

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(
    ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY as string,
  );

  return {
    headers: {
      ...headers,
      authorization: token,
    },
  };
});

export const clientMockup = new ApolloClient({
  link: from([
    authLink.concat(
      createHttpLink({
        uri: ENV_KEYS.VITE_APP_API_URL,
      }),
    ),
  ]),
  cache: new InMemoryCache({
    addTypename: false,
  }),
  connectToDevTools: false,
});

const wsLink = new GraphQLWsLink(
  createClient({
    url: `wss://${ENV_KEYS.VITE_APP_SUBSCRIPTION_URL}`,
  }),
);

const httpLink = new HttpLink({
  uri: ENV_KEYS.VITE_APP_API_URL,
});

const splitLink = split(
  ({ query }) => {
    const definition = getMainDefinition(query);
    return (
      definition.kind === "OperationDefinition" &&
      definition.operation === "subscription"
    );
  },
  wsLink,
  httpLink,
);

const client = new ApolloClient({
  link: from([authLink.concat(splitLink)]),
  cache: new InMemoryCache({
    addTypename: false,
  }),
  connectToDevTools: false,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  // <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </ApolloProvider>
    </Provider>
  // </React.StrictMode>,
);
