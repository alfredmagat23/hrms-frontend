import { DEMO_PASSWORD } from "@/config/demo-accounts";
import {
  COMPANY_DISPLAY_BY_ID,
  DIRECTORY_FILTER_DEPARTMENTS,
  DIRECTORY_FILTER_POSITIONS,
  slugId,
} from "@/lib/domain/directory-catalog";
import { addDays, relativeWeekday, todayIso } from "@/lib/domain/dates";
import type {
  ApprovalStage,
  AttendancePunch,
  DemoDataStore,
  LeaveRequest,
} from "@/lib/domain/types";
import { createModuleFixtures } from "@/lib/mock/module-fixtures";

export const STORE_VERSION = 3;
export { DEMO_PASSWORD };

function stages(
  manager: ApprovalStage["status"],
  hr: ApprovalStage["status"],
  head: ApprovalStage["status"],
): ApprovalStage[] {
  return [
    { key: "manager", order: 1, status: manager },
    { key: "hr", order: 2, status: hr },
    { key: "head_hr", order: 3, status: head },
  ];
}

function punch(
  id: string,
  employeeId: string,
  companyId: string,
  date: string,
  hhmm: string,
): AttendancePunch {
  return {
    id,
    employeeId,
    companyId,
    timestamp: `${date}T${hhmm}:00`,
    source: "mock",
  };
}

