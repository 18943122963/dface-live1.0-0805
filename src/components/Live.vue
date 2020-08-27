<template>
  <div class="out">
    <div id="mse"></div>
  </div>
</template>

<script>
import "xgplayer";
import FlvPlayer from "xgplayer-flv";
import { fetch } from "dface-fetch";
// import MyWebSocket from "@/utils/DfaceWs.ts";
export default {
  data() {
    return {
      player: {}
    };
  },
  methods: {
    //配置播放器
    setPlayer(src) {
      const size = this.getSize();
      this.player = new FlvPlayer({
        id: "mse",
        url: src,
        isLive: true,
        autoplay: true,
        width: size[0],
        height: size[1],
        // fitVideoSize: size[2],
        controls: false
      });
    },
    //配置视频
    async setLive() {
      //先拿到直播间id
      let liveKey = await fetch
        .get("api/live/listLive")
        .then(data => {
          //es11可选链，若存在data，且存在object，且存在length，且length不为0
          if (data?.object?.length && data.object.length !== 0) {
            //返回第一个直播间
            return data.object[0];
          } else {
            this.errFunc(2);
            this.player = {};
          }
        })
        .catch(() => this.errFunc(1));
      //没拿到livekey直接结束
      if (!liveKey) return;
      //用id获得链接
      fetch
        .get(`api/live/playUrl?liveKey=${liveKey}`)
        .then(data => {
          //es11可选链
          if (data?.object?.hdlPlayUrl) {
            //配置播放器
            this.setPlayer(data.object.hdlPlayUrl);
          } else this.errFunc(3);
        })
        .catch(() => this.errFunc(1));
    },
    //错误函数
    errFunc(num) {
      switch (num) {
        case 1: {
          this.$message.error("网络错误");
          break;
        }

        case 2: {
          this.$message.error("获取直播间失败");
          break;
        }

        case 3: {
          this.$message.error("视频连接失败");
          break;
        }
        default: {
          this.$message.error("未定义错误");
        }
      }
    },
    //判断浏览器宽高来设置尺寸
    getSize() {
      let windowH = window.innerHeight;
      let windowW = window.innerWidth;
      //横屏时
      if (windowW > windowH) {
        return [1920, 1080, "fixHeight"];
      }
      //3:4
      else if (windowW / windowH > (3 / 4 + 9 / 16) / 2) {
        return [960, 1080, "fixHeight"];
      }
      //9:16
      else {
        return [1080, 1920, "fixWidth"];
      }
    }
  },
  mounted() {
    //链接直播
    this.setLive();
  }
};
</script>
<style scoped>
.out {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  background: blueviolet;
}
.news {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  right: 0;
  margin-bottom: 50px;
  /* background: url(""); */
  z-index: 124;
}
#mse {
  background: #0b0e71;
}
</style>
