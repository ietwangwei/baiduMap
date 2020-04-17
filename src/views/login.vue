<template>
  <baidu-map
    class="map"
    :center="{ lng: 116.404, lat: 39.915 }"
    :zoom="14"
    :map-click="false"
    :double-click-zoom="false"
    @mousemove="syncPolyline"
    @click="paintPolyline"
    @rightclick="newPolyline"
  >
    <bm-control :offset="{ width: 15, height: 15 }">
      <div class="map-edit-container">
        <div class="map-edit-item">
          <i
            class="el-icon-more"
            :class="{ currEdit: markerObj.editing }"
            @click="toggle('markerObj')"
            title="绘制点"
          />
          <i
            class="el-icon-minus"
            :class="{ currEdit: polylineObj.editing }"
            @click="toggle('polylineObj')"
            title="绘制折线"
          />
        </div>
        <div class="map-edit-item">
          <i
            class="el-icon-position"
            :class="{ currEdit: polygonObj.editing }"
            @click="toggle('polygonObj')"
            title="绘制多边线"
          />
          <i
            class="el-icon-remove-outline"
            :class="{ currEdit: circleObj.editing }"
            @click="toggle('circleObj')"
            title="绘制圆形"
          />
        </div>
        <div class="map-edit-item">
          <i
            class="el-icon-help"
            :class="{ currEdit: resetData }"
            @click="resetRecover('resetData')"
            title="重置"
          />
          <i
            class="el-icon-arrow-left"
            :class="{ currEdit: recoverData }"
            @click="resetRecover('recoverData')"
            title="返回"
          />
        </div>
      </div>
    </bm-control>
    <!-- 添加标记 -->
    <template v-if="markerObj.isShow">
      <bm-marker
        :position="path[0]"
        v-for="(path, index) of markerObj.paths"
        :key="'marker_' + index"
        :dragging="true"
      >
        <bm-label
          content="test"
          :labelStyle="{ color: 'red', fontSize: '12', border: '0', background: 'transparent' }"
          :offset="{ width: 0, height: 30 }"
        />
      </bm-marker>
    </template>
    <template v-if="polylineObj.isShow">
      <bm-polyline
        :path="path"
        v-for="(path, index) of polylineObj.paths"
        :key="'polyline_' + index"
        :stroke-weight="2"
      ></bm-polyline>
    </template>
    <template v-if="polygonObj.isShow">
      <bm-polygon
        :path="path"
        v-for="(path, index) of polygonObj.paths"
        :key="'polygon_' + index"
        stroke-color="blue"
        :stroke-opacity="0.5"
        :stroke-weight="2"
      />
    </template>
    <template v-if="circleObj.isShow">
      <bm-circle
        :center="path[0]"
        v-for="(path, index) of circleObj.paths"
        :key="'circle_' + index"
        :radius="circleObj.radius"
        stroke-color="blue"
        :stroke-opacity="0.5"
        :stroke-weight="2"
        @lineupdate="updateCirclePath"
        :editing="true"
      ></bm-circle>
    </template>
  </baidu-map>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      currEditName: 'polygonObj',
      resetData: false,
      recoverData: false,
      markerObj: {
        isShow: false,
        editing: false,
        paths: []
      },
      polylineObj: {
        isShow: false,
        editing: false,
        paths: []
      },
      polygonObj: {
        isShow: false,
        editing: false,
        paths: []
      },
      circleObj: {
        isShow: false,
        editing: false,
        paths: [],
        radius: 500
      }
    }
  },
  computed: mapGetters(['getLastDrawHistory']),
  methods: {
    toggle (name) {
      let nameArr = ['markerObj', 'polylineObj', 'polygonObj', 'circleObj']
      this.currEditName = name
      this[name].editing = !this[name].editing
      nameArr.splice(nameArr.indexOf(name), 1)
      nameArr.forEach(curr => {
        this[curr].editing = false
      })
    },
    syncPolyline (e) {
      if (!this[this.currEditName].editing) {
        return
      }
      const { paths } = this[this.currEditName]
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
    newPolyline (e) {
      if (!this[this.currEditName].editing) {
        return
      }
      const { paths } = this[this.currEditName]
      if (!paths.length) {
        paths.push([])
      }
      const path = paths[paths.length - 1]
      path.pop()
      if (path.length) {
        paths.push([])
      }
    },
    paintPolyline (e) {
      if (!this[this.currEditName].editing) {
        return
      }
      const { paths } = this[this.currEditName]
      !paths.length && paths.push([])
      paths[paths.length - 1].push(e.point)
      this[this.currEditName].isShow = true
      if (
        this.currEditName === 'markerObj' ||
        this.currEditName === 'circleObj'
      ) {
        this[this.currEditName].editing = false
      }
      this.$store.dispatch('setLastDrawHistoryActions', {
        paths: this[this.currEditName].paths,
        lastEditName: this.currEditName
      })
    },
    updateCirclePath (e) {
      this.circleObj.paths[0] = e.target.getCenter()
      this.circleObj.radius = e.target.getRadius()
    },
    resetRecover (name) {
      if (name === 'resetData') {
        this[this.getLastDrawHistory.lastEditName].editing = false
        this[this.getLastDrawHistory.lastEditName].isShow = false
        this[this.getLastDrawHistory.lastEditName].paths = []
      } else {
        this[this.getLastDrawHistory.lastEditName].isShow = true
        this[this.getLastDrawHistory.lastEditName].paths = this.getLastDrawHistory.paths
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.map {
  width: 100%;
  height: 800px;

  /deep/ .anchorBL {
    display: none;
  }

  .map-edit-container {
    width: 250px;
    height: 40px;
    line-height: 30px;
    padding-left: 10px;
    background-color: #fff;
    -webkit-box-shadow: 1px 1px 1px #000;
    box-shadow: 2px 3px 1px #909399;
    border-radius: 5px;
    display: flex;

    .map-edit-item {
      padding: 0 7px;
      margin: 6px 0;

      &:nth-of-type(1),
      &:nth-of-type(2) {
        border-right: 1px solid rgba(110, 110, 110, 0.3);
      }

      i {
        font-size: 18px;
        cursor: pointer;
        margin-left: 5px;
        padding: 5px;

        &:hover {
          background-color: #ccc;
        }
      }

      .currEdit {
        background-color: #ccc;
      }
    }
  }
}
</style>
