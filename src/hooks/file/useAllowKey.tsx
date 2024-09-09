import React from "react";
import { IFileTypes } from "types/filesType";

type PrevAndNextProps = {
  handlePrevView: () => void;
  handleNextView: () => void;
  currentFile: IFileTypes;
  mainFile: IFileTypes[];
};
const useAllowKey = ({
  handlePrevView,
  handleNextView,
  currentFile,
  mainFile,
}: PrevAndNextProps) => {
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        handlePrevView();
      } else if (event.key === "ArrowRight") {
        handleNextView();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [currentFile, mainFile]);
};

export { useAllowKey };
