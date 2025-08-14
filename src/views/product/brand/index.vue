<template>
  <div class="app-container">
    <el-form :model="queryParams" ref="queryFormRef" size="small" :inline="true" v-show="showSearch" label-width="75px">
      <el-form-item label="品牌名" prop="name">
        <el-input v-model="queryParams.name" placeholder="请输入品牌名" @keyup.enter="handleQuery" />
      </el-form-item>
      <el-form-item label="检索首字母" prop="firstLetter">
        <el-input v-model="queryParams.firstLetter" placeholder="请输入检索首字母" @keyup.enter="handleQuery" />
      </el-form-item>
      <!-- <el-form-item label="排序" prop="sort">
        <el-input v-model="queryParams.sort" placeholder="请输入排序" @keyup.enter="handleQuery" />
      </el-form-item> -->
      <el-form-item>
        <el-button type="primary" icon="Search" size="small" @click="handleQuery">搜索</el-button>
        <el-button icon="Refresh" size="small" @click="resetQuery">重置</el-button>
      </el-form-item>
    </el-form>

    <el-row :gutter="10" class="mb8">
      <el-col :span="1.5">
        <el-button type="primary" plain icon="Plus" size="small" @click="handleAdd">新增</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="success" plain icon="Edit" size="small" :disabled="single" @click="handleUpdate">修改</el-button>
      </el-col> -->
      <el-col :span="1.5">
        <el-button type="danger" plain icon="Delete" size="small" :disabled="multiple"
          @click="handleDelete">删除</el-button>
      </el-col>
      <!-- <el-col :span="1.5">
        <el-button type="warning" plain icon="Download" size="small" @click="handleExport">导出</el-button>
      </el-col> -->
      <right-toolbar v-model:showSearch="showSearch" @queryTable="resetAndGetList"></right-toolbar>
    </el-row>

    <el-dialog title="已关联分类" v-model="relationOpen" width="600px">
      <el-dialog title="新建关联分类" v-model="relationOpenInner" width="650px" append-to-body>
        <el-form :inline="true" :model="relationFormInner" ref="relationFormInnerRef" size="small" label-width="90px" style="height: 300px;"
          @submit.prevent="getNoRelationCatLists">
          <el-form-item label="检索条件" prop="key">
            <el-input v-model="relationFormInner.key" placeholder="请输入检索条件(分类名)"
              @Keyup.enter.native.stop="getNoRelationCatLists" />
          </el-form-item>
          <el-form-item>
            <el-button size="small" type="primary" @click="getNoRelationCatLists">查询</el-button>
          </el-form-item>
          <el-table :data="relationInnerDataList" style="width: 100%">
            <el-table-column label="分类名" prop="name" />
            <el-table-column label="操作">
              <template #default="scope">
                <el-button size="small" type="primary" link icon="Plus"
                  @click="handleAddRelationInner(scope.row)">关联</el-button>
              </template>
            </el-table-column>
          </el-table>
          <pagination :pagerCount="2" :total="relationInnerPage.total" v-model:page="relationInnerPage.pageNum"
            v-model:limit="relationInnerPage.pageSize" @pagination="getNoRelationCatLists" :hidden="false" />
          <template #footer>
            <div class="dialog-footer">
              <el-button type="primary" @click="relationOpenInner = false">确 定</el-button>
            </div>
          </template>
        </el-form>
      </el-dialog>

      <el-form :model="relationForm" ref="relationFormRef" size="small" :inline="true" label-width="70px"
        @submit.prevent="getRelationAttrs">
        <el-form-item>
          <el-button size="small" icon="Plus" type="primary" @click="handleAddRelation">新建关联</el-button>
        </el-form-item>

        <el-form-item label="检索条件" prop="key">

          <el-input v-model="relationForm.key" placeholder="请输入检索条件(分类名)" @Keyup.enter.native.stop="getRelationAttrs" />
        </el-form-item>
        <el-form-item>
          <el-button size="small" type="primary" @click="getRelationAttrs">查询</el-button>
        </el-form-item>
      </el-form>
      <el-table :data="relationDataList" style="width: 100%">
        <el-table-column label="品牌名" prop="brandName" />
        <el-table-column label="分类名称" prop="catelogName" />
        <el-table-column label="操作">
          <template #default="scope">
            <el-button size="small" type="primary" link icon="Delete"
              @click="handleDeleteRelation(scope.row)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>
      <pagination :total="relationPage.total" v-model:page="relationPage.pageNum" v-model:limit="relationPage.pageSize"
        @pagination="getRelationAttrs" :hidden="false" />
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="relationOpen = false">确 定</el-button>
        </div>
      </template>
    </el-dialog>
    <el-table v-loading="loading" :data="brandList" @selection-change="handleSelectionChange">
      <el-table-column type="selection" width="55" align="center" />
      <el-table-column type="index" label="序号" align="center" min-width="80px" />
      <el-table-column label="品牌名" align="center" prop="name" min-width="120px" />
      <el-table-column label="品牌logo地址" align="center" prop="logo">
        <template #default="scope">
          <img :src="scope.row.logo" style="width: auto;height: 60px;" />
        </template>
      </el-table-column>
      <el-table-column label="介绍" align="center" prop="descript" />
      <el-table-column label="显示状态" align="center" prop="showStatus">
        <template #default="scope">
          <el-switch v-model="scope.row.showStat" @change="(val) => ChangeStatus(scope.row.brandId, val)"
            active-color="#13ce66" inactive-color="#ff4949" />
        </template>
      </el-table-column>

      <el-table-column label="检索首字母" align="center" prop="firstLetter" />
      <el-table-column label="排序" align="center" prop="sort" />
      <el-table-column label="操作" align="center" class-name="small-padding fixed-width">
        <template #default="scope">
          <el-button size="small" type="primary" link icon="Edit"
            @click="handleRelation(scope.row.brandId)">关联分类</el-button>
          <el-button size="small" type="primary" link icon="Edit" @click="handleUpdate(scope.row)">修改</el-button>
          <el-button size="small" type="primary" link icon="Delete" @click="handleDelete(scope.row)">删除</el-button>
        </template>
      </el-table-column>
    </el-table>

    <pagination :total="total" v-model:page="queryParams.pageNum" v-model:limit="queryParams.pageSize"
      @pagination="getList" style="margin-top: 20px;" />

    <!-- 添加或修改品牌对话框 -->
    <el-dialog :title="title" v-model="open" width="600px" append-to-body>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px">
        <el-form-item label="品牌名" prop="name">
          <el-input v-model="form.name" placeholder="请输入品牌名" />
        </el-form-item>
        <el-form-item label="品牌logo">
          <el-upload class="avatar-uploader" action="#" :auto-upload="false" accept="image/*" :show-file-list="false"
            :file-list="fileList" :limit="1" :on-change="handleFileChange">
            <img v-if="form.logo || previewUrls" :src="imgsUrl" class="avatar" />
            <el-icon v-else class="avatar-uploader-icon">
              <Plus />
            </el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="介绍" prop="descript">
          <el-input v-model="form.descript" type="textarea" placeholder="请输入内容" />
        </el-form-item>
        <el-form-item label="显示状态">
          <el-switch v-model="form.showStat" inline-prompt active-text="是" inactive-text="否" />
        </el-form-item>

        <el-form-item label="检索首字母" prop="firstLetter">
          <el-input v-model="form.firstLetter" placeholder="请输入首字母" />
        </el-form-item>
        <el-form-item label="排序" prop="sort">
          <el-input v-model="form.sort" placeholder="请输入排序" />
        </el-form-item>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button type="primary" @click="submitForm">确 定</el-button>
          <el-button @click="cancel">取 消</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="Brand">
