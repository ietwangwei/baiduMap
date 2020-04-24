<template>
  <div class="home-page">
    <div class="map-containe">
      <div class="top-bar">
        <div class="actions">
          <el-button size="small" @click="changeStatus('addPolygon')">{{ status === 'addPolygon' ? '取消' : '绘制多边形' }}</el-button>
          <!-- <el-button size="small" @click="changeStatus('addMark')">{{ status === 'addMark' ? '取消' : '添加标记' }}</el-button> -->
          <el-button size="small" @click="changeStatus('addText')">{{ status === 'addText' ? '取消' : '添加文本' }}</el-button>
          <el-button size="small" @click="changeStatus('addCircle')">{{ status === 'addCircle' ? '取消' : '绘制圆形' }}</el-button>
          <el-button size="small" @click="changeStatus('edit')">{{ status === 'edit' ? '取消' : '编辑' }}</el-button>
          <el-button size="small" @click="revoke">撤销</el-button>
          <el-button size="small" @click="saveCovers">保存</el-button>
        </div>
        <el-amap-search-box
          class="search-box"
          :search-option="searchOption"
          :on-search-result="onSearchResult"
        />
      </div>
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
        <div
          v-for="(cover ,index) in covers"
          :key="index"
          class="cover-item"
        >
          <!-- 文本标记 -->
          <div
            v-if="cover.type === 'mark'"
            class="mark"
          >
            <el-amap-text
              :text="cover.text"
              :offset="cover.offset"
              :position="cover.position"
              :events="coverEvents[cover.type]"
              :draggable="cover.draggable"
            />
            <el-amap-marker
              :vid="index"
              :position="cover.position"
              :events="coverEvents[cover.type]"
              :draggable="cover.draggable"
            />
          </div>
          <!-- 圆形区域 -->
          <div
            v-if="cover.type === 'circle'"
            class="circle"
          >
            <el-amap-circle
              :center="cover.center"
              :radius="cover.radius"
              :strokeColor="cover.strokeColor"
              :strokeOpacity="cover.strokeOpacity"
              :strokeWeight="cover.strokeWeight"
              :fillColor="cover.fillColor"
              :fillOpacity="cover.fillOpacity"
              :events="coverEvents[cover.type]"
              :draggable="cover.draggable"
              :editable="cover.editable"
            />
          </div>
          <!-- 多边形区域 -->
          <div
            v-if="cover.type === 'polygon'"
            class="polygon"
          >
            <el-amap-polygon
              :vid="index"
              :ref="`polygon_${index}`"
              :path="cover.path"
              :events="coverEvents[cover.type]"
              :strokeColor="cover.strokeColor"
              :strokeOpacity="cover.strokeOpacity"
              :strokeWeight="cover.strokeWeight"
              :fillColor="cover.fillColor"
              :fillOpacity="cover.fillOpacity"
              :editable="cover.editable"
              :draggable="cover.draggable"
            />
          </div>
        </div>
        <!-- 信息窗口 -->
        <el-amap-info-window
          :position="currentWindow.position"
          :content="currentWindow.content"
          :visible="currentWindow.visible"
          :events="currentWindow.events">
        </el-amap-info-window>
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
        events: {
          close (e) {
            _this.currentWindow.visible = false
          }
        }
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
          _this.caoverClickHandler(e)
        }
      },
      covers: [],
      coverEvents: {
        'mark': {
          click (e) {
            _this.caoverClickHandler(e, 'mark')
          },
          dragend (e) {
            _this.dragHandler(e)
          }
        },
        'polygon': {
          click (e) {
            _this.caoverClickHandler(e, 'polygon')
          }
        },
        'circle': {
          click (e) {
            _this.caoverClickHandler(e, 'circle')
          }
        }
      },
      status: '',
      drawConfig: {
        strokeColor: '#007ed2',
        strokeOpacity: 0.5,
        strokeWeight: 1,
        fillColor: '#007ed2',
        fillOpacity: 0.4
      },
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
    this.getCovers()
  },
  methods: {
    // 获取数据
    getCovers () {
      this.$http.town.getCovers().then(res => {
        res.forEach(item => {
          if (item.type === 'polygon') {
            item.path = this.point2Lnglat(item.path)
          }
        })
        this.covers = res
        // if (res.code === 200) {
        //   this.covers = res
        // } else {
        //   this.$message.error(res.message)
        // }
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
    generatePolygon () {
      let polygon = {
        type: 'polygon',
        editable: true,
        draggable: true,
        path: []
      }
      this.covers.push(Object.assign({}, this.drawConfig, polygon))
    },
    // 生成一个圆形
    generateCircle () {
      let circle = {
        type: 'circle',
        draggable: true,
        editable: true,
        center: [0, 0],
        radius: this.formData.radius
      }
      this.covers.push(Object.assign({}, this.drawConfig, circle))
    },
    // 生成一个标记
    generateMark (e) {
      const mark = {
        id: this.getUUid(),
        type: 'mark',
        editable: true,
        draggable: true,
        position: this.currentPosition,
        text: this.formData.title,
        content: this.formData.content,
        offset: [0, 12]
      }
      this.covers.push(mark)
    },
    // 点击事件
    caoverClickHandler (e, type) {
      this.getPosition(e)
      switch (this.status) {
        case 'addPolygon':
          this.addpolygon(e)
          break
        case 'addText':
          this.setForm()
          this.visible = true
          break
        case 'addCircle':
          this.addCircle(e)
          break
        case 'edit':
          // todo
          break
        default:
          this.setInfo(e, type)
          break
      }
    },
    // 添加节点
    addpolygon (e) {
      let { lng, lat } = e.lnglat
      let len = this.covers.length
      this.covers[len - 1].path.push([lng, lat])
    },
    // 添加圆形
    addCircle (e) {
      let { lng, lat } = e.lnglat
      let len = this.covers.length
      this.covers[len - 1].center = [lng, lat]
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
        case 'addCircle':
          this.title = '添加圆形'
          this.formData = Object.assign({}, { name: '', radius: 100 }, this.drawConfig)
          this.formConfig = {
            props: [
              {
                label: '名称',
                prop: 'name',
                type: 'input'
              },
              {
                label: '半径',
                prop: 'radius',
                type: 'inputNumber',
                min: 10,
                max: 1000,
                step: 10
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
    // 提交
    submit () {
      switch (this.status) {
        case 'addText':
          this.generateMark()
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
        case 'addCircle':
          this.drawConfig = {
            strokeColor: this.formData.strokeColor,
            strokeOpacity: this.formData.strokeOpacity,
            strokeWeight: this.formData.strokeWeight,
            fillColor: this.formData.fillColor,
            fillOpacity: this.formData.fillOpacity
          }
          this.generateCircle()
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
          let len = this.covers.length
          this.covers[len - 1].path.pop()
          console.log('pathpop')
          break
        case 'addMark':
          this.covers.pop()
          console.log('标记pop')
          break
        case 'addText':
          this.covers.pop()
          console.log('文本pop')
          break
        default:
          console.log(type)
          break
      }
    },
    // 保存
    saveCovers () {
      let covers = []
      this.covers.forEach(item => {
        if (item.type === 'polygon') {
          covers.push(Object.assign({}, item, { path: this.lnglat2Pointer(item.path) }))
        } else {
          covers.push(item)
        }
      })
      let queryData = {
        covers
      }
      console.log(JSON.stringify(covers))
      this.$http.town.saveCovers(queryData).then(res => {
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
            console.log('绘制多边形')
            break
          case 'addText':
            console.log('添加文本')
            break
          case 'addCircle':
            this.setForm()
            this.visible = true
            console.log('添加圆形')
            break
          default:
            console.log(type)
            break
        }
      }
    },
    // 获取窗口信息
    setInfo (e, type) {
      let target = e.target
      let filterCovers = this.covers.filter(cover => {
        return cover.type === type
      })
      if (filterCovers.length) {
        switch (type) {
          case 'mark':
            if (typeof target.getPosition !== 'function') return
            let position = target.getPosition()
            let currentPosition = [position.lng, position.lat]
            let mark = filterCovers.filter(i => {
              return JSON.stringify(i.position) === JSON.stringify(currentPosition)
            })[0]
            this.currentWindow = {
              position: currentPosition,
              content: mark.content,
              visible: true
            }
            break
          default:
            console.log(type)
            break
        }
      }
    },
    isEditable (cover) {
      if (!cover.editable) return false
      if (this.status === 'edit') return true
    },
    point2Lnglat (path) {
      return path.map(point => {
        return [point.lng, point.lat]
      })
    },
    lnglat2Pointer (path) {
      return path.map(point => {
        if (Array.isArray(point)) {
          return {
            lng: point[0],
            lat: point[1]
          }
        } else {
          return {
            lng: point.lng,
            lat: point.lat
          }
        }
      })
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
    top: 24px;
    left: 20px;
    padding: 0 12px;
    height: 60px;
  }

  .actions {
    position: absolute;
    top: 25px;
    right: 200px;
    display: flex;
    align-items: center;
    height: 60px;
    z-index: 100;
    background-color: #FFF;
    padding: 12px;
  }

  .amap-overlay-text-container {
    border: 1px solid #4084F0;
    padding: 3px 6px;
    font-size: 12px;
  }
  img {
    width: 12px;
  }
}

</style>
