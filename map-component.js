import { i18n, addCss } from "./helper.js";

import TooltipComponent from "./tooltip-component.js";
// import axios from 'axios';
// import * as _ from 'lodash'
export default {
  components: {
    TooltipComponent,
  },
  props: {
    mode: {
      type: String,
      default: "simple",
    },
  },
  data() {
    return {
      types: ["sensor", "drilling", "zone"],
      typesSelected: ["sensor", "drilling", "zone"],
      map: null,
      mapStyle: "3d",
      tooltip: null,
      pitch: 60,
      bearing: 41,
      mapItems: [],
      initialized: false,
      i18n: i18n(),
      base: "https://permapyrenees.eu",
      layers: ["mountains", "cities", "roads", "pois"],
      layersSelected: [],
      zoom: 8,
      lat: 42.338473777989066,
      lng: -0.10777898737029545,
      detail: 0
    };
  },
  computed: {},
  async mounted() {
    this.initMap();
  },
  methods: {
    async initMap() {
      if (this.mode === "full") {
        addCss(
          "/wp-content/themes/divi-child/map/assets/map-styles-full.css",
          "map-styles-full"
        );
      }

      if (this.getQuerystringParameter("zoom")) {
        this.zoom = parseInt(this.getQuerystringParameter("zoom"));        
      }
      if (this.getQuerystringParameter("lat")) {
        this.lat = parseFloat(this.getQuerystringParameter("lat"));
      }
      if (this.getQuerystringParameter("lng")) {
        this.lng = parseFloat(this.getQuerystringParameter("lng"));
      }
      if (this.getQuerystringParameter("detail")) {
        this.detail = parseInt(this.getQuerystringParameter("detail"));
      }


      if (window.innerWidth < 768) {
        this.zoom = this.zoom - 2;
      }


      mapboxgl.accessToken =
        "pk.eyJ1Ijoiam9yZGl3ZWJjb29wIiwiYSI6ImNseWN0azh5NDFhZTEybHM2OXdrNWMwbTkifQ.zNm6Ce6CMxwpnPcbMsXjXA";
      this.map = new mapboxgl.Map({
        container: "map", // container ID
        zoom: this.zoom,        
        center: [this.lng, this.lat], // starting position [lng, lat]
        pitch: this.pitch,
        bearing: this.bearing,
        style: "mapbox://styles/mapbox/outdoors-v12",
        scrollZoom      : false,
        boxZoom         : true,
        doubleClickZoom : true
      });

      this.map.addControl(new mapboxgl.NavigationControl(), "top-left");

      class ChangeMapTypeCustomControl {
        onAdd(map) {
          this.map = map;
          this.mapStyle = "3d";
          this.container = document.createElement("div");
          this.container.className = "mapboxgl-ctrl";
          this.container.title = "2D / 3D";
          this.svg = document.createElement("div");
          this.svg.className = "change-map-type-custom-control";
          this.svg.innerHTML = `<?xml version="1.0" encoding="utf-8"?>
          <svg version="1.1" id="Capa_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 141.7 141.7" style="enable-background:new 0 0 141.7 141.7;" xml:space="preserve">
          <style type="text/css">
            .st0{fill:none;stroke:#000;stroke-width:8.5087;stroke-linecap:round;stroke-miterlimit:10;}
          </style>
          <g>
            <polygon class="st0" points="11.7,33.6 11.7,120 51,106.9 90.2,120 129.8,107.5 129.8,21.4 90.8,34 50.6,20.6 	"/>
            <line class="st0" x1="50.9" y1="21.6" x2="50.9" y2="106"/>
            <line class="st0" x1="90.3" y1="33.4" x2="90.3" y2="117.8"/>
          </g>
          </svg>
          `;

          this.container.appendChild(this.svg);

          this.container.addEventListener("click", () => {
            if (this.mapStyle === "3d") {
              this.mapStyle = "2d";
              this.map.setTerrain();
              this.map.removeSource("mapbox-dem");
              this.map.easeTo({ pitch: 0, bearing: 0, duration: 1000 });
            } else {
              this.mapStyle = "3d";
              this.map.easeTo({ pitch: 60, bearing: 41, duration: 1000 });
              this.map.addSource("mapbox-dem", {
                type: "raster-dem",
                url: "mapbox://mapbox.mapbox-terrain-dem-v1",
                tileSize: 512,
                maxzoom: 14,
              });
              // add the DEM source as a terrain layer with exaggerated height
              this.map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });
            }
          });
          return this.container;
        }
        onRemove() {
          this.container.parentNode.removeChild(this.container);
          this.map = undefined;
        }
      }

      const changeMapTypeCustomControl = new ChangeMapTypeCustomControl();

      this.map.addControl(changeMapTypeCustomControl, "top-left");

      class MapOptionsCustomControl {     
        constructor(t) {
          this.t = t;
        }
        onAdd(map) {
          this.map = map;
          this.mapStyle = "3d";
          this.container = document.createElement("div");
          this.container.className = "mapboxgl-ctrl ctrl-options";
          this.container.title = "";
          this.svg = document.createElement("div");
          this.svg.className = "change-map-type-custom-control";
          this.svg.innerHTML = `<svg class="select-type-icon-control" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
          `;

          this.container.appendChild(this.svg);

          this.container.addEventListener("click", () => {
            const legend = document.getElementById("legend");
            legend.classList.toggle("xs-hidden");
            const legendLayers = document.getElementById("legend-layers");
            legendLayers?.classList.toggle("xs-hidden");
            this.t.tooltip = null;
          });
          return this.container;
        }
        onRemove() {
          this.container.parentNode.removeChild(this.container);
          this.map = undefined;
        }
      }

      console.log("this", this);
      const mapOptionsCustomControl = new MapOptionsCustomControl(this);
      mapOptionsCustomControl

      this.map.addControl(mapOptionsCustomControl, "top-left");

      // disable map zoom when using scroll
      //this.map.scrollZoom.disable();

      this.map.on("style.load", async () => {
        console.log("style loaded");
        this.map.addSource("mapbox-dem", {
          type: "raster-dem",
          url: "mapbox://mapbox.mapbox-terrain-dem-v1",
          tileSize: 512,
          maxzoom: 14,
        });
        // add the DEM source as a terrain layer with exaggerated height
        this.map.setTerrain({ source: "mapbox-dem", exaggeration: 1.5 });

        var { data } = await axios.get(
          this.base + "/wp-json/wp/v2/mapitem?per_page=100&_embed"
        );
        this.mapItems = data;
        this.reload();

        // layers
        //this.showLayers();

        // console.log("allLayers", allLayers);
        // const layers = allLayers.filter(
        //   (layer) =>
        //     layer.id.startsWith("road-") ||
        //     layer.id.startsWith("ztunnel-") ||
        //     layer.id.startsWith("zbridge-") ||
        //     layer.id.startsWith('zgolf-') ||
        //     layer.id.startsWith('zbuilding') ||
        //     layer.id.startsWith('zferry') ||
        //     layer.id.startsWith('zaerialway') ||
        //     ( layer.id.endsWith('-label') )
        // );
        // console.log("layers", layers);
        // for (const layer of layers) {
        //   this.map.setLayoutProperty(layer.id, "visibility", "none");
        // }
        // this.map.setLayoutProperty("poi-label", "visibility", "none");
      });
    },
    async reload() {
      if (!this.initialized) {
        this.initialized = true;
        this.showLayers();
        for (const mapItem of this.mapItems) {
          if (mapItem.acf.type === "zone") {
            // poligon from https://geojson.io/
            const mapItemGeoJson = JSON.parse(mapItem.acf.geojson);
            const geojson = {
              type: "geojson",
              data: mapItemGeoJson.features[0],
            };
            geojson.type = "geojson";
            this.map.addSource(`zone-${mapItem.id}`, geojson);
            this.map.on("click", `zone-${mapItem.id}`, (e) => {
              this.map.flyTo({ center: e.lngLat });
              //this.drawTooltip(mapItem);
            });
            this.map.addLayer({
              id: `zone-${mapItem.id}`,
              type: "fill",
              source: `zone-${mapItem.id}`, // reference the data source
              layout: {},
              paint: {
                "fill-color": "#fff",
                "fill-opacity": 0.5,
              },
            });
            // Add a black outline around the polygon.
            this.map.addLayer({
              id: `outline-zone-${mapItem.id}`,
              type: "line",
              source: `zone-${mapItem.id}`,
              layout: {},
              paint: {
                "line-color": "#000",
                "line-width": 1,
              },
            });

            // this.map.on('click', (e) => {
            //   this.clickOnMap(e)
            // });
          } else {
            const el = document.createElement("div");
            el.className = `marker-${mapItem.acf.type} hovicon effect-1`;
            el.id = `marker-${mapItem.id}`;
            const marker = new mapboxgl.Marker(el, { anchor: "bottom" })
              .setLngLat([mapItem.acf.longitude, mapItem.acf.latitude])
              .addTo(this.map);
            marker.getElement().addEventListener("click", () => {
              this.map.flyTo({
                center: [mapItem.acf.longitude, mapItem.acf.latitude],
              });
              this.drawTooltip(mapItem);
              const hoviconElements = document.querySelectorAll(".hovicon");
              hoviconElements.forEach((element) => {
                element.classList.remove("active");
              });
              el.classList.toggle("active");
            });
          }
        }
      } else {
        for (const mapItem of this.mapItems) {
          if (mapItem.acf.type === "zone") {
            const layers = this.map.getStyle().layers;
            const layerId = `zone-${mapItem.id}`;
            const outlineLayerId = `outline-zone-${mapItem.id}`;
            const visibility = this.typesSelected.includes("zone")
              ? "visible"
              : "none";
            this.map.setLayoutProperty(layerId, "visibility", visibility);
            this.map.setLayoutProperty(
              outlineLayerId,
              "visibility",
              visibility
            );
          } else {
            const id = `marker-${mapItem.id}`;
            document.getElementById(id).style.display =
              this.typesSelected.includes(mapItem.acf.type) ? "block" : "none";
          }
        }
      }
    },
    toggleType(type) {
      if (this.typesSelected.includes(type)) {
        this.typesSelected = this.typesSelected.filter((t) => t !== type);
      } else {
        this.typesSelected.push(type);
      }
      this.reload();
    },
    toggleMapStyle() {
      if (this.mapStyle === "3d") {
        this.mapStyle = "2d";
        this.map.setTerrain();
        //this.map.easeTo({
      } else {
        this.mapStyle = "3d";
      }
    },
    drawTooltip(mapItem) {
      this.tooltip = mapItem;
      const tooltip = document.getElementById("tooltip");
      tooltip.style.visibility = "visible";
    },
    clickOnMap(event) {
      if (window.innerWidth > 600) {
        this.tooltip = null;
      }
    },
    close() {
      this.tooltip = null;
      const hoviconElements = document.querySelectorAll(".hovicon");
      hoviconElements.forEach((element) => {
        element.classList.remove("active");
      });
    },
    toggleLayer(layer) {
      if (this.layersSelected.includes(layer)) {
        this.layersSelected = this.layersSelected.filter((l) => l !== layer);
      } else {
        this.layersSelected.push(layer);
      }
      this.showLayers();
    },
    closeLegend() {
      const legend = document.getElementById("legend");
      legend.classList.toggle("xs-hidden");
      const legendLayers = document.getElementById("legend-layers");
      legendLayers?.classList.toggle("xs-hidden");
    },
    showLayers() {
      const allLayers = this.map.getStyle().layers;
      const roadLayers = allLayers.filter((layer) =>
        layer.id.startsWith("road-")
      );
      for (const layer of roadLayers) {
        this.map.setLayoutProperty(
          layer.id,
          "visibility",
          this.layersSelected.includes("roads") ? "visible" : "none"
        );
      }
      const cityLayers = allLayers.filter(
        (layer) =>
          layer.id.endsWith("-label") &&
          !layer.id.endsWith("poi-label") &&
          !layer.id.endsWith("natural-line-label") &&
          !layer.id.endsWith("natural-point-label") &&
          !layer.id.endsWith("waterway-label") &&
          !layer.id.startsWith("water-")
      );
      for (const layer of cityLayers) {
        this.map.setLayoutProperty(
          layer.id,
          "visibility",
          this.layersSelected.includes("cities") ? "visible" : "none"
        );
      }
      const mountainLayers = allLayers.filter(
        (layer) =>
          layer.id.endsWith("poi-label") ||
          layer.id.endsWith("natural-line-label") ||
          layer.id.endsWith("natural-point-label") ||
          layer.id.endsWith("waterway-label") ||
          layer.id.startsWith("water-")
      );
      for (const layer of mountainLayers) {
        this.map.setLayoutProperty(
          layer.id,
          "visibility",
          this.layersSelected.includes("mountains") ? "visible" : "none"
        );
      }
      const poiLayers = allLayers.filter((layer) =>
        layer.id.startsWith("poi-label")
      );
      for (const layer of poiLayers) {
        this.map.setLayoutProperty(
          layer.id,
          "visibility",
          this.layersSelected.includes("pois") ? "visible" : "none"
        );
      }
    },
    getQuerystringParameter(name) {
      const urlParams = new URLSearchParams(window.location.search);
      return urlParams.get(name);
    }
  },
  template: `
    <div id="app-wrapper">    
      <div id="zzz" class="xs-hidden">
      <div id="legend" class="xs-hidden">
        <div class="close-legend" @click="closeLegend">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
        </div>
        <div class="d-flex d-block-xs justify-content-between">
          <div class="legend-title text-start">{{i18n.actions}}</div>
          <div class="d-flex justify-content-between sensors-list">
            <div v-for="type in types" :key="type" @click="toggleType(type)" class="select-type">
              <img :src="'/wp-content/themes/divi-child/map/assets/images/' + type + '.svg'" alt="type" class="type-icon" />
              <span class="legend" :class="type">{{ i18n.sensors[type] }}</span>
              <svg v-if="typesSelected.includes(type)" class="select-type-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
              <svg v-if="!typesSelected.includes(type)" class="select-type-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
            </div>
          </div>
          <div class="legend-text">{{ i18n.legend_text }}</div>
        </div>
      </div>
      <div id="legend-layers" v-if="mode === 'full'" class="xs-hidden">
        <div class="d-flex d-block-xs justify-content-between">
          <div class="legend-title text-start">{{i18n.legend}}</div>
          <div class="d-flex justify-content-between sensors-list">
            <div v-for="layer in layers" :key="type" @click="toggleLayer(layer)" class="select-type">
              <span class="legend" :class="type">{{ i18n.layers[layer] }}</span>
              <svg v-if="layersSelected.includes(layer)" class="select-type-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-280q83 0 141.5-58.5T680-480q0-83-58.5-141.5T480-680q-83 0-141.5 58.5T280-480q0 83 58.5 141.5T480-280Zm0 200q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
              <svg v-if="!layersSelected.includes(layer)" class="select-type-icon" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-80q-83 0-156-31.5T197-197q-54-54-85.5-127T80-480q0-83 31.5-156T197-763q54-54 127-85.5T480-880q83 0 156 31.5T763-763q54 54 85.5 127T880-480q0 83-31.5 156T763-197q-54 54-127 85.5T480-80Zm0-80q134 0 227-93t93-227q0-134-93-227t-227-93q-134 0-227 93t-93 227q0 134 93 227t227 93Zm0-320Z"/></svg>
            </div>
          </div>
          <div class="legend-text"></div>
        </div>      
      </div>
      </div>


      <div class="tooltip-placeholder" v-if="mode === 'full'">
        <img v-if="tooltip === null" class="tooltip-logo tooltip-placeholder-logo" src="/wp-content/themes/divi-child/map/assets/images/logo_tipo_negra.svg" alt="tooltip" />
      </div>
      <TooltipComponent @close="close" :tooltip="tooltip" :base="base" :items="mapItems" :detail="detail"></TooltipComponent>
      <div id="map"></div>
      
    </div>
    `,
};
