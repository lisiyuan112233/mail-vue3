import request from '@/utils/productRequest'

// 获取产品分类列表
export function getProductCategoryList(params = {}) {
    return request({
        url: '/system/category/list/tree',
        method: 'get',
        params: params  // 支持传递查询参数
    })
}

// 获取产品分类列表（带查询条件）
export function getProductCategoryListWithFilter(category) {
    return request({
        url: '/system/category/list',
        method: 'get',
        params: {
            name: category.name,
            status: category.status,
            parentId: category.parentId,
            // 其他字段...
        }
    })
}
// 删除产品分类
export function deleteProductCategory(id) {
    return request({
        url: `/system/category/${id}`,
        method: 'delete'
    })
}
export function addProductCategory(data) {
    return request({
        url: '/system/category',
        method: 'post',
        data: data
    })
}
export function updateProductCategory(data) {
    return request({
        url: `/system/category`,
        method: 'put',
        data: data
    })
}
export function handleDropCategory(data){
    return request({
        url: '/system/category/change',
        method: 'put',
        data: data
    })
}
export function deledeteProductCategoryBatch(data) {
    return request({
        url: '/system/category',
        method: 'delete',
        data: data
        })
}
