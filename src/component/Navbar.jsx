import { Link,useNavigate } from "react-router-dom";
import { API_BASE } from "../Constants/config";
import axios from "axios";
const Navbar =({isAuth})=>{

    const navigate= useNavigate();
    const logOut= async()=>{
        try{
            await axios.post(`${API_BASE}/logout`);
            alert("登出成功!");
            // 清除cookies中的token
            // 設置到期時間為過去
            // 並套用到全部頁面上
            document.cookie="hexToken=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/"
            navigate('/login');
        }catch(err){
            console.log(err?.response?.data?.message);
        }
    }

    return (
        <nav className='d-flex align-item-center justify-content-center gap-3 position-relative' style={{padding:"20px"}}>
            <div className="d-flex gap-3">
                <Link to='/' className='pe-3 border-end'>首頁</Link>
                <Link to='/products'  className='pe-3 border-end'>產品列表</Link>
                <Link to='/productEdit' className='pe-3 border-end'>產品編輯</Link>
                <Link to='/cart'  className='pe-3 border-end'>購物車</Link>     
                <Link to='/Order' className='pe-3 border-end'>訂單資訊</Link>
            </div> 

            
            <div className='position-absolute end-0 me-4'>
                {
                    isAuth?(
                        <button type="button" className="btn btn-outline-danger "
                            onClick={()=>logOut()}>
                            登出
                        </button>
                    ):(
                        <Link to="/login" className="btn btn-outline-primary">
                            登入
                        </Link>
                    )
                }
                
            </div>
        </nav>


    )
};

export default Navbar;