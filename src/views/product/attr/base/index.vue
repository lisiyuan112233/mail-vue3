<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <category @tree-node-click="treenodeclick"></category>
    </el-col>
    <el-col :span="18">
      <div class="mod-config">
        <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
          <el-form-item>
            <el-input v-model="dataForm.key" placeholder="参数名" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="getDataList()">查询</el-button>
            <el-button type="success" @click="getAllDataList()">查询全部</el-button>
            <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
            <el-button type="danger" @click="deleteHandle()"
              :disabled="dataListSelections.length <= 0">批量删除</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle"
          style="width: 100%;">
          <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
          <el-table-column prop="attrId" header-align="center" align="center" label="id"></el-table-column>
          <el-table-column prop="attrName" header-align="center" align="center" label="属性名"></el-table-column>
          <el-table-column v-if="attrtype == 1" prop="searchType" header-align="center" align="center" label="可检索">
            <template #default="scope">
              <i class="el-icon-success" v-if="scope.row.searchType == 1"></i>
              <i class="el-icon-error" v-else></i>
            </template>
          </el-table-column>
          <el-table-column prop="valueType" header-align="center" align="center" label="值类型">
            <template #default="scope">
              <el-tag v-if="scope.row.valueType == 0">单选</el-tag>
              <el-tag v-else>多选</el-tag>
            </template>
          </el-table-column>
          <el-table-column v-if="attrtype == 1" prop="enable" header-align="center" align="center" label="启用">
            <template #default="scope">
              <i class="el-icon-success" v-if="scope.row.enable == 1"></i>
              <i class="el-icon-error" v-else></i>
            </template>
          </el-table-column>
          <el-table-column prop="catelogName" header-align="center" align="center" label="所属分类"></el-table-column>
          <el-table-column v-if="attrtype == 1" prop="showDesc" header-align="center" align="center" label="快速展示">
            <template #default="scope">
              <i class="el-icon-success" v-if="scope.row.showDesc == 1"></i>
              <i class="el-icon-error" v-else></i>
            </template>
          </el-table-column>
          <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
            <template #default="scope">
              <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.attrId)">修改</el-button>
              <el-button type="text" size="small" @click="deleteHandle(scope.row.attrId)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination @size-change="sizeChangeHandle" @current-change="currentChangeHandle" :current-page="pageIndex"
          :page-sizes="[10, 20, 50, 100]" :page-size="pageSize" :total="totalPage"
          layout="total, sizes, prev, pager, next, jumper"></el-pagination>
        <!-- 弹窗, 新增 / 修改 -->
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" :type="attrtype"
          @refreshDataList="getDataList"></add-or-update>
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'
import { listBaseAttr } from '@/api/product/attr/base.js'
import Category from "@/components/category"
import AddOrUpdate from "./attr-add-or-update"

const { proxy } = getCurrentInstance()

// Props
const props = defineProps({
  attrtype: {
    type: Number,
    default: 1
  }
})

// 响应式数据
const catId = ref(0)
const dataForm = reactive({
  key: ""
})
const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref([])
const addOrUpdateVisible = ref(false)

// 方法
const treenodeclick = (data, node) => {
  console.log('父组件接收到树节点点击事件:', data, node);
  if (node.level == 3) {
    catId.value = data.catId
    getDataList()
  }
}

const getDataList = () => {
  dataListLoading.value = true
  listBaseAttr(catId, {
    page: pageIndex.value,
    limit: pageSize.value,
    key: dataForm.key,
    type: props.attrtype
  }).then(({ data }) => {
    if (data && data.code === 0) {
      dataList.value = data.list
      totalPage.value = data.totalCount
    } else {
      dataList.value = []
      totalPage.value = 0
    }
  }).finally(() => {
    dataListLoading.value = false
  })
}

const getAllDataList = () => {
  catId.value = 0
  getDataList()
}

const sizeChangeHandle = (val) => {
  pageSize.value = val
  pageIndex.value = 1
  getDataList()
}

const currentChangeHandle = (val) => {
  pageIndex.value = val
  getDataList()
}

const selectionChangeHandle = (val) => {
  dataListSelections.value = val
}

const addOrUpdateHandle = (id) => {
  addOrUpdateVisible.value = true
  proxy.$nextTick(() => {
    proxy.$refs.addOrUpdate.init(id)
  })
}

const deleteHandle = (id) => {
  let ids = id ? [id] : dataListSelections.value.map(item => {
    return item.attrId
  })
  proxy.$confirm(`确定对[id=${ids.join(',')}]进行[${id ? '删除' : '批量删除'}]操作?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    proxy.$http({
      url: proxy.$http.adornUrl('/product/attr/delete'),
      method: 'post',
      data: proxy.$http.adornData(ids, false)
    }).then(({ data }) => {
      if (data && data.code === 0) {
        proxy.$message({
          message: '操作成功',
          type: 'success',
          duration: 1500,
          onClose: () => {
            getDataList()
          }
        })
      } else {
        proxy.$message.error(data.msg)
      }
    })
  })
}

const isAuth = (permission) => {
  // 这里需要根据实际的权限验证逻辑来实现
  return true
}

// 生命周期
onMounted(() => {
  getDataList()
})
</script>

<style scoped></style>