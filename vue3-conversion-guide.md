# Vue2 到 Vue3 组合式 API 转换指南

本指南提供了两个脚本，用于将 Vue2 选项式 API 转换为 Vue3 组合式 API。

## 脚本说明

1. `convert-to-vue3.js` - 完整转换脚本，尝试自动转换大部分代码
2. `simple-convert-to-vue3.js` - 简化版转换脚本，生成带有 TODO 注释的基础框架

## 使用方法

### 方法一：使用完整转换脚本

```bash
node convert-to-vue3.js
```

此脚本会尝试自动转换所有 `src/views/modules` 目录下的 Vue 文件。转换后的文件会直接替换原文件。

### 方法二：使用简化版转换脚本

```bash
node simple-convert-to-vue3.js
```

此脚本会为每个 Vue 文件生成一个 `.vue3` 后缀的文件，包含基本的转换框架和 TODO 注释。您需要手动完成剩余的转换工作。

## 转换规则

从 Vue2 选项式 API 到 Vue3 组合式 API 的主要转换规则：

1. **模板变更**
   - `slot-scope="scope"` → `#default="scope"`
   - `:visible.sync="visible"` → `v-model="visible"`

2. **脚本部分**
   - `<script>` → `<script setup>`
   - 导入必要的组合式 API 函数

3. **数据处理**
   - `data()` 中的属性 → `ref()` 或 `reactive()`
   - 访问数据时，基本类型需要 `.value`，对象类型不需要

4. **方法转换**
   - `methods` 中的方法 → 普通函数声明

5. **计算属性**
   - `computed` 中的属性 → `computed(() => {})`

6. **侦听器**
   - `watch` 中的配置 → `watch(source, callback, options)`

7. **生命周期钩子**
   - `created`, `mounted` → `onMounted`
   - `beforeDestroy` → `onBeforeUnmount`
   - `destroyed` → `onUnmounted`

8. **Props 定义**
   - `props` 选项 → `defineProps({})`

9. **事件发送**
   - `this.$emit('event')` → `emit('event')`

10. **方法暴露**
    - 需要暴露给父组件的方法 → `defineExpose({})`

## 手动转换示例

### Vue2 选项式 API

```vue
<template>
  <div>{{ message }}</div>
</template>

<script>
export default {
  data() {
    return {
      message: 'Hello'
    }
  },
  methods: {
    updateMessage(newMessage) {
      this.message = newMessage;
    }
  },
  mounted() {
    console.log('Component mounted');
  }
}
</script>
```

### Vue3 组合式 API

```vue
<template>
  <div>{{ message }}</div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const message = ref('Hello');

const updateMessage = (newMessage) => {
  message.value = newMessage;
};

onMounted(() => {
  console.log('Component mounted');
});

// 暴露方法给父组件
defineExpose({
  updateMessage
});
</script>
```

## 注意事项

1. 自动转换可能不完美，请务必检查转换后的代码
2. 特别复杂的组件可能需要手动转换
3. 转换后测试所有功能，确保正常工作
4. 对于使用 Vuex 的组件，可能需要额外调整