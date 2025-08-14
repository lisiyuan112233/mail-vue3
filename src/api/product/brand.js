import request from '@/utils/productRequest'

// 查询品牌列表
export function listBrand(query) {
  return request({
    url: '/system/brand/list',
    method: 'get',
    params: query
  })
}

// 查询品牌详细
export function getBrand(brandId) {
  return request({
    url: '/system/brand/' + brandId,
    method: 'get'
  })
}

// 新增品牌
export function addBrand(data) {
  return request({
    url: '/system/brand',
    method: 'post',
    data: {...data, showStat: data.showStat ? 1 : 0}
  })
}

// 修改品牌
export function updateBrand(data) {
  return request({
    url: '/system/brand',
    method: 'put',
    data: data
  })
}

// 删除品牌
export function delBrand(brandId) {
  return request({
    url: '/system/brand/' + brandId,
    method: 'delete'
  })
}
// 批量删除品牌 ids
export function delBrandBatch(brandIds) {
  return request({
    url: '/system/brand/batch',
    method: 'delete',
    data: brandIds
  })
}
export function ChangeBrandStatus(data) {
  return request({
    url: '/system/brand/changeStatus',
    method: 'put',
    data: data
  })
}
export function getRelationForBrand(brandId,page) {
  return request({
    url: `/system/category-brand-relation/forBrand/${brandId}`,
    method: 'get',
    params: page
  })
}
export function deleteRelationForBrandAndCat(brandId,catId){
  return request({
    url: `/system/category-brand-relation/condition`,
    method: 'delete',
    data: {
      brandId,
      catId
    }
  })
}
export function addRelationForBrandAndCat(data){
  return request({
    url: '/system/category-brand-relation/twoId',
    method: 'post',
    data: data
  })
}
export function getNoRelationCatList(brandId,page) {
  return request({
    url: `/system/category-brand-relation/forBrandAndNoRelation/${brandId}`,
    method: 'get',
    params: page
  })
}