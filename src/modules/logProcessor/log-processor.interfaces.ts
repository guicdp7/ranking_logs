export interface LogLine {
  date: Date;
  type: string;
  details: Record<string, string>;
}
