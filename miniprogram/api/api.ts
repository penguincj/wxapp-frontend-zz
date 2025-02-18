import { request } from "../utils/util"

export const getCityList = () => {
    return request('/api/v1/cities');
}

export const getMuseumList = (_cityid: any) => {
    return request('/api/v1/museums?cityID='+_cityid);
}

export const getMuseumById = (_museumid: any) => {
    return request('/api/v1/museums/'+_museumid);
}


export const getExhibitionList = (_museumid: any) => {
    return request('/api/v1/exhibitions?museumID='+_museumid);
}


export const getExhibitionById = (_exhibitionid: any) => {
    return request('/api/v1/exhibitions/'+_exhibitionid);
}

// 推荐展
export const getRecoExhibitionList = (_museumid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=recommend&museumID=${_museumid}&num=${_num}`);
}

// 推荐城市展
export const getCityRecoExhibitionList = (_cityid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=recommend&cityID=${_cityid}&num=${_num}`);
}


// 常设展
export const getLongExhibitionList = (_museumid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=long&museumID=${_museumid}&num=${_num}`);
}

// 城市常设展
export const getCityLongExhibitionList = (_cityid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=long&cityID=${_cityid}&num=${_num}`);
}

// 临时展
export const getShortExhibitionList = (_museumid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=short&museumID=${_museumid}&num=${_num}`);
}

// 城市临时展
export const getCityShortExhibitionList = (_cityid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=short&cityID=${_cityid}&num=${_num}`);
}

// 往期展
export const getPastExhibitionList = (_museumid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=past&museumID=${_museumid}&num=${_num}`);
}

// 城市往期展
export const getCityPastExhibitionList = (_cityid: any, _num=1) => {
    return request(`/api/v1/exhibitions?type=past&cityID=${_cityid}&num=${_num}`);
}

export const getExhibitionListAll = (_querystr: any) => {
    return request(`/api/v1/exhibitions` + _querystr);
}

export const getUnitList = (_exhibitionid: any) => {
    return request('/api/v1/units?exhibitionID='+_exhibitionid);
}

export const getExhibitList = (_unitid: any) => {
    return request('/api/v1/exhibits?unitID='+_unitid);
}

export const getExhibitById = (_exhibitid: any) => {
    return request('/api/v1/exhibits/'+_exhibitid);
}

export const getNarrowList = (_exhibitionid: any) => {
    return request('/api/v1/narrations?exhibitionID='+_exhibitionid);
}

