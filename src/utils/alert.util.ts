import Notiflix from "notiflix";

export const  successMessage = (message: string, timeout?: number) => {
  Notiflix.Notify.init({ position: "right-top" });
  Notiflix.Notify.success(message, {
    width: "350px",
    timeout: timeout,
    cssAnimation: true,
    fontSize: "16px",
    cssAnimationDuration: 400,
    cssAnimationStyle: "from-top",
    success: {
      textColor: "#ffffff",
      childClassName: "notiflix-notify-success",
      notiflixIconColor: "#ffffff",
      /* notiflixIconSize: "16px", */
    },
  });
};

export const warningMessage = (message: string, timeout?: number) => {
  Notiflix.Notify.init({ position: "right-top" });
  Notiflix.Notify.warning(message, {
    width: "350px",
    timeout: timeout,
    cssAnimation: true,
    fontSize: "16px",
    cssAnimationDuration: 400,
    cssAnimationStyle: "from-top",
    success: {
      textColor: "#ffffff",
      childClassName: "notiflix-notify-success",
      notiflixIconColor: "#ffffff",
      /* notiflixIconSize: "16px", */
    },
  });
};

export const errorMessage = (message: string, timeout?: number) => {
  Notiflix.Notify.init({ position: "right-top" });
  Notiflix.Notify.failure(message, {
    width: "350px",
    timeout: timeout,
    cssAnimation: true,
    showOnlyTheLastOne: true,
    fontSize: "16px",
    cssAnimationDuration: 400,
    cssAnimationStyle: "from-right",
    failure: {
      background: "#D32F2F",
      textColor: "#ffffff",
      childClassName: "notiflix-notify-failure",
      notiflixIconColor: "#ffffff",
      /* notiflixIconSize: "16px", */
    },
  });
};

export const startLoading = () => {
  return Notiflix.Loading.standard("Uploading...");
};

export const stopLoading = () => {
  return Notiflix.Loading.remove();
};

export const deleteModalConfirm = (
  message: string,
  _action?: (...args: any[]) => void,
) => {
  Notiflix.Confirm.init({
    width: "300px",
    position: "center",
    cssAnimation: true,
    cssAnimationDuration: 400,
    cssAnimationStyle: "zoom",
    /* failure: {
      background: "#ff5549",
      textColor: "#fff",
    }, */
  });
  Notiflix.Confirm.show(
    "Warning!! Delete this item?",
    message,
    "ຕົກລົງ",
    "ຍົກເລີກ",
  );
};
