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
             @playing="playing = true"
             @pause="playing = false"
             @loadeddata="duration = $event.target.duration"
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
  </div>
</template>

<script>
const mediaDevices = window.navigator.mediaDevices
const MediaRecorder = window.MediaRecorder

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
      url: 'https://vignette.wikia.nocookie.net/leagueoflegends/images/b/b1/Aatrox_002.ogg/revision/latest?cb=20180612205314',
      playing: false,
      duration: 0,
      time: 0
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
      // 
      // this.$set(this, 'url', )
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
      recorder.addEventListener("dataavailable", this.addChunk)
      this.$set(this, 'recorder', recorder)
      this.recorder.start()
    },
    recordStop () {
      this.recording = false
    }
  },
  async beforeMount () {
    try {
      const stream = await mediaDevices.getUserMedia({ audio: true })
      this.$set(this, 'stream', stream)
      this.audioEnabled = true
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