import { ref, reactive, onMounted } from 'vue'
import { ElMessageBox } from 'element-plus'
import { Plus } from '@element-plus/icons-vue';
import {
  listBrand, getBrand, delBrand, addBrand,
  updateBrand, ChangeBrandStatus, delBrandBatch
  , getRelationForBrand, deleteRelationForBrandAndCat
  , addRelationForBrandAndCat, getNoRelationCatList
} from "@/api/product/brand"
import { getUploadSignature } from "@/api/common/fileStore.js"
import { generateUUID } from "@/utils/UUID.js"

const { proxy } = getCurrentInstance()

// 遮罩层
const loading = ref(true)
// 选中数组
const ids = ref([])
// 非单个禁用
const single = ref(true)
// 非多个禁用
const multiple = ref(true)
// 显示搜索条件
const showSearch = ref(true)
// 总条数
const total = ref(0)
// 品牌表格数据
const brandList = ref([])
// 弹出层标题
const title = ref("")
// 是否显示弹出层
const open = ref(false)
// 上传文件列表
const fileList = ref([]);
// 关联品牌表单数据
const relationForm = reactive({
  key: "",
  brandId: null
})
// 关联品牌表格数据
const relationDataList = ref([])
const relationInnerDataList = ref([])
// 关联品牌分页数据
const relationPage = reactive({
  pageNum: 1,
  pageSize: 5,
  key: "",
  total: 0
})
const relationInnerPage = reactive({
  pageNum: 1,
  pageSize: 5,
  key: "",
  total: 0
})
// 是否显示关联分类弹出层
const relationOpen = ref(false)
const relationOpenInner = ref(false)
const relationFormInner = reactive({
  key: ""
})
// 查询参数
const queryParams = reactive({
  pageNum: 1,
  pageSize: 5,
  name: null,
  firstLetter: null
})

