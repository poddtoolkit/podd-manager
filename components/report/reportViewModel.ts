import { action, makeObservable, observable, runInAction } from "mobx";
import { BaseViewModel } from "lib/baseViewModel";
import { IReportService } from "lib/services/report";
import { ReportDetail } from "lib/services/report/report";

export class ReportViewModel extends BaseViewModel {
  data: ReportDetail = {} as ReportDetail;
  id: string;

  constructor(id: string, readonly reportService: IReportService) {
    super();
    makeObservable(this, {
      data: observable,
      fetch: action,
    });
    this.id = id;
    this.fetch();
  }

  async fetch() {
    console.log("fetch", this.id);
    if (this.id) {
      this.isLoading = true;
      const data = await (await this.reportService.getReport(this.id)).data;
      if (data) {
        runInAction(() => {
          this.data = data;
        });
      }
      this.isLoading = false;
    }
  }
}
