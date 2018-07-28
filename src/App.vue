<template>
  <div id="app">
    <img class="logo"
         src="./assets/logo.png">
    <p class="instruction"
       :style="{ visibility: audioEnabled?'visible':'hidden' }">
      <span v-if="!recording">Tap to Play</span>
      <span v-else>Tap to Pause</span>
    </p>
    <div class="mic">
      <font-awesome-icon icon="microphone"
                         class="enabled"
                         v-if="audioEnabled"
                         :class="{ recording: recording }"
                         @click="recording?recordStop():recordStart()"/>
      <font-awesome-icon icon="microphone-slash"
                         class="disabled"
                         v-else/>
    </div>
    <div class="player" v-if="audioEnabled">
      <audio ref="player"
             :src="url"
             @loadedmetadata="loaded($event.target)"
             @playing="playing = true"
             @pause="playing = false"
             @timeupdate="time = $event.target.currentTime"
             @loadstart="reset"/>
      <button class="player__btn"
              :disabled="!hasSource"
              @click="playing?pause():play()">
        <font-awesome-icon icon="play" v-if="!playing"/>
        <font-awesome-icon icon="pause" v-else/>
      </button>
      <input class="player__progress"
             type="range"
             v-model="time"
             :max="duration"
             step="0.01"
             @change="timeChanged(time)">
    </div>
    <div class="download" v-if="url">
      <a :href="url" download="record.wav">
        <button :disabled="downloading"
                @click="download()">
          Download
        </button>
      </a>
    </div>
  </div>
</template>

<script>
const mediaDevices = window.navigator.mediaDevices
const MediaRecorder = window.MediaRecorder
const Blob = window.Blob
const Audio = window.Audio
const URL = window.URL

const isFirefox = typeof InstallTrigger !== 'undefined'
const isChrome = !!window.chrome && !!window.chrome.webstore

export default {
  name: 'app',
  data () {
    return {
      audioEnabled: false,
      stream: null,
      recording: false,
      recorder: null,
      audioChunks: [],
      // url: null,
      url: null,
      playing: false,
      duration: 0,
      time: 0,
      downloading: false
    }
  },
  computed: {
    hasSource ({ url, recording }) {
      if (url && !recording) return true
      else return false
    }
  },
  methods: {
    addChunk (ev) {
      this.audioChunks.push(ev.data)
    },
    convertChunk () {
      const audioBlob = new Blob(this.audioChunks, {
        type: 'audio/wav'
      })
      const audioUrl = URL.createObjectURL(audioBlob)
      // if (isChrome) {
      //   const audio = new Audio(audioUrl)
      //   console.log(audio);
      //   console.log(audio.duration);
      //   this.$set(this, 'duration', audio.duration)
      // }
      this.$set(this, 'url', audioUrl)
      this.$set(this, 'audioChunks', [])
    },
    loaded (audio) {
      let duration = 0
      // if (isFirefox)
      duration = audio.duration
      console.log(duration);
      this.$set(this, 'duration', duration)
    },
    timeChanged (time) {
      if (this.url) {
        this.$refs['player'].currentTime = time
      }
    },
    play () {
      const player = this.$refs['player']
      player.pause()
      player.play()
    },
    pause () {
      this.$refs['player'].pause()
    },
    reset () {
      this.pause()
      this.duration = 0
      this.time = 0
    },
    recordStart () {
      this.recording = true
      const recorder = new MediaRecorder(this.stream)
      recorder.addEventListener('dataavailable', this.addChunk)
      recorder.addEventListener('stop', this.convertChunk)
      this.$set(this, 'recorder', recorder)
      this.recorder.start()
    },
    async recordStop () {
      this.recorder.stop()
      this.recording = false
    },
    download () {
      this.downloading = true
      setTimeout(() => {
        this.downloading = false
      }, 1500)
    }
  },
  async beforeMount () {
    try {
      if (isFirefox || isChrome) {
        const stream = await mediaDevices.getUserMedia({ audio: true })
        this.$set(this, 'stream', stream)
        this.audioEnabled = true
      }
      else alert('Browser not Supported!')
    } catch (error) {
      console.warn(error)
      alert('Failed to GET Audio Source!')
    }
  }
}
</script>