export function createSeedData(): DemoDataStore {
  const mon = relativeWeekday(0, 1);
  const tue = relativeWeekday(0, 2);
  const wed = relativeWeekday(0, 3);
  const thu = relativeWeekday(0, 4);
  const fri = relativeWeekday(0, 5);
  const lastMon = relativeWeekday(1, 1);
  const lastTue = relativeWeekday(1, 2);
  const lastWed = relativeWeekday(1, 3);
  const lastThu = relativeWeekday(1, 4);
  const lastFri = relativeWeekday(1, 5);
  const nextMon = addDays(mon, 7);
  const nextTue = addDays(mon, 8);
  const today = todayIso();

  const companies = [
    { id: "co-aug", name: COMPANY_DISPLAY_BY_ID["co-aug"], code: "AUG" },
    { id: "co-elb", name: COMPANY_DISPLAY_BY_ID["co-elb"], code: "ELB" },
    { id: "co-ima", name: COMPANY_DISPLAY_BY_ID["co-ima"], code: "IMA" },
  ];

  const roles = [
    { id: "employee" as const, label: "Employee" },
    { id: "hr" as const, label: "HR" },
  ];

  const employmentStatuses = [
    { id: "st-not-started", label: "Not Started", isSample: true as const },
    { id: "st-active", label: "Active", isSample: true as const },
    { id: "st-inactive", label: "Inactive", isSample: true as const },
    { id: "st-onleave", label: "On Leave", isSample: true as const },
  ];

  const departments = DIRECTORY_FILTER_DEPARTMENTS.map((name) => ({
    id: slugId("dept", name),
    name,
    code: name.slice(0, 3).toUpperCase(),
  }));

  const positions = DIRECTORY_FILTER_POSITIONS.map((name) => ({
    id: slugId("pos", name),
    name,
    code: name.slice(0, 3).toUpperCase(),
  }));

  const dept = (name: string) => slugId("dept", name);
  const pos = (name: string) => slugId("pos", name);

  const shifts = [
    {
      id: "shift-std",
      name: "Standard 9–6",
      start: "09:00",
      graceEnd: "09:15",
      lunchStart: "12:00",
      lunchEnd: "13:00",
      end: "18:00",
      workDays: [1, 2, 3, 4, 5],
    },
  ];

  const leaveTypes = [
    {
      id: "lt-vl",
      name: "Vacation Leave",
      allowsHalfDay: true,
      isSample: true as const,
    },
    {
      id: "lt-sl",
      name: "Sick Leave",
      allowsHalfDay: true,
      isSample: true as const,
    },
  ];

  // Fictional employees — Augustea (~12), Elburg (~8), IMA (~5)
  const employees = [
    {
      id: "emp-jamie",
      employeeNo: "AUG-1001",
      firstName: "Jamie",
      lastName: "Ortega",
      email: "jamie.ortega@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-riley",
      employeeNo: "AUG-1002",
      firstName: "Riley",
      lastName: "Santos",
      email: "riley.santos@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-casey",
      employeeNo: "AUG-1003",
      firstName: "Casey",
      lastName: "Nguyen",
      email: "casey.nguyen@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-morgan",
      employeeNo: "AUG-1004",
      firstName: "Morgan",
      lastName: "Dela Cruz",
      email: "morgan.delacruz@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-onleave",
    },
    {
      id: "emp-avery",
      employeeNo: "AUG-1005",
      firstName: "Avery",
      lastName: "Lim",
      email: "avery.lim@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-quinn",
      employeeNo: "AUG-1006",
      firstName: "Quinn",
      lastName: "Reyes",
      email: "quinn.reyes@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-taylor",
      employeeNo: "AUG-1007",
      firstName: "Taylor",
      lastName: "Garcia",
      email: "taylor.garcia@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-jordan",
      employeeNo: "AUG-1008",
      firstName: "Jordan",
      lastName: "Cruz",
      email: "jordan.cruz@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-inactive",
    },
    {
      id: "emp-blake",
      employeeNo: "AUG-1009",
      firstName: "Blake",
      lastName: "Torres",
      email: "blake.torres@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-drew",
      employeeNo: "AUG-1010",
      firstName: "Drew",
      lastName: "Mendoza",
      email: "drew.mendoza@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-cameron",
      employeeNo: "AUG-1011",
      firstName: "Cameron",
      lastName: "Flores",
      email: "cameron.flores@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-alex",
      employeeNo: "AUG-1012",
      firstName: "Alex",
      lastName: "Perez",
      email: "alex.perez@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-sam",
      employeeNo: "ELB-2001",
      firstName: "Sam",
      lastName: "Villareal",
      email: "sam.villareal@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-pat",
      employeeNo: "ELB-2002",
      firstName: "Pat",
      lastName: "Ocampo",
      email: "pat.ocampo@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-chris",
      employeeNo: "ELB-2003",
      firstName: "Chris",
      lastName: "Bautista",
      email: "chris.bautista@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-lee",
      employeeNo: "ELB-2004",
      firstName: "Lee",
      lastName: "Ramos",
      email: "lee.ramos@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-robin",
      employeeNo: "ELB-2005",
      firstName: "Robin",
      lastName: "Gutierrez",
      email: "robin.gutierrez@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-jesse",
      employeeNo: "ELB-2006",
      firstName: "Jesse",
      lastName: "Castillo",
      email: "jesse.castillo@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-onleave",
    },
    {
      id: "emp-kerry",
      employeeNo: "ELB-2007",
      firstName: "Kerry",
      lastName: "Domingo",
      email: "kerry.domingo@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-skyler",
      employeeNo: "ELB-2008",
      firstName: "Skyler",
      lastName: "Navarro",
      email: "skyler.navarro@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-dana",
      employeeNo: "IMA-3001",
      firstName: "Dana",
      lastName: "Aquino",
      email: "dana.aquino@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-evan",
      employeeNo: "IMA-3002",
      firstName: "Evan",
      lastName: "Sison",
      email: "evan.sison@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-fran",
      employeeNo: "IMA-3003",
      firstName: "Fran",
      lastName: "Valdez",
      email: "fran.valdez@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-gray",
      employeeNo: "IMA-3004",
      firstName: "Gray",
      lastName: "Padilla",
      email: "gray.padilla@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-active",
    },
    {
      id: "emp-harper",
      employeeNo: "IMA-3005",
      firstName: "Harper",
      lastName: "Luna",
      email: "harper.luna@tls-demo.test",
      workContact: "+63 2 8000 0000 (demo)",
      location: "Philippines",
      statusId: "st-not-started",
    },
  ];

  const assignments = [
    // Augustea
    {
      id: "asg-jamie-aug",
      employeeId: "emp-jamie",
      companyId: "co-aug",
      departmentId: dept("Operation"),
      positionId: pos("Fleet Officer"),
      shiftId: "shift-std",
      team: "Operation",
      isPrimary: true,
    },
    // Multi-company: Jamie also at Elburg (for C3 demo)
    {
      id: "asg-jamie-elb",
      employeeId: "emp-jamie",
      companyId: "co-elb",
      departmentId: dept("Operation - Crewing"),
      positionId: pos("Crewing Assistant"),
      shiftId: "shift-std",
      team: "Operation",
      isPrimary: false,
    },
    {
      id: "asg-riley",
      employeeId: "emp-riley",
      companyId: "co-aug",
      departmentId: dept("Operation - Documentation"),
      positionId: pos("Documentation Associate"),
      shiftId: "shift-std",
      team: "Documentation",
      isPrimary: true,
    },
    {
      id: "asg-casey",
      employeeId: "emp-casey",
      companyId: "co-aug",
      departmentId: dept("Information Technology"),
      positionId: pos("IT Associate"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
    {
      id: "asg-morgan",
      employeeId: "emp-morgan",
      companyId: "co-aug",
      departmentId: dept("Accounting - General"),
      positionId: pos("General Accounting Associate I"),
      shiftId: "shift-std",
      team: "General Accounting",
      isPrimary: true,
    },
    {
      id: "asg-avery",
      employeeId: "emp-avery",
      companyId: "co-aug",
      departmentId: dept("Human Resource"),
      positionId: pos("Human Resource Officer"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
    {
      id: "asg-quinn",
      employeeId: "emp-quinn",
      companyId: "co-aug",
      departmentId: dept("Operation - Mobilization"),
      positionId: pos("Mobilization Officer"),
      shiftId: "shift-std",
      team: "Mobilization",
      isPrimary: true,
    },
    {
      id: "asg-taylor",
      employeeId: "emp-taylor",
      companyId: "co-aug",
      departmentId: dept("Operation - Recruitment"),
      positionId: pos("Recruitment Associate"),
      shiftId: "shift-std",
      team: "Recruitment",
      isPrimary: true,
    },
    {
      id: "asg-jordan",
      employeeId: "emp-jordan",
      companyId: "co-aug",
      departmentId: dept("Accounting - Treasury"),
      positionId: pos("Treasury Associate"),
      shiftId: "shift-std",
      team: "General Accounting",
      isPrimary: true,
    },
    {
      id: "asg-blake",
      employeeId: "emp-blake",
      companyId: "co-aug",
      departmentId: dept("Information Technology"),
      positionId: pos("Back-end Data Developer"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
    {
      id: "asg-drew",
      employeeId: "emp-drew",
      companyId: "co-aug",
      departmentId: dept("Quality"),
      positionId: pos("Quality Coordinator"),
      shiftId: "shift-std",
      team: "Quality",
      isPrimary: true,
    },
    {
      id: "asg-cameron",
      employeeId: "emp-cameron",
      companyId: "co-aug",
      departmentId: dept("Operation"),
      positionId: pos("Fleet Supervisor"),
      shiftId: "shift-std",
      team: "Operation",
      isPrimary: true,
    },
    {
      id: "asg-alex",
      employeeId: "emp-alex",
      companyId: "co-aug",
      departmentId: dept("Accounting - Vessel"),
      positionId: pos("Vessel Accounting Associate"),
      shiftId: "shift-std",
      team: "Vessel",
      isPrimary: true,
    },
    // Elburg
    {
      id: "asg-sam",
      employeeId: "emp-sam",
      companyId: "co-elb",
      departmentId: dept("Operation - Crewing"),
      positionId: pos("Fleet Officer"),
      shiftId: "shift-std",
      team: "Operation",
      isPrimary: true,
    },
    {
      id: "asg-pat",
      employeeId: "emp-pat",
      companyId: "co-elb",
      departmentId: dept("Operation - Documentation"),
      positionId: pos("Documentation Assistant"),
      shiftId: "shift-std",
      team: "Documentation",
      isPrimary: true,
    },
    {
      id: "asg-chris",
      employeeId: "emp-chris",
      companyId: "co-elb",
      departmentId: dept("Information Technology"),
      positionId: pos("IT Officer"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
    {
      id: "asg-lee",
      employeeId: "emp-lee",
      companyId: "co-elb",
      departmentId: dept("Accounting - Audit"),
      positionId: pos("Accounting Analyst"),
      shiftId: "shift-std",
      team: "General Accounting",
      isPrimary: true,
    },
    {
      id: "asg-robin",
      employeeId: "emp-robin",
      companyId: "co-elb",
      departmentId: dept("Human Resource"),
      positionId: pos("Human Resource Associate"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
    {
      id: "asg-jesse",
      employeeId: "emp-jesse",
      companyId: "co-elb",
      departmentId: dept("Operation - Crew Welfare"),
      positionId: pos("Crew Welfare Associate"),
      shiftId: "shift-std",
      team: "Operation",
      isPrimary: true,
    },
    {
      id: "asg-kerry",
      employeeId: "emp-kerry",
      companyId: "co-elb",
      departmentId: dept("Recruitment"),
      positionId: pos("Recruitment Officer"),
      shiftId: "shift-std",
      team: "Recruitment",
      isPrimary: true,
    },
    {
      id: "asg-skyler",
      employeeId: "emp-skyler",
      companyId: "co-elb",
      departmentId: dept("Data Management"),
      positionId: pos("Data Management Associate"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
    // IMA
    {
      id: "asg-dana",
      employeeId: "emp-dana",
      companyId: "co-ima",
      departmentId: dept("Operation"),
      positionId: pos("Office Manager"),
      shiftId: "shift-std",
      team: "Operation",
      isPrimary: true,
    },
    {
      id: "asg-evan",
      employeeId: "emp-evan",
      companyId: "co-ima",
      departmentId: dept("Payroll and Billing"),
      positionId: pos("Payroll And Billing Associate"),
      shiftId: "shift-std",
      team: "General Accounting",
      isPrimary: true,
    },
    {
      id: "asg-fran",
      employeeId: "emp-fran",
      companyId: "co-ima",
      departmentId: dept("Information Technology"),
      positionId: pos("IT Supervisor"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
    {
      id: "asg-gray",
      employeeId: "emp-gray",
      companyId: "co-ima",
      departmentId: dept("Administrative"),
      positionId: pos("Administrative Associate"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
    {
      id: "asg-harper",
      employeeId: "emp-harper",
      companyId: "co-ima",
      departmentId: dept("HR Admin"),
      positionId: pos("Administrrative Associate"),
      shiftId: "shift-std",
      team: "Administrative",
      isPrimary: true,
    },
  ];

  const users = [
    {
      id: "usr-emp-aug",
      email: "employee.augustea@tls-demo.test",
      displayName: "Jamie Ortega",
      roleId: "employee" as const,
      employeeId: "emp-jamie",
      mockPassword: DEMO_PASSWORD,
    },
    {
      id: "usr-emp-elb",
      email: "employee.elburg@tls-demo.test",
      displayName: "Sam Villareal",
      roleId: "employee" as const,
      employeeId: "emp-sam",
      mockPassword: DEMO_PASSWORD,
    },
    {
      id: "usr-hr-aug",
      email: "hr.augustea@tls-demo.test",
      displayName: "Avery Lim",
      roleId: "hr" as const,
      employeeId: "emp-avery",
      mockPassword: DEMO_PASSWORD,
    },
    {
      id: "usr-hr-group",
      email: "hr.group@tls-demo.test",
      displayName: "Group HR Demo",
      roleId: "hr" as const,
      employeeId: null,
      mockPassword: DEMO_PASSWORD,
    },
  ];

  const memberships = [
    { userId: "usr-emp-aug", companyId: "co-aug" },
    { userId: "usr-emp-elb", companyId: "co-elb" },
    { userId: "usr-hr-aug", companyId: "co-aug" },
    { userId: "usr-hr-group", companyId: "co-aug" },
    { userId: "usr-hr-group", companyId: "co-elb" },
    { userId: "usr-hr-group", companyId: "co-ima" },
  ];

  const holidays = [
    {
      id: "hol-aug-1",
      date: fri,
      name: "Augustea Company Day (sample)",
      companyId: "co-aug",
      isSample: true as const,
    },
    {
      id: "hol-elb-1",
      date: nextTue,
      name: "Elburg Founders Day (sample)",
      companyId: "co-elb",
      isSample: true as const,
    },
    {
      id: "hol-ima-1",
      date: nextMon,
      name: "IMA Foundation Day (sample)",
      companyId: "co-ima",
      isSample: true as const,
    },
  ];

  const leaveBalances = [
    {
      employeeId: "emp-jamie",
      companyId: "co-aug",
      leaveTypeId: "lt-vl",
      entitled: 15,
      used: 2,
    },
    {
      employeeId: "emp-jamie",
      companyId: "co-aug",
      leaveTypeId: "lt-sl",
      entitled: 10,
      used: 1,
    },
    {
      employeeId: "emp-sam",
      companyId: "co-elb",
      leaveTypeId: "lt-vl",
      entitled: 15,
      used: 3,
    },
    {
      employeeId: "emp-sam",
      companyId: "co-elb",
      leaveTypeId: "lt-sl",
      entitled: 10,
      used: 0,
    },
    {
      employeeId: "emp-riley",
      companyId: "co-aug",
      leaveTypeId: "lt-vl",
      entitled: 15,
      used: 1,
    },
    {
      employeeId: "emp-riley",
      companyId: "co-aug",
      leaveTypeId: "lt-sl",
      entitled: 10,
      used: 0,
    },
    {
      employeeId: "emp-casey",
      companyId: "co-aug",
      leaveTypeId: "lt-vl",
      entitled: 15,
      used: 0,
    },
    {
      employeeId: "emp-casey",
      companyId: "co-aug",
      leaveTypeId: "lt-sl",
      entitled: 10,
      used: 0,
    },
    {
      employeeId: "emp-pat",
      companyId: "co-elb",
      leaveTypeId: "lt-vl",
      entitled: 15,
      used: 2,
    },
    {
      employeeId: "emp-pat",
      companyId: "co-elb",
      leaveTypeId: "lt-sl",
      entitled: 10,
      used: 1,
    },
    {
      employeeId: "emp-dana",
      companyId: "co-ima",
      leaveTypeId: "lt-vl",
      entitled: 15,
      used: 0,
    },
    {
      employeeId: "emp-dana",
      companyId: "co-ima",
      leaveTypeId: "lt-sl",
      entitled: 10,
      used: 0,
    },
  ];

  // Seed leave requests with relative dates
  const leaveRequests: LeaveRequest[] = [
    {
      id: "lr-jamie-pending-hr",
      employeeId: "emp-jamie",
      companyId: "co-aug",
      leaveTypeId: "lt-vl",
      startDate: nextTue,
      endDate: nextTue,
      portion: "whole",
      reason: "Personal appointment (seed pending HR).",
      filedAt: `${lastFri}T10:00:00`,
      duration: { workingDays: 1, excludedDates: [] },
      stages: stages("approved", "pending", "waiting"),
      timeline: [
        {
          stageKey: "manager",
          action: "approved",
          actorName: null,
          at: `${lastFri}T11:00:00`,
          comment: "Simulated manager approval (demo only)",
          isSimulated: true,
        },
      ],
    },
    {
      id: "lr-jamie-final",
      employeeId: "emp-jamie",
      companyId: "co-aug",
      leaveTypeId: "lt-vl",
      startDate: lastWed,
      endDate: lastWed,
      portion: "pm",
      reason: "Family errand (seed fully approved).",
      filedAt: `${lastMon}T09:00:00`,
      duration: { workingDays: 0.5, excludedDates: [] },
      stages: stages("approved", "approved", "approved"),
      timeline: [
        {
          stageKey: "manager",
          action: "approved",
          actorName: null,
          at: `${lastMon}T10:00:00`,
          comment: "Simulated manager approval (demo only)",
          isSimulated: true,
        },
        {
          stageKey: "hr",
          action: "approved",
          actorName: "Avery Lim",
          at: `${lastMon}T14:00:00`,
          comment: null,
          isSimulated: false,
        },
        {
          stageKey: "head_hr",
          action: "approved",
          actorName: "Head of HR (seed)",
          at: `${lastTue}T09:00:00`,
          comment: "Prepared seed final approval.",
          isSimulated: false,
        },
      ],
    },
    {
      id: "lr-riley-rejected",
      employeeId: "emp-riley",
      companyId: "co-aug",
      leaveTypeId: "lt-sl",
      startDate: lastThu,
      endDate: lastThu,
      portion: "whole",
      reason: "Felt unwell (seed rejected).",
      filedAt: `${lastWed}T08:30:00`,
      duration: { workingDays: 1, excludedDates: [] },
      stages: stages("approved", "rejected", "waiting"),
      timeline: [
        {
          stageKey: "manager",
          action: "approved",
          actorName: null,
          at: `${lastWed}T09:00:00`,
          comment: "Simulated manager approval (demo only)",
          isSimulated: true,
        },
        {
          stageKey: "hr",
          action: "rejected",
          actorName: "Avery Lim",
          at: `${lastWed}T15:00:00`,
          comment: "Medical certificate required for this date.",
          isSimulated: false,
        },
      ],
    },
    {
      id: "lr-sam-pending",
      employeeId: "emp-sam",
      companyId: "co-elb",
      leaveTypeId: "lt-vl",
      startDate: nextMon,
      endDate: nextMon,
      portion: "whole",
      reason: "Personal matter (Elburg seed).",
      filedAt: `${lastFri}T16:00:00`,
      duration: { workingDays: 1, excludedDates: [] },
      stages: stages("approved", "pending", "waiting"),
      timeline: [
        {
          stageKey: "manager",
          action: "approved",
          actorName: null,
          at: `${lastFri}T16:30:00`,
          comment: "Simulated manager approval (demo only)",
          isSimulated: true,
        },
      ],
    },
  ];

  const punches: AttendancePunch[] = [
    // Jamie — on time (grace edge 09:15)
    punch("p1", "emp-jamie", "co-aug", mon, "08:58"),
    punch("p2", "emp-jamie", "co-aug", mon, "18:02"),
    // Jamie — late 09:16 = 16 min
    punch("p3", "emp-jamie", "co-aug", tue, "09:16"),
    punch("p4", "emp-jamie", "co-aug", tue, "18:00"),
    // Jamie — grace edge on time
    punch("p5", "emp-jamie", "co-aug", wed, "09:15"),
    punch("p6", "emp-jamie", "co-aug", wed, "18:01"),
    // Jamie — undertime
    punch("p7", "emp-jamie", "co-aug", thu, "09:00"),
    punch("p8", "emp-jamie", "co-aug", thu, "17:30"),
    // Jamie — missing out (past day last week)
    punch("p9", "emp-jamie", "co-aug", lastTue, "09:05"),
    // Jamie — missing in
    punch("p10", "emp-jamie", "co-aug", lastThu, "18:00"),
    // Riley — on time
    punch("p11", "emp-riley", "co-aug", mon, "08:55"),
    punch("p12", "emp-riley", "co-aug", mon, "18:00"),
    punch("p13", "emp-riley", "co-aug", tue, "09:02"),
    punch("p14", "emp-riley", "co-aug", tue, "18:05"),
    // Sam Elburg
    punch("p15", "emp-sam", "co-elb", mon, "09:20"),
    punch("p16", "emp-sam", "co-elb", mon, "18:00"),
    punch("p17", "emp-sam", "co-elb", tue, "08:50"),
    punch("p18", "emp-sam", "co-elb", tue, "17:45"),
    // Dana IMA
    punch("p19", "emp-dana", "co-ima", mon, "09:00"),
    punch("p20", "emp-dana", "co-ima", mon, "18:00"),
    // Avery (HR Augustea) — My Attendance demo
    punch("p21", "emp-avery", "co-aug", mon, "09:00"),
    punch("p22", "emp-avery", "co-aug", mon, "18:00"),
    punch("p23", "emp-avery", "co-aug", tue, "09:10"),
    punch("p24", "emp-avery", "co-aug", tue, "18:05"),
    punch("p25", "emp-avery", "co-aug", wed, "09:02"),
    punch("p26", "emp-avery", "co-aug", wed, "17:55"),
  ];

  // If today is a weekday and Jamie has no punches yet, add in-progress
  if (
    !punches.some(
      (p) =>
        p.employeeId === "emp-jamie" &&
        p.companyId === "co-aug" &&
        p.timestamp.startsWith(today),
    ) &&
    ![0, 6].includes(new Date().getDay())
  ) {
    punches.push(punch("p-today", "emp-jamie", "co-aug", today, "09:01"));
  }

  void lastMon;

  const modules = createModuleFixtures({
    aug: "co-aug",
    elb: "co-elb",
    ima: "co-ima",
  });

  return {
    version: STORE_VERSION,
    companies,
    roles,
    users,
    memberships,
    employmentStatuses,
    departments,
    positions,
    shifts,
    employees,
    assignments,
    holidays,
    leaveTypes,
    leaveBalances,
    leaveRequests,
    punches,
    ...modules,
  };
}
