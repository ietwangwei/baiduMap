<template>
  <div class="home-page">
    <div class="map-containe">
      <div class="actions">
        <el-button size="small" @click="changeStatus('addPolygon')">{{ status === 'addPolygon' ? '取消' : '绘制' }}</el-button>
        <el-button size="small" @click="changeStatus('edit')">{{ status === 'edit' ? '取消' : '编辑' }}</el-button>
        <el-button size="small" @click="changeStatus('addMark')">{{ status === 'addMark' ? '取消' : '添加标记' }}</el-button>
        <el-button size="small" @click="changeStatus('addText')">{{ status === 'addText' ? '取消' : '添加文本' }}</el-button>
        <el-button size="small" @click="revoke">撤销</el-button>
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
        <!-- 标记物 -->
        <el-amap-marker
          v-for="(marker, index) in markers"
          :key="index"
          :position="marker.position"
          :icon="marker.icon"
          :draggable="status === 'addMark'"
        />
        <!-- 文本 -->
        <el-amap-text
          v-for="text in texts"
          :key="text.id"
          :text="text.text"
          :offset="text.offset"
          :position="text.position"
          :events="text.events"
          :draggable="status === 'addText'"
          class="test"
        />
        <!-- 信息窗口 -->
        <el-amap-info-window
          :position="currentWindow.position"
          :content="currentWindow.content"
          :visible="currentWindow.visible"
          :events="currentWindow.events">
        </el-amap-info-window>
        <!-- 主要区域 -->
        <el-amap-polygon
          v-for="(polygon, index) in polygons"
          :key="index + polygon.path"
          :vid="index"
          :editable="status === 'edit'"
          :ref="`polygon_${index}`"
          :path="polygon.path"
          :draggable="polygon.draggable"
          :events="polygon.events"
          :strokeColor="polygon.strokeColor"
          :strokeOpacity="polygon.strokeOpacity"
          :strokeWeight="polygon.strokeWeight"
          :fillColor="polygon.fillColor"
          :fillOpacity="polygon.fillOpacity"
        />
      </el-amap>
    </div>
    <el-dialog
      :title="title"
      :visible="visible"
      :close-on-click-modal="false"
      @close="visible = false"
    >
      <FormConfig
        :formData="formData"
        :formConfig="formConfig"
      />
      <div class="dialog-footer">
        <el-button size="small" @click="visible = false">取 消</el-button>
        <el-button size="small" type="primary" @click="submit">确 定</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import { AMapManager } from 'vue-amap'
import FormConfig from '@/components/FormConfig'
const amapManager = new AMapManager()

