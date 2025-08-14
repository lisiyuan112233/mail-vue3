<template>
  <div>
    <el-input placeholder="输入关键字进行过滤" v-model="filterText"></el-input>
    <el-tree :data="filteredMenuTree" :props="{ children: 'children', label: 'name' }" node-key="catId" ref="menuTree"
      @node-click="nodeclick" :highlight-current="true">
    </el-tree>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue';
import { getProductCategoryList } from '@/api/product/edit.js';
import { ElLoading } from 'element-plus';
import { defineEmits, getCurrentInstance } from 'vue';
const emit = defineEmits(['tree-node-click']);
const { proxy } = getCurrentInstance()
// 数据
const filterText = ref("");
const filteredMenuTree = ref([]);
const menus = ref([]);
const expandedKey = ref([]);
const loadingInstance1 = ref(null);
const defaultProps = ref({
  children: "children",
  label: "name"
});
const menuTree = ref(null);

let Timer = null;
watch(filterText, (val) => {
  if (Timer) clearTimeout(Timer)
  if (val) {
    Timer = setTimeout(() => {
      filteredMenuTree.value = [];
      for (let child of menus.value) {
        let node = filterNode(val, child);
        if (node) {
          filteredMenuTree.value.push(node);
        }
      }
    }, 300)
  } else {
    filteredMenuTree.value = menus.value;
  }
});

const filterNode = (value, data) => {
  let node = null;
  let children = [];
  let isReturn = false;
  for (let child of data.children || []) {
    let Cnode = filterNode(value, child);
    isReturn = isReturn || Cnode !== null;
    if (Cnode) {
      children.push(Cnode);
    }
  }
  if (isReturn || data.name.toLowerCase().includes(value.toLowerCase())) {
    node = Object.assign({}, data);
    node.children = children;
    return node;
  }
  return null;
};


const nodeclick = (data, node, component) => {
  // 向父组件发送事件
  emit('tree-node-click', data, node, component);
};

// 生命周期
onMounted(() => {
  loadingInstance1.value = ElLoading.service({ fullscreen: true })
  getProductCategoryList().then(({data}) => {
    menus.value = data
    filteredMenuTree.value = data
  }).catch(() => {
    proxy.$modal.error("获取分类数据失败，请稍后再试");
  }).finally(() => {
    loadingInstance1.value.close();
  });

});
</script>

<style scoped></style>