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
            <el-button
              v-if="isAuth('product:attr:save')"
              type="primary"
              @click="addOrUpdateHandle()"
            >新增</el-button>
            <el-button
              v-if="isAuth('product:attr:delete')"
              type="danger"
              @click="deleteHandle()"
              :disabled="dataListSelections.length <= 0"
            >批量删除</el-button>
          </el-form-item>
        </el-form>
        <el-table
          :data="dataList"
          border
          v-loading="dataListLoading"
          @selection-change="selectionChangeHandle"
          style="width: 100%;"
        >
          <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
          <el-table-column prop="attrId" header-align="center" align="center" label="id"></el-table-column>
          <el-table-column prop="attrName" header-align="center" align="center" label="属性名"></el-table-column>
          <el-table-column prop="valueSelect" header-align="center" align="center" label="可选值">
            <template #default="scope">
              <el-tooltip class="item" effect="dark" :content="scope.row.valueSelect" placement="top">
                <el-tag
                  v-for="(item, index) in scope.row.valueSelect.split(';')"
                  :key="index"
                  style="margin-right: 5px;"
                >{{ item }}</el-tag>
              </el-tooltip>
            </template>
          </el-table-column>
          <el-table-column prop="catelogName" header-align="center" align="center" label="所属分类"></el-table-column>
          <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
            <template #default="scope">
              <el-button type="text" size="small" @click="addOrUpdateHandle(scope.row.attrId)">修改</el-button>
              <el-button type="text" size="small" @click="deleteHandle(scope.row.attrId)">删除</el-button>
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
        <!-- 弹窗, 新增 / 修改 -->
        <add-or-update
          v-if="addOrUpdateVisible"
          ref="addOrUpdate"
          :type="attrtype"
          @refreshDataList="getDataList"
        ></add-or-update>
      </div>
    </el-col>
  </el-row>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { getCurrentInstance } from 'vue'
import Category from "@/components/category"
import AddOrUpdate from "../common/attr-add-or-update"

const { proxy } = getCurrentInstance()

// Props
const props = defineProps({
  attrtype: {
    type: Number,
    default: 0
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
  console.log('父组件接收到树节点点击事件:', data, node)
  if (node.level == 3) {
    catId.value = data.catId
    getDataList()
  }
}

const getDataList = () => {
  dataListLoading.value = true
  
  // 模拟API调用延迟
  setTimeout(() => {
    // 销售属性假数据
    const mockData = [
      {
        attrId: 1,
        attrName: '颜色',
        valueSelect: '黑色;白色;红色;蓝色;金色',
        catelogName: '手机/数码/手机'
      },
      {
        attrId: 2,
        attrName: '版本',
        valueSelect: '8GB+128GB;8GB+256GB;12GB+256GB;12GB+512GB',
        catelogName: '手机/数码/手机'
      },
      {
        attrId: 3,
        attrName: '套餐类型',
        valueSelect: '官方标配;充电套装;保护套装;全套装',
        catelogName: '手机/数码/手机'
      },
      {
        attrId: 4,
        attrName: '尺码',
        valueSelect: 'S;M;L;XL;XXL',
        catelogName: '服饰/内衣/男装'
      },
      {
        attrId: 5,
        attrName: '材质',
        valueSelect: '纯棉;涤纶;混纺;丝绸;羊毛',
        catelogName: '服饰/内衣/男装'
      },
      {
        attrId: 6,
        attrName: '口味',
        valueSelect: '原味;草莓味;巧克力味;香草味;抹茶味',
        catelogName: '食品/饮料/零食'
      },
      {
        attrId: 7,
        attrName: '规格',
        valueSelect: '500ml;1L;1.5L;2L',
        catelogName: '食品/饮料/零食'
      },
      {
        attrId: 8,
        attrName: '款式',
        valueSelect: '经典款;运动款;商务款;休闲款',
        catelogName: '鞋靴/运动鞋'
      }
    ]
    
    // 根据搜索关键字过滤数据
    let filteredData = mockData
    if (dataForm.key) {
      filteredData = mockData.filter(item => 
        item.attrName.includes(dataForm.key)
      )
    }
    
    // 分页处理
    const start = (pageIndex.value - 1) * pageSize.value
    const end = start + pageSize.value
    const paginatedData = filteredData.slice(start, end)
    
    dataList.value = paginatedData
    totalPage.value = filteredData.length
    dataListLoading.value = false
  }, 500)
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
    proxy.$message({
      message: '操作成功',
      type: 'success',
      duration: 1500,
      onClose: () => {
        getDataList()
      }
    })
  })
}

const isAuth = (permission) => {
  // 权限验证逻辑
  return true
}

// 生命周期
onMounted(() => {
  getDataList()
})
</script>

<style scoped>
</style>