// 是否改变了文件
const fileChangeTag = ref(false)
// 表单参数
const form = ref({})
const imgsUrl = ref('');
// 表单校验
const rules = ref({
  name: [
    { required: true, message: '品牌名不能为空', trigger: 'blur' },
    { min: 2, max: 50, message: '品牌名长度应在2到50个字符之间', trigger: 'blur' }
  ],
  firstLetter: [
    { required: true, message: '检索首字母不能为空', trigger: 'blur' },
    { pattern: /^[A-Za-z]$/, message: '检索首字母必须是单个英文字母', trigger: 'blur' }
  ],
  sort: [
    { pattern: /^\d+$/, message: '排序必须是数字', trigger: 'blur' }
  ]
})
// 预览图片地址
const previewUrls = ref("");
// 表单引用
const formRef = ref()
const queryFormRef = ref()

// 处理图片预览
function handleFileChange(uploadFile) {
  console.log('上传文件:', uploadFile)
  if (uploadFile.raw && uploadFile.raw.type.startsWith('image/')) {
    console.log('处理图片预览:', uploadFile.raw)
    let reader = new FileReader();
    // 读取文件为DataURL（Base64格式）
    reader.readAsDataURL(uploadFile.raw);
    // 读取完成后生成预览地址
    reader.onload = (e) => {
      console.log('生成预览地址:', e)
      previewUrls.value = e.target.result;
      imgsUrl.value = previewUrls.value;
      fileChangeTag.value = true;
      fileList.value[0] = uploadFile;
    }
  } else {
    fileList.value = [];
    proxy.$message.error("文件格式不支持")
  }
}

/** 查询品牌列表 */
function resetAndGetList() {
  proxy.resetForm("queryFormRef")
  getList()
}
function getList() {
  loading.value = true
  listBrand(queryParams).then(response => {
    // 创建一个标志，表示这是从API获取的数据，不应触发状态变更事件
    // window._isLoadingData = true
    console.log('获取品牌列表成功:', response)
    // 处理数据
    const processedData = response.data.map(item => ({
      ...item,
      showStat: item.showStat === 1,
    }))

    // 赋值
    brandList.value = processedData

    // 确保total值有效，如果response.total为0或undefined，则设置为processedData.length
    total.value = Number.parseInt(response.total) || 0
    console.log('设置total值:', total.value)

    loading.value = false
  }).catch(() => {
    proxy.$modal.msgError('获取品牌列表失败')
    loading.value = false
  })
}

function ChangeStatus(brandId, showStat) {
  // 如果是从API加载数据，不执行状态变更
  // if (window._isLoadingData) {
  //   return;
  // }

  ChangeBrandStatus({ brandId: brandId, showStat: showStat ? 1 : 0 }).then(res => {
    if (res.code === 200) {
      proxy.$modal.msgSuccess('状态修改成功')
    } else {
      throw new Error()
    }
  }).catch(() => {
    proxy.$modal.msgError('状态修改失败')
    brandList.value.find(item => item.brandId === brandId).showStat = !showStat
  })
}
// 取消按钮
function cancel() {
  open.value = false
  reset()
}

// 表单重置
function reset() {
  form.value = {
    brandId: null,
    name: null,
    logo: null,
    descript: null,
    showStat: null,
    firstLetter: null,
    sort: null
  }
  imgsUrl.value = "";
  fileList.value = []
  previewUrls.value = "";
  fileChangeTag.value = false
  proxy.resetForm("formRef")
}

