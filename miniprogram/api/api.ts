import { request } from "../utils/util"
export const base_api = false ? 'api' : 'test-api'

export const getCityList = () => {
    return request(`/${base_api}/v1/cities`);
}

export const getCityListFilter = () => {
    return request(`/${base_api}/v1/cities?type=has_narration`);
}

export const getMuseumList = (_cityid: any) => {
    return request(`/${base_api}/v1/museums?hidden=0&cityID=${_cityid}`);
}

export const getMuseumById = (_museumid: any) => {
    return request(`/${base_api}/v1/museums/${_museumid}`);
}
// 获取博物馆信息
export const getMuseumInfoById = (_museumid: any) => {
    return request(`/${base_api}/v1/museums/${_museumid}/visitGuide`);
}

// 获取博物馆重点文物列表
export const getTreatureList = (_museumid: any, _num: any, _pagenum: any) => {
    return request(`/${base_api}/v1/treasures?museumID=${_museumid}&num=${_num}&pageNum=${_pagenum}`);
}

// 获取重点文物信息
export const getTreatureInfoById = (_treasureid: any) => {
    return request(`/${base_api}/v1/treasures/${_treasureid}`);
}

export const getExhibitionList = (_museumid: any, _num=999, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?museumID=${_museumid}&num=${_num}&pageNum=${_pagenum}`);
}


export const getExhibitionById = (_exhibitionid: any) => {
    return request(`/${base_api}/v1/exhibitions/${_exhibitionid}`);
}

// 推荐展
export const getRecoExhibitionList = (_museumid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=recommend&museumID=${_museumid}&num=${_num}&pageNum=${_pagenum}`);
}

// 推荐展
export const getFutureExhibitionList = (_museumid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=future&museumID=${_museumid}&num=${_num}&pageNum=${_pagenum}`);
}

// 推荐城市展
export const getCityRecoExhibitionList = (_cityid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=recommend&cityID=${_cityid}&num=${_num}&pageNum=${_pagenum}`);
}

// 展览feed流
export const getCityExhibitionFeedList = (_cityid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/feeds?cityID=${_cityid}&num=${_num}&pageNum=${_pagenum}`);
}

// 常设展
export const getLongExhibitionList = (_museumid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=long&museumID=${_museumid}&num=${_num}&pageNum=${_pagenum}`);
}

// 城市常设展
export const getCityLongExhibitionList = (_cityid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=long&cityID=${_cityid}&num=${_num}&pageNum=${_pagenum}`);
}

// 临时展
export const getShortExhibitionList = (_museumid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=short&museumID=${_museumid}&num=${_num}&pageNum=${_pagenum}`);
}

// 城市临时展
export const getCityShortExhibitionList = (_cityid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=short&cityID=${_cityid}&num=${_num}&pageNum=${_pagenum}`);
}

// 往期展
export const getPastExhibitionList = (_museumid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=past&museumID=${_museumid}&num=${_num}&pageNum=${_pagenum}`);
}

// 城市往期展
export const getCityPastExhibitionList = (_cityid: any, _num=1, _pagenum=1) => {
    return request(`/${base_api}/v1/exhibitions?type=past&cityID=${_cityid}&num=${_num}&pageNum=${_pagenum}`);
}

export const getExhibitionListAll = (_querystr: any) => {
    return request(`/${base_api}/v1/exhibitions` + _querystr);
}


export const getUnitList = (_exhibitionid: any) => {
    return request(`/${base_api}/v1/units?exhibitionID=${_exhibitionid}`);
}

export const getExhibitList = (_unitid: any) => {
    return request(`/${base_api}/v1/exhibits?unitID=${_unitid}`);
}
export const queryExhibitListAll = (_userid: any, _querystr: any) => {
    // return request(`/${base_api}/v1/queries` + _querystr);
    return request(`/${base_api}/v1/users/${_userid}/search` + _querystr);
}

export const getExhibitById = (_exhibitid: any) => {
    return request(`/${base_api}/v1/exhibits/${_exhibitid}`);
}

export const getNarrowList = (_exhibitionid: any) => {
    return request(`/${base_api}/v1/narrations?exhibitionID=${_exhibitionid}`);
}

export const modifyNameAndAva = (_id: any, options: any) => {
    return request(`/${base_api}/v1/users/${_id}/profile`, options)
}

export const likeExhibit = (user_id: any, exhibit_id: any, options: any) => {
    return request(`/${base_api}/v1/users/${user_id}/exhibits/${exhibit_id}/like`, options);
}

