// toastUtils.js
import { toast } from "react-hot-toast";
import { createElement } from "react";
import { AlertTriangle, Info } from "lucide-react";

export const showToast = ({ type = "success", message, options = {} }) => {
  switch (type) {
    case "success":
      return toast.success(message, options);
    case "error":
      return toast.error(message, options);
    case "loading":
      return toast.loading(message, options);
    case "warning":
      return toast(message, {
        icon: createElement(AlertTriangle, { size: 18, color: "#fbbf24" }),
        ...options,
      });
    case "info":
      return toast(message, {
        icon: createElement(Info, { size: 18, color: "#60a5fa" }),
        ...options,
      });
    default:
      return toast(message, options);
  }
};
