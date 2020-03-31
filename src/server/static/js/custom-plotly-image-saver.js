
var saveImage = (function(){
  let $offscreenElem = null;
  let $canvas = null;
  const VECTOR_EFFECT_REGEX = /vector-effect: non-scaling-stroke;/g;
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
    
    let {width, height} = plotlyElement._fullLayout;

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

        let dataUrl = $canvas.toDataURL('image/'+format)

        saveAs(dataUrl, name + "." + format)

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


var saveAs = (function(){
  /*
  * FileSaver.js
  * A saveAs() FileSaver implementation.
  *
  * By Eli Grey, http://eligrey.com
  * Modified by mathijs.henquet@gmail.com
  *
  * License : https://github.com/eligrey/FileSaver.js/blob/master/LICENSE.md (MIT)
  * source  : http://purl.eligrey.com/github/FileSaver.js
  */

  function download (url, name, opts) {
    var xhr = new XMLHttpRequest()
    xhr.open('GET', url)
    xhr.responseType = 'blob'
    xhr.onload = function () {
      saveAs(xhr.response, name, opts)
    }
    xhr.onerror = function () {
      console.error('could not download file')
    }
    xhr.send()
  }

  function corsEnabled (url) {
    var xhr = new XMLHttpRequest()
    // use sync to avoid popup blocker
    xhr.open('HEAD', url, false)
    try {
      xhr.send()
    } catch (e) {}
    return xhr.status >= 200 && xhr.status <= 299
  }

  // `a.click()` doesn't work for all browsers (#465)
  function click (node) {
    try {
      node.dispatchEvent(new MouseEvent('click'))
    } catch (e) {
      var evt = document.createEvent('MouseEvents')
      evt.initMouseEvent('click', true, true, window, 0, 0, 0, 80,
                            20, false, false, false, false, 0, null)
      node.dispatchEvent(evt)
    }
  }

  // Detect WebKit inside a native macOS app
  var isWebKit = /AppleWebKit/.test(navigator.userAgent)

  return (
    // probably in some web worker
    (typeof window !== 'object' || window !== window)
      ? function saveAs () { /* noop */ }

    // Use download attribute first if possible (#193 Lumia mobile) unless this is a native macOS app
    : ('download' in HTMLAnchorElement.prototype && !isWebKit)
    ? function saveAs (url, name, opts) {
      console.log(url, name, opts);

      var a = document.createElement('a')
      name = name || 'download'

      a.download = name
      a.rel = 'noopener' // tabnabbing
      a.href = url
      click(a)

      console.log(a);
    }

    // Use msSaveOrOpenBlob as a second approach
    : 'msSaveOrOpenBlob' in navigator
    ? function saveAs (url, name, opts) {
      name = name || 'download'

      if (corsEnabled(url)) {
        download(url, name, opts)
      } else {
        var a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        setTimeout(function () { click(a) })
      }
    }

    // Fallback to using FileReader and a popup
    : function saveAs (blob, name, opts, popup) {
      // Open a popup immediately do go around popup blocker
      // Mostly only available on user interaction and the fileReader is async so...
      popup = popup || open('', '_blank')
      if (popup) {
        popup.document.title =
        popup.document.body.innerText = 'downloading...'
      }

      return download(blob, name, opts)
    }
  )
})();