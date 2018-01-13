<template>
    <a href="#" @click.prevent="activate" class="scene">
        <p class="scene__name">{{ name }}</p>
    </a>
</template>

<script>
    export default {
        props: ['raw', 'token'],
        data() {
            return {
                uuid: '',
                name: 'test'
            }
        },

        mounted() {
            this.name = this.raw.name
            this.uuid = this.raw.uuid
        },

        methods: {
            activate() {
                this.$http({
                    method: 'put',
                    url: 'https://api.lifx.com/v1/scenes/scene_id:'+ this.uuid +'/activate',
                    headers: this.authHeader,
                    data: {
                        duration: 1.0
                    }
                })
                .then((response) => {
                    window.dispatchEvent(new Event('refresh'))
                    console.log(response)
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
    .scene {
        float: left;
        margin-right: 40px;
        margin-bottom: 30px;
        display: block;
        text-decoration: none;
        width: 240px;
        padding: 20px 20px 25px;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
        border-radius: 4px;
        border: 1px solid #F5F5F5;
        color: #1F3D50;
        text-align: center;
        font-size: 14px;
        font-weight: 700;
    }
</style>