export default {
  name: 'home',
  components: {
    FormConfig
  },
  data () {
    const _this = this
    return {
      searchOption: {
        city: '成都',
        citylimit: true
      },
      mapCenter: [104.053185, 30.3755265],
      currentWindow: {
        position: [0, 0],
        content: '',
        visible: false,
        events: {}
      },
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
          _this.polygonClickHandler(e)
        }
      },
      polygons: [],
      markers: [],
      texts: [],
      status: '',
      drawConfig: {
        strokeColor: '#007ed2',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#007ed2',
        fillOpacity: 0.4
      },
      path: [],
      visible: false,
      title: '',
      formData: {},
      formConfig: {
        props: []
      },
      currentPosition: []
    }
  },
  mounted () {
    this.getData()
  },
  methods: {
    // 获取数据
    getData () {
      this.$http.town.getRange().then(res => {
        if (res.code === 200) {
          let points = []
          res.data.map(i => {
            if (i.lng && i.lat) {
              points.push([i.lng, i.lat])
            }
          })
          this.generatePolygon()
          this.polygons[0].path = points
        } else {
          this.$message.error(res.message)
        }
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
    // 生成一个多边形
    generatePolygon (points) {
      const _this = this
      let polygon = {
        draggable: false,
        path: [],
        events: {
          click (e) {
            _this.polygonClickHandler(e)
          }
        }
      }
      this.polygons.push(Object.assign({}, this.drawConfig, polygon))
    },
    // 点击事件
    polygonClickHandler (e) {
      this.getPosition(e)
      switch (this.status) {
        case 'addPolygon':
          this.addpolygon(e)
          break
        case 'addMark':
          this.addMark(e)
          break
        case 'addText':
          this.setForm()
          this.visible = true
          break
        default:
          console.log('click handler is not found')
          break
      }
    },
    // 添加节点
    addpolygon (e) {
      let { lng, lat } = e.lnglat
      let len = this.polygons.length
      this.polygons[len - 1].path.push([lng, lat])
    },
    // 获取uuid
    getUUid () {
      return 'uuid' + new Date().getTime().toString()
    },
    // 获取坐标
    getPosition (e) {
      let { lng, lat } = e.lnglat
      this.currentPosition = [lng, lat]
    },
    // 增加标记
    addMark (e) {
      const _this = this
      const mark = {
        id: this.getUUid(),
        position: this.currentPosition,
        events: {
          click: () => {
            alert('click marker')
          },
          dragend: (e) => {
            _this.dragHandler(e)
          }
        },
        visible: true,
        draggable: true,
        content: 'test'
      }
      this.markers.push(mark)
    },
    // 设置表单
    setForm () {
      let type = this.status
      switch (type) {
        case 'addPolygon':
          this.title = '添加区域'
          this.formData = Object.assign({}, { name: '' }, this.drawConfig)
          this.formConfig = {
            props: [
              {
                label: '名称',
                prop: 'name',
                type: 'input'
              },
              {
                label: '边界颜色',
                prop: 'strokeColor',
                type: 'colorPicker'
              },
              {
                label: '边界透明度',
                prop: 'strokeOpacity',
                type: 'inputNumber',
                min: 0,
                max: 1,
                step: 0.1
              },
              {
                label: '边界宽度',
                prop: 'strokeWeight',
                type: 'inputNumber',
                min: 1,
                max: 10,
                step: 1
              },
              {
                label: '区域填充色',
                prop: 'fillColor',
                type: 'colorPicker'
              },
              {
                label: '区域透明度',
                prop: 'fillOpacity',
                type: 'inputNumber',
                min: 0,
                max: 1,
                step: 0.1
              }
            ]
          }
          break
        case 'addText':
          this.title = '添加文本'
          this.formData = {
            title: '',
            content: ''
          }
          this.formConfig = {
            props: [
              {
                label: '名称',
                prop: 'title',
                type: 'input'
              },
              {
                label: '内容',
                prop: 'content',
                type: 'textarea'
              }
            ]
          }
          break
      }
    },
    // 拖拽事件
    dragHandler (e) {
      debugger
    },
    // 添加文本
    addText (e) {
      const _this = this
      const text = {
        id: this.getUUid(),
        position: this.currentPosition,
        text: this.formData.title,
        content: this.formData.content,
        offset: [0, 12],
        events: {
          click () {
            alert('click text')
          },
          dragend (e) {
            _this.dragHandler(e)
          }
        }
      }
      this.texts.push(text)
    },
    // 提交
    submit () {
      switch (this.status) {
        case 'addText':
          this.addText()
          this.visible = false
          break
        case 'addPolygon':
          this.drawConfig = {
            strokeColor: this.formData.strokeColor,
            strokeOpacity: this.formData.strokeOpacity,
            strokeWeight: this.formData.strokeWeight,
            fillColor: this.formData.fillColor,
            fillOpacity: this.formData.fillOpacity
          }
          this.generatePolygon()
          this.visible = false
          break
        default:
          break
      }
    },
    // 回退
    revoke () {
      let type = this.status
      switch (type) {
        case 'addPolygon':
          let len = this.polygons.length
          this.polygons[len - 1].path.pop()
          if (this.polygons[len - 1].path.length === 0) {
            this.polygons.pop()
          }
          console.log('pathpop')
          break
        case 'addMark':
          this.markers.pop()
          console.log('标记pop')
          break
        case 'addText':
          this.texts.pop()
          console.log('文本pop')
          break
        default:
          console.log(type)
          break
      }
    },
    saveRange () {},
    saveCovers () {},
    // 保存
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
        if (res.code === 200) {
          this.$message.success('保存成功')
        } else {
          this.$message.error(res.message)
        }
      })
    },
    // 按钮
    changeStatus (type) {
      if (this.status === type) {
        this.status = ''
      } else {
        this.status = type
        switch (type) {
          case 'addPolygon':
            this.setForm()
            this.visible = true
            break
          case 'addMark':
            console.log('添加标记')
            break
          case 'addText':
            console.log('添加文本')
            break
          default:
            console.log(type)
            break
        }
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

  .amap-overlay-text-container {
    border: 1px solid #4084F0;
    padding: 3px 6px;
    font-size: 12px;
  }

  .amap-icon {
    img {
      width: 12px;
    }
  }
}
</style>
