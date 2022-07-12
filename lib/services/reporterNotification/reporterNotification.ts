export type ReporterNotification = {
  id: string;
  reportType?: {
    id: string;
    name: string;
  };
  description: string;
  condition: string;
  template: string;
};
