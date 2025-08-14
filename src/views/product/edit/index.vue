<template>
    <div>
        <el-dialog v-model="dialogVisibleDelete" title="删除" width="500" :before-close="handleClose">
            <span>确定删除吗?</span>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogVisibleDelete = false">取消</el-button>
                    <el-button type="primary" @click="handleDeleteTo">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
        <el-switch v-model="value3" inline-prompt active-text="开启拖拽" inactive-text="关闭拖拽" style="margin-right: 10px;" />
        <el-button type="danger" :icon="Delete" circle size="small" @Click="handleDelete" />
        <el-tree style="max-width: 600px" :data="productCategoryList" :props="defaultProps" node-key="catId"
            :expand-on-click-node="false" @node-click="handleNodeClick" :default-expanded-keys="expandKeys"
            :allow-drop="allowDrop" @node-drop="handleDrop" :draggable="value3" ref="tree" show-checkbox>
            <template #default="{ node, data }">
                <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
                    <span>{{ data.name }}</span>
                    <div>
                        <el-button type="primary" link @click="edit(data)">
                            Edit
                        </el-button>

                        <el-button v-if="data.children && data.children.length !== 0" type="primary" link @click="append(data)">
                            Append
                        </el-button>

                        <el-button v-if="node.childNodes.length === 0" style="margin-left: 4px" type="danger" link
                            @click="remove(node, data)">
                            Delete
                        </el-button>
                    </div>
                </div>
            </template>
        </el-tree>
        <el-dialog v-model="dialogFormVisible" :title="`${dialogStatus ? '编辑' : '新增'}分类`" width="500">
            <el-form :model="form" :rules="rules" ref="formRef" :label-width="formLabelWidth">
                <el-form-item label="分类名称" prop="name">
                    <el-input v-model="form.name" autocomplete="off" maxlength="10" show-word-limit
                        placeholder="请输入分类名称" />
                </el-form-item>
                <el-form-item v-if="dialogStatus" label="分类图标" prop="icon">
                    <el-input v-model="form.icon" autocomplete="off" maxlength="10" show-word-limit
                        placeholder="请输入分类图标" />
                </el-form-item>
                <el-form-item v-if="dialogStatus" label="分类单位" prop="productUnit">
                    <el-input v-model="form.productUnit" autocomplete="off" maxlength="10" show-word-limit
                        placeholder="请输入分类单位" />
                </el-form-item>
            </el-form>
            <template #footer>
                <div class="dialog-footer">
                    <el-button @click="dialogFormVisible = false">取消</el-button>
                    <el-button type="primary" @click="dialogFormVisibleEvent">
                        确定
                    </el-button>
                </div>
            </template>
        </el-dialog>
    </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { ElMessageBox, ElMessage, ElLoading } from 'element-plus';
import { Delete } from '@element-plus/icons-vue'
import {
    getProductCategoryList, deleteProductCategory,
    addProductCategory, updateProductCategory,
    handleDropCategory, deledeteProductCategoryBatch
} from '@/api/product/edit'

let productCategoryList = ref([])
let expandKeys = ref([])
let value3 = ref(true) // 控制拖拽开关
let dialogStatus = ref(false)
let dialogVisibleDelete = ref(false)
let dialogFormVisible = ref(false)
let maxLevel = ref(0)
let form = ref({
    catId: '',
    name: '',
    parentCid: '',
    catLevel: 3,
    sort: 0,
    icon: '',
    productUnit: '',
    productCount: 0,
    updateTime: ''
})

// 表单校验规则
const rules = ref({
    name: [
        { required: true, message: '请输入分类名称', trigger: 'blur' },
        { min: 1, max: 10, message: '分类名称长度不能超过10个字符', trigger: 'blur' }
    ],
    icon: [
        { required: true, message: '请输入分类图标', trigger: 'blur' },
        { min: 1, max: 200, message: '分类图标长度不能超过200个字符', trigger: 'blur' }
    ],
    productUnit: [
        { required: true, message: '请输入分类单位', trigger: 'blur' },
        { min: 1, max: 40, message: '分类单位长度不能超过40个字符', trigger: 'blur' }
    ]
})

const formRef = ref()
const tree = ref()
const formLabelWidth = '120px'

const defaultProps = {
    children: 'children',
    label: 'name',
}

// 查询参数
const queryParams = ref({
    name: '',
    status: '',
    parentId: ''
})
let loadingInstance1 = null
const handleNodeClick = (data) => {
    console.log(data)
}

const append = (data) => {
    dialogStatus.value = false
    form.value.parentCid = data.catId
    form.value.catLevel = data.catLevel + 1
    form.value.name = '' // 清空表单
    dialogFormVisible.value = true
}

const edit = (data) => {
    dialogStatus.value = true
    form.value.name = data.name
    form.value.catId = data.catId
    form.value.parentCid = data.parentCid
    form.value.icon = data.icon
    form.value.productUnit = data.productUnit
    form.value.updateTime = data.updateTime
    dialogFormVisible.value = true
}
const remove = (node, data) => {
    console.log(node, data)
    ElMessageBox.confirm(
        '你确定删除该分类?',
        'Warning',
        {
            confirmButtonText: '确定',
            cancelButtonText: '取消',
            type: 'warning',
        }
    ).then(async () => {
        try {
            let { code, msg } = await deleteProductCategory(data.catId)
            if (code === 200) {
                ElMessage({
                    type: 'success',
                    message: '删除产品分类成功',
                })
                expandKeys.value = [node.parent.data.catId]
                getDataList()
            } else {
                console.error('删除产品分类失败:', msg)
            }
        } catch (error) {
            console.error('删除产品分类失败:', error)
        }

    })
        .catch(() => {
        })
}
function allowDrop(draggingNode, dropNode, type) {
    // 检查 draggingNode 是否有 children 属性
    if (!draggingNode.data.children || draggingNode.data.children.length === 0) {
        // 如果没有子节点，直接检查层级
        if (type === 'inner') {
            return dropNode.level + 1 <= 3
        } else {
            return dropNode.level <= 3
        }
    }

    // 如果有子节点，计算最大层级
    maxLevel.value = 0
    getLevel(draggingNode, draggingNode.data.catLevel)
    let maxLevelTmp = maxLevel.value
    if (type === 'inner') {
        return maxLevelTmp + 1 + dropNode.level <= 3
    } else {
        return maxLevelTmp + dropNode.level <= 3
    }
}

