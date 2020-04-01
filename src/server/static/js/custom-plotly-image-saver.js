
window.saveImage = (function(){
  let $offscreenElem = null;
  let $canvas = null;
  const VECTOR_EFFECT_REGEX = /vector-effect: non-scaling-stroke;/g;

  // adapted form https://stackoverflow.com/questions/20830309/download-file-using-an-ajax-request
  function download(canvas, filename, type) {
    //for IE
    if (canvas.msToBlob && window.navigator.msSaveBlob) { 
      var blob = canvas.msToBlob(type);
      window.navigator.msSaveBlob(blob, filename);
      return;
    }

    /// create an "off-screen" anchor tag
    var link = document.createElement('a'),
        event;

    document.body.appendChild(link);

    /// the key here is to set the download attribute of the a tag
    link.download = filename;

    /// convert canvas content to data-uri for link. When download
    /// attribute is set the content pointed to by link will be
    /// pushed as "download" in HTML5 capable browsers
    link.href = canvas.toDataURL();

    /// create a "fake" click-event to trigger the download
    if (document.createEvent) {

      event = document.createEvent("MouseEvents");
      event.initMouseEvent("click", true, true, window,
                        0, 0, 0, 0, 0, false, false, false,
                        false, 0, null);

      link.dispatchEvent(event);

    } else if (link.fireEvent) {
      link.fireEvent("onclick");
    }

    document.body.removeChild(link);
  }

  return function saveImage(plotlyElement, opts){
    let scale = opts.scale || 1;
    let format = opts.format || "png";
    let name = opts.name || "plot";
    let background = opts.background || "black";
    let compose = opts.compose || function($canvas, plot, width, height){
      $canvas.width = width;
      $canvas.height = height;
      ctx = $canvas.getContext("2d");

      ctx.filter = "invert(1)";
      ctx.drawImage(plot, 0, 0);
    };
    let width = opts.width || plotlyElement._fullLayout.width;
    let height = opts.height || plotlyElement._fullLayout.height;

    let layout = Object.assign({}, plotlyElement.layout, {paper_bgcolor: background, plot_bgcolor: background, width, height});

    if($offscreenElem === null){
      $offscreenElem = document.createElement("div")
      $offscreenElem.id = "plot_image_download_container";
      $offscreenElem.style.position = "fixed";
      $offscreenElem.style.left = "-99999px";
      document.body.appendChild($offscreenElem)

      $canvas = document.createElement('canvas');
      // document.body.appendChild($canvas);
    }

    Plotly.newPlot($offscreenElem, plotlyElement.data, layout, plotlyElement.config).then(() => {
      let svg = Plotly.Snapshot.toSVG($offscreenElem, "svg", scale);

      // fixes the lines becoming thin
      svg = svg.replace(VECTOR_EFFECT_REGEX,"");     
      var img = new window.Image();

      img.onload = function() {
        compose($canvas, img, width * scale, height * scale);

        download($canvas, `${name}.${format}`, format)

        Plotly.purge($offscreenElem);
      };

      img.onerror = function(err) {
        // TODO better error handling, for now try to fallback to Plotly code
        Plotly.downloadImage($offscreenElem, opts);
      };

      img.src = 'data:image/svg+xml;base64,' + btoa(svg);
    });
  }
})();