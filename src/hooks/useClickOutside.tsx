import React, { RefObject } from "react";

interface clickTypes {
  refs: RefObject<HTMLElement>[];
  handleClose: () => void;
  enabled: boolean;
}
function useClickOutside({ refs, handleClose, enabled }: clickTypes) {
  const timeoutRef = React.useRef<number | undefined>(undefined);

  React.useEffect(() => {
    if (!enabled) return; 
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node),
      );

      if (isOutside) {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = window.setTimeout(() => {
          handleClose();
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
