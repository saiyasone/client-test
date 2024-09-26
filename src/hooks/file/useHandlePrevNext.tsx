import { IFileTypes } from "types/filesType";

type PrevAndNextProps = {
  currentFile: IFileTypes;
  mainFile: IFileTypes[];
};
const useHandlePreNext = () => {
  const handleNext = ({ currentFile, mainFile }: PrevAndNextProps) => {

    if (!mainFile || mainFile.length === 0) {
      return null;
    }
    const currentIndex = mainFile.findIndex(
      (fileId) => fileId._id === currentFile._id,
    );
    const nextIndex = (currentIndex + 1) % mainFile.length;
    const newIndex = mainFile[nextIndex];
    return newIndex;
  };

  const handlePrev = ({ currentFile, mainFile }: PrevAndNextProps) => {

    if (!mainFile || mainFile.length === 0) {
      return null;
    }
    
    const currentIndex = mainFile.findIndex(
      (fileId) => fileId._id === currentFile._id,
    );
    const prevIndex = (currentIndex - 1 + mainFile.length) % mainFile.length;
    const newIndex = mainFile[prevIndex];
    return newIndex;
  };

  return { handleNext, handlePrev };
};

export { useHandlePreNext };
