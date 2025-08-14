import request from '@/utils/productRequest'
export function getUploadSignature() {
    return request({
        url: '/system/oss/upload',
        method: 'get'
        })
}