# Google Maps API Features - The Ultimate Example
Explore the geospatial features of the Google Maps API

## Draw Distinct Shapes
In the Google Maps API, you can draw rectangles, circles, polygons, and multi-lines. Markers can also be dropped at areas of interest.

When a shape is completed, click on the shape to see the full list of corner coordinates as well as geospatial details like area, perimeter, and/or radius. Even if you made a mistake, you can still move and edit the shape to apply corrections. 

** Circles cannot be corrected. To fix circles, you have to delete the shape entirely.

## Save all your Shapes
Once you've completed all your shapes, click the 'save' control button to save your entire map to your browser's local storage saved under the tag 'geoData'. All map data is saved as a GeoJSON. The GeoJSON carefully encodes every corner coordinate and each shape's area, perimeter, or radius to the 14th decimal place. The GeoJSON also saves the shape's distinct colour as well as each shape's unique ID (strictly numerical presently). Learn more about local storage here (https://developer.mozilla.org/en/docs/Web/API/Window/localStorage) and learn more of the geoJSON file type here (http://geojson.org/). 

When your page is reloaded, all your shapes will be loaded through the GeoJSON and the map automatically styles and centers the map to encompass all present shapes optimally. This is done through the 'zoom', 'style', 'loadPolygons', and 'processPoints' functions intiated by the map's callback.

## Download your map
At any point in time, you can download the entire contents of your saved data by clicking the 'download' button. This will generate the map's GeoJSON under the name 'myGeojson.json'. This file type can easily be converted to other geographical file types like KML, Shapefile, WKT, etc. To test the authenticity of your downloaded copy, head over to geojson.io.

<a href="res/myGeojson.json" download>Download</a>

**Circles may not be accurately recreated as a circle is not a recognized GeoJSON structure.

## Delete all your Shapes
At any point in time, upon clicking 'Clear Map', all present shapes will be deleted. This is done by exclusively removing each shape from the GeoJSON structure and the visual map itself.

## Destinguish your Shapes by Colour
As multiple shapes pile up, it's beneficial to distinguish each shape by a different colour. Presently 9 distinct colours are available to choose from. The number of colours and the actual colours themselves are defined as the 'colors' array at the top of the JAVAScript file. The 'buildColorPallete()' and 'makeColorButton()' functions help represent all the colours. Other important functions are 'selectColor()' and 'setSelectedShapeColor'. Presently, the colour palette sits below the map.

## The Search Box
The search box situated at the top of the map is present to help users pin-point there location to an exact address. With Google Auto-complete present as well, it is a quick way to navigate the world.
