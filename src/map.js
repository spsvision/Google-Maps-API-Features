var drawingManager;
var map;
var selectedShape;
var colors = ['#DC2C80','#6C07BD','#00bfff','#06CA8D', '#ffdf00', '#ff7f50', '#D13212', '#8B4513', '#FFF1E8', '#242424'];
var selectedColor;
var colorButtons = {};
var area = 0;
var perimeter = 0;
var infowindow;
var id = 1;

function clearSelection() {
  if (selectedShape) {
    selectedShape.setEditable(false);
    selectedShape = null;
  }
}

function setSelection(shape) {
  clearSelection();
  selectedShape = shape;
  shape.setEditable(true);
  selectColor(shape.get('fillColor') || shape.get('strokeColor'));
}

function deleteSelectedShape(id) {
  area -= map.data.getFeatureById(id).getProperty('area');
  perimeter -= map.data.getFeatureById(id).getProperty('perimeter');
  map.data.remove(map.data.getFeatureById(id));
  if (selectedShape) {
    selectedShape.setMap(null);
  }
  savePolygon();
}

function deleteAllShape() {
  map.data.forEach(function (f) {
        map.data.remove(f);
  });
  savePolygon();
  area = 0;
  perimeter = 0;
}
function selectColor(color) {
  selectedColor = color;
  for (var i = 0; i < colors.length; ++i) {
    var currColor = colors[i];
    colorButtons[currColor].style.border = currColor == color ? '2px solid #16263E' : '2px solid #fff';
  }
  // Retrieves the current options from the drawing manager and replaces the stroke or fill color as appropriate.
  var polylineOptions = drawingManager.get('polylineOptions');
  polylineOptions.strokeColor = color;
  drawingManager.set('polylineOptions', polylineOptions);

  var rectangleOptions = drawingManager.get('rectangleOptions');
  rectangleOptions.fillColor = color;
  rectangleOptions.strokeColor = color;
  drawingManager.set('rectangleOptions', rectangleOptions);

  var circleOptions = drawingManager.get('circleOptions');
  circleOptions.fillColor = color;
  circleOptions.strokeColor = color;

  drawingManager.set('circleOptions', circleOptions);

  var polygonOptions = drawingManager.get('polygonOptions');
  polygonOptions.fillColor = color;
  polygonOptions.strokeColor = color;

  drawingManager.set('polygonOptions', polygonOptions);
}

function setSelectedShapeColor(color) {
  if (selectedShape) {
    if (selectedShape.type == google.maps.drawing.OverlayType.POLYLINE) {
      selectedShape.set('strokeColor', color);
    } else {
      selectedShape.set('fillColor', color);
      selectedShape.set('strokeColor', color);
    }
  }
}

function makeColorButton(color) {
  var button = document.createElement('span');
  button.className = 'color-button';
  button.style.backgroundColor = color;
  google.maps.event.addDomListener(button, 'click', function() {
    selectColor(color);
    setSelectedShapeColor(color);
  });

  return button;
}

function buildColorPalette() {
  var colorPalette = document.getElementById('color-palette');
  for (var i = 0; i < colors.length; ++i) {
    var currColor = colors[i];
    var colorButton = makeColorButton(currColor);
    colorPalette.appendChild(colorButton);
    colorButtons[currColor] = colorButton;
  }
  selectColor(colors[0]);
}

function btnControl(controlDiv, map, btn) {

  // Set CSS for the control border.
  var controlUI = document.createElement('div');
  if (btn == 'save') {
    controlUI.style.backgroundColor = '#2D5DB6';
    controlUI.title = 'Save your map';
    controlUI.style.marginLeft = '22px';
  } else if (btn == 'delete') {
    controlUI.style.backgroundColor = '#C8343A';
    controlUI.title = 'Delete all your shapes & clear the map';
    controlUI.style.marginRight = '22px';
  } else if (btn == 'download') {
    controlUI.style.backgroundColor = '#16263E';
    controlUI.title = 'Export your map as a GeoJSON';
    controlUI.style.marginBottom = '22px';
  }
  controlUI.style.border = '1px solid #fff';
  controlUI.style.borderRadius = '3px';
  controlUI.style.boxShadow = '0 2px 6px rgba(0,0,0,.3)';
  controlUI.style.cursor = 'pointer';
  controlUI.style.textAlign = 'center';
  controlDiv.appendChild(controlUI);

  // Set CSS for the control interior.
  var controlText = document.createElement('div');
  controlText.style.color = '#fff';
  controlText.style.fontSize = '14px';
  controlText.style.lineHeight = '38px';
  controlText.style.paddingLeft = '5px';
  controlText.style.paddingRight = '5px';
  if (btn == 'save') {
    controlText.innerHTML = 'Save Map';
  } else if (btn == 'delete') {
    controlText.innerHTML = 'Clear Map';
  } else if (btn == 'download') {
    controlText.innerHTML = 'Download';
  }
  controlUI.appendChild(controlText);

  // Setup the click event listeners to save the shapes.
  if (btn == 'save') {
    controlUI.addEventListener('click', savePolygon);
  } else if (btn == 'delete') {
    controlUI.addEventListener('click', deleteAllShape);
  } else if (btn == 'download') {
    controlUI.addEventListener('click', function(){
      map.data.toGeoJson(function (json) {
              downloadJSON(JSON.stringify(json));
      });
      }
    );
  }
}

