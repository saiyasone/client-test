import { useEffect } from "react";

type Prop = {
  isData?: boolean;

  onReload?: () => void;
};
const useUnloadHandler = (props: Prop) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (props.isData) {
        event.preventDefault();
        event.returnValue = "";
      }

      if (props.onReload) {
        props.onReload();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [props?.isData]);
};

export default useUnloadHandler;
