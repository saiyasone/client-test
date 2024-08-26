import { useMutation } from "@apollo/client";
import { MUTATION_TOKEN_VALIDATION } from "api/graphql/secure.graphql";
import { ENV_KEYS } from "constants/env.constant";
import { Fragment, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function TokenValidation({ children, tokenCheck }) {
  const navigate = useNavigate();
  const [tokenValidation] = useMutation(MUTATION_TOKEN_VALIDATION);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await tokenValidation({
          variables: {
            where: {
              token: String(tokenCheck),
            },
          },
        });
        if (data?.tokenValidation?.status === 200) {
          return navigate("/dashboard");
        }
      } catch (error) {
        localStorage.removeItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);
        return navigate("/auth/sign-in");
      }
    })();
  }, [tokenValidation]);

  return <Fragment>{children}</Fragment>;
}

function IsLoggedClientAuthGuard({ children }) {
  // const token = localStorage.getItem("accessToken");
  const token = localStorage.getItem(ENV_KEYS.VITE_APP_ACCESS_TOKEN_KEY);

  return <TokenValidation tokenCheck={token}>{children}</TokenValidation>;
}

export default IsLoggedClientAuthGuard;
