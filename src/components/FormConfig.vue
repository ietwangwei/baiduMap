<template>
  <div class="form-configable">
    <el-form
      v-model="formData"
    >
      <el-form-item
        v-for="item in formConfig.props"
        :key="item.prop"
        :label="item.label"
      >
        <!-- 输入框 -->
        <el-input
          v-if="item.type === 'input'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          :suffix-icon="item.suffixIcon || 'search'"
          size="small"
        ></el-input>
        <el-color-picker
          v-if="item.type === 'colorPicker'"
          v-model="formData[item.prop]"
          size="small"
        ></el-color-picker>
        <el-input-number
          v-if="item.type === 'inputNumber'"
          v-model="formData[item.prop]"
          :step="item.step"
          :min="item.min"
          :max="item.max"
          size="small"
        ></el-input-number>
        <!-- 文本域 -->
        <el-input
          v-if="item.type === 'textarea'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          :suffix-icon="item.suffixIcon || 'search'"
          size="small"
          type="textarea"
          style="resize: none;"
          maxlength="500"
          show-word-limit
        ></el-input>
        <!-- 选择框 -->
        <el-select
          v-if="item.type === 'select'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          size="small"
        >
          <el-option
            v-for="option in item.options"
            :key="option.value"
            :value="option.value"
            :label="option.label"
          />
        </el-select>
        <!-- 级联选择框 -->
        <el-cascader
          v-if="item.type === 'cascader'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          :options="item.options"
          size="small"
        />
        <!-- 单选框 -->
        <el-radio-group
          v-if="item.type === 'radio'"
          v-model="formData[item.prop]"
          size="small"
          @change="item.changeHanlder"
        >
          <el-radio
            v-for="radio in item.radios"
            :key="radio.label"
            :label="radio.label"
          >{{ radio.name }}</el-radio>
        </el-radio-group>
        <!-- 日期选择器 -->
        <el-date-picker
          v-if="item.type === 'date'"
          v-model="formData[item.prop]"
          type="date"
          :placeholder="item.placeholder"
          size="small"
        >
        </el-date-picker>
        <!-- 时间选择器 -->
        <el-time-select
          v-if="item.type === 'time'"
          v-model="formData[item.prop]"
          :placeholder="item.placeholder"
          size="small"
        >
        </el-time-select>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: 'formConfig',
  props: ['formData', 'formConfig'],
  data () {
    return {
      defaultConfig: {
        placeholderInput: '请输入',
        placeholderSelect: '请选择',
        accept: ''
      }
    }
  },
  methods: {
    remove (index) {
      this.$emit('remove', index)
    }
  }
}
</script>

<style lang="scss">
.form-configable {
  .el-form-item {
    display: flex;
    align-items: flex-start;
    margin-bottom: 16px;

    .el-form-item__label {
      width: 100px;
      text-align: right
    }

    .el-form-item__content {
      flex: 1;
      text-align: left;
    }
  }

  .el-textarea__inner {
    height: 180px;
    resize: none;
  }
}
</style>
