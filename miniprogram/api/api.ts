import { request } from "../utils/util"

export const getCityList = () => {
    return request('/api/v1/cities');
}

export const getMuseumList = (_cityid: any) => {
    return request('/api/v1/museums?cityID='+_cityid);
}

export const getExhibitionList = (_museumid: any) => {
    return request('/api/v1/exhibitions?museumID='+_museumid);
}

// 推荐展
export const getRecoExhibitionList = (_cityid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=recommend&cityID=${_cityid}&num=${_num}`);
}

// 常设展
export const getLongExhibitionList = (_cityid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=long&cityID=${_cityid}&num=${_num}`);
}

// 临时展
export const getShortExhibitionList = (_cityid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=short&cityID=${_cityid}&num=${_num}`);
}

export const getExhibitList = (_exhibitionid: any) => {
    return request('/api/v1/exhibits?exhibitionID='+_exhibitionid);
}

export const getNarrowList = (_exhibitionid: any) => {
    return request('/api/v1/narrows?exhibitionID='+_exhibitionid);
}

