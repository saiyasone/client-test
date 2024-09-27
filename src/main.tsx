import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
  from,
  split
} from "@apollo/client";
import { setContext } from "@apollo/client/link/context";
import { GraphQLWsLink } from "@apollo/client/link/subscriptions";
import { getMainDefinition } from "@apollo/client/utilities";
import "animate.css/animate.min.css";
import { ENV_KEYS, envFeedConfig } from "constants/env.constant.ts";
import { ThemeProvider } from "contexts/ThemeProvider.tsx";
import { createClient } from "graphql-ws";
import React from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "stores/store.ts";
import App from "./App.tsx";


type ApiEndpointsKeys = string;

/*This function hide and show message to console*/
// (function () {
//   const originalConsoleLog = console.log;
//   window.console.log = function (...args:any[]) {
//     if (process.env.NODE_ENV ==="production") {
//       console.warn("Sorry, developers tools are blocked here....");
//       console.info(
//         "%cThis is a browser feature intended for developers. If someone told you to copy-paste something here to enable a vshare feature or hack someone's account, it is a scam and will give them access to your vshare account.",
//         "color: orange; font-size: 14px; font-weight: normal; background: #000; padding: 5px; border-radius: 5px;",
//       );

//       window.console.log = function () {
//         return true
//       };
//     } else {
//       originalConsoleLog.apply(console, args);
//     }
//   };
// })();
/* The below function block devtools if browser open devtools function will be detected, affter return debugger */
// (function () {
//   if (process.env.NODE_ENV == "production") {
//     (function a() {
//       try {
//         (function b(i) {
//           if (("" + i / i).length !== 1 || i % 20 === 0) {
//             (function () {}).constructor("debugger")();
//           } else {
//             debugger;
//           }
//           b(++i);
//         })(0);
//       } catch (e) {
//         setTimeout(a, 1000);
//       }
//     })();
//   }
// })();

const authLink = setContext((_, { headers }) => {
  const token = localStorage.getItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN as string);

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

// const httpLink = new HttpLink({
//   uri: ENV_KEYS.VITE_APP_API_URL,
// });
// const httpFeedLink = new HttpLink({
//   uri: envFeedConfig.endpoint,
// });

const apiEndpoints:Record<ApiEndpointsKeys, string> = {
  feed: envFeedConfig.endpoint,
};

const defaultEndpoint = ENV_KEYS.VITE_APP_API_URL;

const newHttpLink = createHttpLink({
  uri: ({ getContext }) => {
    const { api } = getContext();
    if (api && api in apiEndpoints) {
      return apiEndpoints[api];
    }
    return defaultEndpoint;
  },
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
  newHttpLink,
);

const client = new ApolloClient({
  link: from([authLink.concat(splitLink)]),
  cache: new InMemoryCache({
    addTypename: false,
  }),
  connectToDevTools: false,
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ApolloProvider client={client}>
        <ThemeProvider>
          <BrowserRouter>
            <App />
          </BrowserRouter>
        </ThemeProvider>
      </ApolloProvider>
    </Provider>
  </React.StrictMode>,
);
