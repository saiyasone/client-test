import { gql, useMutation } from "@apollo/client";
import { ENV_KEYS } from "constants/env.constant";
import useAuth from "hooks/useAuth";
import React from "react";
import { Navigate, useNavigate } from "react-router-dom";

// For routes that can only be accessed by authenticated users
function TokenValidation({ children, tokenCheck }) {
  const navigate = useNavigate();
  const MUTATION = gql`
    mutation TokenValidation($where: CheckTokenInput) {
      tokenValidation(where: $where) {
        status
        data
      }
    }
  `;

  const [tokenValidation] = useMutation(MUTATION);
  React.useEffect(() => {
    (async () => {
      try {
        const { data } = await tokenValidation({
          variables: {
            where: {
              token: String(tokenCheck),
            },
          },
        });
        if (data?.tokenValidation?.status !== 200) {
          // localStorage.removeItem("accessToken");
          localStorage.removeItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
          navigate("/auth/sign-in");
        }
      } catch (error) {
        // localStorage.removeItem("accessToken");
        localStorage.removeItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
        navigate("/auth/sign-in");
      }
    })();
  }, [tokenValidation]);
  return <React.Fragment>{children}</React.Fragment>;
}

function ClientAuthGuard({ children }) {
  // const token = localStorage.getItem("accessToken");
  const token = localStorage.getItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);

  const { isAuthenticated, isInitialized } = useAuth();


  if (isInitialized && !isAuthenticated) {
    // localStorage.removeItem("accessToken");
    localStorage.removeItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
    return <Navigate to="/auth/sign-in" />;
  }
  if (!token) {
    // localStorage.removeItem("accessToken");
    localStorage.removeItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
    return <Navigate to="/auth/sign-in" />;
  }

  return (
    <TokenValidation tokenCheck={token} /*  user={user} */>
      {children}
    </TokenValidation>
  );
}

export default ClientAuthGuard;
