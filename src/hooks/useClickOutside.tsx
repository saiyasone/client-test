import React, { RefObject } from "react";

interface clickTypes {
  refs: RefObject<HTMLElement>[];
  handleClose: () => void;
}
function useClickOutside({ refs, handleClose }: clickTypes) {
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const isOutside = refs.every(
        (ref) => ref.current && !ref.current.contains(event.target as Node),
      );
      if (isOutside) {
        setTimeout(() => {
          handleClose();
        }, 200);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [refs, handleClose]);
}
export default useClickOutside;
