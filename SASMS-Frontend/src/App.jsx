import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import '../src/App.css'

import { SplashScreen } from "./page/SplashScreen";
import Login from '../src/page/Login'
import Signup from "../src/page/Signup";
import AdminDashboard from "../src/page/admin/AdminDashboard";
import AdminAssets from "./page/admin/AdminAssets";
import AdminProviders from "./page/admin/AdminProviders";
import AdminNotifications from "./page/admin/AdminNotifications";
import { AdminSettings } from "./page/admin/AdminSetting";
import AdminServices from "./page/admin/AdminServices";
import UserDashboard from "./page/user/UserDashboard";
import  UserBooking from "./page/user/UserBooking";
import AllServices from "./page/user/AllServices";
import BookingFlow from "./page/user/BookingFlow";
import UserBookingDetail from "./page/user/UserBookingdetail";
import UserProfile from "./page/user/UserProfile";
import AdminBookingDetail from "./page/admin/AdminBookingDetail";
import ProviderDashboard from "./page/provider/ProviderDashboard";
import ProviderProfile from "./page/provider/ProviderProfile";
import UserSettings from "./page/user/UserSettings";
import UserNotification from "./page/user/UserNotification";
import AdminServiceRequest from "./page/admin/AdminServiceRequest";
import ProviderTasks from "./page/provider/ProviderTasks";
import ProviderTaskDetail from "./page/provider/ProviderTaskDetail";
import ProviderNotifications from "./page/provider/ProviderNotifications";
import { ProviderSettings } from "./page/provider/ProviderSettings";
import InstallButton from "./component/InstallButton";

function App() {

  return (
    <BrowserRouter>
    <InstallButton/>
      <Routes>

        <Route path="/" element={<SplashScreen />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />

        {/*Admin */}
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/assets" element={<AdminAssets />} />
        <Route path="/admin/providers" element={<AdminProviders />} />
        <Route path="/admin/serviceRequest" element={<AdminServiceRequest />} />
        <Route path="/admin/service" element={<AdminServices />} />
        <Route path="/admin/notifications" element={<AdminNotifications />} />
        <Route path="/admin/settings" element={<AdminSettings />} />
      <Route path="/admin/booking/:id" element={<AdminBookingDetail />} />



        {/* User Routes */}
        <Route path="/user" element={<UserDashboard />} />
        <Route path="/user/booking" element={<BookingFlow />} />
        <Route path="/user/bookings" element={<UserBooking/>} />
        <Route path="/user/booking/:id" element={<UserBookingDetail/>} />
        <Route path="/user/services" element={<AllServices />} />
        <Route path="/user/settings" element={<UserSettings />} />
        <Route path="/user/profile" element={<UserProfile/>} />
        <Route path="/user/notifications" element={<UserNotification />} />



        {/* Provider */}
        <Route path="/provider" element={<ProviderDashboard />} />
        <Route path="/provider/tasks" element={<ProviderTasks />} />
        <Route path="/provider/task/:id" element={<ProviderTaskDetail />} />
        <Route path="/provider/profile" element={<ProviderProfile />} />
        <Route path="/provider/notifications" element={<ProviderNotifications />} />
        <Route path="/provider/settings" element={<ProviderSettings />} />
      </Routes>

      {/* GLOBAL TOAST */}
      <ToastContainer
        position="top-right"
        autoClose={3000}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
        toastClassName={() =>
          "w-full flex items-center px-5 py-4 mt-2 rounded-xl shadow-md border border-gray-200 bg-white text-gray-800 text-sm "
        }
        bodyClassName={() => "flex items-center gap-2"}
        progressClassName={"bg-blue-500"}
      />
    </BrowserRouter>
  );
}

export default App;