function initialize() {
  map = new google.maps.Map(document.getElementById('map'), {
    center: new google.maps.LatLng(31.553574922464268, -18.160400390625),
    zoom: 2, mapTypeId: google.maps.MapTypeId.HYBRID, zoomControl: true, mapTypeControl: true, mapTypeControlOptions : { position: google.maps.ControlPosition.TOP_LEFT}, scaleControl: true, streetViewControl: false, rotateControl: true, fullscreenControl: true, fullscreenControlOptions : { position:google.maps.ControlPosition.RIGHT_TOP }
  });

  map.setTilt(45);
  var polyOptions = {
    strokeWeight: 3,
    fillOpacity: 0.75,
    draggable: false,
    editable: false
  };
  map.data.setStyle({
        editable: true,
        draggable: true
  });
  google.maps.event.addDomListener(window, "resize", function() {
    var center = map.getCenter();
    google.maps.event.trigger(map, "resize");
    map.setCenter(center);
  });
  // Creates a drawing manager attached to the map that allows the user to draw
  // markers, lines, and shapes.
  drawingManager = new google.maps.drawing.DrawingManager({
    drawingControlOptions: { position: google.maps.ControlPosition.BOTTOM_CENTER},
    drawingMode: google.maps.drawing.OverlayType.POLYGON,
    markerOptions: {
      draggable: true
    },
    polylineOptions: {
      editable: true
    },
    rectangleOptions: polyOptions,
    circleOptions: polyOptions,
    polygonOptions: polyOptions,
    map: map
  });
  var input = document.getElementById('pac-input');
  var searchBox = new google.maps.places.SearchBox(input);
  map.controls[google.maps.ControlPosition.TOP_CENTER].push(input);

  // Bias the SearchBox results towards current map's viewport.
  map.addListener('bounds_changed', function() {
    searchBox.setBounds(map.getBounds());
  });

  var markers = [];
  // Listen for the event fired when the user selects a prediction and retrieve
  // more details for that place.
  searchBox.addListener('places_changed', function() {
    var places = searchBox.getPlaces();

    if (places.length == 0) {
      return;
    }

    // Clear out the old markers.
    markers.forEach(function(marker) {
      marker.setMap(null);
    });
    markers = [];

    // For each place, get the icon, name and location.
    var bounds = new google.maps.LatLngBounds();
    places.forEach(function(place) {
      if (!place.geometry) {
        console.log("Returned place contains no geometry");
        return;
      }
      var icon = {
        url: place.icon,
        size: new google.maps.Size(71, 71),
        origin: new google.maps.Point(0, 0),
        anchor: new google.maps.Point(17, 34),
        scaledSize: new google.maps.Size(25, 25)
      };

      // Create a marker for each place.

      if (place.geometry.viewport) {
        // Only geocodes have viewport.
        bounds.union(place.geometry.viewport);
      } else {
        bounds.extend(place.geometry.location);
      }
    });
    map.fitBounds(bounds);
  });
  infowindow = new google.maps.InfoWindow;

  google.maps.event.addListener(drawingManager, 'overlaycomplete', function(e) {
    if (e.type == google.maps.drawing.OverlayType.MARKER) {
          map.data.add(new google.maps.Data.Feature({
		id: id,
         	geometry: new google.maps.Data.Point(e.overlay.getPosition())
          }));
	  id++;
    } else {
      if (e.type == google.maps.drawing.OverlayType.CIRCLE) {
          map.data.add(new google.maps.Data.Feature({
          	properties: {
		  radius: e.overlay.getRadius(),
		  area: e.overlay.getRadius()*e.overlay.getRadius()*Math.PI,
		  perimeter: 2*e.overlay.getRadius()*Math.PI,
            	  fill: e.overlay.fillColor,
		  stroke: e.overlay.fillColor
          	},
		id: id,
         	geometry: new google.maps.Data.Point(e.overlay.getCenter())
          }));
	  id++;

        area += e.overlay.getRadius()*e.overlay.getRadius()*Math.PI;
        perimeter += 2*e.overlay.getRadius()*Math.PI;
      }
      if (e.type == google.maps.drawing.OverlayType.RECTANGLE) {
        var sw = e.overlay.bounds.getSouthWest();
        var ne = e.overlay.bounds.getNorthEast();
        var southWest = new google.maps.LatLng(sw.lat(), sw.lng());
        var northEast = new google.maps.LatLng(ne.lat(), ne.lng());
        var southEast = new google.maps.LatLng(sw.lat(), ne.lng());
        var northWest = new google.maps.LatLng(ne.lat(), sw.lng());
	var path = [southWest,southEast,northEast,northWest];
          map.data.add(new google.maps.Data.Feature({
          	properties: {
            	  fill: e.overlay.fillColor,
		  stroke: e.overlay.fillColor,
		  perimeter: google.maps.geometry.spherical.computeLength([northEast, northWest, southWest, southEast]),
		  area: google.maps.geometry.spherical.computeArea([northEast, northWest, southWest, southEast])
          	},
		id: id,
         	geometry: new google.maps.Data.Polygon([path])
          }));
	  id++;

        area+=google.maps.geometry.spherical.computeArea([northEast, northWest, southWest, southEast]);
        perimeter+=google.maps.geometry.spherical.computeLength([northEast, northWest, southWest, southEast]);
      }

      if (e.type == google.maps.drawing.OverlayType.POLYGON) {
          path = e.overlay.getPath();
	  map.data.add(new google.maps.Data.Feature({
          	properties: {
            	  fill: e.overlay.fillColor,
		  stroke: e.overlay.fillColor,
		  perimeter: google.maps.geometry.spherical.computeLength(path),
		  area: google.maps.geometry.spherical.computeArea(path)
          	},
		id: id,
          	geometry: new google.maps.Data.Polygon([e.overlay.getPath().getArray()])
          }));
	  id++;
          area+=google.maps.geometry.spherical.computeArea(path);
          perimeter+=google.maps.geometry.spherical.computeLength(path);
      }
      if (e.type == google.maps.drawing.OverlayType.POLYLINE) {
          var linearea = 0;
          path = e.overlay.getPath();
          if (path.getAt(0) == path.getAt(path.length - 1)) {
            linearea = google.maps.geometry.spherical.computeArea(path);
          }
          map.data.add(new google.maps.Data.Feature({
          	properties: {
            	  stroke: e.overlay.strokeColor,
		  perimeter: google.maps.geometry.spherical.computeLength(path),
		  area: linearea
          	},
		id: id,
          	geometry: new google.maps.Data.LineString(e.overlay.getPath().getArray())
          }));
	  id++;
          area += linearea;
          perimeter+= google.maps.geometry.spherical.computeLength(path);
      }
      e.overlay.setMap(null);

      drawingManager.setDrawingMode(null);
      style(map);
      map.data.addListener('addfeature', savePolygon);
      map.data.addListener('removefeature', savePolygon);

      // Add an event listener that selects the newly-drawn shape when the user
      // mouses down on it.
      var newShape = e.overlay;

      newShape.type = e.type;
      google.maps.event.addListener(newShape, 'click', function() {
        setSelection(newShape);
      });
      setSelection(newShape);
    }
  });

  map.data.addListener('click', function(event) {
    var feature = event.feature;
    var html = "";
    var typer = "";

    if (feature.getGeometry().getType() === 'Polygon') {
	html += '<b>'+ feature.getGeometry().getType()+' '+ feature.getId() +'</b><br><br>';
        for(var i = 0; i < feature.getGeometry().getAt(0).getLength(); i++) {
            html += 'Coordinate ' + i + ':<br>(' + feature.getGeometry().getAt(0).getAt(i).lat().toFixed(4) + ', ' + feature.getGeometry().getAt(0).getAt(i).lng().toFixed(4) + ')<br>';
        }
	      typer = feature.getGeometry().getType();
 	      html +='<br>Perimeter: ' + feature.getProperty('perimeter').toFixed(1) + " m";
        html +='<br>Area: ' + feature.getProperty('area').toFixed(1) + " m^2<br>";
    } else if (feature.getGeometry().getType() === 'LineString') {

	      typer = feature.getGeometry().getType();
	      html += '<b>'+feature.getGeometry().getType()+' '+ feature.getId() +'</b><br><br>';
        for(var i = 0; i < feature.getGeometry().getLength(); i++) {
            html += 'Coordinate ' + i + ':<br>(' + feature.getGeometry().getAt(i).lat().toFixed(4) + ', ' + feature.getGeometry().getAt(i).lng().toFixed(4) + ')<br>';
        }
	html +='<br>Perimeter: ' + feature.getProperty('perimeter').toFixed(1) + " m";
        html +='<br>Area: ' + feature.getProperty('area').toFixed(1) + " m^2<br><br>";
    } else if (feature.getGeometry().getType() === 'Point') {
	if (feature.getProperty('radius') && feature.getGeometry().getType()==='Point') {
		html += '<b>Circle'+' '+ feature.getId() +'</b><br><br>' +
                 'Center: <br>(' + feature.getGeometry().get().lat().toFixed(4) + feature.getGeometry().get().lng().toFixed(4) +
		  ')<br>Radius: ' + feature.getProperty('radius').toFixed(1) + " m" +
		  '<br>Perimeter: ' + feature.getProperty('perimeter').toFixed(1) + " m" +
		  '<br>Area: ' + feature.getProperty('area').toFixed(1) + " m^2<br>";
		typer = "Circle";
	} else {
		html += '<b>Marker'+' '+ feature.getId() +'</b><br><br>' +
                 'Center: <br>(' + feature.getGeometry().get().lat().toFixed(4) + feature.getGeometry().get().lng().toFixed(4) +'<br><br>';
		typer = "Marker";
	}
    }
    html +="<br><input type='button' id='delete-button' class='btn btn-danger' value='Delete Shape' onclick='deleteSelectedShape(" + feature.getId() + ")'/><br>";
    infowindow.setOptions({
      position: event.latLng,
      map: map
    });
    infowindow.setContent(html);
    infowindow.open(map);
  });
  // Clear the current selection when the drawing mode is changed, or when the
  // map is clicked.
  google.maps.event.addListener(drawingManager, 'drawingmode_changed', clearSelection);
  google.maps.event.addListener(map, 'click', clearSelection);
  var saveControlDiv = document.createElement('div');
  var saveControl = new btnControl(saveControlDiv, map, 'save');

  saveControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.LEFT_CENTER].push(saveControlDiv);

  var delControlDiv = document.createElement('div');
  var delControl = new btnControl(delControlDiv, map, 'delete');

  delControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.RIGHT_CENTER].push(delControlDiv);

  var downControlDiv = document.createElement('div');
  var downControl = new btnControl(downControlDiv, map, 'download');

  downControlDiv.index = 1;
  map.controls[google.maps.ControlPosition.BOTTOM_LEFT].push(downControlDiv);

  buildColorPalette();
  loadPolygons(map);
}

