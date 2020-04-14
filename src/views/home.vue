<template>
  <div class="home-page">
    <div class="mapbox">
      <div class="top-search">
        <el-input size="small" v-model="keyword" />
      </div>
      <baidu-map
        :center="center"
        :zoom="zoom"
        :map-click="false"
        @mousemove="syncPolygon"
        @ready="handler"
        style="height:800px"
        @click="paintPolygon"
        @rightclick="newPolygon"
      >
        <bm-polygon
          :path="path"
          v-for="path of polygonPath.paths"
          :key="path.toString()"
          stroke-color="#007ed2"
          fill-color="#007ed2"
          :fill-opacity="0.2"
          :stroke-opacity="0.5"
          :stroke-weight="1"
          @click="alertpath"
        />
        <bm-control>
          <button @click="toggle('polygonPath')">{{ polygonPath.editing ? '停止绘制' : '开始绘制' }}</button>
        </bm-control>
        <bm-local-search :keyword="keyword" :auto-viewport="true"></bm-local-search>
      </baidu-map>
    </div>
  </div>
</template>

<script>
import bmPolygon from 'vue-baidu-map/components/overlays/Polygon'
import BmLocalSearch from 'vue-baidu-map/components/search/LocalSearch.vue'
import BmControl from 'vue-baidu-map/components/controls/Control.vue'

export default {
  name: 'home',
  components: {
    bmPolygon,
    BmLocalSearch,
    BmControl
  },
  data () {
    return {
      title: 'demo',
      keyword: '',
      center: { lng: 104.075707, lat: 30.516006 },
      zoom: 13,
      polygonPath: {
        editing: false,
        paths: [] // 绘制完成后的经纬度，其实是在画的时候动态push的，因为在点击的时候触发了 paintPolygon 函数
      }
    }
  },
  mounted () {},
  methods: {
    handler ({ BMap, map }) {
      map.enableScrollWheelZoom(true)
    },
    getClickInfo (e) {
      console.log(e.point.lng)
      console.log(e.point.lat)
    },
    // 开启多边形绘制
    toggle (name) {
      this[name].editing = !this[name].editing
      // 在这里做一步判断，如果有路径且开启绘制就把原来的路径清空
      if (this.polygonPath.paths && this.polygonPath.editing) {
        this.polygonPath.paths = []
      }
    },
    // 鼠标移动时
    syncPolygon (e) {
      if (!this.polygonPath.editing) {
        return
      }
      const { paths } = this.polygonPath
      if (!paths.length) {
        return
      }
      const path = paths[paths.length - 1]
      if (!path.length) {
        return
      }
      if (path.length === 1) {
        path.push(e.point)
      }
      this.$set(path, path.length - 1, e.point)
    },
    // 完成绘制
    newPolygon (e) {
      if (!this.polygonPath.editing) {
        return
      }
      // 当开始绘制后把按钮调回开始绘制状态，防止绘制多个图形
      this['polygonPath'].editing = !this['polygonPath'].editing
      const { paths } = this.polygonPath
      if (!paths.length) {
        paths.push([])
      }
      // 回退
      const path = paths[paths.length - 1]
      path.pop()
      if (path.length) {
        paths.push([])
      }
      console.log(this.polygonPath.paths)
    },
    // 设置节点
    paintPolygon (e) {
      if (!this.polygonPath.editing) {
        alert('请开启绘制模式')
        return
      }
      const { paths } = this.polygonPath
      !paths.length && paths.push([])
      paths[paths.length - 1].push(e.point)
    },
    alertpath (e) {
      console.log(e.currentTarget.so)
      console.log(this.polygonPath.paths[0])
    }
  }
}
</script>

<style lang="scss" scoped>
.mapbox {
  width: 800px;
  height: 800px;
  margin: 0 auto
}
.top-search {
  width: 300px;
}
</style>