<style lang="scss">
$color-mic: #D14444;
$color-player: #D1D1D1;

html, body {
  height: 100%;
  width: 100%;
}

#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
  font-size: 10px;
  display: flex;
  justify-content: center;
  flex-direction: column;
  .logo {
    align-self: center;
    display: inline-block;
    height: 150px;
    width: 150px;
  }
  .instruction {
    font-size: 1.6em;
    margin-top: 0;
    margin-bottom: 10px;
  }
  .mic {
    color: $color-mic;
    font-size: 6.5em;
    .enabled {
      cursor: pointer;
      transition: transform .2s;
      &:hover {
        transform: scale(1.1)
      }
      &:active {
        color: darken($color-mic, 5);
      }
      &.recording {
        color: darken($color-mic, 5);
        animation: growMic 2s ease-out infinite;
      }
    }
    .disabled {
      color: #5C6051;
      cursor: not-allowed;
    }
  }
  .player {
    align-self: center;
    margin-top: 10px;
    width: 25em;
    border: 2px solid $color-player;
    border-radius: 150px;
    padding: .3em;
    display: flex;
    justify-content: space-between;
    align-content: flex-start;
    &__btn {
      background-color: $color-player;
      width: 2.5em;
      height: 2.5em;
      border: none;
      padding: 0;
      text-align: center;
      vertical-align: middle;
      font-size: 1.75em;
      border-radius: 150px;
      cursor: pointer;
      &:active,
      &:focus {
        outline: none;
      }
      &::-moz-focus-inner {
        border: none;
      }
    }
    &__progress {
      -webkit-appearance: none;
      align-self: center;
      display: inline-block;
      width: calc(100% - 4.5em);
      &:focus {
        outline: none;
      }
      &::-moz-focus-outer {
        border: none;
      }
      &::-webkit-slider-runnable-track {
        -webkit-appearance: none;
        background-color: $color-player;
        height: 4px;
        margin-right: 7.5px;
        cursor: pointer;
      }
      &::-moz-range-track {
        background-color: $color-player;
        height: 4px;
        cursor: pointer;
      }
      &::-webkit-slider-thumb {
        -webkit-appearance: none;
        background-color: darken($color-player, 10);
        border: 1px solid darken($color-player, 10);
        border-radius: 150px;
        width: 10px;
        height: 10px;
        cursor: pointer;
        margin-top: -2.5px;
        transition: all .2s;
        &:hover {
          transform: scale(1.5);
        }
      }
      &::-moz-range-thumb {
        background-color: darken($color-player, 10);
        border: 1px solid darken($color-player, 10);
        width: 12.5px;
        height: 12.5px;
        cursor: pointer;
      }
      &::-moz-range-progress  {
        background-color: darken($color-player, 15);
      }
    }
  }
  .download {
    margin-top: 10px;
    a, button {
      &:active,
      &:focus {
        outline: none;
      }
      &::-moz-focus-inner {
        border: none;
      }
    }
    button {
      padding: .5em 1em;
      border: 3px solid $color-player;
      border-radius: .5em;
      background-color: $color-player;
      font-size: 1.75em;
      cursor: pointer;
      transition: all .2s;
      &:hover {
        background-color: darken($color-player, 5);
        border-color: darken($color-player, 5);
        &:active {
          background-color: darken($color-player, 10);
          border-color: darken($color-player, 10);
        }
      }
      &:disabled {
        background-color: lighten($color-player, 10);
        border-color: lighten($color-player, 10);
      }
    }
  }
}

@keyframes growMic {
  0% {
    transform: scale(1.1);
    opacity: 1;
  }
  50% {
    transform: scale(1);
    opacity: .75;
  }
  100% {
    transform: scale(1.1);
    opacity: 1;
  }
}
</style>
