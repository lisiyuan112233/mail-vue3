<template>
  <div class="mod-config">
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;"
    >
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="id" header-align="center" align="center" label="id"></el-table-column>
      <el-table-column prop="spuName" header-align="center" align="center" label="名称"></el-table-column>
      <el-table-column prop="spuDescription" header-align="center" align="center" label="描述"></el-table-column>
      <el-table-column prop="catalogId" header-align="center" align="center" label="分类"></el-table-column>
      <el-table-column prop="brandId" header-align="center" align="center" label="品牌"></el-table-column>
      <el-table-column prop="weight" header-align="center" align="center" label="重量"></el-table-column>
      <el-table-column prop="publishStatus" header-align="center" align="center" label="上架状态">
        <template #default="scope">
          <el-tag v-if="scope.row.publishStatus == 0">新建</el-tag>
          <el-tag v-if="scope.row.publishStatus == 1">已上架</el-tag>
          <el-tag v-if="scope.row.publishStatus == 2">已下架</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createTime" header-align="center" align="center" label="创建时间"></el-table-column>
      <el-table-column prop="updateTime" header-align="center" align="center" label="修改时间"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template #default="scope">
          <el-button
            v-if="scope.row.publishStatus == 0"
            type="text"
            size="small"
            @click="productUp(scope.row.id)"
          >上架</el-button>
          <el-button type="text" size="small" @click="attrUpdateShow(scope.row)">规格</el-button>
        </template>
      </el-table-column>
    </el-table>

    <el-pagination
      @size-change="sizeChangeHandle"
      @current-change="currentChangeHandle"
      :current-page="pageIndex"
      :page-sizes="[10, 20, 50, 100]"
      :page-size="pageSize"
      :total="totalPage"
      layout="total, sizes, prev, pager, next, jumper"
    ></el-pagination>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onActivated, onBeforeUnmount, getCurrentInstance } from 'vue'
import { useRouter } from 'vue-router'

const { proxy } = getCurrentInstance()
const router = useRouter()

const props = defineProps({
  catId: {
    type: Number,
    default: 0
  }
})

let dataSub = null

const dataForm = reactive({})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref([])
const addOrUpdateVisible = ref(false)

const productUp = (id) => {
  proxy.$http({
    url: proxy.$http.adornUrl("/product/spuinfo/" + id + "/up"),
    method: "post"
  }).then(({ data }) => {
    if (data && data.code === 0) {
      proxy.$message({
        message: "操作成功",
        type: "success",
        duration: 1500,
        onClose: () => {
          getDataList();
        }
      });
    } else {
      proxy.$message.error(data.msg);
    }
  });
}

const attrUpdateShow = (row) => {
  console.log(row);
  router.push({
    path: "/product-attrupdate",
    query: { spuId: row.id, catalogId: row.catalogId }
  });
}

// 获取数据列表
const getDataList = () => {
  dataListLoading.value = true;
  let param = {};
  Object.assign(param, dataForm, {
    page: pageIndex.value,
    limit: pageSize.value
  });
  proxy.$http({
    url: proxy.$http.adornUrl("/product/spuinfo/list"),
    method: "get",
    params: proxy.$http.adornParams(param)
  }).then(({ data }) => {
    if (data && data.code === 0) {
      dataList.value = data.page.list;
      totalPage.value = data.page.totalCount;
    } else {
      dataList.value = [];
      totalPage.value = 0;
    }
    dataListLoading.value = false;
  });
}

// 每页数
const sizeChangeHandle = (val) => {
  pageSize.value = val;
  pageIndex.value = 1;
  getDataList();
}

// 当前页
const currentChangeHandle = (val) => {
  pageIndex.value = val;
  getDataList();
}

// 多选
const selectionChangeHandle = (val) => {
  dataListSelections.value = val;
}

// 新增 / 修改
const addOrUpdateHandle = (id) => {}

onMounted(() => {
  dataSub = PubSub.subscribe("dataForm", (msg, val) => {
    console.log("~~~~~", val);
    Object.assign(dataForm, val);
    getDataList();
  });
})

onActivated(() => {
  getDataList();
})

onBeforeUnmount(() => {
  PubSub.unsubscribe(dataSub);
})
</script>
