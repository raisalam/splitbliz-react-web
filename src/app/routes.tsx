import { createBrowserRouter } from "react-router";
import { Root } from "./components/Root";
import { Home } from "./components/Home";
import { Splash } from "./components/Splash";
import { Login } from "./components/Login";
import { ProfileSetup } from "./components/ProfileSetup";
import { FirstGroup } from "./components/FirstGroup";
import { GroupDetail } from "./components/GroupDetail";
import { AddExpense } from "./components/AddExpense";
import { SettleUp } from "./components/SettleUp";
import { ProfileSettings } from "./components/ProfileSettings";
import { GroupSettings } from "./components/GroupSettings";
import { CreateGroup } from "./components/CreateGroup";
import { GroupWhiteboard } from "./components/GroupWhiteboard";
import { GroupChat } from "./components/GroupChat";
import { GroupAI } from "./components/GroupAI";
import { Notifications } from "./components/Notifications";
import { GroupActivity } from "./components/GroupActivity";
import { ExpenseDetail } from "./components/ExpenseDetail";

export const router = createBrowserRouter([
  {
    path: "/",
    Component: Root,
    children: [
      { index: true, Component: Home },
      { path: "welcome", Component: Splash },
      { path: "login", Component: Login },
      { path: "onboarding/profile", Component: ProfileSetup },
      { path: "onboarding/group", Component: FirstGroup },
      { path: "profile", Component: ProfileSettings },
      { path: "group/new", Component: CreateGroup },
      { path: "group/:groupId", Component: GroupDetail },
      { path: "group/:groupId/settings", Component: GroupSettings },
      { path: "group/:groupId/add-expense", Component: AddExpense },
      { path: "group/:groupId/settle", Component: SettleUp },
      { path: "group/:groupId/whiteboard", Component: GroupWhiteboard },
      { path: "group/:groupId/chat", Component: GroupChat },
      { path: "group/:groupId/ai", Component: GroupAI },
      { path: "group/:groupId/activity", Component: GroupActivity },
      { path: "group/:groupId/expense/:expenseId", Component: ExpenseDetail },
      { path: "notifications", Component: Notifications },
    ],
  },
]);
