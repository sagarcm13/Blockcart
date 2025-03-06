import { useQuery } from 'react-query';
import axiosClient from './axios';

export const getProducts = async (context) => {
  const type = context.queryKey[1]
  return axiosClient.get('/list', { params: { type: type } }).then(res => res.data)
}

export function useProducts(type) {
  return useQuery({
    queryKey: ["products", type],
    queryFn: getProducts,
  });
}

export const getProductDetail = async (context) => {
  const id = context.queryKey[1]
  return axiosClient.get('/product', { params: { id: id } }).then(res => res.data)
}

export function useProductDetail(id) {
  return useQuery({
    queryKey: ["productDetail", id],
    queryFn: getProductDetail,
  });
}

export const getCartDetail = async () => {
  return axiosClient.get('/cart',{headers: {'x-auth-token': localStorage.getItem("token")},}).then(res => res.data)
}

export function useCartDetail() {
  return useQuery({
    // queryKey: ["productDetail", id],
    queryFn: getCartDetail,
  });
}