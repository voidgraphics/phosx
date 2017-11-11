<template>
  <div id="wrapper">
    <div class="dragbar"></div>
    <main>
      <a href="#" @click.prevent="showConfig = !showConfig">Config</a>
      <div class="left-side doc" v-show="showConfig">
        <span class="title">
          Control your LIFX lights!
        </span>
        <input class="input input--text" type="text" placeholder="Paste your LIFX authorization token here" v-model="token">
        <button class="button" @click.prevent="connect">Connect</button>
        <p class="error" v-if="error">Error</p>
      </div>

      <div class="right-side">
        <div class="doc">
          <div>
            <h1 class="title">Connected: {{ isConnected }}</h1>

          </div>
          <div class="lights">
            <div class="light" v-for="light in lights">
              <h2 class="title alt">{{ light.label }}</h2>
              <p>Power: {{ light.power }}</p>
              <p>Brightness: {{ light.brightness }}</p>
              <div v-if="light.color">
                <p>Hue: {{ light.color.hue }}</p>
                <p>Kelvin: {{ light.color.kelvin }}</p>
                <p>Saturation: {{ light.color.saturation }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script>
  import {ipcRenderer} from 'electron'

  export default {
    name: 'landing-page',
    data() {
      return {
        lights: [],
        showConfig: false,
        color: 'blue',
        brightness: 0.5,
        error: false,
        isConnected: false,
        token: ''
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
          console.log(json)
          this.scenes = json
        })
      },

      changeColor(color, brightness) {
        console.log('changing color', color, brightness)
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
  @import url('https://fonts.googleapis.com/css?family=Source+Sans+Pro');

  * {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body { font-family: 'Source Sans Pro', sans-serif; }

  .dragbar {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    height: 40px;
    -webkit-app-region: drag;
  }

  #wrapper {
    background:
      radial-gradient(
        ellipse at top left,
        rgba(255, 255, 255, 1) 40%,
        rgba(229, 229, 229, .9) 100%
      );
    height: 100vh;
    padding: 60px 80px;
    width: 100vw;
  }

  #logo {
    height: auto;
    margin-bottom: 20px;
    width: 420px;
  }

  main {
    display: flex;
    justify-content: space-between;
  }

  main > div { flex-basis: 50%; }

  .left-side {
    display: flex;
    flex-direction: column;
    padding-right: 25px;
  }

  .welcome {
    color: #555;
    font-size: 23px;
    margin-bottom: 10px;
  }

  .light {
    margin-bottom: 35px;
  }

  .title {
    color: #2c3e50;
    font-size: 20px;
    font-weight: bold;
    margin-bottom: 15px;
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

  .title.alt {
    font-size: 18px;
    margin-bottom: 10px;
  }

  .doc p {
    color: black;
    margin-bottom: 10px;
  }

  .doc p.error {
    color: #fc4500;
    margin-top: 25px;
  }

  .doc button {
    font-size: .8em;
    cursor: pointer;
    outline: none;
    padding: 0.75em 2em;
    border-radius: 2em;
    display: inline-block;
    color: #fff;
    background-color: #4fc08d;
    transition: all 0.15s ease;
    box-sizing: border-box;
    border: 1px solid #4fc08d;
  }

  .doc button.alt {
    color: #42b983;
    background-color: transparent;
  }
</style>
