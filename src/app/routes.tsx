import ClientLayout from "components/ClientLayout";
import PageLayout from "components/PageLayout";
import ClientDashboardLayout from "components/client-dashboard/ClientDashboardLayout";
import IsLoggedClientAuthGuard from "components/guard/IsLoggedClientAuthGuard";
import { AuthProvider } from "contexts/AuthProvider";
import ClientAuthGuard from "contexts/ClientAuthProvider";
import { EventUploadTriggerProvider } from "contexts/EventUploadTriggerProvider";
import FolderProvider from "contexts/FolderProvider";
import { MenuDropdownProvider } from "contexts/MenuDropdownProvider";
import PackageCheckerProvider from "contexts/PackageCheckerProvider";
import { Outlet, RouteObject } from "react-router-dom";
import AccountInfo from "./pages/account-info/AccountInfo";
import ClientDashboard from "./pages/client-dashboard/ClientDashboard";
import ExtendFolder from "./pages/extend-folder/ExtendFolder";
import ExtendShare from "./pages/extend-share/ExtendShare";
import Faq from "./pages/faq/Faq";
import FavouriteFile from "./pages/favourite/FavouriteFile";
import Feedback from "./pages/feedback/Feedback";
import FileDrop from "./pages/file-drop/FileDrop";
import FileDropDetail from "./pages/file-drop/FileDropDetail";
import File from "./pages/file/FileType";
import ForgotPassword from "./pages/forgot-password/ForgotPassword";
import { MyCloud } from "./pages/my-cloud/MyCloud";
import Page404 from "./pages/not-found/Page404";
import Pricing from "./pages/price/Pricing";
import PricingCheckout from "./pages/price/PricingCheckout";
import RecentFile from "./pages/recent-file/RecentFile";
import ResetFilePassword from "./pages/reset-file-password/ResetFilePassword";
import ShareWithMe from "./pages/share-with-me/ShareWithMe";
import SignIn from "./pages/sign-in/SignIn";
import SignUp from "./pages/sign-up/SignUp";
import CreateTicket from "./pages/ticket/CreateTicket";
import ReplyTicket from "./pages/ticket/ReplyTicket";
import Ticket from "./pages/ticket/Ticket";
import Trash from "./pages/trash/Trash";
import UppyUpload from "components/UppyUpload";
import ConfirmPayment from "./pages/confirm-payment/Confirmpayment";
import ResetPassword from "./pages/reset-password/ResetPassword";

const routes: RouteObject[] = [
  {
    path: "auth",
    element: (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    ),
    children: [
      {
        element: <PageLayout />,
        children: [
          {
            path: "sign-in",
            element: (
              <IsLoggedClientAuthGuard>
                <SignIn />
              </IsLoggedClientAuthGuard>
            ),
          },
          {
            path: "sign-up",
            element: <SignUp />,
          },
          {
            path: "forgot-password",
            element: <ForgotPassword />,
          },
          {
            path: "reset-password/:token",
            element: <ResetPassword />,
          },
        ],
      },
    ],
  },
  {
    path: "file/reset-password",
    element: <ResetFilePassword />,
  },
  {
    path: "",
    element: (
      <FolderProvider>
        <EventUploadTriggerProvider>
          <AuthProvider>
            <ClientAuthGuard>
              <PackageCheckerProvider>
                <MenuDropdownProvider>
                  <ClientDashboardLayout />
                </MenuDropdownProvider>
              </PackageCheckerProvider>
            </ClientAuthGuard>
          </AuthProvider>
        </EventUploadTriggerProvider>
      </FolderProvider>
    ),
    children: [
      {
        path: "",
        element: <ClientDashboard />,
      },
      {
        path: "dashboard",
        element: <ClientDashboard />,
      },
      {
        path: "my-cloud",
        element: <MyCloud />,
      },
      {
        path: "recent",
        element: <RecentFile />,
      },
      {
        path: "favourite",
        element: <FavouriteFile />,
      },
      {
        path: "trash",
        element: <Trash />,
      },
      {
        path: "account-setting",
        element: <AccountInfo />,
      },
      {
        path: "share-with-me",
        element: <ShareWithMe />,
      },
      {
        path: "file-drop",
        element: <FileDrop />,
      },
      {
        path: "file-drop-detail/:url",
        element: <FileDropDetail />,
      },
      {
        path: "support-ticket",
        element: <Ticket />,
      },
      {
        path: "support-ticket/new",
        element: <CreateTicket />,
      },
      {
        path: "support-ticket/reply/:paramId",
        element: <ReplyTicket />,
      },
      {
        path: "folder/:id",
        element: <ExtendFolder />,
      },
      {
        path: "folder/share/:id",
        element: <ExtendShare />,
      },
      {
        path: "faq",
        element: <Faq />,
      },
      {
        path: "pricing",
        element: <Pricing />,
      },
      {
        path: "pricing/checkout/:packageId",
        element: <PricingCheckout />,
      },
      {
        path: "feedback",
        element: <Feedback />,
      },
      {
        path: "uppy",
        element: <UppyUpload />,
      },
      {
        path: "file/:user/:fileType/:status",
        element: <File />,
      },
    ],
  },
  // {
  //   path: "uppy",
  //   element: <UppyUpload />,
  // },
  {
    path: "confirm",
    element: <ConfirmPayment />,
  },
  {
    path: "*",
    element: (
      <AuthProvider>
        <ClientLayout>
          <Page404 />
        </ClientLayout>
      </AuthProvider>
    ),
  },
];

export default routes;
