<template>
<!-- 
使用说明：
1）、引入category-cascader.vue
2）、语法：<category-cascader v-model:catelogPath="catelogPath"></category-cascader>
    解释：
      catelogPath：指定的值是cascader初始化需要显示的值，应该和父组件的catelogPath绑定;
      在Vue3中使用v-model:catelogPath代替了.sync修饰符
      -->
  <div>
    <el-cascader
      filterable
      clearable 
      placeholder="试试搜索：手机"
      v-model="paths"
      :options="categorys"
      :props="setting"
    ></el-cascader>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getCurrentInstance } from 'vue';
import {getProductCategoryList} from '@/api/product/edit'
const { proxy } = getCurrentInstance();

// 接收props
const props = defineProps({
  catelogPath: {
    type: Array,
    default: () => []
  }
});

// 定义emit
const emit = defineEmits(['update:catelogPath']);

// 数据
const setting = ref({
  value: "catId",
  label: "name",
  children: "children"
});
const categorys = ref([]);
const paths = ref(props.catelogPath);

// 监听props变化
watch(() => props.catelogPath, (v, oldv) => {
  console.log('props变化', v);
  if(v === oldv) return;
  // 将字符串数组转换为数字数组
  paths.value = v;
},{deep:true});

// 监听paths变化
watch(()=>paths.value, (v, oldv) => {
  console.log('paths变化', v);
  if(v === oldv) return;
  emit('update:catelogPath', v);
  // 还可以使用pubsub-js进行传值
  // PubSub.publish("catPath", v);
},{deep:true});
// 方法
const getCategorys = () => {
  getProductCategoryList().then(({data})=>{
    categorys.value = data;
   
  }).catch((e)=>{
    proxy.$message.error(e.message);
  })
};

// 生命周期
onMounted(() => {
  getCategorys();
});
</script>

<style scoped>
</style>