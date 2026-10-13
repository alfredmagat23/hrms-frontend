/** Approved People filter option lists (source may contain duplicates / typos). */

const RAW_EMPLOYMENT_STATUSES = ["Not Started", "Active"] as const;

const RAW_LOCATIONS = ["Philippines"] as const;

const RAW_COMPANIES = [
  "Augustea Ship Manning Philippines Inc.",
  "Elburg Shipmanagement Philippines Inc.",
  "I.M.A Assessment and Training Center Inc.",
] as const;

const RAW_DEPARTMENTS = [
  "Accounting",
  "Accounting - Audit",
  "Accounting - General",
  "Accounting - Treasury",
  "Accounting - Vessel",
  "Administrative",
  "Data Management",
  "Executive",
  "HR Admin",
  "Human Resource",
  "Information Technology",
  "Legal",
  "Operation",
  "Operation - Crewing",
  "Operation - Crew Welfare",
  "Operation - Documentation",
  "Operation - Mobilization",
  "Operation - Recruitment",
  "Operations",
  "Payroll and Billing",
  "Quality",
  "Recruitment",
  "Recruitment - Cebu",
] as const;

const RAW_TEAMS = [
  "Administrative",
  "Documentation",
  "Flag and Visa",
  "General Accounting",
  "Mobilization",
  "Operation",
  "Quality",
  "Recruitment",
  "Vessel",
] as const;

const RAW_POSITIONS = [
  "Accounting Analyst",
  "Accounting Officer",
  "Administrative Associate",
  "Administrrative Associate", // ponytail: source typo — validate before production
  "Audit Supervisor For Vessel Accounts",
  "Back-end Data Developer",
  "Branch Manager",
  "Chief Of Staff",
  "Claims Coordinator",
  "Claims Officer",
  "Company's Principal Coordinator",
  "Compliance Officer",
  "Crewing Assistant",
  "Crew Welfare",
  "Crew Welfare Associate",
  "Crew Welfare Officer",
  "Customer Service Representative For Payroll",
  "Data Management Associate",
  "Data Management Manager",
  "Data Management Officer",
  "Data Management Supervisor",
  "Deputy Finance Manager",
  "Documentation Assistant",
  "Documentation Associate",
  "Documentation Supervisor",
  "Driver",
  "Executive Assistant",
  "Finance Manager",
  "Flag And Visa Associate",
  "Fleet Officer",
  "Fleet Supervisor",
  "Front Desk Associate",
  "Front Desk Associate/Purchasing Officer",
  "General Accounting Associate I",
  "General Accounting Associate II",
  "General Accounting Manager",
  "General Accounting Officer",
  "General Accounting Supervisor",
  "Government Analyst",
  "Human Resource Associate",
  "Human Resource Manager & Crew Welfare Officer",
  "Human Resource Officer",
  "IT Associate",
  "IT Officer",
  "IT Supervisor",
  "Liaison Officer",
  "Liaison Officer For Accounting",
  "Liaison/ Treasury Accounting Officer",
  "Mobilization Associate",
  "Mobilization Officer",
  "Office Manager",
  "Operation - Crewing",
  "Payroll And Billing Associate",
  "Payroll And Billing Officer",
  "Payroll & Billing Supervisor",
  "P&I Coordinator",
  "President",
  "Quality Assurance Coordinator",
  "Quality Coordinator",
  "Quality Deputy Manager",
  "Quality Manager",
  "Record Assistant",
  "Recruitment Associate",
  "Recruitment Manager",
  "Recruitment Officer",
  "Sap Technical Administrator",
  "Senior Fleet Supervisor",
  "Tax Accountant",
  "Travel & Flight Operations Coordinator",
  "Treasury Accounting Officer",
  "Treasury Associate",
  "Treasury Associate I",
  "Treasury Associate II",
  "Treasury Supervisor",
  "Utility",
  "Vessel Accounting Associate",
  "Vessel Accounting Associate I",
  "Vessel Accounting Associate II",
  "Vessel Accounting Officer",
  "Vice President",
] as const;

function dedupeExact(values: readonly string[]): string[] {
  return [...new Set(values)];
}

export const DIRECTORY_FILTER_STATUSES = dedupeExact(RAW_EMPLOYMENT_STATUSES);
export const DIRECTORY_FILTER_LOCATIONS = dedupeExact(RAW_LOCATIONS);
export const DIRECTORY_FILTER_COMPANIES = dedupeExact(RAW_COMPANIES);
export const DIRECTORY_FILTER_DEPARTMENTS = dedupeExact(RAW_DEPARTMENTS);
export const DIRECTORY_FILTER_TEAMS = dedupeExact(RAW_TEAMS);
export const DIRECTORY_FILTER_POSITIONS = dedupeExact(RAW_POSITIONS);

export function slugId(prefix: string, name: string): string {
  return `${prefix}-${name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 48)}`;
}

export const COMPANY_DISPLAY_BY_ID: Record<string, string> = {
  "co-aug": "Augustea Ship Manning Philippines Inc.",
  "co-elb": "Elburg Shipmanagement Philippines Inc.",
  "co-ima": "I.M.A Assessment and Training Center Inc.",
};
