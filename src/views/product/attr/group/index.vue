<template>
  <el-row :gutter="20">
    <el-col :span="6">
      <category @tree-node-click="treenodeclick"></category>
    </el-col>
    <el-col :span="18">
      <div class="mod-config">
        <el-form :inline="true" :model="dataForm" @submit.prevent="getDataList()">
          <el-form-item>
            <el-input v-model="dataForm.key" placeholder="分组名" clearable></el-input>
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
          <el-table-column prop="attrGroupName" header-align="center" align="center" label="分组名称" width="120"></el-table-column>
          <el-table-column prop="sort" header-align="center" align="center" label="排序" width="80"></el-table-column>
          <el-table-column prop="descript" header-align="center" align="center" label="描述" show-overflow-tooltip></el-table-column>
          <el-table-column prop="icon" header-align="center" align="center" label="组图标" width="100">
            <template #default="scope">
              <!-- <div v-if="scope.row.icon" class="icon-container">
                <el-icon class="icon-display">
                  <svg class="icon" aria-hidden="true">
                    <use :xlink:href="`#${scope.row.icon}`"></use>
                  </svg>
                </el-icon>
              </div>
              <div v-else-if="scope.row.iconUrl" class="icon-container">
                <img :src="scope.row.iconUrl" alt="图标" class="icon-image" />
              </div>
              <span v-else>
                <el-icon class="icon-display">
                  <Picture />
                </el-icon>
              </span> -->
              <img v-if="scope.row.icon" :src="scope.row.icon" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
            </template>
          </el-table-column>
          <el-table-column prop="catelogName" header-align="center" align="center" label="所属分类" width="120" class-name="border-right"></el-table-column>
          <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
            <template #default="scope">
              <div class="operation-buttons">
                <el-link type="primary" @click="relationHandle(scope.row.attrGroupId)" class="operation-link">
                  关联属性
                </el-link>
                <div class="button-group">
                  <el-link type="primary" @click="addOrUpdateHandle(scope.row.attrGroupId)" class="operation-link">
                    修改
                  </el-link>
                  <el-link type="danger" @click="deleteHandle(scope.row.attrGroupId, scope.row.attrGroupName)" class="operation-link">
                    删除
                  </el-link>
                </div>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <Pagination :total="totalPage" v-model:page="pageIndex" v-model:limit="pageSize"
          @pagination="getDataList" style="margin-top: 20px;" :hidden="false" />

        <!-- 弹窗, 新增 / 修改 -->
        <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"
        ></add-or-update>

        <relation-update v-if="relationVisible" ref="relationUpdate" @refreshDataList="getDataList"
        ></relation-update>
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'
import { Plus } from '@element-plus/icons-vue'
import Category from "@/components/category"
import AddOrUpdate from "./attrgroup-add-or-update"
import RelationUpdate from "./attr-group-relation"
import Pagination from '@/components/Pagination/index.vue'
import { listBaseAttrGroup, deleteAttrGroupByIds } from '@/api/product/attr/group'

const { proxy } = getCurrentInstance()

// 注册组件
const components = {
  Pagination
}

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
const relationVisible = ref(false)

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
  listBaseAttrGroup(catId.value, {
    page: pageIndex.value,
    limit: pageSize.value,
    key: dataForm.key
  }).then(({data:{ totalCount,list,pageSize: returnedPageSize,currPage }}) => {
    console.log(currPage)
    console.log('获取分组列表成功:', list, 'totalCount:', totalCount);
    dataList.value = list || []
    totalPage.value = Number.parseInt(totalCount) || 0
    if (returnedPageSize) {
      pageSize.value = Number.parseInt(returnedPageSize)
    }
    if (currPage) {
      pageIndex.value = Number.parseInt(currPage)
    }
  }).catch((error) => {
    console.error('获取数据失败:', error)
    dataList.value = []
    totalPage.value = 0
  }).finally(() => {
    catId.value = 0
    dataListLoading.value = false
  })
}

const getAllDataList = () => {
  catId.value = 0
  dataForm.key = ''
  getDataList()
}


const selectionChangeHandle = (val) => {
  dataListSelections.value = val
}

const addOrUpdateHandle = (id) => {
  addOrUpdateVisible.value = true
  proxy.$nextTick(() => {
    proxy.$refs.addOrUpdate.init(id, catId.value)
  })
}

const relationHandle = (id) => {
  relationVisible.value = true
  proxy.$nextTick(() => {
    proxy.$refs.relationUpdate.init(id)
  })
}

const deleteHandle = (id,name) => {
  let ids = id ? [id] : dataListSelections.value.map(item => {
    return item.attrGroupId
  })
  let name1 = ids.length == 1 ? name : dataListSelections.value.filter(item => {
    return ids.includes(item.attrGroupId)
  }).map(item => item.attrGroupName).join(',')
  proxy.$confirm(`确定对分组${name1}进行删除操作?`, '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    // TODO: 调用删除API
    dataListLoading.value = true
    deleteAttrGroupByIds(ids).then(({ code }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getDataList()
      } else {
        throw new Error()
      }
    }).catch(() => {
      proxy.$message.error('删除失败，请稍后再试')
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

<style scoped>
.mod-config {
  padding: 20px;
}

.operation-buttons {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
}

.button-group {
  display: flex;
  gap: 8px;
}

.operation-link {
  font-size: 12px;
  text-decoration: none;
  cursor: pointer;
}

.operation-link:hover {
  text-decoration: underline;
}

/* 添加表格列之间的分隔线 */
:deep(.el-table .border-right) {
  border-right: 1px solid #dcdfe6 !important;
}

:deep(.el-table th.border-right) {
  border-right: 1px solid #dcdfe6 !important;
}

/* 图标样式 */
.icon-container {
  display: flex;
  justify-content: center;
  align-items: center;
}

.icon-display {
  font-size: 16px;
  color: #409eff;
}

.icon {
  width: 16px;
  height: 16px;
  fill: currentColor;
}

.icon-image {
  width: 20px;
  height: 20px;
  object-fit: contain;
}
</style>