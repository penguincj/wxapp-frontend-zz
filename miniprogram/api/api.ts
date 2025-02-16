import { request } from "../utils/util"

export const getCityList = () => {
    return request('/api/v1/cities');
}


export const getMuseumList = (_cityid: any) => {
    return request('/api/v1/museums?cityID='+_cityid);
}