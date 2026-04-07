import { formatDriverName } from "@/lib/openf1/team-meta";

export function mapOpenF1DriverName(fullName: string) {
  return formatDriverName(fullName);
}