function getLevel(node, baseLevel) {
    // 检查是否有 children 属性
    if (!node.data.children || node.data.children.length === 0) {
        if (node.level - baseLevel > maxLevel.value) {
            maxLevel.value = node.level - baseLevel
        }
        return
    }
    for (let i = 0; i < node.data.children.length; i++) {
        const child = node.data.children[i]
        if (maxLevel.value < child.catLevel - baseLevel) {
            maxLevel.value = child.catLevel - baseLevel
        }
        // 递归检查子节点
        if (child.children && child.children.length > 0) {
            getLevel({ data: child }, baseLevel)
        }
    }
}

function handleDrop(draggingNode, dropNode, type) {

    let parentId = '';
    let oldLevel = draggingNode.data.catLevel;
    let sort = 0;
    if (type === 'inner') {
        // 内部拖拽
        parentId = dropNode.data.catId
    } else {
        // 外部拖拽
        parentId = dropNode.data.parentCid || 0
    }
    handleDropCategory({
        catId: draggingNode.data.catId,
        parentId,
        sort,
        oldLevel,
        updateTime: draggingNode.data.updateTime
    }).then(({ code, msg }) => {
        if (code === 200) {
            ElMessage({
                type: 'success',
                message: '分类更新成功',
            })
            expandKeys.value = [parentId]
            getDataList()
        } else {
            ElMessage({
                type: 'error',
                message: `分类更新失败: ${msg}`,
            })
        }
    }).catch((error) => {
        console.error('分类更新失败:', error)
        ElMessage({
            type: 'error',
            message: '分类更新失败，请重试',
        })
    })
}
function handleDeleteTo() {
    dialogVisibleDelete.value = false
    deledeteProductCategoryBatch({ ids: tree.value.getCheckedKeys() })
        .then(({ code, msg }) => {
            if (code === 200) {
                ElMessage({
                    type: 'success',
                    message: '批量删除产品分类成功',
                })
                getDataList()
            } else {
                ElMessage({
                    type: 'error',
                    message: `批量删除产品分类失败: ${msg}`,
                })
            }
        }).catch((error) => {
            console.error('批量删除产品分类失败:', error)
            ElMessage({
                type: 'error',
                message: '批量删除产品分类失败，请重试',
            })
        })
}
function handleDelete() {
    if(tree.value.getCheckedKeys().length === 0){
        ElMessage({
            type: 'warning',
            message: '请先勾选要删除的元素',
        })
        return
    }
    dialogVisibleDelete.value = true
}
function handleClose() {
    dialogVisibleDelete.value = false
}
function dialogFormVisibleEvent() {
    formRef.value.validate((valid) => {
        if (valid) {
            if (dialogStatus.value) {
                dialogFormVisible.value = false
                updateProductCategory({
                    catId: form.value.catId,
                    name: form.value.name,
                    updateTime: form.value.updateTime,
                    icon: form.value.icon,
                    productUnit: form.value.productUnit
                }).then(({ code, msg }) => {
                    if (code === 200) {
                        ElMessage({
                            type: 'success',
                            message: '修改产品分类成功',
                        })
                        expandKeys.value = [form.value.parentCid]
                        getDataList()
                    } else {
                        ElMessage({
                            type: 'error',
                            message: `修改产品分类失败: ${msg}`,
                        })
                    }
                }).catch((error) => {
                    console.error('修改产品分类失败:', error)
                    ElMessage({
                        type: 'error',
                        message: '修改产品分类失败，请重试',
                    })
                })
            } else {
                dialogFormVisible.value = false
                form.value.catId = null
                addProductCategory(form.value).then(({ code, msg }) => {
                    if (code === 200) {
                        ElMessage({
                            type: 'success',
                            message: '新增产品分类成功',
                        })
                        expandKeys.value = [form.value.parentCid]
                        getDataList()
                        // 重置表单

                    } else {
                        ElMessage({
                            type: 'error',
                            message: `新增产品分类失败: ${msg}`,
                        })
                    }
                }).catch((error) => {
                    console.error('新增产品分类失败:', error)
                    ElMessage({
                        type: 'error',
                        message: '新增产品分类失败，请重试',
                    })
                })
            }

        } else {
            ElMessage({
                type: 'warning',
                message: '请检查表单输入',
            })
            return false
        }
    })
}
async function getDataList() {
    try {
        loadingInstance1 = ElLoading.service({ fullscreen: true })
        // 方式2：不传递参数，获取所有数据
        let { data } = await getProductCategoryList()
        console.log('获取到的数据:', data)
        productCategoryList.value = data
    } catch (error) {
        console.error('获取产品分类列表失败:', error)
    } finally {
        loadingInstance1.close()
    }
}
onMounted(() => {
    getDataList()
})
</script>

<style lang="scss" scoped></style>