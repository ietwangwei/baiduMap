<template>
  <div class="home-page">
    <div class="actions">
      <el-button size="small" @click="isAdding = !isAdding">{{ isAdding ? '取消' : '绘制' }}</el-button>
      <el-button size="small" @click="isEditing = !isEditing">{{ isEditing ? '取消' : '编辑' }}</el-button>
      <el-button size="small" @click="clear">重新绘制</el-button>
      <el-button size="small" @click="save">保存</el-button>
    </div>
    <div class="map-containe">
      <el-amap-search-box
        class="search-box"
        :search-option="searchOption"
        :on-search-result="onSearchResult"
      ></el-amap-search-box>
      <el-amap
        ref="map"
        vid="amapDemo"
        :amap-manager="aMapManager"
        :center="mapCenter"
        :zoom="zoom"
        :plugin="plugin"
        :events="events"
        class="amap-demo"
      >
        <el-amap-marker
          v-for="(marker, index) in markers"
          :key="index"
          :position="marker"
        />
        <el-amap-polygon
          v-for="(polygon, index) in polygons"
          :key="index"
          :vid="index"
          :editable="isEditing"
          :ref="`polygon_${index}`"
          :path="polygon.path"
          :draggable="polygon.draggable"
          :events="polygon.events"
          :strokeColor="drawConfig.strokeColor"
          :strokeOpacity="drawConfig.strokeOpacity"
          :strokeWeight="drawConfig.strokeWeight"
          :fillColor="drawConfig.fillColor"
          :fillOpacity="drawConfig.fillOpacity"
          @end="endHandler"
        />
      </el-amap>
    </div>
  </div>
</template>

<script>
import { AMapManager } from 'vue-amap'
const amapManager = new AMapManager()

export default {
  data () {
    const _this = this
    return {
      searchOption: {
        city: '成都',
        citylimit: true
      },
      mapCenter: [104.053185, 30.3755265],
      markers: [
        {
          position: [104.053185, 30.3755265],
          events: {
            click: () => {
              alert('click marker')
            },
            dragend: (e) => {
              this.markers[0].position = [e.lnglat.lng, e.lnglat.lat]
            }
          },
          visible: true,
          draggable: false,
          template: '<span>煎茶路街道</span>'
        }
      ],
      aMapManager: amapManager,
      zoom: 13,
      plugin: [
        {
          pName: 'MapType',
          defaultType: 0,
          events: {
            init (o) {
              console.log(o)
            }
          }
        },
        {
          pName: 'Geolocation',
          defaultType: 0,
          events: {
            init (o) {
              console.log(o)
            }
          }
        }
      ],
      events: {
        init: o => {
          o.getCity(result => {
            console.log(result)
          })
        },
        moveend: () => {},
        zoomchange: () => {},
        click: e => {
          if (_this.isAdding) {
            _this.addpolygon(e)
          }
        }
      },
      polygons: [
        {
          draggable: true,
          path: [],
          events: {
            end (e) {
              _this.endHandler(e.target)
            }
          }
        }
      ],
      drawConfig: {
        strokeColor: '#007ed2',
        strokeOpacity: 0.3,
        strokeWeight: 1,
        fillColor: '#007ed2',
        fillOpacity: 0.2
      },
      isEditing: false,
      isAdding: false,
      path: []
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    getData () {
      this.$http.town.getRange().then(res => {
        let points = []
        res.map(i => {
          if (i.lng && i.lat) {
            points.push([i.lng, i.lat])
          }
        })
        this.polygons[0].path = points
        console.log(this.polygons)
      })
    },
    // 查询定位
    onSearchResult (pois) {
      let latSum = 0
      let lngSum = 0
      if (pois.length > 0) {
        pois.forEach(poi => {
          let { lng, lat } = poi
          lngSum += lng
          latSum += lat
          this.markers.push([poi.lng, poi.lat])
        })
        let center = {
          lng: lngSum / pois.length,
          lat: latSum / pois.length
        }
        this.mapCenter = [center.lng, center.lat]
      }
    },
    generatePath (points) {
      let path = this.polygons[0].path
      path.push(points)
      let polygon = {
        draggable: true,
        path: this.path,
        events: {
          click: () => {
            alert('click polygon')
            console.log(amapManager.getComponent(0))
            console.log(this.$refs.map.$$getCenter())
            console.log(this.$refs.polygon_0[0].$$getPath())
          }
        }
      }
      console.log(polygon)
      return polygon
    },
    // 添加节点
    addpolygon (e) {
      let { lng, lat } = e.lnglat
      this.polygons.push(this.generatePath([lng, lat]))
    },
    endHandler (polygon) {
      let paths = polygon.getPath()
      this.path = paths.map(i => {
        return {
          lng: i.lng,
          lat: i.lat
        }
      })
    },
    clear () {
      this.polygons[0].path = []
    },
    save () {
      let queryData = {
        townId: 1,
        points: this.path
      }
      this.$http.town.saveRange(queryData).then(res => {
        this.getRange()
      })
    }
  }
}
</script>

<style lang="scss">
.map-containe {
  position: relative;
  width: 600px;
  height: 600px;

  .search-box {
    position: absolute;
    top: 25px;
    left: 20px;
  }
}
</style>
