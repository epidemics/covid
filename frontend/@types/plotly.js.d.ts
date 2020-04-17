export * from "../../node_modules/@types/plotly.js";

declare module "plotly.js" {
  namespace Snapshot {
    function toSVG(
      offscreenElem: PlotlyHTMLElement,
      type: string,
      scaling: number
    ): string;
  }

  let Icons: { [key: string]: Plotly.Icon };

  interface PlotlyHTMLElement {
    _fullLayout: Plotly.Layout;
    layout: Plotly.Layout;
    config: Plotly.Config;
    data: Plotly.Data[];
  }

  type Range<T = number> = [T, T];

  interface Layout {
    "legend.y": number;
    "yaxis.domain": Range;
    "yaxis2.domain": Range;
    "xaxis.range": Range<Datum>;
    "yaxis.range": Range<Datum>;
  }
}
