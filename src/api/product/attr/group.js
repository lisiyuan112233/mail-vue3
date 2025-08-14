import request from '@/utils/productRequest'
export function listBaseAttrGroup(catId,data) {
  return request({
    url: `/system/attrgroup/list/${catId}`,
    method: 'get',
    params: data
  })
}
export function deleteAttrGroupByIds(groupIds) {
   return request({
    url: `/system/attrgroup/${groupIds}`,
    method: 'delete',
   })
}
export function getAttrGroupInfo(groupId){
  return request({
    url: `/system/attrgroup/info/${groupId}`,
    method: 'get'
  })
}
export function addAttrGroup(data) {
  return request({  
  url: '/system/attrgroup',
  method: 'post',
  data: data
  })
}
export function getNoRelationAttr(attrGroupId,data) {
   return request({
      url: `/system/attr/attr/norelation/${attrGroupId}`,
      method: 'get',
      params: data
   })
}
export function getRelationAttr(attrGroupId,data) {
   return request({
      url: `/system/attr/attr/relation/${attrGroupId}`,
      method: 'get',
      params: data
   })
}
