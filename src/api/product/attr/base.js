import request from '@/utils/productRequest'

export function getBaseListFoCatId(catId,data){
    return request({
        url: `/product/attr/list/${catId}`,
        method: 'get',
        params: data
    })
}
export function getBaseAttrList(catId,page){
    return request({
        url: `/product/attr/base/list/${catId}`,
        method: 'get',
        params: page
    })
}
export function deleteBaseAttrByIds(ids){
    return request({
        url: `/product/attr/base/delete`,
        method: 'delete',
        data: ids
    })
}
export function changeShowDesc(id,showDesc){
    return request({
        url: `/product/attr/base/update/showDesc/${id}`,
        method: 'put',
        data: {status: showDesc}
    })
}
export function changeSearchType(id,SearchType){
    return request({
        url: `/product/attr/base/update/SearchType/${id}`,
        method: 'put',
        data: {status: SearchType}
    })
}
export function changeEnable(id,Enable){
    return request({
        url: `/product/attr/base/update/Enable/${id}`,
        method: 'put',
        data: {status: Enable}
    })
}