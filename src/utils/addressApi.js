import axios from "axios";

const API_KEY = "U01TX0FVVEgyMDI0MDYwMjE5MzcyNzExNDgxMzQ="; // 발급받은 API 키를 입력하세요

const searchAddress = async (keyword) => {
  const url = `https://www.juso.go.kr/addrlink/addrLinkApi.do?confmKey=${API_KEY}&currentPage=1&countPerPage=10&keyword=${keyword}&resultType=json`;
  
  try {
    const response = await axios.get(url);
    if (response.data.results.common.errorCode === "0") {
      return response.data.results.juso;
    } else {
      console.error("Error:", response.data.results.common.errorMessage);
      return [];
    }
  } catch (error) {
    console.error("Error:", error);
    return [];
  }
};

export default searchAddress;
