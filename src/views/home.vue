<template>
  <div class="home-page">
    <div class="map-containe">
      <div class="actions">
        <el-button size="small" @click="changeStatus('add')">{{ status === 'add' ? '取消' : '绘制' }}</el-button>
        <el-button size="small" @click="changeStatus('edit')">{{ status === 'edit' ? '取消' : '编辑' }}</el-button>
        <!-- <el-button size="small" @click="revoke">撤销</el-button> -->
        <el-button size="small" @click="save">保存</el-button>
      </div>
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
          :position="marker.position"
        />
        <el-amap-polygon
          v-for="(polygon, index) in polygons"
          :key="index + polygon.path"
          :vid="index"
          :editable="status === 'edit'"
          :ref="`polygon_${index}`"
          :path="polygon.path"
          :draggable="polygon.draggable"
          :events="polygon.events"
          :strokeColor="drawConfig.strokeColor"
          :strokeOpacity="drawConfig.strokeOpacity"
          :strokeWeight="drawConfig.strokeWeight"
          :fillColor="drawConfig.fillColor"
          :fillOpacity="drawConfig.fillOpacity"
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
          id: 0,
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
          content: 'test',
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
          if (_this.status === 'add') {
            _this.addpolygon(e)
          }
        }
      },
      polygons: [
        {
          draggable: false,
          path: [],
          events: {
          }
        }
      ],
      status: '',
      drawConfig: {
        strokeColor: '#007ed2',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#007ed2',
        fillOpacity: 0.4
      },
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
        draggable: false,
        path: this.path,
        events: {
          click: () => {
            alert('click polygon')
          }
        }
      }
      return polygon
    },
    // 添加节点
    addpolygon (e) {
      let { lng, lat } = e.lnglat
      this.polygons.push(this.generatePath([lng, lat]))
    },
    revoke () {
      this.polygons[0].path.pop()
      this.changeStatus('')
    },
    save () {
      let points = []
      let path = this.$refs.polygon_0[0].$$getPath()
      path.forEach(i => {
        points.push({
          lng: i[0],
          lat: i[1]
        })
      })
      let queryData = {
        townId: 1,
        points
      }
      this.changeStatus('')
      this.$http.town.saveRange(queryData).then(res => {
        this.getRange()
      })
    },
    changeStatus (type) {
      if (this.status === type) {
        this.status = ''
      } else {
        this.status = type
      }
    }
  }
}
</script>

<style lang="scss">
.map-containe {
  position: relative;
  width: 100vw;
  height: 100vh;

  .search-box {
    position: absolute;
    top: 25px;
    left: 20px;
    padding: 0 12px;
  }

  .actions {
    position: absolute;
    top: 25px;
    right: 100px;
    z-index: 100;
    background-color: #FFF;
    padding: 12px;
  }
}
</style>
