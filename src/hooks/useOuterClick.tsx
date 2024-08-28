import { useEffect, useState } from "react";

function useOuterClick(ref:any) {
  const [isOuterClicked, setIsOuterClicked] = useState(false);

  const handleClick = (event:MouseEvent) => {
    setIsOuterClicked(ref.current?.contains(event.target));
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return isOuterClicked;
}

export default useOuterClick;
