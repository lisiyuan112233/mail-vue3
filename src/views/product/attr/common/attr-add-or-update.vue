<template>
  <el-dialog
    :title="!dataForm.id ? '新增' : '修改'"
    :close-on-click-modal="false"
    v-model="visible"
    @closed="dialogClose"
  >
    <el-form :model="dataForm" :rules="dataRule" ref="dataForm" label-width="120px">
      <!--       @keyup.enter.native="dataFormSubmit()" -->
      <el-form-item label="属性名" prop="attrName">
        <el-input v-model="dataForm.attrName" placeholder="属性名"></el-input>
      </el-form-item>
      <el-form-item label="属性类型" prop="attrType">
        <el-select v-model="dataForm.attrType" placeholder="请选择">
          <el-option label="规格参数" :value="1"></el-option>
          <el-option label="销售属性" :value="0"></el-option>
        </el-select>
      </el-form-item>

      <el-form-item label="值类型" prop="valueType">
        <el-switch
          v-model="dataForm.valueType"
          active-text="允许多个值"
          inactive-text="只能单个值"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :inactive-value="0"
          :active-value="1"
        ></el-switch>
      </el-form-item>
      <el-form-item label="可选值" prop="valueSelect">
        <!-- <el-input v-model="dataForm.valueSelect"></el-input> -->
        <el-select
          v-model="dataForm.valueSelect"
          multiple
          filterable
          allow-create
          placeholder="请输入内容"
        ></el-select>
      </el-form-item>
      <el-form-item label="属性图标" prop="icon">
        <el-input v-model="dataForm.icon" placeholder="属性图标"></el-input>
      </el-form-item>
      <el-form-item label="所属分类" prop="catelogId">
        <category-cascader :catelogPath.sync="catelogPath"></category-cascader>
      </el-form-item>
      <el-form-item label="所属分组" prop="attrGroupId" v-if="type == 1">
        <el-select ref="groupSelect" v-model="dataForm.attrGroupId" placeholder="请选择">
          <el-option
            v-for="item in attrGroups"
            :key="item.attrGroupId"
            :label="item.attrGroupName"
            :value="item.attrGroupId"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="可检索" prop="searchType" v-if="type == 1">
        <el-switch
          v-model="dataForm.searchType"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
      </el-form-item>
      <el-form-item label="快速展示" prop="showDesc" v-if="type == 1">
        <el-switch
          v-model="dataForm.showDesc"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
      </el-form-item>
      <el-form-item label="启用状态" prop="enable">
        <el-switch
          v-model="dataForm.enable"
          active-color="#13ce66"
          inactive-color="#ff4949"
          :active-value="1"
          :inactive-value="0"
        ></el-switch>
      </el-form-item>
    </el-form>
    <span slot="footer" class="dialog-footer">
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="dataFormSubmit()">确定</el-button>
    </span>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, watch, nextTick, getCurrentInstance } from 'vue'
import CategoryCascader from "../common/category-cascader"

const props = defineProps({
  type: {
    type: Number,
    default: 1
  }
})

const emit = defineEmits(['refreshDataList'])

const { proxy } = getCurrentInstance()

const visible = ref(false)
const dataForm = reactive({
  attrId: 0,
  attrName: "",
  searchType: 0,
  valueType: 1,
  icon: "",
  valueSelect: "",
  attrType: 1,
  enable: 1,
  catelogId: "",
  attrGroupId: "",
  showDesc: 0
})

const catelogPath = ref([])
const attrGroups = ref([])