function savePolygon() {
    map.data.toGeoJson(function (json) {
      localStorage.setItem('geoData', JSON.stringify(json));
    });
}
function downloadJSON(data){

    if(!data) {
        console.error('No data')
        return;
    }

    if(typeof data === "object"){
        data = JSON.stringify(data, undefined, 4)
    }

    var blob = new Blob([data], {type: 'text/json'}),
        e    = document.createEvent('MouseEvents'),
        a    = document.createElement('a')

    a.download = "myGeojson.json"
    a.href = window.URL.createObjectURL(blob)
    a.dataset.downloadurl =  ['text/json', a.download, a.href].join(':')
    e.initMouseEvent('click', true, false, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
    a.dispatchEvent(e)
}
function processPoints(geometry, callback, thisArg) {
  if (geometry instanceof google.maps.LatLng) {
    callback.call(thisArg, geometry);
  } else if (geometry instanceof google.maps.Data.Point) {
    callback.call(thisArg, geometry.get());
  } else {
    geometry.getArray().forEach(function(g) {
      processPoints(g, callback, thisArg);
    });
  }
}
function loadPolygons(map) {
    var data = JSON.parse(localStorage.getItem('geoData'));
    var total=0;
    area = 0;
    perimeter = 0;
    var bounds = new google.maps.LatLngBounds();
    map.data.forEach(function (f) {
        map.data.remove(f);
    });
    map.data.addGeoJson(data)
    map.data.forEach(function (f) {
//	area += f.getProperty('area');
//	perimeter += f.getProperty('perimeter');
	if (total < f.getId()) {
		total = f.getId();
	}
    });
    id = total+1;

    style(map);
    zoom(map);
}
function style(map) {
  map.data.setStyle(function (feature) {
    if(feature.getProperty('radius') && feature.getGeometry().getType()==='Point'){  // This is the special case to recreate a circle since GeoJSON doesnt support circle types

      new google.maps.Circle({
		map:map,
		center:feature.getGeometry().get(),
        	fillColor: feature.getProperty('fill'),
		fillOpacity: 0.75,
		strokeColor: feature.getProperty('stroke'),
        	strokeWeight: 3,
		radius:feature.getProperty('radius')});
        return {

      };
    }
    return {
        fillColor: feature.getProperty('fill'),
	fillOpacity: 0.75,
	strokeColor: feature.getProperty('stroke'),
        strokeWeight: 3,
        editable: true,
        draggable: true
    };
  });
}
function zoom(map) {
  var bounds = new google.maps.LatLngBounds();
  map.data.forEach(function(feature) {
    processPoints(feature.getGeometry(), bounds.extend, bounds);
  });
  map.fitBounds(bounds);
}

google.maps.event.addDomListener(window, 'load', initialize);
