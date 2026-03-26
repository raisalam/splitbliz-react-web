import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { Home } from "../features/home/Home";
import { Splash } from "../features/auth/Splash";
import { Login } from "../features/auth/Login";
import { ProfileSetup } from "../features/auth/ProfileSetup";
import { FirstGroup } from "../features/auth/FirstGroup";
import { GroupDetail } from "../features/groups/GroupDetail";
import { AddExpense } from "../features/expenses/AddExpense";
import { SettleUp } from "../features/settlements/SettleUp";
import { ProfileSettings } from "../features/profile/ProfileSettings";
import { GroupSettings } from "../features/groups/GroupSettings";
import { CreateGroup } from "../features/groups/CreateGroup";
import { GroupWhiteboard } from "../features/whiteboard/GroupWhiteboard";
import { GroupChat } from "../features/chat/GroupChat";
import { GroupAI } from "../features/ai/GroupAI";
import { Notifications } from "../features/notifications/Notifications";
import { GroupActivity } from "../features/groups/GroupActivity";
import { ExpenseDetail } from "../features/expenses/ExpenseDetail";

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
