<template>
  <div class="mod-config">
    <el-form :inline="true" :model="dataForm" @keyup.enter="getDataList()">
      <el-form :inline="true" :model="dataForm">
        <el-form-item label="分类">
          <category-cascader v-model:catelogPath="catelogPath"></category-cascader>
        </el-form-item>
        <el-form-item label="品牌">
          <brand-select style="width:160px"></brand-select>
        </el-form-item>
        <el-form-item label="价格">
          <el-input-number style="width:160px" v-model="dataForm.price.min" :min="0"></el-input-number>-
          <el-input-number style="width:160px" v-model="dataForm.price.max" :min="0"></el-input-number>
        </el-form-item>
        <el-form-item label="检索">
          <el-input style="width:160px" v-model="dataForm.key" clearable></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="searchSkuInfo">查询</el-button>
        </el-form-item>
      </el-form>
    </el-form>
    <el-table
      :data="dataList"
      border
      v-loading="dataListLoading"
      @selection-change="selectionChangeHandle"
      style="width: 100%;"
      @expand-change="getSkuDetails"
    >
      <el-table-column type="expand">
        <template #default="scope">
          商品标题：{{scope.row.skuTitle}}
          <br />
          商品副标题：{{scope.row.skuSubtitle}}
          <br />
          商品描述：{{scope.row.skuDesc}}
          <br />
          分类ID：{{scope.row.catalogId}}
          <br />
          SpuID：{{scope.row.spuId}}
          <br />
          品牌ID：{{scope.row.brandId}}
          <br />
        </template>
      </el-table-column>
      <el-table-column type="selection" header-align="center" align="center" width="50"></el-table-column>
      <el-table-column prop="skuId" header-align="center" align="center" label="skuId"></el-table-column>
      <el-table-column prop="skuName" header-align="center" align="center" label="名称"></el-table-column>
      <el-table-column prop="skuDefaultImg" header-align="center" align="center" label="默认图片">
        <template #default="scope">
          <img :src="scope.row.skuDefaultImg" style="width:80px;height:80px;" />
        </template>
      </el-table-column>
      <el-table-column prop="price" header-align="center" align="center" label="价格"></el-table-column>
      <el-table-column prop="saleCount" header-align="center" align="center" label="销量"></el-table-column>
      <el-table-column fixed="right" header-align="center" align="center" width="150" label="操作">
        <template #default="scope">
          <el-button type="text" size="small" @click="previewHandle(scope.row.skuId)">预览</el-button>
          <el-button type="text" size="small" @click="commentHandle(scope.row.skuId)">评论</el-button>
          <el-dropdown
            @command="handleCommand(scope.row,$event)"
            size="small"
            split-button
            type="text"
          >
            更多
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item command="uploadImages">上传图片</el-dropdown-item>
                <el-dropdown-item command="seckillSettings">参与秒杀</el-dropdown-item>
                <el-dropdown-item command="reductionSettings">满减设置</el-dropdown-item>
                <el-dropdown-item command="discountSettings">折扣设置</el-dropdown-item>
                <el-dropdown-item command="memberPriceSettings">会员价格</el-dropdown-item>
                <el-dropdown-item command="stockSettings">库存管理</el-dropdown-item>
                <el-dropdown-item command="couponSettings">优惠劵</el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
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
import CategoryCascader from "../common/category-cascader"
import BrandSelect from "../common/brand-select"

const { proxy } = getCurrentInstance()
const router = useRouter()

let catPathSub = null
let brandIdSub = null

const dataForm = reactive({
  key: "",
  brandId: 0,
  catelogId: 0,
  price: {
    min: 0,
    max: 0
  }
})

const dataList = ref([])
const pageIndex = ref(1)
const pageSize = ref(10)
const totalPage = ref(0)
const dataListLoading = ref(false)
const dataListSelections = ref([])
const addOrUpdateVisible = ref(false)
const catelogPath = ref([])

const getSkuDetails = (row, expand) => {
  //sku详情查询
  console.log("展开某行...", row, expand);
}

//处理更多指令
const handleCommand = (row, command) => {
  console.log("~~~~~", row, command);
  if ("stockSettings" == command) {
    router.push({ path: "/ware-sku", query: { skuId: row.skuId } });
  }
}

const searchSkuInfo = () => {
  getDataList();
}

// 获取数据列表
const getDataList = () => {
  dataListLoading.value = true;
  proxy.$http({
    url: proxy.$http.adornUrl("/product/skuinfo/list"),
    method: "get",
    params: proxy.$http.adornParams({
      page: pageIndex.value,
      limit: pageSize.value,
      key: dataForm.key,
      catelogId: dataForm.catelogId,
      brandId: dataForm.brandId,
      min: dataForm.price.min,
      max: dataForm.price.max
    })
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

onMounted(() => {
  catPathSub = PubSub.subscribe("catPath", (msg, val) => {
    dataForm.catelogId = val[val.length - 1];
  });
  brandIdSub = PubSub.subscribe("brandId", (msg, val) => {
    dataForm.brandId = val;
  });
})

onActivated(() => {
  getDataList();
})

onBeforeUnmount(() => {
  PubSub.unsubscribe(catPathSub);
  PubSub.unsubscribe(brandIdSub);
})
</script>
