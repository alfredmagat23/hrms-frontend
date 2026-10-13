import { todayIso, addDays } from "@/lib/domain/dates";
import type {
  AssignedTodoItem,
  DocumentRecord,
  ExpenseSubmission,
  FormLibraryItem,
  FormSubmission,
  OkrObjective,
  WorkflowActivityItem,
} from "@/lib/domain/types";

export function createModuleFixtures(companyIds: {
  aug: string;
  elb: string;
  ima: string;
}): {
  documents: DocumentRecord[];
  formLibrary: FormLibraryItem[];
  formSubmissions: FormSubmission[];
  assignedTodos: AssignedTodoItem[];
  expenseSubmissions: ExpenseSubmission[];
  okrObjectives: OkrObjective[];
  workflowActivities: WorkflowActivityItem[];
} {
  const today = todayIso();
  const d = (n: number) => addDays(today, n);

  const documents: DocumentRecord[] = [
    {
      id: "doc-1",
      name: "Employee Handbook 2026 (Demo)",
      category: "Policies",
      description: "Fictional handbook summary for demo browsing.",
      updatedAt: d(-12),
      companyId: companyIds.aug,
    },
    {
      id: "doc-2",
      name: "Leave Policy Overview",
      category: "Policies",
      description: "High-level leave rules for presentation only.",
      updatedAt: d(-30),
      companyId: companyIds.aug,
    },
    {
      id: "doc-3",
      name: "Office Safety Guide",
      category: "Compliance",
      description: "Mock safety checklist shared org-wide.",
      updatedAt: d(-5),
      companyId: companyIds.elb,
    },
    {
      id: "doc-4",
      name: "Training Calendar Template",
      category: "Training",
      description: "Sample calendar template — not a real file.",
      updatedAt: d(-2),
      companyId: companyIds.ima,
    },
  ];

  const formLibrary: FormLibraryItem[] = [
    {
      id: "form-bg",
      name: "Background Check Form",
      category: "Recruitment",
      description: "Mock pre-hire background authorization form.",
    },
    {
      id: "form-cash",
      name: "Cash Advance",
      category: "Employee Requests",
      description: "Demo cash advance request form.",
    },
    {
      id: "form-clear",
      name: "Employee Clearance",
      category: "Offboarding",
      description: "Sample clearance checklist for exits.",
    },
    {
      id: "form-exit",
      name: "Exit Survey",
      category: "Offboarding",
      description: "Fictional exit feedback questionnaire.",
    },
    {
      id: "form-manpower",
      name: "Manpower Requisition Form",
      category: "Recruitment",
      description: "Mock headcount requisition template.",
    },
    {
      id: "form-ob",
      name: "Official Business",
      category: "Work Arrangements",
      description: "Demo official business filing form.",
    },
    {
      id: "form-orient",
      name: "Orientation Record",
      category: "Recruitment",
      description: "Sample new-hire orientation record.",
    },
    {
      id: "form-ot",
      name: "Overtime Request Form",
      category: "Employee Requests",
      description: "Mock overtime filing form.",
    },
    {
      id: "form-pre",
      name: "Pre-Employment Checklist",
      category: "Recruitment",
      description: "Fictional pre-employment steps checklist.",
    },
  ];

  const formSubmissions: FormSubmission[] = [
    {
      id: "fsub-1",
      formId: "form-ot",
      formName: "Overtime Request Form",
      submittedAt: d(-8),
      status: "Approved",
      lastUpdate: d(-6),
      userId: "usr-hr-aug",
    },
    {
      id: "fsub-2",
      formId: "form-ob",
      formName: "Official Business",
      submittedAt: d(-3),
      status: "Pending",
      lastUpdate: d(-1),
      userId: "usr-hr-aug",
    },
    {
      id: "fsub-3",
      formId: "form-cash",
      formName: "Cash Advance",
      submittedAt: d(-20),
      status: "Returned",
      lastUpdate: d(-15),
      userId: "usr-hr-group",
    },
    {
      id: "fsub-4",
      formId: "form-ob",
      formName: "Official Business",
      submittedAt: d(-5),
      status: "Pending",
      lastUpdate: d(-4),
      userId: "usr-emp-aug",
    },
  ];

  const assignedTodos: AssignedTodoItem[] = [
    {
      id: "atodo-task-1",
      category: "tasks",
      title: "Review new starter paperwork",
      dueDate: d(2),
      href: "/people",
      companyId: companyIds.aug,
    },
    {
      id: "atodo-timeoff-1",
      category: "time-off",
      title: "Approve pending leave requests",
      dueDate: d(0),
      href: "/todos/time-off",
      companyId: companyIds.aug,
    },
    {
      id: "atodo-info-1",
      category: "information-update",
      title: "Confirm department change for demo employee",
      dueDate: d(4),
      href: "/people",
      companyId: companyIds.aug,
    },
    {
      id: "atodo-forms-1",
      category: "forms",
      title: "Complete Orientation Record assignment",
      dueDate: d(1),
      href: "/forms/library",
      companyId: companyIds.aug,
    },
    {
      id: "atodo-forms-2",
      category: "forms",
      title: "Submit Official Business form",
      dueDate: d(3),
      href: "/forms/library",
      companyId: companyIds.elb,
    },
    {
      id: "atodo-perf-1",
      category: "performance",
      title: "Acknowledge Q3 OKR check-in",
      dueDate: d(5),
      href: "/okr/objectives",
      companyId: companyIds.aug,
    },
    {
      id: "atodo-emp-task-1",
      category: "tasks",
      title: "Update emergency contact on file",
      dueDate: d(3),
      href: "/todos/information-update",
      companyId: companyIds.aug,
      assigneeUserId: "usr-emp-aug",
    },
    {
      id: "atodo-emp-forms-1",
      category: "forms",
      title: "Complete Official Business form",
      dueDate: d(2),
      href: "/forms/library",
      companyId: companyIds.aug,
      assigneeUserId: "usr-emp-aug",
    },
    {
      id: "atodo-emp-perf-1",
      category: "performance",
      title: "Review personal Q3 objectives",
      dueDate: d(6),
      href: "/okr/objectives",
      companyId: companyIds.aug,
      assigneeUserId: "usr-emp-aug",
    },
    {
      id: "atodo-emp-elb-1",
      category: "tasks",
      title: "Confirm desk assignment",
      dueDate: d(1),
      href: "/todos/tasks",
      companyId: companyIds.elb,
      assigneeUserId: "usr-emp-elb",
    },
  ];

  const expenseSubmissions: ExpenseSubmission[] = [
    {
      id: "exp-1",
      category: "Office Supplies",
      amount: 12.5,
      currency: "USD",
      expenseDate: d(-10),
      description: "Demo notebook purchase (fictional).",
      receiptFilename: "receipt-notebook-demo.pdf",
      status: "Approved",
      userId: "usr-hr-aug",
      companyId: companyIds.aug,
    },
    {
      id: "exp-2",
      category: "Local Transport",
      amount: 8.0,
      currency: "USD",
      expenseDate: d(-4),
      description: "Mock taxi fare for office errand.",
      receiptFilename: "receipt-taxi-demo.jpg",
      status: "Pending",
      userId: "usr-hr-aug",
      companyId: companyIds.aug,
    },
    {
      id: "exp-3",
      category: "Meals",
      amount: 15.0,
      currency: "USD",
      expenseDate: d(-7),
      description: "Fictional team lunch receipt.",
      receiptFilename: "receipt-meal-demo.pdf",
      status: "Pending",
      userId: "usr-emp-aug",
      companyId: companyIds.aug,
    },
  ];

  const okrObjectives: OkrObjective[] = [
    {
      id: "okr-1",
      title: "Improve onboarding completion rate",
      period: "2026 Q3",
      progress: 62,
      status: "On Track",
      companyId: companyIds.aug,
      ownerUserId: "usr-hr-aug",
      keyResults: [
        { id: "kr-1a", title: "Publish onboarding checklist", progress: 100 },
        { id: "kr-1b", title: "Reduce avg. setup days to 5", progress: 40 },
      ],
    },
    {
      id: "okr-2",
      title: "Strengthen attendance data quality",
      period: "2026 Q3",
      progress: 35,
      status: "At Risk",
      companyId: companyIds.aug,
      ownerUserId: "usr-hr-aug",
      keyResults: [
        { id: "kr-2a", title: "Close missing punch backlog", progress: 50 },
        { id: "kr-2b", title: "Train supervisors on corrections", progress: 20 },
      ],
    },
    {
      id: "okr-3",
      title: "Expand training catalog coverage",
      period: "2026 Q4",
      progress: 15,
      status: "Not Started",
      companyId: companyIds.ima,
      ownerUserId: "usr-hr-group",
      keyResults: [
        { id: "kr-3a", title: "Draft course outline set", progress: 25 },
      ],
    },
    {
      id: "okr-4",
      title: "Complete personal skills plan",
      period: "2026 Q3",
      progress: 48,
      status: "On Track",
      companyId: companyIds.aug,
      ownerUserId: "usr-emp-aug",
      keyResults: [
        { id: "kr-4a", title: "Finish demo certification module", progress: 70 },
        { id: "kr-4b", title: "Shadow one peer review", progress: 25 },
      ],
    },
  ];

  const workflowActivities: WorkflowActivityItem[] = [
    {
      id: "wa-1",
      workflowName: "New Hire Onboarding",
      status: "Active",
      stepLabel: "IT access provisioning",
      at: d(-1),
      companyId: companyIds.aug,
      audience: "hr",
    },
    {
      id: "wa-2",
      workflowName: "Leave Approval Chain",
      status: "Pending",
      stepLabel: "HR review",
      at: d(0),
      companyId: companyIds.aug,
      audience: "hr",
    },
    {
      id: "wa-3",
      workflowName: "Expense Reimbursement",
      status: "Completed",
      stepLabel: "Finance posted",
      at: d(-6),
      companyId: companyIds.aug,
      audience: "all",
    },
    {
      id: "wa-4",
      workflowName: "Offboarding Checklist",
      status: "Active",
      stepLabel: "Asset return",
      at: d(-2),
      companyId: companyIds.elb,
      audience: "hr",
    },
    {
      id: "wa-5",
      workflowName: "Personal Leave Request",
      status: "Active",
      stepLabel: "Awaiting manager",
      at: d(-1),
      companyId: companyIds.aug,
      audience: "employee",
    },
  ];

  return {
    documents,
    formLibrary,
    formSubmissions,
    assignedTodos,
    expenseSubmissions,
    okrObjectives,
    workflowActivities,
  };
}
