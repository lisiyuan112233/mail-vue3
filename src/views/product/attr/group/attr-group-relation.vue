<template>
  <div>
    <el-dialog title="属性与分组关联" v-model="visible" width="90%" :close-on-click-modal="false" @closed="dialogClose">
      <!-- 内层对话框：选择属性 -->
      <el-dialog title="选择属性" v-model="innerVisible" width="50%" append-to-body>
        <div>
          <el-form :inline="true" :model="dataForm" @submit.prevent="getDataList()">
            <el-form-item>
              <el-input v-model="dataForm.key" placeholder="参数名" @Keyup.enter.native.stop="getDataList" clearable></el-input>
            </el-form-item>
            <el-form-item>
              <el-button @click="getDataList()">查询</el-button>
            </el-form-item>
          </el-form>
          <el-table :data="dataList" border v-loading="dataListLoading" @selection-change="innerSelectionChangeHandle"
            style="width: 100%;">
            <el-table-column type="selection" header-align="center" align="center"></el-table-column>
            <el-table-column prop="attrId" header-align="center" align="center" label="属性ID"></el-table-column>
            <el-table-column prop="attrName" header-align="center" align="center" label="属性名"></el-table-column>
            <el-table-column prop="icon" header-align="center" align="center" label="属性图标">
              <template #default="scope">
                <el-icon v-if="scope.row.icon" :class="scope.row.icon"></el-icon>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column prop="valueSelect" header-align="center" align="center" label="可选值列表"
              show-overflow-tooltip></el-table-column>
          </el-table>
            <pagination :total="totalPage" v-model:page="pageIndex" v-model:limit="pageSize" @pagination="getDataList"
            style="margin-top: 10px;" :hidden="false" />
          

        </div>
        <template #footer>
          <div class="dialog-footer">
            <el-button @click="innerVisible = false">取 消</el-button>
            <el-button type="primary" @click="submitAddRelation">确认新增</el-button>
          </div>
        </template>
      </el-dialog>

      <!-- 主要内容区域 -->
      <el-row>
        <el-col :span="24">
          <div style="margin-bottom: 20px;">
            <el-button type="primary" @click="addRelation">新建关联</el-button>
            <el-button type="danger" @click="batchDeleteRelation"
              :disabled="dataListSelections.length <= 0">批量删除</el-button>
          </div>

          <el-table :data="relationAttrs" style="width: 100%" @selection-change="selectionChangeHandle" border>
            <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
            <el-table-column prop="attrId" label="属性ID" header-align="center" align="center"></el-table-column>
            <el-table-column prop="attrName" label="属性名" header-align="center" align="center"></el-table-column>
            <el-table-column prop="valueSelect" label="可选值" header-align="center" align="center">
              <template #default="scope">
                <el-tooltip placement="top" v-if="scope.row.valueSelect">
                  <template #content>
                    <span v-for="(item, index) in scope.row.valueSelect.split(';')" :key="index">
                      {{ item }}
                      <br />
                    </span>
                  </template>
                  <el-tag>{{ scope.row.valueSelect.split(";")[0] + " ..." }}</el-tag>
                </el-tooltip>
                <span v-else>-</span>
              </template>
            </el-table-column>
            <el-table-column fixed="right" header-align="center" align="center" width="100" label="操作">
              <template #default="scope">
                <el-button type="text" size="small" @click="deleteRelation(scope.row.attrId)">删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-col>
      </el-row>
      <pagination :total="Rtotal" v-model:page="RpageNum" v-model:limit="RpageSize"
        @pagination="getRelationAttrs" :hidden="false" />
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="visible = false">关 闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, getCurrentInstance } from 'vue'
import { getNoRelationAttr, getRelationAttr } from '@/api/product/attr/group'
import { deleteRelationBatch, deleteRelationById, insertAttrToGroupRelations } from '@/api/product/attr/relation'
const { proxy } = getCurrentInstance()

// 定义事件
const emit = defineEmits(['refreshDataList'])

// 响应式数据
const attrGroupId = ref(0)
const visible = ref(false)
const innerVisible = ref(false)
const relationAttrs = ref([])
const dataListSelections = ref([])
const innerdataListSelections = ref([])
//分页

const Rtotal = ref(0)
const RpageSize = ref(5)
const RpageNum = ref(1)
const dataForm = reactive({
  key: ""
})

const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)

// 方法
const init = (id) => {
  attrGroupId.value = id || 0
  visible.value = true
  getRelationAttrs()
}

