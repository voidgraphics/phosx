<template>
    <div class="light">
        <h2 class="light__name">
            <span class="light__indicator" :style="{ background: computedColor }"></span>
            {{ label }}
        </h2>
        <div class="draggable">
            <span class="draggable__label">Hue</span>
            <em class="draggable__value">{{ hue }}°</em>
            <div class="draggable__outer">
                <div class="draggable__inner" :style="{ width: huePercent, background: computedColor }"></div>
            </div>
        </div>
        <div class="draggable">
            <span class="draggable__label">Brightness</span>
            <em class="draggable__value">{{ brightnessPercent }}</em>
            <div class="draggable__outer">
                <div class="draggable__inner" :style="{ width: brightnessPercent, background: computedColor }"></div>
            </div>
        </div>
        <div class="draggable">
            <span class="draggable__label">Saturation</span>
            <em class="draggable__value">{{ saturationPercent }}</em>
            <div class="draggable__outer">
                <div class="draggable__inner" :style="{ width: saturationPercent, background: computedColor }"></div>
            </div>
        </div>
        <a href="#" @click.prevent="togglePower" class="power" title="Turn on/off this light">
            <svg class="power__svg" xmlns="http://www.w3.org/2000/svg" viewBox="143 307 24 24"><g transform="translate(143 307)" :style="{ stroke: computedColor }"><circle class="a" cx="5" cy="5" r="5" transform="translate(7 7)"/><g class="power__rays" :style="{ transform: power == 'off' ? 'scale(0.7)' : 'none' }"><line class="a" y2="2" transform="translate(12 1)"/><line class="a" y2="2" transform="translate(12 21)"/><line class="a" x2="1.42" y2="1.42" transform="translate(4.22 4.22)"/><line class="a" x2="1.42" y2="1.42" transform="translate(18.36 18.36)"/><line class="a" x2="2" transform="translate(1 12)"/><line class="a" x2="2" transform="translate(21 12)"/><line class="a" y1="1.42" x2="1.42" transform="translate(4.22 18.36)"/><line class="a" y1="1.42" x2="1.42" transform="translate(18.36 4.22)"/></g></g></svg>
        </a>
    </div>
</template>

<script>
    import tinycolor from 'tinycolor2'

    export default {
        props: ['raw', 'token'],
        data() {
            return {
                id: '',
                color: null,
                brightness: 0,
                hue: 0,
                saturation: 0,
                power: 'off',
                label: 'Generic light'
            }
        },

        mounted() {
            console.log(this.raw);
            this.label = this.raw.label
            this.id = this.raw.id
            this.brightness = this.raw.brightness
            this.hue = Math.round(this.raw.color.hue)
            this.saturation = this.raw.color.saturation
            this.color = tinycolor(this.hslString)
            this.power = this.raw.power
        },

        methods: {
            togglePower() {
                this.power == 'on' ? this.power = 'off' : this.power = 'on'
                this.$http({
                    method: 'put',
                    url: 'https://api.lifx.com/v1/lights/id:' + this.id + '/state',
                    headers: this.authHeader,
                    data: {
                        power: this.power
                    }
                })
                .then((response) => {
                    console.log(response)
                })
            }
        },

        watch: {
            raw(fresh) {
                console.log(fresh)
                this.hue = Math.round(fresh.color.hue)
                this.brightness = fresh.brightness
                this.saturation = fresh.color.saturation
                this.color = tinycolor(this.hslString)
            }
        },

        computed: {
            huePercent() {
                return Math.round((this.hue / 360) * 100) + '%'
            },
            brightnessPercent() {
                return Math.round(this.brightness * 100) + '%'
            },
            saturationPercent() {
                return Math.round(this.saturation * 100) + '%'
            },
            hslString() {
                return 'hsl(' + this.hue + ', ' + this.saturationPercent + ', 50%)'
            },
            computedColor() {
                if(!this.color || this.power == 'off') return '#1F3D50'
                return this.color.toHexString()
            },
            authHeader() {
                return {
                    'Authorization': 'Bearer ' + this.token
                }
            }
        } 
    }
</script>

<style>
    .light {
        width: 240px;
        padding: 20px 20px 25px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        border-radius: 4px;
        flex-shrink: 0;
        border: 1px solid #F5F5F5;
    }

    .light + .light {
        margin-left: 40px;
    }

    .light__name {
        font-size: 14px;
        font-weight: 700;
        color: #1F3D50;
        margin-bottom: 25px;
    }

    .light__indicator,
    .draggable__inner,
    .power__svg a {
        transition: background 300ms ease-out;
    }

    .light__indicator {
        width: 14px;
        height: 14px;
        border-radius: 50%;
        display: inline-block;
        margin-right: 8px;
        vertical-align: -1px;
    }

    .draggable__label,
    .draggable__value {
        float: left;
        font-size: 14px;
        color: #1F3D50;
    }

    .draggable__value {
        float: right;
        font-weight: 700;
        font-style: normal;
        margin-bottom: 7px;
    }

    .draggable__outer {
        clear: both;
        width: 100%;
        height: 6px;
        border-radius: 6px;
        margin-bottom: 15px;
        background: #F0F0F0;
    }

    .draggable__inner {
        height: 100%;
        border-radius: 6px;
        background: #1F3D50;
        transition: width 300ms ease-out, background 300ms ease-out;
    }

    .power:hover .power__svg {
        transform: rotate(90deg);
    }

    .power__svg {
        transition: transform 300ms ease-out;
        width: 22px;
        margin: 0 auto;
        display: block;
        margin-top: 25px;
    }

    .power__rays {
        transform-origin: center;
        transition: transform 300ms ease-out;
    }


    .power__svg .a{fill:none;stroke-linecap:round;stroke-linejoin:round;stroke-width:2px;}
</style>