import * as Plotly from "plotly.js";

export const saveImage = (function() {
  let $offscreenElem: HTMLElement | null = null;
  let $canvas: HTMLCanvasElement | null = null;
  const VECTOR_EFFECT_REGEX = /vector-effect: non-scaling-stroke;/g;

  // adapted form https://stackoverflow.com/questions/20830309/download-file-using-an-ajax-request
  function download(canvas: HTMLCanvasElement, filename: string, type: string) {
    //for IE
    let { msToBlob } = canvas as any;
    if (msToBlob && window.navigator.msSaveBlob) {
      let blob = msToBlob(type);
      window.navigator.msSaveBlob(blob, filename);
      return;
    }

    /// create an "off-screen" anchor tag
    let link = document.createElement("a"),
      event;

    document.body.appendChild(link);

    /// the key here is to set the download attribute of the a tag
    link.download = filename;

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    link.href = canvas.toDataURL();

    let { fireEvent } = link as any;
    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {
      event = document.createEvent("MouseEvents");
      event.initMouseEvent(
        "click",
        true,
        true,
        window,
        0,
        0,
        0,
        0,
        0,
        false,
        false,
        false,
        false,
        0,
        null
      );

      link.dispatchEvent(event);
    } else if (fireEvent) {
      fireEvent("onclick");
    }

    document.body.removeChild(link);
  }

  type Compose = (
    $canvas: HTMLCanvasElement,
    plot: CanvasImageSource,
    width: number,
    height: number
  ) => void;

  return function saveImage(
    plotlyElement: Plotly.PlotlyHTMLElement,
    opts: {
      scale?: number;
      format?: "png" | "webp" | "jpeg" | "svg";
      name?: string;
      background?: string;
      compose?: Compose;
      width?: number;
      height?: number;
    }
  ) {
    let scale = opts.scale ?? 1;
    let format = opts.format ?? "png";
    let name = opts.name ?? "plot";
    let background = opts.background ?? "black";
    let compose =
      opts.compose ??
      function($canvas, plot, width, height) {
        $canvas.width = width;
        $canvas.height = height;
        let ctx = $canvas.getContext("2d")!;

        ctx.filter = "invert(1)";
        ctx.drawImage(plot, 0, 0);
      };

    let width = opts.width || plotlyElement._fullLayout.width;
    let height = opts.height || plotlyElement._fullLayout.height;

    let layout = Object.assign({}, plotlyElement.layout, {
      paper_bgcolor: background,
      plot_bgcolor: background,
      width,
      height
    });

    if ($offscreenElem === null) {
      $offscreenElem = document.createElement("div");
      $offscreenElem.id = "plot_image_download_container";
      $offscreenElem.style.position = "fixed";
      $offscreenElem.style.left = "-99999px";
      document.body.appendChild($offscreenElem);

      $canvas = document.createElement("canvas");
      // document.body.appendChild($canvas);
    }

    let config: Partial<Plotly.Config> = {
      ...plotlyElement.config,
      staticPlot: true
    };

    Plotly.newPlot($offscreenElem, plotlyElement.data, layout, config).then(
      gd => {
        let svg = Plotly.Snapshot.toSVG(gd, "svg", scale);

        // fixes the lines becoming thin
        svg = svg.replace(VECTOR_EFFECT_REGEX, "");
        let img = new window.Image();
        let filename = `${name}.${format}`;

        img.onload = function() {
          if (!$canvas) return;

          compose($canvas, img, width * scale, height * scale);

          download($canvas, filename, format);

          if ($offscreenElem) Plotly.purge($offscreenElem);
        };

        img.onerror = function(_err) {
          // TODO better error handling, for now try to fallback to Plotly code
          if ($offscreenElem)
            Plotly.downloadImage($offscreenElem, {
              ...opts,
              width,
              height,
              filename,
              format
            });
        };

        img.src = "data:image/svg+xml;base64," + btoa(svg);
      }
    );
  };
})();
