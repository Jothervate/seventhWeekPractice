import { useState, useRef, useEffect ,useCallback} from 'react';
import { useNavigate,useLocation} from 'react-router-dom';
import axios from "axios";
import * as bootstrap from "bootstrap";

import { NEW_PRODUCT_DATA,API_BASE,API_PATH } from './Constants/config';


import ProductModal from './component/ProductModal';
import DeleteModal from './component/Delete';
// 路由+Link
import AppRoute from './Route/AppRoute';
import Navbar from './component/Navbar';

// Toast
import Toast from './toastSlice/Toast';
import { useDispatch } from 'react-redux';
import { pushMessage } from './toastSlice/toastSlice';

// sweetalert2
import Swal from 'sweetalert2';

function App() {

  // 初始化navigate設定
  const navigate= useNavigate();
  // 初始化location
  const location = useLocation();
  // 初始化是否以cookies首次跳轉
  const hasInitialRedirected= useRef(false);

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [isAuth, setIsAuth] = useState(false);
  // 新增載入狀態,避免頁面沒有進行更新
  const [isLoading,setIsLoading] =useState(false);

  // 新增檢查Token的狀態,避免畫面不同步
  const [isAuthChecking, setIsAuthChecking] = useState(true); // 預設為 true，代表一開始就在檢查

  // 分流：定義兩個不同的資料庫
  const [adminProducts, setAdminProducts] = useState([]);  // 後端(產品編輯)管理用
  const [clientProducts, setClientProducts] = useState([]); // 前台(產品列表)列表用

  // 查看細節內容
  const [templateData,setTemplateData]=useState(null);

  // 建立購物車資訊
  const [carts,setCarts]= useState([]);
  // 購物車內自行加總
  const [total,setTotal]= useState(0);
  const [finalTotal,setFinalTotal]= useState(0);

  // 是否正在刪除產品
  const [isDeleteItem,setIsDeleteItem]= useState(false);


  // 是否取得資訊成功
  const [isLoadingSuccess,setIsLoadingSuccess]= useState(false);

  // 設置初始表單內容
  const [templateProduct,setTemplateProduct]= useState(NEW_PRODUCT_DATA); 
  // 設置功能系統
  const [modalType,setModalType]= useState('');
  
  // 取得頁面資訊
  const [adminPagination,setAdminPagination] = useState({});
  const [clientPagination,setClientPagination]= useState({});
  
  // 是否上傳中
  const [isUploading,setIsUploading]= useState(false);

  // 1. 初始化兩個不同的 Ref
  const productModalRef = useRef(null);
  const delProductModalRef = useRef(null);

  // 2. 在 useEffect 中分別實例化 Bootstrap Modal
  const modalInstance = useRef(null);
  const delModalInstance = useRef(null);

  // 定義dispatch,為接下來的傳輸提示訊息做準備
  const dispatch= useDispatch();

  useEffect(() => {
    modalInstance.current = new bootstrap.Modal(productModalRef.current);
    delModalInstance.current = new bootstrap.Modal(delProductModalRef.current);
  }, []);

  // 3. 修改 openModal：根據 type 開啟對應的實例
  const openModal = (type, product) => {
    setModalType(type);
    setTemplateProduct({
      ...NEW_PRODUCT_DATA,
      ...product,
      imagesUrl: product?.imagesUrl ? [...product.imagesUrl] : [""]
    });

    if (type === 'delete') {
      delModalInstance.current.show();
    } else {
      modalInstance.current.show();
    }
  };

  // 4. 修改 closeModal：關閉所有可能的視窗
  const closeModal = () => {
    modalInstance.current.hide();
    delModalInstance.current.hide();
  };

  // 取得 Cookie 的輔助函式（搬到父元件，方便全域使用）
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
  };

  // 取得產品資料
  //多新增isAdmin-->為之後只想純取啟用產品做準備
  // 取得資料函式（優化參數處理）
  const getDatas = useCallback(async (page=1, isAdmin=true) => {
    // 讀取資料為true
    setIsLoading(true);

    // 💡 依據模式清空對應的資料，避免「閃過舊資料」
    if (isAdmin) setAdminProducts([]);
    else setClientProducts([]);
    
    try {
      // 注意：這裡補上了 ${API_PATH} 後面的斜線 /
      const path= isAdmin?`admin/products` : `products`;
      const res = await axios.get(`${API_BASE}/api/${API_PATH}/${path}?page=${page}`);
      if(isAdmin){
        setAdminProducts(res?.data?.products);
        setAdminPagination(res?.data?.pagination);
      }else{
        setClientProducts(res?.data?.products);
        setClientPagination(res?.data?.pagination);
      }
      
      setIsLoadingSuccess(true);
      dispatch(pushMessage({
        message:`取得資料成功!`,
        status:"success"
      }))

    } catch (err) {
      dispatch(pushMessage({
        message:`取得產品失敗: ${err.response?.data?.message || err?.message}`,
        status:"danger"
      }))
      setIsLoadingSuccess(false);
    }finally{
      // 無論成功與否,最後讀取功能都會變回false
      setIsLoading(false);
    }
  },[]);

  // 檢查登入狀態 (搬回父元件)
  useEffect(() => {
    const token = getCookie("hexToken");

    // 如果根本沒有任何金鑰,驗證直接結束
    if (!token) {
        setIsAuth(false);
        setIsAuthChecking(false);
        return;
      };

      axios.defaults.headers.common['Authorization'] = token;
      const checkAuth = async () => {
        try {
          await axios.post(`${API_BASE}/api/user/check`);
          setIsAuth(true);
          

          // 只有當「尚未執行過初始跳轉」時，才執行 navigate('/')
          if (hasInitialRedirected.current === false) {
            if(location.pathname==='/login'){
              navigate('/');
            }
            // 跳轉後，立刻將開關設為 true，之後這個 useEffect 就算再執行也不會觸發跳轉
            hasInitialRedirected.current = true;
          };
        } catch (err) {
          console.error("驗證失敗", err);
          setIsAuth(false);
        }finally{
          setIsAuthChecking(false);
        }
      };
      checkAuth();
  }, [navigate,location]); // 僅在頁面載入時執行


  

  // 手動按鈕檢查 (你原本的按鈕功能)
  const checkLogin = async () => {
    try {
      await axios.post(`${API_BASE}/api/user/check`);
      dispatch(pushMessage({
        message:`你已成功登入,讚讚!`,
        status:"success"
      }))
    } catch (err) {

      dispatch(pushMessage({
        message:`驗證無效: ${err.response?.data?.message}`,
        status:"danger"
      }))
    }
  };

  // 查看詳細資訊
  const getTemplateData = (item) => {
    // 1. 檢查陣列是否已有資料，且 ID 是否跟點擊的產品一樣
    const isAlreadyLoaded = templateData?.length > 0 && templateData[0].id === item.id;

    if (isAlreadyLoaded) {
      dispatch(pushMessage({
        message:`你已獲取該產品細節，無須再獲取！`,
        status:"danger"
      }))
      return; // 中止執行
    }

    try {
      // 2. 將 templateData 替換為只包含「當前點擊產品」的陣列
      setTemplateData([item]); 
    } catch (err) {
      dispatch(pushMessage({
        message:`發生${err?.response?.data?.message||"未知錯誤"}`,
        status:"danger"
      }))
    }
  };

  // 處理輸入設定(關鍵)
  const handleModalInputChange=(e)=>{
    const {name,value,checked,type}= e.target;
    setTemplateProduct((pre)=>({
      ...pre,
      [name]: type==="checkbox"?checked:value
    }));

  };
  // 修改副圖片
  const handleModalImageChange=(index,value)=>{

    setTemplateProduct((pre)=>{
      const newImages= [...(pre.imagesUrl|| []) ];

      // 更新索引值的value
      newImages[index]= value;

      // 每當多一格空字串-->新增空白輸入框-->超過五個-->則終止
      if(newImages[value]!=="" && index ===newImages.length-1 && newImages.length<5){
        newImages.push("");
      };

      // 如果最後一格是空的，且倒數第二格也是空的 (代表有多餘的空白格)，則移除最後一格
      // 這樣可以確保「輸入框列表」的末端最多只有一個空白格供使用者繼續輸入
      if(newImages.length >1 && 
        newImages[newImages.length-1]==="" &&
        newImages[newImages.length-2]===""){
        newImages.pop();
      };

      return {
        ...pre,
        imagesUrl:newImages
      };
    })
  };

  //加入多層圖片
  const addNewImages =()=>{
      setTemplateProduct((pre)=>{
        const currentImages = pre.imagesUrl || [];
        if(currentImages.length<5){
          return {
            ...pre,
            imagesUrl: [...currentImages, ""] // 這裡直接解構並新增，更簡潔
          };
        }else{
          
          dispatch(pushMessage({
            message:`你已超過加入圖片上限!`,
            status:"danger"
          }))
          return pre;
        }
      });
  };


  //移除多層圖片
  const removeImages= ()=>{
    setTemplateProduct((pre)=>{
      const currentImages = pre.imagesUrl || [];
      if(currentImages.length>1){
        const newImages= [...currentImages]
        newImages.pop();
        return {
          ...pre,
          imagesUrl:newImages
        }
      }else{
        dispatch(pushMessage({
          message:"至少要有一張副圖片!",
          status:"danger"
        }))
        return pre;
      }
      
    })
  }

  // 根據不同功能來進行不同執行動作
  const updateProductData= async()=>{

    // 解構id
    const { id } = templateProduct;
    // 新增端點+方法
    let url = `${API_BASE}/api/${API_PATH}/admin/product`;
    let method = "post";
    let status = "";
    let payload = null; // 用來存放要送出的資料

    // 1. 根據類型決定參數
    // 使用switch方法
      switch (modalType) {
        case "create":
          status = "新增";
          method = "post";
          break;

        case "edit":
          if (!id) return dispatch(pushMessage({
            message:"產品 id 缺失，無法更新",
            status:"danger",
          }));

          status = "更新";
          method = "put";
          url = `${url}/${id}`;
          break;

        case "delete":
          if (!id) return dispatch(pushMessage({
            message:"產品 id 缺失，無法更新",
            status:"danger",
          }));
          status = "刪除";
          method = "delete";
          url = `${url}/${id}`;
          break;

        default:
          return;
      }

      // 2. 處理資料格式 (只有新增和更新需要 body)
      if (method !== "delete") {
        payload = {
          data: {
            ...templateProduct,
            origin_price: Number(templateProduct.origin_price) || 0,
            price: Number(templateProduct.price) || 0,
            is_enabled: templateProduct.is_enabled ? 1 : 0,
            imagesUrl: (templateProduct.imagesUrl || []).filter((link) => link.trim() !== ""),
          },
        };
      }

      // 3. 執行請求
      try {
        // 注意：delete 的呼叫方式與其他不同
        if(method==="delete"){
          await axios.delete(url);
          setIsDeleteItem(true)
        }else{
          await axios[method](url,payload)
        };
        dispatch(pushMessage({
          message:`${status}資料成功!`,
          status:'success'
        }))
        await getDatas();
        closeModal();
      } catch (err) {
        const errorMsg = err.response?.data?.message || err.message;
        console.error(`${status}失敗：`, errorMsg);
        dispatch(pushMessage({
          message:`${status}失敗：${errorMsg}`,
          status:"danger"
        }))
      }finally{
        setIsDeleteItem(false);
      }
    };

    // 處理上傳圖片

    const uploadImage=async(e)=>{
        const file= e.target.files?.[0];//目前只需要取一張圖片就好
        if(!file){
            dispatch(pushMessage({
              message:"請上傳一張圖片!",
              status:"danger"
            }))
            return;
        }

        // 前端初步驗證
        // 圖片大小不可超過2MB
        const maxSize= 2*1024*1024;
        if(file.size>maxSize){
          dispatch(pushMessage({
            message:"圖片檔案不可超過2MB!",
            status:"danger"
          }))
          e.target.value='';//清空input
          return ;
        };

        setIsUploading(true);

        try{
            const formData= new FormData();
            formData.append("file-to-upload",file);
            const res= await axios.post(`${API_BASE}/api/${API_PATH}/admin/upload`,formData);
            const uploadImageUrl= res.data.imageUrl;
            setTemplateProduct((pre)=>({
                ...pre,
                imageUrl:uploadImageUrl
            }))

        }catch(err){
            const errorMsg= err.response?.data?.message||'上傳失敗!';
            dispatch(pushMessage({
              message:`發生錯誤${errorMsg}`
            }))
        }finally{
          setIsUploading(false);//成功或失敗都結束上傳狀態
          e.target.value=''//清空input值
        }
    };

    // 取得購物車資訊
    const getCart=async()=>{
      try{
        const res= await axios.get(`${API_BASE}/api/${API_PATH}/cart`);
        setCarts(res?.data?.data?.carts);
        setTotal(res?.data?.data?.total);
        setFinalTotal(res?.data?.data?.final_total);
      }catch(err){
        console.log("取得購物車資訊發生錯誤!",err.response?.data?.message);
        dispatch(pushMessage({
          message:"發生錯誤,購物車無法取得資訊!",
          status:"danger"
        }))
      }
    };

    // 新增購物車資訊
    const addToCart = async(product,qty=1) => {

      // 確認資訊內容是否存在
      if(!product) return;
      
      const data={
        data:{
          product_id:product.id,
          qty:qty
        }
      };

      setIsLoadingSuccess(true);

      try{
        const res = await axios.post(`${API_BASE}/api/${API_PATH}/cart`,data);
        console.log("加入成功!",res.data);
        dispatch(pushMessage({
          message:`已成功將${product.title}加入購物車!`,
          status:'success'
        }))
        getCart();
      }catch(err){
        console.log("加入失敗!"+err?.response?.data?.message||"未知錯誤!");
        dispatch(pushMessage({
          message:`發生${err?.response?.data?.message||"未知錯誤!"}`,
          status:"danger"
        }))
      }finally{
        setIsLoading(false);
      }

    };

    // 移除購物車指定項目內容
    const removeTargetItem=async(cartItem)=>{
      
      const result = await Swal.fire({
        title:"確定移除該品項?",
        text:"刪除後,無法回復該動作",
        icon:'warning',
        showCancelButton:true,
        confirmButtonColor: '#d33', // 紅色按鈕代表危險操作
        cancelButtonColor: '#8c8c8c',
        confirmButtonText: '是的，我要刪除',
        cancelButtonText: '取消'
      })

      if(!result.isConfirmed) return ;

      try{
        await axios.delete(`${API_BASE}/api/${API_PATH}/cart/${cartItem.id}`);
        dispatch(pushMessage({
          message:`已移除${cartItem.title}`,
          status: 'success'
        }))
        getCart();
        
      }catch(err){
        dispatch(pushMessage({
          message:`發生${err?.response?.data?.message||"未知錯誤"}`,
          status:'danger'
        }))
      }
    };

    // 全部清除
    const clearCart=async()=>{
      if(carts.length>0){
        const result= await Swal.fire({
          title:"確定要移除全部購物車內容?",
          text:"刪除後,將無法回復該動作",
          icon:'warning',
          showCancelButton:true,
          confirmButtonColor:"#d33",
          cancelButtonColor:"#8c8c8c",
          confirmButtonText:"是的,我要全部刪除",
          cancelButtonText:"取消"
        })
        if(!result.isConfirmed) return ;

        try{
          await axios.delete(`${API_BASE}/api/${API_PATH}/cart`);
          dispatch(pushMessage({
            message:`已全部刪除!`,
            status:'success'
          }))
          getCart();
        }catch(err){
          console.log("發生錯誤!",err?.response?.data?.message);
          dispatch(pushMessage({
            message:`移除失敗:${err?.response?.data?.message || "未知錯誤"}`,
            status:'danger'
          }))
        }

      }else{
        dispatch(pushMessage({
          message:"購物車已經沒有東西,無須清空!",
          status:"danger"
        }))
      }
      
    };

    //更新數量狀態
    const updateQty = async(item, type) => {
      // 1.先計算出新數量
      const newQty = type === "add" ? item.qty + 1 : item.qty - 1;

      // 2. 基本防呆：如果數量小於 1，就不準再減了 (或是你要做刪除也可以，但通常是擋住)
      if (newQty < 1) return;

      // 3. 準備 API 要的資料格式
      const data = {
        data: {
          product_id: item.product_id, // ⚠️ 注意：PUT 還是需要帶 product_id
          qty: newQty
        }
      };

      try{
        // 發送put請求
        await axios.put(`${API_BASE}/api/${API_PATH}/cart/${item.id}`,data);
        
        getCart();
      }catch(err){
        console.error("更新失敗:", err);
        dispatch(pushMessage({
          message:`更新資料發生${err?.response?.data?.message||"未知錯誤!"}!`,
          status:"danger"
        }))
      }

    };

    // 當成功購物完內容後,進行購物車內容清除
    const resetCart=()=>{
      setCarts([]);
      getCart();
    }

    
