import { useOutletContext, useNavigate } from "react-router-dom";
import { useRef, useEffect, useState,useCallback } from 'react';
import { useForm } from "react-hook-form";
import Swal from "sweetalert2";
import * as bootstrap from "bootstrap";
import axios from "axios";

import { API_BASE, API_PATH } from "../Constants/config";
import CityCountryData from '../TaiwanArea/CityCountyData.json';

const CheckOutPage = () => {

    // 1. 設定 useForm (加入 isSubmitting 狀態)
    const { 
        register, 
        handleSubmit, 
        formState: { errors, isSubmitting } // 取出 isSubmitting 來控制按鈕停用
    } = useForm({
        mode: 'onTouched' // 建議：欄位被觸碰後就開始驗證，體驗較好
    });
    
    // 2. 接收父層資料 
    // ⚠️注意：這裡改用 finalTotal，請確認你的 AppRoute context 傳過來的名稱
    const { carts, finalTotal, resetCart } = useOutletContext();
    
    const navigate = useNavigate();
    const modalRef = useRef(null);
    const bsModalRef = useRef(null);

    // 3. Modal 初始化與生命週期管理
    useEffect(() => {
        const modalElement = modalRef.current;
        if (!modalElement) return;

        // 初始化 Modal
        bsModalRef.current = new bootstrap.Modal(modalElement, {
            backdrop: "static",
            keyboard: false
        });

        // 顯示 Modal
        bsModalRef.current.show();

        // 監聽隱藏事件 (當使用者按 X 關閉或點擊背景時觸發，雖然這裡 backdrop static 擋住了背景點擊)
        const handleHidden = () => {
            navigate('/cart');
        };
        modalElement.addEventListener('hidden.bs.modal', handleHidden);

        // 4. 清理函式
        return () => {
            modalElement.removeEventListener('hidden.bs.modal', handleHidden);
            
            // 確保 Modal 實體存在才隱藏
            if (bsModalRef.current) {
                bsModalRef.current.hide();
            }

            // 【暴力清除殘留樣式】
            // React Router 換頁太快，有時 Bootstrap 的 backdrop 會殘留在 body 上
            const backdrop = document.querySelector('.modal-backdrop');
            if (backdrop) {
                backdrop.remove();
            }
            document.body.classList.remove('modal-open');
            document.body.style.removeProperty('overflow');
            document.body.style.removeProperty('padding-right');
        };

    }, [navigate]);

    const handleClose = useCallback(() => {
        // 主動關閉會觸發 hidden.bs.modal 事件，進而執行 navigate('/cart')
        bsModalRef.current?.hide();
    },[])

    // 送出表單
    const onSubmit = useCallback(async (data) => {
        const finalAddress = `${data.city}${data.districts}${data.address}`;
        const orderData = {
            data: {
                user: {
                    name: data.name,
                    email: data.email,
                    tel: data.tel,
                    address: finalAddress
                },
                message: data.message || "沒有留言"
            }
        }

        try {
            const res= await axios.post(`${API_BASE}/api/${API_PATH}/order`, orderData); 
            // ⚠️注意：HexSchool 的結帳 API 通常是 /order 而不是 /cart (如果是送出訂單)
            // 如果你的 API 真的是 /cart (建立訂單)，請維持原樣。
            // 但標準 Hex API 流程是： POST /order (建立訂單) -> 取得 orderId -> POST /pay/{orderId} (付款)
            
            Swal.fire({
                title:"表單已成功提交!",
                text:"感謝你的購買,商品準備中...",
                icon:"success",
                confirmButtonText:`再去逛逛!`,
                confirmButtonColor:"#3085d6",
                timer: 3000,
                timerProgressBar:true //顯示倒數紀錄條
            }).then(()=>{
                navigate("/products");
            })
            
            // 清空購物車 (實際上 API 送出訂單後，後端購物車通常會自動清空)
            // 但為了保險，前端狀態也重置
            resetCart(); 
            
            // 關閉 Modal (會觸發 useEffect 的 cleanup 並導回)
            handleClose();
            
            console.log(res);

        } catch (err) {
            console.error("結帳失敗:", err);
            alert("結帳失敗: " + (err.response?.data?.message || "請稍後再試"));
        }
    },[resetCart,handleClose])

    // 縣市選擇邏輯
    const [selectedCity, setSelectedCity] = useState("");
    const [selectedDistricts, setSelectedDistricts] = useState("");
    const [districts, setDistricts] = useState([]);

    const handleCityChange = (e) => {
        const city = e.target.value;
        setSelectedCity(city);
        const cityData = CityCountryData.find((item) => item.CityName === city);
        
        // 切換縣市時，清空行政區
        setSelectedDistricts("");
        setDistricts(cityData ? cityData.AreaList : []);
    }

    const handleDistrictChange = (e) => {
        setSelectedDistricts(e.target.value);
    }

    return (
        <div className="modal fade" ref={modalRef} tabIndex="-1" style={{ display: 'none' }}>
            <div className="modal-dialog modal-lg">
                <div className="modal-content">

                    <div className="modal-header">
                        <h5 className="modal-title">填寫訂單資訊</h5>
                        <button type="button" className="btn-close" onClick={handleClose}></button>
                    </div>

                    <div className="modal-body">
                        <div className="row justify-content-center">
                            <div className="col-12">
                                {/* 訂單摘要 */}
                                <div className="card mb-3">
                                    <div className="card-header bg-light">
                                        訂單摘要 (總計: <span className="text-danger fw-bold">NT$ {finalTotal}</span>)
                                    </div>
                                    <div className="card-body p-0" style={{maxHeight: '200px', overflowY: 'auto'}}>
                                        <table className="table table-sm mb-0 align-middle">
                                            <thead className="sticky-top bg-white">
                                                <tr>
                                                    <th>品名</th>
                                                    <th>數量</th>
                                                    <th className="text-end">小計</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {carts?.map((item) => (
                                                    <tr key={item.id}>
                                                        <td>{item.product.title}</td> 
                                                        {/* ⚠️注意：通常資料結構是 item.product.title */}
                                                        <td>{item.qty} / {item.product.unit}</td>
                                                        <td className="text-end text-muted">NT$ {item.final_total}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                {/* 表單 */}
                                {/* eslint-disable-next-line react-hooks/refs */}
                                <form id="checkOutForm" onSubmit={handleSubmit(onSubmit)}>
                                    <div className="mb-3">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input
                                            id="email"
                                            type="email"
                                            className={`form-control ${errors.email ? 'is-invalid' : ''}`}
                                            placeholder="請輸入 Email"
                                            {...register('email', {
                                                required: 'Email為必填!',
                                                pattern: {
                                                    value: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/,
                                                    message: "Email格式不正確!"
                                                }
                                            })} />
                                        {errors.email && <div className='invalid-feedback'>{errors.email.message}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="name" className="form-label">收件人姓名</label>
                                        <input
                                            id="name"
                                            type="text"
                                            className={`form-control ${errors.name ? "is-invalid" : ""}`}
                                            placeholder="請輸入姓名"
                                            {...register('name', {
                                                required: "用戶名稱為必填!",
                                            })} />
                                        {errors.name && <div className='invalid-feedback'>{errors.name.message}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="tel" className="form-label">收件人電話</label>
                                        <input
                                            id="tel"
                                            type="tel"
                                            className={`form-control ${errors.tel ? "is-invalid" : ""}`}
                                            placeholder="請輸入電話"
                                            {...register('tel', {
                                                required: "電話為必填!",
                                                pattern: {
                                                    value: /^0(9\d{8}|[2-8]\d{7,8})$/,
                                                    message: "電話格式不正確 (例: 0912345678)"
                                                }
                                            })} />
                                        {errors.tel && <div className='invalid-feedback'>{errors.tel.message}</div>}
                                    </div>

                                    <div className="row mb-3">
                                        <div className="col-md-6 mb-3">
                                            <label htmlFor="citySelector" className="form-label">縣市</label>
                                            <select
                                                className={`form-select ${errors.city ? "is-invalid" : ""}`}
                                                id="citySelector"
                                                {...register('city', {
                                                    required: "縣市為必填!",
                                                    onChange: handleCityChange // React Hook Form 允許這樣串接 onChange
                                                })}>
                                                <option value="" disabled>請選擇縣市</option>
                                                {CityCountryData.map((area, index) => (
                                                    <option key={index} value={area.CityName}>
                                                        {area.CityName}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.city && <div className="invalid-feedback">{errors.city.message}</div>}
                                        </div>

                                        <div className="col-md-6 mb-3">
                                            <label htmlFor='districtSelector' className="form-label">行政區</label>
                                            <select
                                                className={`form-select ${errors.districts ? "is-invalid" : ""}`}
                                                id="districtSelector"
                                                disabled={!selectedCity} // 沒選縣市時禁用
                                                {...register("districts", {
                                                    required: "行政區為必填!",
                                                    onChange: handleDistrictChange
                                                })}>
                                                <option value="" disabled >請選擇行政區</option>
                                                {districts.map((area, index) => (
                                                    <option key={index} value={area.AreaName}>
                                                        {area.AreaName}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.districts && <div className="invalid-feedback">{errors.districts.message}</div>}
                                        </div>
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="address" className="form-label">地址</label>
                                        <input
                                            id="address"
                                            className={`form-control ${errors.address ? "is-invalid" : ""}`}
                                            type="text"
                                            placeholder="請輸入詳細地址"
                                            disabled={!selectedDistricts}
                                            {...register("address", {
                                                required: "地址為必填!",
                                                // 建議移除過於嚴格的 pattern，只保留必填，避免特殊地址無法送出
                                            })} />
                                        {errors.address && <div className="invalid-feedback">{errors.address.message}</div>}
                                    </div>

                                    <div className="mb-3">
                                        <label htmlFor="message" className="form-label">留言</label>
                                        <textarea
                                            id="message"
                                            className="form-control"
                                            cols="30"
                                            rows="3" // 縮小一點高度
                                            {...register("message")}></textarea>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={handleClose}>
                            取消 / 回上一頁
                        </button>
                        <button
                            type="submit"
                            form="checkOutForm"
                            className="btn btn-outline-success"
                            disabled={isSubmitting} // 防止重複提交
                        >
                            {isSubmitting ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                    送出中...
                                </>
                            ) : "確認送出"}
                        </button>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default CheckOutPage;