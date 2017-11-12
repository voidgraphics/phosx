<template>
  <div id="wrapper">
    <div class="dragbar"></div>
    <main>
      <div class="config">
        <a href="#" class="config__trigger" @click.prevent="showConfig = !showConfig">
          {{ isConnected ? 'Connected' : 'Not connected' }}
          <svg class="config__svg" xmlns="http://www.w3.org/2000/svg" viewBox="944 38.982 22 23.567"><g transform="translate(943 38.759)"><path class="a" d="M12.89,1.45l8,4A2,2,0,0,1,22,7.24v9.53a2,2,0,0,1-1.11,1.79l-8,4a2,2,0,0,1-1.79,0l-8-4A2,2,0,0,1,2,16.76V7.24A2,2,0,0,1,3.11,5.45l8-4a2,2,0,0,1,1.78,0Z"/><path class="a" d="M2.32,6.16,12,11l9.68-4.84"/><line class="a" y1="11.76" transform="translate(12 11)"/><line class="a" x2="10" y2="5" transform="translate(7 3.5)"/></g></svg>
        </a>
        <div class="config__panel" v-show="showConfig">
          <label for="token">Token</label>
          <input id="token" class="input input--text" type="text" placeholder="Paste your authorization token here" v-model="token">
          <button class="button" @click.prevent="connect">Save</button>
          <p class="error" v-if="error">Error</p>
        </div>
      </div>
      <section class="section">
        <h2 class="section__title">Your lights</h2>
        <div class="lights">
          <light :key="key" v-for="light, key in lights" :token="token" :raw="light"></light>
        </div>
      </section>
      <section class="section">
        <h2 class="section__title">Your scenes</h2>
        <div class="scenes">
          <scene v-for="scene, key in scenes" :token="token" :raw="scene"></scene>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
  import light from './Light.vue'
  import scene from './Scene.vue'
  import {ipcRenderer} from 'electron'

  export default {
    name: 'landing-page',
    components: { light, scene },
    data() {
      return {
        lights: [],
        scenes: [],
        showConfig: false,
        error: false,
        isConnected: false,
        token: 'c9dd764d4b8a71d3c449937f1248c1b6484074fde175b85d820ddf39bfccadcf'
      }
    },
    mounted() {
      ipcRenderer.on('color-picker', (e, color) => {
        this.color = color
        this.changeColor(color, this.brightness)
      })
      ipcRenderer.on('brightness', (e, brightness) => {
        this.brightness = brightness
        this.changeColor(null, this.brightness)
      })
      if(this.token) {
        this.refreshData()
        this.getScenes()
      }
    },
    methods: {
      connect() {
        this.refreshData();
      },

      refreshData() {
        fetch('https://api.lifx.com/v1/lights/all', {
          headers: {
            'Authorization': 'Bearer ' + this.token
          }
        })
        .then((response) => {
          this.isConnected = response.status == 200
          if(response.status != 200) {
            console.error(response)
            this.error = true
          }
          return response.json()
        })
        .then((json) => {
          this.lights = json
        })
      },

      getScenes() {
        fetch('https://api.lifx.com/v1/scenes', {
          headers: this.authHeader
        })
        .then((response) => {
          if(response.status != 200) {
            console.error(response)
            this.error = true
          }
          return response.json()
        })
        .then((json) => {
          this.scenes = json
        })
      },

      changeColor(color, brightness) {
        this.$http({
          method: 'put',
          url: 'https://api.lifx.com/v1/lights/all/state',
          headers: this.authHeader,
          data: { color, brightness }
        })
        .then((response) => {
          this.refreshData()
        })
      }
    },

    computed: {
      authHeader() {
        return {
          'Authorization': 'Bearer ' + this.token
        }
      }
    }
  }
</script>

<style>

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Lato', sans-serif; }

  .dragbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    background: #f7f7f7;
    -webkit-app-region: drag;
  }

  #wrapper {
    background: white;
    height: 100vh;
    padding: 60px 35px;
    position: relative;
    width: 100vw;
  }

  .lights,
  .scenes {
    display: flex;
    overflow-x: scroll;
    padding-bottom: 25px;
  }

  .input {
    padding: 15px 20px;
    border-radius: 4px;
    border: 1px solid #ddd;
    margin-bottom: 25px;
  }

  .input:focus {
    outline: none;
  }

  p.error {
    color: #fc4500;
    margin-top: 25px;
  }

  .section {
    margin-bottom: 25px;
  }

  .section__title {
    font-weight: 700;
    font-size: 20px;
    margin-bottom: 25px;
    color: #1F3D50;
  }

  .config__trigger {
    text-decoration: none;
    font-size: 14px;
    color: rgba(31, 61, 80, 0.2);
    position: absolute;
    right: 35px;
    transition: color 300ms ease-out;
  }

  .config__trigger:hover {
    color: #1F3D50;
  }

  .config__svg {
    width: 20px;
    vertical-align: -5px;
    margin-left: 15px;
  }

  .config__svg .a{fill:none;stroke:#1f3d50;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;}
</style>
