import { i18n } from "./helper.js";

export default {  
  props: {
    tooltip: null,
    base: ''
  },
  mounted() {},
  data() {
    return {
      i18n: i18n(),
    };
  },
  computed: { 
    latDg() {
      const latitude = this.tooltip.acf.latitude;
      const degrees = Math.floor(latitude);
      const minutes = Math.floor((latitude - degrees) * 60);
      const seconds = Math.round(((latitude - degrees) * 60 - minutes) * 60);
      return `${degrees}° ${minutes}' ${seconds}"N`;
    },
    lngDg() {
      const longitude = this.tooltip.acf.longitude;
      const degrees = Math.floor(longitude);
      const minutes = Math.floor((longitude - degrees) * 60);
      const seconds = Math.round(((longitude - degrees) * 60 - minutes) * 60);
      return `${degrees}° ${minutes}' ${seconds}"E`;
    },
  },
  methods: {    
    async download() {
      var { data } = await axios.get(`${this.base}/wp-json/wp/v2/media/${this.tooltip.acf.document}`);
      window.open(data.guid.rendered, '_blank');
    },
  },
  template: `
    <div>
      <div v-show="tooltip" id="tooltip" class="tooltip">
        <div v-if="tooltip">
          <div class="close" @click="$emit('close')">
            <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z"/></svg>
          </div>
          <img class="tooltip-logo" src="/wp-content/themes/divi-child/map/assets/images/logo_tipo_negra.svg" alt="tooltip" />
          <h1>{{ tooltip.title.rendered }}</h1>
          <div v-if="tooltip._embedded['wp:featuredmedia'] && tooltip._embedded['wp:featuredmedia'].length">
            <img :src="tooltip._embedded['wp:featuredmedia'][0].source_url" class="tooltip-image">
          </div>
          <div class="d-flex info-row info-row-bb">
            <div class="info-col-1">
              <img src="/wp-content/themes/divi-child/map/assets/images/ubicacio.svg" class="tooltip-icon">
            </div>
            <div class="info-col-2">
              <b>{{i18n.location}}</b>
              <div>{{ tooltip.acf.location }}</div>
              <b>{{latDg}} {{lngDg}}</b>
            </div>
          </div>

          <div class="d-flex info-row info-row-bb">
            <div class="info-col-1">
              <img src="/wp-content/themes/divi-child/map/assets/images/tipologia.svg" class="tooltip-icon">
            </div>
            <div class="info-col-2">
              <div class="mt-1"><b>{{ tooltip.acf.typology.map(t => i18n.typology[t]).join(', ') }}</b></div>
            </div>
          </div>

          <div class="d-flex info-row info-row-bb">
            <div class="info-col-1">
              <img src="/wp-content/themes/divi-child/map/assets/images/eines.svg" class="tooltip-icon">
            </div>
            <div class="info-col-2">
              <div class="mt-0" v-html="tooltip.acf.tools.map(t => i18n.tools[t]).join('<br>')"></div>
            </div>
          </div>

          <div class="d-flex info-row info-row-bb">
            <div class="info-col-1">
              <img src="/wp-content/themes/divi-child/map/assets/images/materies-estudi.svg" class="tooltip-icon">
            </div>
            <div class="info-col-2">
              <div class="mt-0" v-html="tooltip.acf.study.map(t => i18n.study[t]).join('<br>')"></div>
            </div>
          </div>
          <div class="d-flex info-row zinfo-row-bb">
            <div class="info-col-1">
              <img src="/wp-content/themes/divi-child/map/assets/images/mapa.svg" class="tooltip-icon">
            </div>
            <div class="info-col-2">
              <div class="mt-05">
                <a class="download d-flex" href="#" @click="download">
                {{ i18n.geological_map }}
                <svg class="ms-auto" xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 -960 960 960" width="24px" fill="#5f6368"><path d="M480-360 280-560h400L480-360Z"/></svg>
                </a>
                
              </div>
            </div>
          </div>

          <div class="d-flex info-row mt-1">
            <div class="info-col-3">
              <div class="zmt-1"><a class="download-button" href="#">{{ i18n.complete_sheet }}</a></div>            
            </div>
            <div class="info-col-4">
              <img src="/wp-content/themes/divi-child/map/assets/images/interreg_ue.svg" class="tooltip-image mt-05">
            </div>
          </div>
        </div>
      </div>        
    </div>
    `,
};
