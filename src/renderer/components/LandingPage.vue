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
          <input id="token" class="input input--text" type="text" placeholder="Paste your authorization token" v-model="token">
          <button class="button" @click.prevent="connect">Save</button>
        </div>
      </div>
      <div class="tip" v-if="!isConnected">
        <h2 class="tip__title">You are not connected</h2>
        <p class="tip__text">Please click the icon in the top right and provide a valid token. <br>You can go to <a href="https://cloud.lifx.com/settings" @click.prevent="navigateToLifxCloud">https://cloud.lifx.com/settings</a> to generate a token for this application. <br>Remember, do not show it to anyone.</p>
      </div>
      <section class="section" v-if="lights.length && isConnected">
        <h2 class="section__title">Your lights</h2>
        <div class="lights">
          <light :key="key" v-for="light, key in lights" :token="token" :raw="light"></light>
        </div>
      </section>
      <section class="section" v-if="scenes.length && isConnected">
        <h2 class="section__title">Your scenes</h2>
        <div class="scenes">
          <scene :key="key" v-for="scene, key in scenes" :token="token" :raw="scene"></scene>
        </div>
      </section>
    </main>
  </div>
</template>

<script>
  import light from './Light.vue'
  import scene from './Scene.vue'
  import {ipcRenderer} from 'electron'
  const {shell} = require('electron')
  import throttle from 'lodash.throttle'

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
        token: ''
      }
    },
    mounted() {
      this.token = localStorage.getItem('token');
      window.addEventListener('refresh', () => this.refreshData())
      let throttleColor = throttle(this.updateColor, 600)
      ipcRenderer.on('color-picker', throttleColor)
      let throttleBrightness = throttle(this.updateBrightness, 600)
      ipcRenderer.on('brightness', throttleBrightness)
      if(this.token) {
        this.refreshData()
        this.getScenes()
      }
    },
    methods: {
      connect() {
        localStorage.setItem('token', this.token)
        this.showConfig = false;
        this.refreshData();
        this.getScenes()
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

      updateBrightness(e, brightness) {
        this.brightness = brightness
        this.changeColor(null, this.brightness)
      },

      updateColor(e, color) {
        console.log(e, color)
        this.color = color
        this.changeColor(color, this.brightness)
      },

      changeColor(color, brightness) {
        console.log('changing', color)
        this.$http({
          method: 'put',
          url: 'https://api.lifx.com/v1/lights/all/state',
          headers: this.authHeader,
          data: { color, brightness }
        })
        .then((response) => {
          this.refreshData()
        })
      },

      navigateToLifxCloud() {
        shell.openExternal('https://cloud.lifx.com/settings')
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
    min-height: 100vh;
    padding: 60px 35px;
    position: relative;
  }

  .lights,
  .scenes {
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

  .section:after {
    content: '';
    display: block;
    clear: left;
  }

  .section__title {
    font-weight: 700;
    font-size: 20px;
    margin-bottom: 25px;
    color: #1F3D50;
  }

  .config {
    position: fixed;
    top: 60px;
  }

  .config__trigger {
    text-decoration: none;
    font-size: 14px;
    color: rgba(31, 61, 80, 0.2);
    position: fixed;
    right: 35px;
    padding: 12px 22px;
    border-radius: 4px;
    background: white;
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

  .config__panel {
    position: fixed;
    top: 60px;
    width: 260px;
    right: 100px;
    background: white;
    padding: 20px;
    border-radius: 4px;
    box-shadow: 0px 5px 15px rgba(0, 0, 0, 0.05);
    border: 1px solid #F0F0F0;
  }

  .config__panel label {
    display: block;
    font-size: 14px;
    margin-bottom: 10px;
  }

  .config__panel .input {
    margin-bottom: 15px;
    width: 100%;
  }

  .config__panel .button {
    display: block;
    text-align: center;
    border: none;
    width: 100%;
    background: #577DFF;
    color: white;
    border-radius: 4px;
    padding: 12px;
    cursor: pointer;
    font-size: 14px;
  }

  .config__panel .button:focus {
    outline: none;
  }

  .tip {
    text-align: center;
    margin-top: 180px;
  }

  .tip__title {
    margin-bottom: 15px;
  }

  .tip__text {
    line-height: 1.5;
  }
</style>