export const collectExhibit = (user_id: any, exhibit_id: any, options: any) => {
    return request(`/${base_api}/v1/users/${user_id}/exhibits/${exhibit_id}/collection`, options);
}

export const viewHistoryList = (user_id: any) => {
    return request(`/${base_api}/v1/users/${user_id}/view/history`);
}

export const likeList = (user_id: any) => {
    return request(`/${base_api}/v1/users/${user_id}/likes`);
}

export const collectionList = (user_id: any) => {
    return request(`/${base_api}/v1/users/${user_id}/collections`);
}

export const sendViewExhibitionAction = (_userid: any, _exhibitionid: any, options: any) => {
    return request(`/${base_api}/v1/users/${_userid}/exhibitions/${_exhibitionid}/view`, options)
}

export const sendListenAudioAction = (_audioid: any, options: any) => {
    return request(`/${base_api}/v1/audios/${_audioid}/listen`, options)
}

export const sendFeedback = (_userid: any, options: any) => {
    return request(`/${base_api}/v1/users/${_userid}/complain`, options)
}

// 社区

// 社区-查询评分及评价列表
export const getCommentsByExhibitionID = (_exhibitionid: any, _labelname: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/comments?label_name=${_labelname}`)
}

// 社区-添加用户评价
export const postCommentsByExhibitionID = (_exhibitionid: any, _userid: any, options: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/comment`, options)
}

// 社区-删除用户评价
export const delCommentsByExhibitionID = (_exhibitionid: any, _userid: any, _commentid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/comment/${_commentid}`, {
        method: 'DELETE'
    })
}

// 社区-创建标签
export const postLabel = (_exhibitionid: any, options: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/label`, options)
}

// 社区-查询标签
export const getLabel = (_exhibitionid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/labels`)
}

// 社区-想看
export const postWantVisit = (_exhibitionid: any,  _userid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/wantvisit`, {
        method: 'POST'
    })
}

// 社区-取消想看
export const delWantVisit = (_exhibitionid: any,  _userid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/wantvisit`, {
        method: 'DELETE'
    })
}

// 社区-看过
export const postVisited = (_exhibitionid: any,  _userid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/visited`, {
        method: 'POST'
    })
}

// 社区-取消看过
export const delVisited = (_exhibitionid: any,  _userid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/visited`, {
        method: 'DELETE'
    })
}

// 社区-添加评价A的评价B 
export const postReplyToParent = (_exhibitionid: any, _userid: any, options: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/reply`, options);
}

// 社区-删除评价A的评价B 
export const delReplyToParent = (_exhibitionid: any, _userid: any, _commentid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/reply/${_commentid}`, {
        method: 'DELETE'
    })
}

// 社区-图片上传
export const uploadImageCommunities = (_exhibitionid: any, options: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/images`, options)
}

// 社区-评价详情
export const getCommentDetail = (_exhibitionid: any,  _commentid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/comments/${_commentid}`)
}

// 社区-评论点赞
export const postCommentLike = (_exhibitionid: any,  _userid: any,  _commentid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/commentLike/${_commentid}`, {
        method: 'POST'
    })
}

// 社区-取消评论点赞
export const delCommentLike = (_exhibitionid: any,  _userid: any,  _commentid: any) => {
    return request(`/${base_api}/v1/communities/exhibitions/${_exhibitionid}/users/${_userid}/commentLike/${_commentid}`, {
        method: 'DELETE'
    })
}

// 海报背景列表
export const getPosters = (_exhibitionid: any) => {
    return request(`/${base_api}/v1/posters?type=exhibition&id=${_exhibitionid}`)
}


// 海报背景列表
export const getPostersOfMuseum = (_museumid: any) => {
    return request(`/${base_api}/v1/posters?type=museum&id=${_museumid}`)
}

// 首页二期评价列表
export const getHotComments = (_num=1, _pagenum: any, _city_id: any) => {
    return request(`/${base_api}/v1/communities/hotComments?num=${_num}&pageNum=${_pagenum}&city_id=${_city_id}`)
}

// 首页二期 index 有city参数
export const getIndexCityData = (_lat: any, _lng: any, _cityid: any) => {
    return request(`/${base_api}/v1/index?lat=${_lat}&lon=${_lng}&cityID=${_cityid}`)
}

// 首页二期 index 无city参数
export const getIndexData = (_lat: any, _lng: any) => {
    return request(`/${base_api}/v1/index?lat=${_lat}&lon=${_lng}`)
}

// 首页二期 续听接口
export const getContinueListen = () => {
    return request(`/${base_api}/v1/continueListen`)
}
