import { useEffect } from "react";

type Prop = {
  isData?: boolean;
};
const useUnloadHandler = (props: Prop) => {
  useEffect(() => {
    const handleBeforeUnload = (event: BeforeUnloadEvent) => {
      if (props.isData) {
        event.preventDefault();
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload);
    };
  }, [props]);
};

export default useUnloadHandler;
