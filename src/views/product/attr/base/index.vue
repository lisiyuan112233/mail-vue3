<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <category @tree-node-click="treenodeclick"></category>
    </el-col>
    <el-col :span="18">
      <div class="mod-config">
        <el-form :inline="true" :model="baseAttrPage" @submit.prevent="getDataList()">
          <el-form-item>
            <el-input v-model="baseAttrPage.key" placeholder="参数名" @keyup.enter="getDataList()" clearable></el-input>
          </el-form-item>
          <el-form-item>
            <el-button @click="getDataList()">查询</el-button>
            <el-button type="success" @click="getAllDataList()">查询全部</el-button>
            <el-button type="primary" @click="addOrUpdateHandle()">新增</el-button>
            <el-button type="danger" @click="deleteHandle()" :disabled="dataListSelections.length <= 0">批量删除</el-button>
          </el-form-item>
        </el-form>
        <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="selectionChangeHandle"
          style="width: 100%;">
          <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
          <el-table-column type="index" header-align="center" align="center" label="id"></el-table-column>
          <el-table-column prop="attrName" header-align="center" align="center" label="属性名"></el-table-column>
          <el-table-column v-if="attrtype == 1" prop="searchType" header-align="center" align="center" label="可检索">
            <template #default="scope">
              <el-switch :v-model="scope.row.searchType === 1 ? true : false"
                @change="(val) => ChangeSearchTypeStatus(scope.row.attrId, val ? 1 : 0)" />
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
              <el-switch :v-model="scope.row.enable === 1 ? true : false" @change="(val) => ChangeEnableStatus(scope.row.attrId, val ? 1 : 0)" />
            </template>
          </el-table-column>
          <el-table-column prop="catelogName" header-align="center" align="center" label="所属分类"></el-table-column>
          <el-table-column v-if="attrtype == 1" prop="showDesc" header-align="center" align="center" label="快速展示">
            <template #default="scope">
              <el-switch :v-model="scope.row.showDesc === 1 ? true : false" @change="(val) => ChangeShowDescStatus(scope.row.attrId, val ? 1 : 0)" />
            </template>
          </el-table-column>
          <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
            <template #default="scope">
              <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.attrId)">修改</el-button>
              <el-button type="text" size="small" @click="deleteHandle(scope.row.attrId)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <pagination :total="baseAttrPage.total" v-model:page="baseAttrPage.pageIndex"
          v-model:limit="baseAttrPage.pageSize" @pagination="getDataList" style="margin-top: 20px;" :hidden="false" />

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
import { getBaseAttrList, deleteBaseAttrByIds
  ,changeShowDesc,changeSearchType,changeEnable
 } from '@/api/product/attr/base.js'
import Category from "@/components/category"
import AddOrUpdate from "../common/attr-add-or-update"

const { proxy } = getCurrentInstance()

// Props
const props = defineProps({
  attrtype: {
    type: Number,
    default: 1
  }
})
// 属性参数分页数据
const baseAttrPage = reactive({
  pageIndex: 1,
  pageSize: 5,
  key: "",
  total: 0
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
//三个按钮
function changeStatus(func,id,value){
  func(id,value).then(({ code, msg }) => {
    if (code === 200) {
      proxy.$message.success('修改成功')
    } else {
      throw new Error(msg)
    }
  }).catch(err => {
    proxy.$message.error(err.message)
  });
}
function ChangeShowDescStatus(id, value) {
  changeStatus(changeShowDesc,id, value);
}
function ChangeSearchTypeStatus(id, value) {
  changeStatus(changeSearchType,id, value);
}
function ChangeEnableStatus(id, value) {
  changeStatus(changeEnable,id, value);

}
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
  getBaseAttrList(catId.value, baseAttrPage), then(({ data: { list, totalCount }, code }) => {
    if (code === 200) {
      dataList.value = list
      baseAttrPage.total = Number.parseInt(totalCount) || 0
    } else {
      throw new Error('获取属性列表失败')
    }
  }).catch(err => {
    proxy.$message.error(err.message)
  }).finally(() => {
    dataListLoading.value = false
  })
}

const getAllDataList = () => {
  catId.value = 0
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
  proxy.$confirm(`确定删除?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataListLoading.value = true
    deleteBaseAttrByIds(ids).then(({ code, msg }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        dataListSelections.value = []
        getDataList()
      } else {
        throw new Error(msg)
      }
    }).catch(err => {
      proxy.$message.error(err.message)
    }).finally(() => {
      dataListLoading.value = false
    })
  })
}


// 生命周期
onMounted(() => {
  getDataList()
})
</script>

<style scoped></style>