import { useEffect, useState } from "react";

function useHover(ref) {
  const [isHovered, setIsHovered] = useState(false);
  const handleMouseOver = () => {
    setIsHovered(true);
  };

  const handleMouseOut = () => {
    setIsHovered(false);
  };

  useEffect(() => {
    if (!ref || !ref.current) {
      return;
    }
    const node = ref.current;

    node.addEventListener("mouseover", handleMouseOver);
    node.addEventListener("mouseout", handleMouseOut);

    return () => {
      node.removeEventListener("mouseover", handleMouseOver);
      node.removeEventListener("mouseout", handleMouseOut);
    };
  }, []);

  const handleClick = (event) => {
    if (ref.current && !ref.current.contains(event.target)) {
      setIsHovered(false);
    }
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClick);
    return () => {
      document.removeEventListener("mousedown", handleClick);
    };
  }, []);

  return isHovered;
}

export default useHover;
