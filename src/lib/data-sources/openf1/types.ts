export type OpenF1DataSourceMeta = {
  source: "live" | "mock";
  error?: string;
};

export type OpenF1DataSourceResponse<T> = {
  data: T;
  meta: OpenF1DataSourceMeta;
};