/** 搜索按钮操作 */
function handleQuery() {
  queryParams.pageNum = 1
  loading.value = true
  listBrand(queryParams).then(response => {
    // 创建一个标志，表示这是从API获取的数据，不应触发状态变更事件
    // window._isLoadingData = true

    // 处理数据
    const processedData = response.data.map(item => ({
      ...item,
      showStat: item.showStat === 1
    }))

    // 赋值
    brandList.value = processedData
    total.value = Number.parseInt(response.total) || 0

    // 在下一个事件循环中移除标志
    // setTimeout(() => {
    //   window._isLoadingData = false
    // }, 0)
  }).catch(() => {
    proxy.$modal.msgError('获取品牌列表失败')
  }).finally(() => {
    loading.value = false
  })
}

/** 重置按钮操作 */
function resetQuery() {
  proxy.resetForm("queryFormRef")
  handleQuery()
}
/** 建立关联关系 */
function handleAddRelationInner(row) {
  ElMessageBox.confirm(`是否建立与${row.name}关系?`).then(() => {
    loading.value = true
    addRelationForBrandAndCat({
      brandId:relationForm.brandId,
      catId: row.catId
    }).then(({ code, msg }) => {
      if (code === 200) {
        proxy.$modal.msgSuccess('添加成功')
        relationOpenInner.value = false
        getRelationAttrs()
      } else {
        throw new Error(msg)
      }
    }).catch(err => {
      proxy.$modal.msgError(err.msg || '添加失败')
    }).finally(() => {
      loading.value = false
    })
  })
}
// 多选框选中数据
function handleSelectionChange(selection) {
  ids.value = selection.map(item => item.brandId)
  single.value = selection.length !== 1
  multiple.value = !selection.length
}
/** 获取未关联分类 */
function getNoRelationCatLists() {
  loading.value = true
  getNoRelationCatList(relationForm.brandId, {
    limit: relationInnerPage.pageSize,
    page: relationInnerPage.pageNum,
    key: relationFormInner.key
  }).then(({ data: { list, totalCount }, code }) => {
    if (code === 200) {
      relationInnerDataList.value = list
      relationInnerPage.total = Number.parseInt(totalCount) || 0
    } else {
      throw new Error()
    }
  }).catch(() => {
    proxy.$modal.msgError('获取未关联分类失败')
  }).finally(() => {
    loading.value = false
  })
}
/** 新建关联分类按钮操作 */
function handleAddRelation() {
  relationOpenInner.value = true
  getNoRelationCatLists()

}
function getRelationAttrs() {
  loading.value = true
  getRelationForBrand(relationForm.brandId, {
    limit: relationPage.pageSize,
    page: relationPage.pageNum,
    key: relationForm.key
  }).then(({ data: { list, totalCount }, code }) => {

    if (code === 200) {
      relationDataList.value = list
      relationPage.total = Number.parseInt(totalCount) || 0
    } else {
      throw new Error()
    }
  }).catch(() => {
    proxy.$modal.msgError("获取关联属性失败")
  }).finally(() => {
    loading.value = false
  })
}
function handleDeleteRelation(row) {
  ElMessageBox.confirm(`是否确认删除关系 ${row.brandName}<->${row.catelogName}?`).then(() => {
    loading.value = true
    deleteRelationForBrandAndCat(row.brandId, row.catelogId).then(({ code, msg }) => {
      if (code == 200) {
        proxy.$modal.msgSuccess(msg)
        getRelationAttrs()
      } else {
        throw new Error(msg)
      }
    }).catch((err) => {
      proxy.$modal.msgError(err.msg)
    }).finally(() => {
      loading.value = false
    })
  })
}
/** 关联分类按钮操作 */
function handleRelation(brandId) {
  relationOpen.value = true
  relationForm.brandId = brandId
  getRelationAttrs()
}
/** 新增按钮操作 */
function handleAdd() {
  reset()
  open.value = true
  title.value = "添加品牌"
}

