"use client";

import { HrTodoListPage } from "@/components/hr/todo-list-page";

export default function HrTodoFormsPage() {
  return (
    <HrTodoListPage
      title="Forms"
      category="forms"
      description="Forms assigned to you as pending work (not the Form Library)."
    />
  );
}
