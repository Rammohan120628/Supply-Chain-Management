import React from "react";
import { Toaster, toast } from "react-hot-toast";

/**
 * showToast(message, type)
 * type: "success" | "error"
 */
export const showToast = (message: string, type: "success" | "error") => {
  if (type === "success") {
    toast.success(message, {
      duration: 3000,
      position: 'top-right',
    });
  } else {
    toast.error(message, {
      duration: 3000,
      position: 'top-right',
    });
  }
};

const Toastify: React.FC = () => {
  return (  
    <Toaster
      position="top-right"
      toastOptions={{
        className: '',
        style: {
          background: '#363636',
          color: '#fff',
          zIndex: 999999,
        },
        duration: 4000,
        success: {
          style: {
            background: '#10b981',
          },
        },
        error: {
          style: {
            background: '#ef4444',
          },
        },
      }}
    />
  );
};

export default Toastify;