/** 修改按钮操作 */
function handleUpdate(row) {
  reset()
  const brandId = row.brandId

  getBrand(brandId).then(response => {
    form.value = response.data
    form.value.showStat = form.value.showStat === 1
    imgsUrl.value = response.data.logo
    open.value = true
    title.value = "修改品牌"
  }).catch(() => {
    proxy.$modal.msgError('品牌获取失败')
  })
}
// 抽离OSS上传逻辑为单独函数
const uploadToOSS = () => {

  return getUploadSignature()
    .then(signInfo => {
      // 1. 先校验文件
      if (fileList.value.length === 0 || !fileList.value[0].raw) {
        throw new Error("选择文件不能为空"); // 直接终止
      }

      const formData = new FormData();
      const location = signInfo.keyPrefix + generateUUID() + fileList.value[0].name;
      formData.append('OSSAccessKeyId', signInfo.accessKeyId);
      formData.append('policy', signInfo.policy);
      formData.append('signature', signInfo.signature);
      formData.append('key', location);
      formData.append('file', fileList.value[0].raw);
      console.log(formData);
      return fetch(signInfo.host, {
        method: 'POST',
        body: formData
      }).then(response => {
        console.log(response);
        if (!response.ok) {
          throw new Error('上传失败');
        }
        return signInfo.host + '/' + location;
      }).catch(error => {
        console.error('上传失败:', error);
        throw new Error('上传失败，请稍后重试');
      });
    });
};
/** 提交按钮 */
function submitForm() {
  proxy.$refs["formRef"].validate(valid => {
    if (valid) {
      loading.value = true
      // 2. 上传逻辑（根据fileChangeTag判断走OSS上传还是直接用现有logo）
      const uploadPromise = fileChangeTag.value
        ? uploadToOSS()
        : form.value.logo ? Promise.resolve(form.value.logo) : Promise.reject(new Error("品牌logo不能为空"));
      // 3. 链式调用：上传 → 提交表单 → 处理结果
      uploadPromise
        .then(async location => {
          if (form.value.brandId != null) {
            // 提交修改
            return {
              api: await updateBrand({
                ...form.value,
                showStat: form.value.showStat ? 1 : 0,
                logo: location
              }), action: '更新'
            };
          } else {
            // 提交新增
            return { api: await addBrand({ ...form.value, logo: location }), action: '添加' };
          }
        })
        .then(({ api, action }) => {
          if (api.code === 200) {
            proxy.$modal.msgSuccess(`${action}成功`);
            open.value = false;
            getList();
          } else {
            throw new Error(`${action}失败`);
          }
        })
        .catch(err => {
          // 所有异常统一在这里处理
          proxy.$modal.msgError(err.message || '操作失败');
        }).finally(() => {
          loading.value = false
        });
    }
  })
}
/** 删除按钮操作 */
function handleDelete(row) {

  const brandIds = row.brandId || ids.value
  if (row.brandId) {
    // 单个删除
    ElMessageBox.confirm(`是否确认删除品牌 ${row.name}?`).then(() => {
      delBrand(brandIds).then(res => {
        if (res.code !== 200) {
          throw new Error('删除失败')
        }
        getList()
        proxy.$modal.msgSuccess("删除成功")
      }).catch(() => {
        proxy.$modal.msgError('删除失败')
      })
    })
  } else {
    // 批量删除
    ElMessageBox.confirm(`是否确认删除选中品牌?`).then(() => {
      console.log(brandIds)
      // 确保传递的是正确格式的数据，后端期望接收 {ids: Long[]} 格式
      delBrandBatch({ ids: brandIds }).then(res => {
        if (res.code !== 200) {
          throw new Error('删除失败')
        }
        getList()
        proxy.$modal.msgSuccess("删除成功")
      }).catch((error) => {
        console.error('批量删除失败:', error)
        proxy.$modal.msgError('删除失败')
      })
    })
  }
}

/** 导出按钮操作 */
// function handleExport() {
//   proxy.download('domain/brand/export', {
//     ...queryParams
//   }, `brand_${new Date().getTime()}.xlsx`)
// }

onMounted(() => {
  getList()
})
</script>
<style lang="scss" scoped>
.avatar {
  width: 70px;
  /* 固定宽度 */
  height: 70px;
  /* 固定高度 */
  object-fit: cover;
  /* 保持比例，裁剪超出部分（常用） */
  /* 其他可选样式 */
  border-radius: 4px;
  /* 圆角 */
  border: 1px solid #eee;
  /* 边框 */
}
</style>
