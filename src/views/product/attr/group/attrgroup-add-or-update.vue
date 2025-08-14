<template>
  <el-dialog :title="!dataForm.attrGroupId ? '新增' : '修改'" :close-on-click-modal="false" v-model="visible"
    @closed="dialogClose">
    <el-form :model="dataForm" :rules="dataRule" ref="dataFormRef" @keyup.enter="dataFormSubmit()" label-width="120px">
      <el-form-item label="组名" prop="attrGroupName">
        <el-input v-model="dataForm.attrGroupName" placeholder="请输入组名" clearable></el-input>
      </el-form-item>
      <el-form-item label="排序" prop="sort">
        <el-input-number v-model="dataForm.sort" :min="0" :max="999" placeholder="排序"
          style="width: 100%"></el-input-number>
      </el-form-item>
      <el-form-item label="描述" prop="descript">
        <el-input v-model="dataForm.descript" type="textarea" :rows="3" placeholder="请输入描述" clearable></el-input>
      </el-form-item>
      <el-form-item label="组图标" prop="icon">
        <el-input v-model="dataForm.icon" placeholder="请输入图标类名，如：el-icon-mobile-phone" clearable>
          <template #append>
            <el-icon v-if="dataForm.icon">
              <component :is="dataForm.icon" />
            </el-icon>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item label="所属分类" prop="catelogId">
        <category-cascader v-model:catelogPath="catelogPath"></category-cascader>
      </el-form-item>
    </el-form>
    <template #footer>
      <div class="dialog-footer">
        <el-button @click="visible = false">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit" :loading="loading">确定</el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, reactive, nextTick, watch } from 'vue'
import { getCurrentInstance } from 'vue'
import CategoryCascader from '@/components/category-cascader'
import { getAttrGroupInfo, addAttrGroup } from '@/api/product/attr/group'
const { proxy } = getCurrentInstance()

// 定义事件
const emit = defineEmits(['refreshDataList'])

// 响应式数据
const visible = ref(false)
const loading = ref(false)
const catelogPath = ref([])

const dataForm = reactive({
  attrGroupId: '',
  attrGroupName: '',
  catelogId: '',
  descript: '',
  icon: '',
  sort: 0
})

// 表单引用
const dataFormRef = ref()

// 校验规则
const dataRule = reactive({
  attrGroupName: [
    { required: true, message: '组名不能为空', trigger: 'blur' },
    { min: 2, max: 20, message: '组名长度在 2 到 20 个字符', trigger: 'blur' },
    { pattern: /^[\u4e00-\u9fa5a-zA-Z0-9_-]+$/, message: '组名只能包含中文、英文、数字、下划线和横线', trigger: 'blur' }
  ],
  sort: [
    { required: true, message: '排序不能为空', trigger: 'blur' },
    { type: 'number', min: 0, max: 999, message: '排序必须是0-999之间的数字', trigger: 'blur' }
  ],
  descript: [
    { max: 200, message: '描述长度不能超过200个字符', trigger: 'blur' }
  ],
  icon: [
    { max: 50, message: '图标类名长度不能超过50个字符', trigger: 'blur' },
    { pattern: /^[a-zA-Z0-9-_]*$/, message: '图标类名只能包含英文、数字、横线和下划线', trigger: 'blur' }
  ]
})

// 方法
const init = (id, catId) => {
  dataForm.attrGroupId = id || ''
  visible.value = true

  nextTick(() => {
    if (dataFormRef.value) {
      dataFormRef.value.resetFields()
    }

    if (dataForm.attrGroupId) {
      // 编辑模式 - 获取详情
      getInfo()
    } else {
      // 新增模式 - 设置默认分类
      if (catId) {
        dataForm.catelogId = catId
        // 这里可能需要根据catId设置catelogPath
        // setCatelogPath(catId)
      }
    }
  })
}

const getInfo = () => {
  // TODO: 获取属性分组详情
  getAttrGroupInfo(dataForm.attrGroupId).then(({ data,code }) => {
    if (data && code === 200) {
      console.log('属性分组详情:', data)
      const info = {...data, catelogPath: data.catelogPath.slice().reverse()}
      dataForm.attrGroupName = info.attrGroupName
      dataForm.catelogId = info.catelogId
      dataForm.descript = info.descript
      dataForm.icon = info.icon
      dataForm.sort = info.sort
      // 设置分类路径
      setCatelogPath(info.catelogPath)
    }
  }).catch((err) => {
    console.log('获取属性分组详情失败:', err)
    proxy.$message.error('获取属性分组信息失败')
  })

  // 临时模拟数据
  // setTimeout(() => {
  //   dataForm.attrGroupName = '主体'
  //   dataForm.catelogId = 225
  //   dataForm.descript = '主体信息'
  //   dataForm.icon = 'el-icon-mobile-phone'
  //   dataForm.sort = 1
  //   catelogPath.value = [1, 2, 225] // 模拟分类路径
  // }, 100)
}
const setCatelogPath = (catelogIds) => {
  catelogPath.value = []
  if (catelogIds && catelogIds.length > 0) {
    catelogPath.value= catelogIds
  }
}


const dataFormSubmit = () => {
  if (dataFormRef.value) {
    dataFormRef.value.validate((valid) => {
      if (valid) {
        loading.value = true

        // TODO: 提交数据
        // const url = dataForm.attrGroupId 
        //   ? `/product/attrgroup/update` 
        //   : `/product/attrgroup/save`

        addAttrGroup({
          attrGroupId: dataForm.attrGroupId || undefined,
          attrGroupName: dataForm.attrGroupName,
          catelogId: dataForm.catelogId,
          descript: dataForm.descript,
          icon: dataForm.icon,
          sort: dataForm.sort
        }).then(({ code }) => {
          if (code === 200) {
            proxy.$message.success('操作成功')
            visible.value = false
            emit('refreshDataList')
          } else {
            proxy.$message.error(data.msg)
          }
        }).catch(() => {
          proxy.$message.error('操作失败，请稍后再试')
        }).finally(() => {
          loading.value = false
        })

        // 临时模拟提交成功
        // setTimeout(() => {
        //   proxy.$message.success('操作成功')
        //   visible.value = false
        //   emit('refreshDataList')
        //   loading.value = false
        // }, 1000)
      }
    })

  }
}

const dialogClose = () => {
  // 重置表单数据
  Object.assign(dataForm, {
    attrGroupId: '',
    attrGroupName: '',
    catelogId: '',
    descript: '',
    icon: '',
    sort: 0
  })
  catelogPath.value = []
}
watch(() => catelogPath.value, (newVal) => {
  if (Array.isArray(newVal) && newVal.length > 0) {
    dataForm.catelogId = newVal[newVal.length - 1]
    console.log('分类路径变化:', dataForm.catelogId)
  }

}, {
  deep: true
})
// 暴露方法给父组件调用
defineExpose({
  init
})
</script>

<style scoped>
.dialog-footer {
  text-align: right;
}

:deep(.el-input-number) {
  width: 100%;
}
</style>