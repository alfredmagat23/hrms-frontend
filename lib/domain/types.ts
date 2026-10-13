export type RoleId = "employee" | "hr";

export type LeavePortion = "whole" | "am" | "pm";

export type ApprovalStageKey = "manager" | "hr" | "head_hr";

export type ApprovalStageStatus =
  | "waiting"
  | "pending"
  | "approved"
  | "rejected";

export type AttendanceStatus =
  | "on_time"
  | "late"
  | "undertime"
  | "late_undertime"
  | "absent"
  | "missing_in"
  | "missing_out"
  | "in_progress"
  | "holiday"
  | "on_leave"
  | "rest_day"
  | "half_day_leave";

export interface Company {
  id: string;
  name: string;
  code: string;
}

export interface Role {
  id: RoleId;
  label: string;
}

export interface User {
  id: string;
  email: string;
  displayName: string;
  roleId: RoleId;
  employeeId: string | null;
  mockPassword: string;
}

export interface UserCompanyMembership {
  userId: string;
  companyId: string;
}

export interface MockSession {
  userId: string;
  roleId: RoleId;
  activeCompanyId: string | null;
  signedInAt: string;
}

export interface EmploymentStatus {
  id: string;
  label: string;
  isSample: true;
}

export interface Department {
  id: string;
  name: string;
  code: string;
}

export interface Position {
  id: string;
  name: string;
  code: string;
}

export interface Shift {
  id: string;
  name: string;
  start: string;
  graceEnd: string;
  lunchStart: string;
  lunchEnd: string;
  end: string;
  workDays: number[];
}

export interface Employee {
  id: string;
  employeeNo: string;
  firstName: string;
  lastName: string;
  email: string;
  workContact: string;
  location: string;
  statusId: string;
}

export interface EmploymentAssignment {
  id: string;
  employeeId: string;
  companyId: string;
  departmentId: string;
  positionId: string;
  shiftId: string;
  team: string;
  isPrimary: boolean;
}

export interface DocumentRecord {
  id: string;
  name: string;
  category: string;
  description: string;
  updatedAt: string;
  companyId: string;
}

export interface FormLibraryItem {
  id: string;
  name: string;
  category: string;
  description: string;
}

export interface FormSubmission {
  id: string;
  formId: string;
  formName: string;
  submittedAt: string;
  status: string;
  lastUpdate: string;
  userId: string;
}

export type AssignedTodoCategory =
  | "tasks"
  | "time-off"
  | "information-update"
  | "forms"
  | "performance";

export interface AssignedTodoItem {
  id: string;
  category: AssignedTodoCategory;
  title: string;
  dueDate: string;
  href: string;
  companyId: string;
  /** When set, personal to-do for that user; when omitted, HR work item. */
  assigneeUserId?: string;
}

export interface ExpenseSubmission {
  id: string;
  category: string;
  amount: number;
  currency: string;
  expenseDate: string;
  description: string;
  receiptFilename: string;
  status: string;
  userId: string;
  companyId: string;
}

export interface OkrKeyResult {
  id: string;
  title: string;
  progress: number;
}

export interface OkrObjective {
  id: string;
  title: string;
  period: string;
  progress: number;
  status: string;
  companyId: string;
  ownerUserId: string;
  keyResults: OkrKeyResult[];
}

export interface WorkflowActivityItem {
  id: string;
  workflowName: string;
  status: string;
  stepLabel: string;
  at: string;
  companyId: string;
  /** Presentation audience; defaults to all when omitted. */
  audience?: "employee" | "hr" | "all";
}

export interface Holiday {
  id: string;
  date: string;
  name: string;
  companyId: string;
  isSample: true;
}

export interface LeaveType {
  id: string;
  name: string;
  allowsHalfDay: boolean;
  isSample: true;
}

export interface LeaveBalance {
  employeeId: string;
  companyId: string;
  leaveTypeId: string;
  entitled: number;
  used: number;
}

export interface ApprovalStage {
  key: ApprovalStageKey;
  order: number;
  status: ApprovalStageStatus;
}

export interface ApprovalTimelineEntry {
  stageKey: ApprovalStageKey;
  action: "approved" | "rejected" | "simulated_manager_approval";
  actorName: string | null;
  at: string;
  comment: string | null;
  isSimulated: boolean;
}

export interface ExcludedDate {
  date: string;
  reason: "weekend" | "holiday";
  holidayName?: string;
}

export interface LeaveRequestDuration {
  workingDays: number;
  excludedDates: ExcludedDate[];
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  companyId: string;
  leaveTypeId: string;
  startDate: string;
  endDate: string;
  portion: LeavePortion;
  reason: string;
  filedAt: string;
  duration: LeaveRequestDuration;
  stages: ApprovalStage[];
  timeline: ApprovalTimelineEntry[];
}

export interface AttendancePunch {
  id: string;
  employeeId: string;
  companyId: string;
  timestamp: string;
  source: "mock";
}

export interface AttendanceRecord {
  employeeId: string;
  companyId: string;
  date: string;
  scheduledShift: string;
  timeIn: string | null;
  timeOut: string | null;
  lateMinutes: number | null;
  undertimeMinutes: number | null;
  status: AttendanceStatus;
  halfDayLeave: LeavePortion | null;
  calculationPending: boolean;
  statusLabel: string;
}

export interface DemoDataStore {
  version: number;
  companies: Company[];
  roles: Role[];
  users: User[];
  memberships: UserCompanyMembership[];
  employmentStatuses: EmploymentStatus[];
  departments: Department[];
  positions: Position[];
  shifts: Shift[];
  employees: Employee[];
  assignments: EmploymentAssignment[];
  holidays: Holiday[];
  leaveTypes: LeaveType[];
  leaveBalances: LeaveBalance[];
  leaveRequests: LeaveRequest[];
  punches: AttendancePunch[];
  documents: DocumentRecord[];
  formLibrary: FormLibraryItem[];
  formSubmissions: FormSubmission[];
  assignedTodos: AssignedTodoItem[];
  expenseSubmissions: ExpenseSubmission[];
  okrObjectives: OkrObjective[];
  workflowActivities: WorkflowActivityItem[];
}

export type ServiceErrorCode =
  | "VALIDATION"
  | "NOT_FOUND"
  | "FORBIDDEN_COMPANY"
  | "CONFLICT"
  | "UNAUTHENTICATED";

export interface FieldError {
  field: string;
  message: string;
}

export interface ServiceError {
  code: ServiceErrorCode;
  message: string;
  fieldErrors?: FieldError[];
}

export type ServiceResult<T> =
  | { ok: true; data: T }
  | { ok: false; error: ServiceError };

export function ok<T>(data: T): ServiceResult<T> {
  return { ok: true, data };
}

export function fail(
  code: ServiceErrorCode,
  message: string,
  fieldErrors?: FieldError[],
): ServiceResult<never> {
  return { ok: false, error: { code, message, fieldErrors } };
}
