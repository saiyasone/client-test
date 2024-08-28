import { useLazyQuery } from "@apollo/client";
import { QUERY_SETTING } from "api/graphql/setting.graphql";
import { createContext, useContext, useEffect, useMemo } from "react";
import { decryptSettingKey } from "utils/secure.util";

export const SETTING_KEYS = {
  ACCOUNT_ID_STRIPE: {
    productKey: "Ac9BlQ",
    secretKey: "si4,2-3@-2j34jJS",
  },
  PUBLIC_KEY_STRIPE: {
    productKey: "stpkys",
    secretKey: "Jlsdjflwnlds;23j",
  },
  SECRET_KEY_STRIPE: {
    productKey: "jwewjr",
    secretKey: "How0weojrl:_SDfj",
  },
  CAPCHA_GOOGLE: "ECPTCHP",
  OAUTH_GITHUB: "LOGVGTS",
  OAUTH_GOOGLE: "LOGVAGG",
  OAUTH_FACEBOOK: "LOGVAFB",
  SIGN_IN_LIMIT: "LGONLIG",
  OAUTH_GOOGLE_MOBILE: "GGA0KS",
  OAUTH_FACEBOOK_MOBILE: "FKA9Mb",
  OAUTH_APPLE_MOBILE: "PaA9cZ",
};

export const SettingKeyContext = createContext({});

const SettingKeyProvider = ({ children }) => {
  const [getSetting, { data }] = useLazyQuery(QUERY_SETTING, {
    fetchPolicy: "no-cache",
  });

  const dataSetting = data?.general_settings?.data;

  async function customSettings() {
    try {
      await getSetting({
        variables: {
          noLimit: true,
        },
      });
    } catch (error) {
      console.error("Error on Setting", error);
    }
  }

  useEffect(() => {
    customSettings();
  }, []);

  const result = useMemo(() => {
    const accessKeyResult = Object.keys(SETTING_KEYS).map((settingKey) => {
      const dataSettingFound = dataSetting?.find(
        (data) =>
          data?.productKey ===
          (SETTING_KEYS[settingKey]?.productKey || SETTING_KEYS[settingKey]),
      );
      return {
        [settingKey]:
          decryptSettingKey(
            dataSettingFound?.action,
            SETTING_KEYS[settingKey]?.secretKey,
          ) ||
          dataSettingFound?.action ||
          null,
      };
    });
    return Object.assign({}, ...accessKeyResult);
  }, [dataSetting]);

  return (
    <SettingKeyContext.Provider
      value={{
        data: result,
      }}
    >
      {children}
    </SettingKeyContext.Provider>
  );
};

export const useSettingKey = () => {
  const settingKeyContext = useContext(SettingKeyContext);
  return settingKeyContext;
};

export default SettingKeyProvider;
