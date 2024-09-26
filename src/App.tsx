import { useLazyQuery } from "@apollo/client";
import createCache from "@emotion/cache";
import { CacheProvider } from "@emotion/react";
import { ThemeProvider as MuiThemeProvider } from "@mui/material/styles";
import { AdapterMoment } from "@mui/x-date-pickers/AdapterMoment";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { QUERY_GET_SEO } from "api/graphql/ad.graphql";
import routes from "app/routes";
import useTheme from "hooks/useTheme";
import { useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { useLocation, useRoutes } from "react-router-dom";
import createTheme from "theme";
import { getRouteName } from "utils/url.util";
import "./languages/i18n";

const emotionCache = createCache({ key: "css" });

function App() {
  const content = useRoutes(routes);
  const location = useLocation();
  const { theme } = useTheme();
  const [SEOData, setSEOData] = useState([]);
  const [title, setTitle] = useState("");
  const currentURL = location.pathname;
  const routeName = getRouteName(currentURL);
  const [getSEO] = useLazyQuery(QUERY_GET_SEO);

  const handleQuerySEO = async () => {
    const result = await getSEO({
      variables: {
        where: {
          title: routeName,
        },
      },
    });
    if (result?.data?.getPublicSEO?.data) {
      setSEOData(result?.data?.getPublicSEO?.data);
      setTitle(result?.data?.getPublicSEO?.data?.[0]?.title);
    }
  };
  const formattedData: any = SEOData?.map((item) => {
    return Object.entries(item).map(([key, value]) => {
      return {
        name: key,
        content: value,
      };
    });
  }).flat();

  useEffect(() => {
    handleQuerySEO();
  }, [routeName]);

  return (
    <CacheProvider value={emotionCache}>
      <HelmetProvider>
        <Helmet defaultTitle={title} meta={formattedData} />
        <LocalizationProvider dateAdapter={AdapterMoment}>
          <MuiThemeProvider theme={createTheme(theme)}>
            {content}
          </MuiThemeProvider>
        </LocalizationProvider>
      </HelmetProvider>
    </CacheProvider>
  );
}

export default App;
