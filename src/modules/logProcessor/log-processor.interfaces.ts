export interface LogLine {
  text: string;
  date: Date;
  type: string;
  details: Record<string, string>;
}