return (
  <>
    <Toast/>
    {/* 先確認是否有載入資料中 */}
      {
        isAuthChecking?(
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          {/* 這裡可以放 Bootstrap 的 Spinner */}
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>):(
          <>
            {/* 如果載入完成,則會正常顯示內容 */}
            {/* 改掉,變成有區分登入前與登入後不同的差別 */}
            <Navbar isAuth={isAuth}/>
              <div className='container'>
                <AppRoute 
                  isAuth={isAuth}
                  isLoading={isLoading}
                  formData={formData}
                  setIsAuth={setIsAuth}
                  setFormData={setFormData}
                  clientProducts={clientProducts}
                  clientPagination={clientPagination}
                  getDatas={getDatas}
                  openModal={openModal}
                  getTemplateData={getTemplateData}
                  templateData={templateData}
                  setTemplateData={setTemplateData}
                  checkLogin={checkLogin}
                  addToCart={addToCart}
                  isLoadingSuccess={isLoadingSuccess}
                  adminProducts={adminProducts}
                  adminPagination={adminPagination}
                  getCart={getCart}
                  total={total}
                  finalTotal={finalTotal}
                  carts={carts}
                  removeTargetItem={removeTargetItem}
                  clearCart={clearCart}
                  updateQty={updateQty}
                  resetCart={resetCart}
              />
              </div>
            </>
      )}  
      {/* {Modal} */}
        <ProductModal 
          ref={productModalRef}
          modalType={modalType}
          templateProduct={templateProduct}
          handleModalInputChange={handleModalInputChange}
          handleModalImageChange={handleModalImageChange}
          addNewImages={addNewImages}
          removeImages={removeImages}
          updateProductData={updateProductData}
          closeModal={closeModal}
          uploadImage={uploadImage}
          isUploading={isUploading}
        />

        <DeleteModal 
          ref={delProductModalRef}
          templateProduct={templateProduct}
          updateProductData={updateProductData}
          closeModal={closeModal}
          isDeleteItem={isDeleteItem}
        />
        {/* {Modal end} */}
              
    </>
  );
}

export default App;