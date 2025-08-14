import request from '@/utils/productRequest'

export function getBaseListFoCatId(catId,data){
    return request({
        url: `/product/attr/list/${catId}`,
        method: 'get',
        params: data
    })
}