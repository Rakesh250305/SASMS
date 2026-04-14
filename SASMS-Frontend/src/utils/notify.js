import { toast } from "react-toastify";

const baseOptions = {
  position: "top-center",
  autoClose: 2800,
  hideProgressBar: false,
  closeButton: false,
  pauseOnHover: true,
  draggable: true,
};

export const notifySuccess = (message) =>
  toast.success(message, {
    ...baseOptions,
    icon: "✓",
  });

export const notifyError = (message) =>
  toast.error(message, {
    ...baseOptions,
    icon: "!",
  });

export const notifyInfo = (message) =>
  toast.info(message, {
    ...baseOptions,
    icon: "i",
  });
