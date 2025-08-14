import request from '@/utils/productRequest'
export function deleteRelationBatch(data) {
    return request({
        url: '/system/relation/batch',
        method: 'delete',
        data
    })
}
export function deleteRelationById(attrId, attrGroupId) {
    return request({
        url: '/system/relation',
        method: 'delete',
        data:{
            attrId,
            attrGroupId
        }
    })
}
export function insertAttrToGroupRelations(data){
    return request({
        url: '/system/relation/batch',
        method: 'put',
        data
    })
}