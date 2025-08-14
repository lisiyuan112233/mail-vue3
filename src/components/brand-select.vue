<template>
  <div>
    <el-select placeholder="请选择" v-model="brandId" filterable clearable>
      <el-option
        v-for="item in brands"
        :key="item.brandId"
        :label="item.brandName"
        :value="item.brandId"
      ></el-option>
    </el-select>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue';
import { getCurrentInstance } from 'vue';

const { proxy } = getCurrentInstance();

// 数据
const catId = ref(0);
const brands = ref([
  {
    label: "a",
    value: 1
  }
]);
const brandId = ref("");
let subscribe = null;

// 监听brandId变化
watch(brandId, (val) => {
  PubSub.publish("brandId", val);
});

// 方法
const getCatBrands = () => {
  proxy.$http({
    url: proxy.$http.adornUrl("/product/categorybrandrelation/brands/list"),
    method: "get",
    params: proxy.$http.adornParams({
      catId: catId.value
    })
  }).then(({ data }) => {
    brands.value = data.data;
  });
};

// 生命周期钩子
onMounted(() => {
  // 监听三级分类消息的变化
  subscribe = PubSub.subscribe("catPath", (msg, val) => {
    catId.value = val[val.length - 1];
    getCatBrands();
  });
});

onBeforeUnmount(() => {
  PubSub.unsubscribe(subscribe); // 销毁订阅
});
</script>

<style scoped>
</style>