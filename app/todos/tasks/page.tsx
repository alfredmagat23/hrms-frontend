"use client";

import { HrTodoListPage } from "@/components/hr/todo-list-page";

export default function HrTodoTasksPage() {
  return (
    <HrTodoListPage
      title="Tasks"
      category="tasks"
      description="Pending tasks assigned to you in this demo."
    />
  );
}
