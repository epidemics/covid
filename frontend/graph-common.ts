import * as Plotly from "plotly.js";
import { saveImage } from "./custom-plotly-image-saver";

const DOWNLOAD_PLOT_SCALE = 2;

type ScreenshotInfo = () => { name: string; title: string };

type Thing = {
  config: Partial<Plotly.Config>;
  layout: Partial<Plotly.Layout>;
  hook: (gd: Plotly.PlotlyHTMLElement) => void;
};

type Range = [number, number];

export function makeConfig(bounds, screenshotInfo?: ScreenshotInfo): Thing {
  function ensureZero(gd: Plotly.PlotlyHTMLElement) {
    let shouldUpdate = false;
    let range = layout.yaxis.range as Range;
    let ybounds = bounds.y;
    if (range[0] < ybounds[0]) {
      range[1] += ybounds[0] - range[0];
      range[0] = ybounds[0];
      shouldUpdate = true;
    }

    if (shouldUpdate) {
      Plotly.relayout(gd, {
        "yaxis.range": range
      });
    }
  }

  function hook(gd: Plotly.PlotlyHTMLElement) {
    gd.on("plotly_relayout", () => {
      ensureZero(gd);
    });
  }

  let customToImage: Plotly.ModeBarButton = {
    name: "Download plot",
    title: "Download plot",
    icon: Plotly.Icons.camera,
    click: gd => {
      let { name, title } = screenshotInfo();

      return saveImage(gd, {
        name,
        scale: DOWNLOAD_PLOT_SCALE,
        width: 800,
        height: 600,
        format: "png",
        background: "black",
        compose: ($canvas, plot, width, height) => {
          $canvas.width = width;
          $canvas.height = height;
          let ctx = $canvas.getContext("2d");

          ctx.filter = "invert(1)";
          ctx.drawImage(plot, 0, 0);

          const LINE_SPACING = 0.15;

          let y = 0;
          function drawCenteredText(text, size) {
            y += (1 + LINE_SPACING) * size;
            ctx.font = `${Math.round(size)}px "DM Sans"`;
            let x = (width - ctx.measureText(text).width) / 2;
            ctx.fillText(text, x, y);
            y += LINE_SPACING * size;
          }

          ctx.fillStyle = "white";
          drawCenteredText(title, 20 * DOWNLOAD_PLOT_SCALE);

          ctx.fillStyle = "light gray";
          drawCenteredText(
            "by epidemicforecasting.org",
            12 * DOWNLOAD_PLOT_SCALE
          );
        }
      });
    }
  };

  let modeBarButtonsToAdd = [];
  if (screenshotInfo) {
    modeBarButtonsToAdd.push(customToImage);
  }

  let customResetView: Plotly.ModeBarButton = {
    name: "Reset view",
    title: "Reset axis",
    icon: Plotly.Icons.autoscale,
    click: gd => {
      console.log(bounds);
      Plotly.relayout(gd, {
        "yaxis.range": [...bounds.y],
        "xaxis.range": [...bounds.x]
      } as any);
    }
  };

  modeBarButtonsToAdd.push(customResetView);

  let config: Partial<Plotly.Config> = {
    displaylogo: false,
    responsive: false,
    displayModeBar: true,
    modeBarButtonsToAdd,
    modeBarButtonsToRemove: ["toImage", "resetScale2d", "autoScale2d"]
  };

  // graph layout
  let layout: Partial<Plotly.Layout> = {
    margin: { t: 40 },
    paper_bgcolor: "#222028",
    plot_bgcolor: "#222028",
    xaxis: {
      titlefont: {
        family: "DM Sans, sans-serif",
        size: 16,
        color: "white"
      },
      ticks: "outside",
      tickfont: {
        family: "DM Sans, sans-serif",
        size: 14,
        color: "white"
      },
      tick0: 0,
      dtick: 0.0,
      ticklen: 8,
      tickwidth: 1,
      tickcolor: "#fff",
      rangeselector: { visible: true },
      showline: true,
      linewidth: 1
    },
    yaxis: {
      title: "Active infections (% of population)",
      titlefont: {
        family: "DM Sans, sans-serif",
        size: 16,
        color: "white"
      },
      tickfont: {
        family: "DM Sans, sans-serif",
        size: 14,
        color: "white"
      },
      ticks: "outside",
      tick0: 0,
      dtick: 0.0,
      ticklen: 8,
      tickwidth: 1,
      tickcolor: "#fff",
      showline: true,
      linecolor: "#fff",
      linewidth: 1,
      showgrid: false
    },
    showlegend: true,
    legend: {
      x: 1,
      xanchor: "right",
      y: 1,
      yanchor: "top",
      bgcolor: "#22202888",
      font: {
        color: "#fff"
      }
    }
  };

  return { config, layout, hook };
}
