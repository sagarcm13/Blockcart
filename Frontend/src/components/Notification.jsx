// src/components/Notification.js
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export const notify = (message, type = 'default') => {
  switch (type) {
    case 'success':
      toast.success(message);
      break;
    case 'error':
      toast.error(message);
      break;
    case 'info':
      toast.info(message);
      break;
    case 'warning':
      toast.warning(message);
      break;
    default:
      toast(message);
      break;
  }
};

export default function Notification() {
  return <ToastContainer />;
}
