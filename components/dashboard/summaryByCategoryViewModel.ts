import {
  action,
  computed,
  makeObservable,
  observable,
  runInAction,
} from "mobx";
import { BaseViewModel } from "lib/baseViewModel";
import { IDashboardService } from "lib/services/dashboard/dashboardService";
import { SummaryByCategoryData } from "lib/services/dashboard/summaryByCategory";
import { ChartData } from "chart.js";

const colors = [
  "rgba(255, 99, 132, 0.5)",
  "rgba(203, 240, 249, 1)",
  "rgba(119, 154, 231, 1)",
];

export class SummaryByCategoryViewModel extends BaseViewModel {
  authorityId: number;
  _fromDate?: Date = undefined;
  _toDate?: Date = new Date();

  data: ChartData<"bar"> = {
    datasets: [],
  };

  _summaryType: string = "report";
  constructor(
    authorityId: number,
    readonly dashboardService: IDashboardService
  ) {
    super();
    makeObservable(this, {
      data: observable,
      _summaryType: observable,
      summaryType: computed,
      _fromDate: observable,
      fromDate: computed,
      _toDate: observable,
      toDate: computed,
      fetch: action,
      changeSummaryType: action,
    });
    this.authorityId = authorityId;
    this.fetch();
  }

  get summaryType(): string {
    return this._summaryType;
  }

  set summaryType(value: string) {
    this._summaryType = value;
  }

  get fromDate(): Date | undefined {
    return this._fromDate;
  }

  set fromDate(value: Date | undefined) {
    if (value) value.setHours(0, 0, 0, 0);
    this._fromDate = value;
  }

  get toDate(): Date | undefined {
    return this._toDate;
  }

  set toDate(value: Date | undefined) {
    if (value) value.setHours(23, 59, 59, 999);
    this._toDate = value;
  }

  async fetch() {
    if (this.summaryType == "report") {
      this.fetchReport();
    } else if (this.summaryType == "case") {
      this.fetchCase();
    }
  }

  async fetchReport() {
    this.isLoading = true;
    const data = await this.dashboardService.fetchSummaryReportByCategory(
      this.authorityId,
      this.fromDate,
      this.toDate
    );
    if (data) {
      runInAction(() => {
        this.transformData(data);
      });
    }
    this.isLoading = false;
  }

  async fetchCase() {
    this.isLoading = true;
    const data = await this.dashboardService.fetchSummaryCaseByCategory(
      this.authorityId,
      this.fromDate,
      this.toDate
    );
    if (data) {
      runInAction(() => {
        this.transformData(data);
      });
    }
    this.isLoading = false;
  }

  transformData(data: SummaryByCategoryData[]) {
    const labels: string[] = [];
    let start: Date | undefined = undefined;
    let end: Date | undefined = undefined;
    if (this.fromDate) start = new Date(this.fromDate);
    if (this.toDate) end = new Date(this.toDate);
    if (!start && data.length) start = new Date(data[0].day);
    if (!end && data.length)
      end = new Date(Math.max(...data.map(element => element.day.getTime())));
    if (start && end) {
      for (const d: Date = start; d <= end; d.setDate(d.getDate() + 1)) {
        labels.push(`${d.getMonth() + 1}/${d.getDate()}`);
      }
    }
    data.forEach(
      item => (item.x = `${item.day.getMonth() + 1}/${item.day.getDate()}`)
    );
    const groupByCategory = this.groupBy(
      data,
      (item: SummaryByCategoryData) => item.category
    );
    // console.log(groupByCategory);
    let datasets: any[] = this.mapToArray(groupByCategory, (key, value) => ({
      label: key,
      data: Array.from(value.values()),
    }));
    datasets.forEach((item, index) => {
      item.backgroundColor = colors[index % 3];
      item.ordering = item.data[0].ordering;
    });
    datasets = datasets.sort((n1, n2) => n1.ordering - n2.ordering);
    // console.log(datasets);
    this.data = {
      labels: labels,
      datasets: datasets,
    };
  }

  changeSummaryType(value: string) {
    this._summaryType = value;
    this.fetch();
  }

  groupBy(list: SummaryByCategoryData[], keyGetter: Function) {
    const map = new Map();
    list.forEach(item => {
      const key = keyGetter(item);
      const collection = map.get(key);
      if (!collection) {
        map.set(key, [item]);
      } else {
        collection.push(item);
      }
    });
    return map;
  }

  mapToArray<K, V, R>(m: Map<K, V>, transformer: (key: K, item: V) => R) {
    return Array.from(m.entries()).map(x => transformer(x[0], x[1]));
  }
}