const dataRule = reactive({
  attrName: [
    { required: true, message: "属性名不能为空", trigger: "blur" }
  ],
  searchType: [
    {
      required: true,
      message: "是否需要检索不能为空",
      trigger: "blur"
    }
  ],
  valueType: [
    {
      required: true,
      message: "值类型不能为空",
      trigger: "blur"
    }
  ],
  icon: [
    { required: true, message: "属性图标不能为空", trigger: "blur" }
  ],
  attrType: [
    {
      required: true,
      message: "属性类型不能为空",
      trigger: "blur"
    }
  ],
  enable: [
    {
      required: true,
      message: "启用状态不能为空",
      trigger: "blur"
    }
  ],
  catelogId: [
    {
      required: true,
      message: "需要选择正确的三级分类数据",
      trigger: "blur"
    }
  ],
  showDesc: [
    {
      required: true,
      message: "快速展示不能为空",
      trigger: "blur"
    }
  ]
})

// 监听分类路径变化
watch(catelogPath, (path) => {
  //监听到路径变化需要查出这个三级分类的分组信息
  console.log("路径变了", path);
  attrGroups.value = [];
  dataForm.attrGroupId = "";
  dataForm.catelogId = path[path.length - 1];
  if (path && path.length == 3) {
    proxy.$http({
      url: proxy.$http.adornUrl(
        `/product/attrgroup/list/${path[path.length - 1]}`
      ),
      method: "get",
      params: proxy.$http.adornParams({ page: 1, limit: 10000000 })
    }).then(({ data }) => {
      if (data && data.code === 0) {
        attrGroups.value = data.page.list;
      } else {
        proxy.$message.error(data.msg);
      }
    });
  } else if (path.length == 0) {
    dataForm.catelogId = "";
  } else {
    proxy.$message.error("请选择正确的分类");
    dataForm.catelogId = "";
  }
})

const init = (id) => {
  dataForm.attrId = id || 0;
  dataForm.attrType = props.type;
  visible.value = true;
  nextTick(() => {
    proxy.$refs["dataForm"].resetFields();
    if (dataForm.attrId) {
      proxy.$http({
        url: proxy.$http.adornUrl(
          `/product/attr/info/${dataForm.attrId}`
        ),
        method: "get",
        params: proxy.$http.adornParams()
      }).then(({ data }) => {
        if (data && data.code === 0) {
          dataForm.attrName = data.attr.attrName;
          dataForm.searchType = data.attr.searchType;
          dataForm.valueType = data.attr.valueType;
          dataForm.icon = data.attr.icon;
          dataForm.valueSelect = data.attr.valueSelect.split(";");
          dataForm.attrType = data.attr.attrType;
          dataForm.enable = data.attr.enable;
          dataForm.catelogId = data.attr.catelogId;
          dataForm.showDesc = data.attr.showDesc;
          //attrGroupId
          //catelogPath
          catelogPath.value = data.attr.catelogPath;
          nextTick(() => {
            dataForm.attrGroupId = data.attr.attrGroupId;
          });
        }
      });
    }
  });
}

// 表单提交
const dataFormSubmit = () => {
  proxy.$refs["dataForm"].validate(valid => {
    if (valid) {
      proxy.$http({
        url: proxy.$http.adornUrl(
          `/product/attr/${!dataForm.attrId ? "save" : "update"}`
        ),
        method: "post",
        data: proxy.$http.adornData({
          attrId: dataForm.attrId || undefined,
          attrName: dataForm.attrName,
          searchType: dataForm.searchType,
          valueType: dataForm.valueType,
          icon: dataForm.icon,
          valueSelect: dataForm.valueSelect.join(";"),
          attrType: dataForm.attrType,
          enable: dataForm.enable,
          catelogId: dataForm.catelogId,
          attrGroupId: dataForm.attrGroupId,
          showDesc: dataForm.showDesc
        })
      }).then(({ data }) => {
        if (data && data.code === 0) {
          proxy.$message({
            message: "操作成功",
            type: "success",
            duration: 1500,
            onClose: () => {
              visible.value = false;
              emit("refreshDataList");
            }
          });
        } else {
          proxy.$message.error(data.msg);
        }
      });
    }
  });
}

//dialogClose
const dialogClose = () => {
  catelogPath.value = [];
}

// 暴露方法给父组件调用
defineExpose({
  init
})
</script>