const getRelationAttrs = () => {
  // TODO: 获取已关联的属性列表
  dataListLoading.value = true
  getRelationAttr(attrGroupId.value, {
    page: RpageNum.value,
    limit: RpageSize.value
  }).then(({ data:{ list, totalCount }, code }) => {
    if (code === 200) {
      relationAttrs.value = list
      Rtotal.value = Number.parseInt(totalCount) || 0
    } else {
      relationAttrs.value = []
      Rtotal.value = 0
    }
  }).catch(err => {
    proxy.$model.error(err.msg || '拉取数据失败')
  }).finally(() => {
    dataListLoading.value = false
  })

  // 临时模拟数据
  // relationAttrs.value = [
  //   {
  //     attrId: 1,
  //     attrName: '颜色',
  //     valueSelect: '黑色;白色;红色;蓝色'
  //   },
  //   {
  //     attrId: 2,
  //     attrName: '内存',
  //     valueSelect: '64GB;128GB;256GB;512GB'
  //   }
  // ]
}

const addRelation = () => {
  innerVisible.value = true
  getDataList()
}

const getDataList = () => {
  dataListLoading.value = true
  // TODO: 获取可关联的属性列表（排除已关联的）
  getNoRelationAttr(attrGroupId.value, {
    page: pageIndex.value,
    limit: pageSize.value,
    key: dataForm.key
  }).then(({ data: { list, totalCount }, code }) => {
    if (code === 200) {
      dataList.value = list
      console.log("aa", totalCount)
      totalPage.value = Number.parseInt(totalCount) || 0
    } else {
      dataList.value = []
      totalPage.value = 0
    }
  }).finally(() => {
    dataListLoading.value = false
  })

  // 临时模拟数据
  // setTimeout(() => {
  //   dataList.value = [
  //     {
  //       attrId: 3,
  //       attrName: '屏幕尺寸',
  //       icon: 'el-icon-monitor',
  //       valueSelect: '5.5寸;6.1寸;6.7寸'
  //     },
  //     {
  //       attrId: 4,
  //       attrName: '电池容量',
  //       icon: 'el-icon-lightning',
  //       valueSelect: '3000mAh;4000mAh;5000mAh'
  //     }
  //   ]
  //   totalPage.value = 2
  //   dataListLoading.value = false
  // }, 500)
}

const submitAddRelation = () => {
  if (innerdataListSelections.value.length === 0) {
    proxy.$message.warning('请选择要关联的属性')
    return
  }

  const attrIds = innerdataListSelections.value.map(item => item.attrId)

  dataListLoading.value = true
  // TODO: 提交关联关系
  insertAttrToGroupRelations(attrIds.map(id => {
    return {
      attrId: id,
      attrGroupId: attrGroupId.value
    }
  })).then(({ code, msg }) => {
    if (code === 200) {
      proxy.$message.success('关联成功')
      innerVisible.value = false
      getRelationAttrs()
    } else {
      throw new Error(msg)
    }
  }).catch((err) => {
    proxy.$model.error(err.msg || '删除失败')
  }).finally(() => {
    dataListLoading.value = false
  })

  // 临时模拟成功
  // proxy.$message.success('关联成功')
  // innerVisible.value = false
  // getRelationAttrs()
}

const deleteRelation = (attrId) => {
  proxy.$confirm('确定要删除这个关联关系吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataListLoading.value = true
    // TODO: 删除单个关联关系
    deleteRelationById(attrId, attrGroupId.value).then(({ code, msg }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getRelationAttrs()
      } else {
        throw new Error(msg)
      }
    }).catch((err) => {
      proxy.$model.error(err.msg || '删除失败')
    }).finally(() => {
      dataListLoading.value = false
    })
    // 临时模拟删除成功
    // proxy.$message.success('删除成功')
    // getRelationAttrs()
  })
}

const batchDeleteRelation = () => {
  if (dataListSelections.value.length === 0) {
    proxy.$message.warning('请选择要删除的关联关系')
    return
  }

  proxy.$confirm('确定要批量删除这些关联关系吗?', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    dataListLoading.value = true
    const relations = dataListSelections.value.map(item => ({
      attrId: item.attrId,
      attrGroupId: attrGroupId.value
    }))
    // TODO: 批量删除关联关系
    deleteRelationBatch(relations).then(({ code, msg }) => {
      if (code === 200) {
        proxy.$message.success('删除成功')
        getRelationAttrs()
      } else {
        proxy.$message.error(msg)
      }
    })

    // 临时模拟删除成功
    // proxy.$message.success('删除成功')
    // getRelationAttrs()
  }).catch((err) => {
    proxy.$model.error(err.msg || '删除失败')
  }).finally(() => {
    dataListLoading.value = false
  })
}


const selectionChangeHandle = (val) => {
  dataListSelections.value = val
}

const innerSelectionChangeHandle = (val) => {
  innerdataListSelections.value = val
}

const dialogClose = () => {
  emit('refreshDataList')
}

// 暴露方法给父组件调用
defineExpose({
  init
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}
:deep(.pagination-container) {
  display: flex;
  justify-content: center;
}
</style>