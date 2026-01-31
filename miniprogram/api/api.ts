import { request } from "../utils/util"

// 开发环境使用 test-api，生产环境使用 api
export const base_api = 'test-api'

// ==================== 城市/位置相关 ====================

// 获取城市列表
export const getCityList = () => {
    return request(`/${base_api}/v1/cities`);
}

// 根据经纬度获取城市
export const getCityByLoc = (_lat: any, _lng: any) => {
    return request(`/${base_api}/v1/city-by-location?location=${_lng},${_lat}`);
}

// ==================== 首页相关 ====================

// 首页数据 v2
export const getIndexDataV2 = (params: { lat?: any; lng?: any; city_code?: string | number }) => {
    if (params && params.city_code) {
        return request(`/${base_api}/v2/index?city_code=${params.city_code}`)
    }
    return request(`/${base_api}/v2/index?lat=${params?.lat}&lon=${params?.lng}`)
}

// 首页数据（带城市参数）
export const getIndexCityData = (_lat: any, _lng: any, _cityid: any) => {
    return request(`/${base_api}/v1/index?lat=${_lat}&lon=${_lng}&cityID=${_cityid}`)
}

// 首页数据（无城市参数）
export const getIndexData = (_lat: any, _lng: any) => {
    return request(`/${base_api}/v1/index?lat=${_lat}&lon=${_lng}`)
}

// ==================== 用户相关 ====================

// 修改用户名和头像
export const modifyNameAndAva = (_id: any, options: any) => {
    return request(`/${base_api}/v1/users/${_id}/profile`, options)
}

// 浏览历史列表
export const viewHistoryList = (user_id: any) => {
    return request(`/${base_api}/v1/users/${user_id}/view/history`);
}

// 点赞列表
export const likeList = (user_id: any) => {
    return request(`/${base_api}/v1/users/${user_id}/likes`);
}

// 收藏列表
export const collectionList = (user_id: any) => {
    return request(`/${base_api}/v1/users/${user_id}/collections`);
}

// 用户反馈
export const sendFeedback = (_userid: any, options: any) => {
    return request(`/${base_api}/v1/users/${_userid}/complain`, options)
}

// 用户搜索
export const querySearch = (_userid: any, _querystr: any) => {
    return request(`/${base_api}/v1/users/${_userid}/search` + _querystr);
}

// ==================== AI识别相关 ====================

// 气泡联想
export const getBubbleList = (data: { query: string; artifact_type?: string; include_detail?: boolean; top_k?: number }) => {
    return request(`/${base_api}/v2/bubble/llm`, {
        method: 'POST',
        data,
    })
}

// 气泡详情
export const getBubbleDetail = (data: { artifact_name: string; artifact_type?: string; topic_type: string; bubble_title: string }) => {
    return request(`/${base_api}/v2/bubble/llm/detail`, {
        method: 'POST',
        data,
    })
}

// ==================== 版本控制 ====================

export const getVersionList = () => {
    return request(`/${base_api}/v1/version-control`);
}
