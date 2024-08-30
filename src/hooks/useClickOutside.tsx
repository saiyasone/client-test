import React, { RefObject } from "react";

interface clickTypes {
  refs: RefObject<HTMLElement>[];
  handleClose: () => void;
  setIsClose: React.Dispatch<React.SetStateAction<boolean>>;
}
function useClickOutside({ refs, handleClose, setIsClose }: clickTypes) {
  const timeoutRef = React.useRef<number | undefined>(undefined);
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node),
      );

      if (isOutside) {
        setIsClose(true);
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          handleClose();
          setIsClose(false);
        }, 200);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [refs, handleClose]);
}
export default useClickOutside;
